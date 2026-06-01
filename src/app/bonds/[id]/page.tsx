import { BondApi, AuthApi, Configuration } from '@/lib/api';
import { getServerApi } from '@/lib/server-api';
import { getBatchBondStats } from '@/actions/bond-actions';
import { Info, Briefcase, ExternalLink } from 'lucide-react';
import { notFound } from 'next/navigation';
import { BackButton } from '@/components/ui/BackButton';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

import { BondHeader } from '@/components/bonds/details/BondHeader';
import { BondParameters } from '@/components/bonds/details/BondParameters';
import { BondCalendar } from '@/components/bonds/details/BondCalendar';
import { BondFinances } from '@/components/bonds/details/BondFinances';
import { OtherIssues } from '@/components/bonds/details/OtherIssues';

import { SessionExpiredTrigger } from '@/components/ui/SessionExpiredAlert';
import { Metadata } from "next";
import {getMaintenanceMode} from "@/actions/settings-actions";
import {MaintenanceView} from "@/components/ui/MaintenanceView";
import Script from "next/script";

const YandexAd = () => {
    return (
        <>
            <div id="yandex_rtb_R-A-17423562-5"></div>
            <Script id="Yandex.RTB-R-A-17423562-5">
                {`
                    window.yaContextCb = window.yaContextCb || [];
                    window.yaContextCb.push(() => {
                        if (window.Ya && window.Ya.Context && window.Ya.Context.AdvManager) {
                            window.Ya.Context.AdvManager.render({
                                "blockId": "R-A-17423562-5",
                                "renderTo": "yandex_rtb_R-A-17423562-5"
                            });
                        }
                    });
                `}
            </Script>
        </>
    );
}
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    try {
        const session = await getServerSession(authOptions);
        let api;
        
        if (session) {
            api = await getServerApi(BondApi);
        } else {
            const config = new Configuration({
                basePath: process.env.NEXT_PUBLIC_SERVER_URL,
                headers: { 'Authorization': `Bearer ${process.env.GUEST_TOKEN}` }
            });
            api = new BondApi(config);
        }

        const data = await api.apiV1BondsIdGet({ id });
        const bond = data.bondResponse;
        const brand = data.brandBusinessDtoResponse;

        if (!bond) return { title: 'Облигация не найдена' };

        const isin = bond.isin || '';
        const ticker = bond.ticker || '';
        const inn = brand?.inn || '';
        const brandName = brand?.name || bond.name;
        
        const title = `${bond.defaultFlag ? '[ДЕФОЛТ] ' : ''}Облигация ${bond.name} (${isin}) — Купон ${bond.nextCouponValuePrc}%, Отчетность ИНН ${inn} | Bonds-Lab`;
        const description = `Полный анализ и график выплат облигации ${bond.name} (ISIN: ${isin}, Тикер: ${ticker}). Текущая цена: ${bond.price}%, доходность, дюрация, кредитный рейтинг и свежая финансовая отчетность эмитента ${brandName} (ИНН ${inn}). Удобная альтернатива Смартлаб (Smart-Lab) и Интерфакс с продвинутой аналитикой.`;

        return {
            title,
            description,
            keywords: `облигация ${bond.name}, ${isin}, ${ticker}, доходность, купон, отчетность ${brandName}, ИНН ${inn}, смартлаб, smart-lab, rusbonds, интерфакс, инвестиции, флоатер, вдо`,
            openGraph: {
                title,
                description,
                type: 'website',
            }
        };
    } catch {
        return { 
            title: `Облигация — Анализ, Доходность и Отчетность | Bonds-Lab`,
            description: 'Подробный анализ облигации, график выплат купонов, доходность к погашению и финансовая отчетность эмитента. Альтернатива Смартлаб и Интерфакс.'
        };
    }
}

