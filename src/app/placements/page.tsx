import { PublicOfferingsApi, AuthApi, Configuration } from '@/lib/api';
import { getServerApi } from '@/lib/server-api';
import { authOptions } from '@/lib/auth';
import { getServerSession } from "next-auth";
import { SessionExpiredTrigger } from '@/components/ui/SessionExpiredAlert';
import { PlacementRow } from '@/components/placements/PlacementRow';

export default async function PlacementsPage() {
    const session = await getServerSession(authOptions);
    let useGuest = !session;
    let authExpired = false;
    
    if (session) {
        try {
            const authApi = await getServerApi(AuthApi);
            await authApi.apiV1AuthMeGet();
        } catch (e: any) {
            if (e.status === 401 || e.status === 403 || e.response?.status === 401 || e.response?.status === 403) {
                authExpired = true;
                useGuest = true;
            }
        }
    }

    let placements = [];
    try {
        let api;
        if (!useGuest) {
            api = await getServerApi(PublicOfferingsApi);
        } else {
            const config = new Configuration({
                basePath: process.env.NEXT_PUBLIC_SERVER_URL,
                headers: {
                    'Authorization': `Bearer ${process.env.GUEST_TOKEN}`
                }
            });
            api = new PublicOfferingsApi(config);
        }
        placements = await api.apiPublicOfferingsGet();
    } catch (e) {
        console.error("Ошибка при получении размещений:", e);
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {authExpired && <SessionExpiredTrigger />}

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1 md:gap-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-foreground)] tracking-tight">Первичные размещения</h1>
                    <p className="text-[var(--color-muted-foreground)] text-sm md:text-base">
                        Актуальная информация о предстоящих и текущих размещениях
                    </p>
                </div>

                <div className="flex flex-col gap-3 min-h-[500px]">
                    {placements.length > 0 ? (
                        placements.map((placement) => (
                            <PlacementRow key={placement.id} placement={placement} />
                        ))
                    ) : (
                        <div className="text-center py-20 bg-[var(--color-card)] shadow-card rounded-3xl">
                            <p className="text-[var(--color-muted-foreground)]">На данный момент активных размещений нет.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
