import { BondApi, Configuration, AuthApi } from '@/lib/api';
import { getServerApi } from '@/lib/server-api';
import { getBondAlternatives } from '@/actions/analytics-actions';
import { BackButton } from '@/components/ui/BackButton';
import { AlternativesClient } from '@/components/bonds/alternatives/AlternativesClient';
import { IsinSearchForm } from '@/components/bonds/alternatives/IsinSearchForm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getMaintenanceMode } from '@/actions/settings-actions';
import { MaintenanceView } from '@/components/ui/MaintenanceView';

export default async function AlternativesPage({ searchParams }: { searchParams: Promise<{ isin?: string }> }) {
    const { isin } = await searchParams;
    const session = await getServerSession(authOptions);

    const isMaintenance = await getMaintenanceMode();

    if (isMaintenance) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <MaintenanceView />
            </div>
        );
    }

    let useGuest = !session;
    let meData = null;

    if (session) {
        try {
            const authApi = await getServerApi(AuthApi);
            meData = await authApi.apiV1AuthMeGet();
        } catch (e: any) {
            if (e.status === 401 || e.response?.status === 401) {
                useGuest = true;
            }
        }
    }

    const isAdmin = meData?.role === 'Admin';
    const isSubscriber = meData?.hasActiveSubscription || false;

    const hasTrial = meData?.isTrialPeriod || false;
    const hasAnyAccess = isSubscriber || isAdmin || hasTrial;

    let bondData = null;
    let alternatives = null;

    if (isin) {
        try {
            let api: BondApi;
            if (!useGuest) {
                api = await getServerApi(BondApi);
            } else {
                const config = new Configuration({
                    basePath: process.env.NEXT_PUBLIC_SERVER_URL,
                    headers: { 'Authorization': `Bearer ${process.env.GUEST_TOKEN}` }
                });
                api = new BondApi(config);
            }
            bondData = await api.apiV1BondsIsinIsinGet({ isin: isin });

            if (bondData?.bondResponse) {
                const targetIsin = bondData.bondResponse.isin || bondData.bondResponse.ticker;
                alternatives = targetIsin ? await getBondAlternatives(targetIsin) : null;
            }
        } catch (e) {
            console.error('Failed to fetch bond by ISIN:', e);
        }
    }

    const targetBond = bondData?.bondResponse;
    const targetBrand = bondData?.brandBusinessDtoResponse;

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex justify-between items-center mb-6">
                <BackButton />
            </div>

            <div className="mb-10 bg-[var(--color-card)] p-6 md:p-8 rounded-3xl shadow-card">
                <h1 className="text-2xl md:text-3xl font-black mb-3 text-[var(--color-foreground)]">
                    Подбор альтернатив
                </h1>
                <p className="text-[var(--color-muted-foreground)] mb-6 max-w-2xl text-sm leading-relaxed">
                    Введите ISIN интересующей вас облигации (12 символов), чтобы сравнить её с другими выпусками на рынке и выбрать оптимальное соотношение доходности и риска.
                </p>
                <IsinSearchForm initialIsin={isin || ''} />
            </div>

            {isin && targetBond && targetBrand ? (
                <div className="animate-fade-in-up">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-[var(--color-foreground)]">
                            Сравнение для: <span className="text-primary">{targetBond.shortName || targetBond.name}</span>
                        </h2>
                    </div>
                    <AlternativesClient
                        targetBond={targetBond}
                        targetBrand={targetBrand}
                        higherYield={alternatives?.higherRiskYield || []}
                        lowerRisk={alternatives?.lowerRiskYield || []}
                        isAdmin={isAdmin}
                        isSubscriber={isSubscriber}
                        isTrialPeriod={hasTrial}
                        freeAttempts={meData?.freeAlternativeSearchesBalance ?? 0}
                    />
                </div>
            ) : isin ? (
                <div className="bg-red-50 dark:bg-red-500/10 p-6 rounded-2xl text-center text-red-600 dark:text-red-400 font-medium">
                    Облигация с ISIN <b>{isin}</b> не найдена в базе.
                </div>
            ) : null}
        </div>
    );
}