export default async function BondDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    const isMaintenance = await getMaintenanceMode();

    if (isMaintenance) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="flex justify-between items-center mb-6">
                    <BackButton />
                </div>
                <MaintenanceView />
            </div>
        );
    }

    let meData = null;
    let authExpired = false;
    let useGuest = !session;

    if (session) {
        try {
            const authApi = await getServerApi(AuthApi);
            meData = await authApi.apiV1AuthMeGet();
        } catch (e: any) {
            console.error("Error fetching me data in details", e);
            if (e.status === 401 || e.status === 403 || e.response?.status === 401 || e.response?.status === 403) {
                authExpired = true;
                useGuest = true;
            }
        }
    }

    const isSubscriber = meData?.hasActiveSubscription || false;
    const isAdmin = meData?.role === 'Admin';
    const isLoggedIn = !!session && !authExpired;

    let data;
    try {
        let api;
        if (!useGuest) {
            api = await getServerApi(BondApi);
        } else {
            const config = new Configuration({
                basePath: process.env.NEXT_PUBLIC_SERVER_URL,
                headers: { 'Authorization': `Bearer ${process.env.GUEST_TOKEN}` }
            });
            api = new BondApi(config);
        }
        data = await api.apiV1BondsIdGet({ id });
    } catch (e) {
        console.error("Bond get failed:", e);
        notFound();
    }

    const { bondResponse: bond, brandBusinessDtoResponse: brand, otherBonds } = data;
    if (!bond || !brand) notFound();

    const statId = bond.isin || bond.id!;
    const statsMap = await getBatchBondStats([statId]);
    const stats = statsMap[statId] || { likes: 0, dislikes: 0, userVote: null };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {authExpired && <SessionExpiredTrigger />}

            <div className="flex justify-between items-center mb-6">
                <BackButton />
            </div>

            <BondHeader bond={bond} brand={brand} stats={stats} isAdmin={isAdmin} isLoggedIn={isLoggedIn} isSubscriber={isSubscriber} />

            {isAdmin && <YandexAd />}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
                <div className="lg:col-span-2 space-y-10">
                    <BondParameters bond={bond} />
                    <BondCalendar bond={bond} />

                    {brand && (
                        <BondFinances brand={brand} isSubscriber={isSubscriber} isLoggedIn={isLoggedIn} isAdmin={isAdmin} otherBonds={otherBonds || []} />
                    )}

                    <OtherIssues bonds={otherBonds || []} currentBondId={bond.id} hasAccess={isAdmin || isSubscriber || isLoggedIn} />
                </div>

                <div className="space-y-6">
                    <div className="bg-[var(--color-card)] rounded-3xl shadow-card p-6">
                        <h3 className="font-bold text-lg mb-4 text-[var(--color-foreground)] flex items-center gap-2">
                            <Info size={18} className="text-[var(--color-muted-foreground)]"/> Информация
                        </h3>
                        <div className="space-y-2">
                            <ExternalLinkBtn href={`https://www.moex.com/ru/issue.aspx?board=tqob&code=${bond.ticker}`} label="Московская Биржа" iconColor="text-red-500" />
                            <ExternalLinkBtn href={`https://smart-lab.ru/q/bonds/${bond.ticker}/`} label="Smart-Lab" iconColor="text-blue-500" />
                        </div>
                    </div>
                    {bond.availableInT &&                     <div className="bg-[var(--color-card)] rounded-3xl shadow-card p-6 sticky top-24">
                        <h3 className="font-bold text-lg mb-4 text-[var(--color-foreground)] flex items-center gap-2">
                            <Briefcase size={18} className="text-[var(--color-muted-foreground)]"/> Купить у брокера
                        </h3>
                        <div className="space-y-2">
                            <ExternalLinkBtn href={`https://www.tbank.ru/invest/bonds/${bond.ticker}`} label="Т-Инвестиции" iconColor="text-yellow-500" />
                        </div>
                    </div>}

                </div>
            </div>
        </div>
    );
}

const ExternalLinkBtn = ({ href, label, iconColor }: { href: string, label: string, iconColor: string }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between w-full p-4 rounded-xl bg-[var(--color-muted)] hover:bg-[var(--color-background)] transition-colors group">
        <span className="font-semibold text-sm text-[var(--color-muted-foreground)] group-hover:text-[var(--color-foreground)] transition-colors">{label}</span>
        <ExternalLink size={18} className={`${iconColor} opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all`} />
    </a>
);