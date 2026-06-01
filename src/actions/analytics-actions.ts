'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AnalyticsApi, Configuration, AlternativeBondsResponse } from '@/lib/api';
import { getServerApi } from '@/lib/server-api';

export async function getBondAlternatives(isin: string): Promise<AlternativeBondsResponse | null> {
    const session = await getServerSession(authOptions);
    const useGuest = !session;

    try {
        let api: AnalyticsApi;

        if (!useGuest) {
            api = await getServerApi(AnalyticsApi);
        } else {
            const config = new Configuration({
                basePath: process.env.NEXT_PUBLIC_SERVER_URL,
                headers: { 'Authorization': `Bearer ${process.env.GUEST_TOKEN}` }
            });
            api = new AnalyticsApi(config);
        }

        const response = await api.apiV1AnalyticsAlternativesIsinGet({ isin });

        return response;
    } catch (e: any) {
        console.error("Error fetching alternatives:", e);
        return null;
    }
}