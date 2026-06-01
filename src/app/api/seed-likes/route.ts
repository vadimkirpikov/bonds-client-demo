import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BondInteraction from '@/models/BondInteraction';
import { BondApi, AuthApi } from '@/lib/api';
import { getServerApi } from '@/lib/server-api';

export async function GET(request: Request) {
    try {
        const authApi = await getServerApi(AuthApi);
        try {
            const meData = await authApi.apiV1AuthMeGet();
            if (meData?.role?.toLowerCase() !== 'admin') {
                return NextResponse.json({ success: false, error: 'Unauthorized: доступно только администраторам' }, { status: 401 });
            }
        } catch (e) {
            return NextResponse.json({ success: false, error: 'Unauthorized: вы не авторизованы или сессия истекла' }, { status: 401 });
        }

        await dbConnect();

        await BondInteraction.deleteMany({ userId: { $regex: /^fake-/ } });

        const bondApi = await getServerApi(BondApi);

        let page = 1;
        let totalPages = 1;
        const fakeInteractions = [];

        do {
            const res = await bondApi.apiV1BondsGet({ page, pageSize: 100 });
            if (!res.bonds) break;
            
            totalPages = Math.ceil((res.total || 0) / 100);

            for (const bondWrap of res.bonds) {
                const bond = bondWrap.bondResponse;
                if (!bond || (!bond.isin && !bond.id)) continue;

                const bondId = bond.isin || bond.id;

                let baseLikes = Math.floor(Math.random() * 20) + 10; // 10 to 30
                let baseDislikes = Math.floor(Math.random() * 5) + 1; // 1 to 5

                if (bond.defaultFlag) {
                    baseDislikes += Math.floor(Math.random() * 50) + 30; // Huge dislikes for defaults
                    baseLikes = Math.floor(Math.random() * 5); // Very few likes
                } else if (bond.technicalDefaultFlag) {
                    baseDislikes = Math.floor(Math.random() * 30) + 20; // 20 to 50 dislikes
                    baseLikes = Math.floor(Math.random() * 30) + 20; // 20 to 50 likes
                } else {
                    if (bond.currentYield && bond.currentYield > 20) {
                        baseLikes += Math.floor(Math.random() * 30) + 10;
                        baseDislikes += Math.floor(Math.random() * 15) + 5; 
                    } else if (bond.currentYield && bond.currentYield > 15) {
                        baseLikes += Math.floor(Math.random() * 20) + 5;
                    }

                    if (bond.nextCall || bond.nextCallType) {
                        baseDislikes += Math.floor(Math.random() * 10) + 2;
                    }

                    if (bond.couponQuantityPerYear && bond.couponQuantityPerYear >= 12) {
                        baseLikes += Math.floor(Math.random() * 40) + 15;
                    }

                    if (bond.amortizationFlag) {
                        baseLikes += Math.floor(Math.random() * 15) + 5;
                    }

                    if (bond.duration && bond.duration < 365) {
                        baseLikes += Math.floor(Math.random() * 10) + 5;
                    }
                }

                for (let i = 0; i < baseLikes; i++) {
                    fakeInteractions.push({
                        bondId: bondId,
                        userId: `fake-like-${bondId}-${i}`,
                        type: 'LIKE',
                    });
                }
                for (let i = 0; i < baseDislikes; i++) {
                    fakeInteractions.push({
                        bondId: bondId,
                        userId: `fake-dislike-${bondId}-${i}`,
                        type: 'DISLIKE',
                    });
                }
            }
            page++;
        } while (page <= totalPages);

        const chunkSize = 1000;
        for (let i = 0; i < fakeInteractions.length; i += chunkSize) {
            const chunk = fakeInteractions.slice(i, i + chunkSize);
            await BondInteraction.insertMany(chunk);
        }

        return NextResponse.json({ success: true, message: `Inserted ${fakeInteractions.length} fake interactions.` });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
