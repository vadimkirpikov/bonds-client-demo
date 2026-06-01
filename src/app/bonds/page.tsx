import { BondApi, AuthApi, ApiV1BondsGetRequest, BondListResponse, Flag, Configuration } from '@/lib/api';
import { getServerApi } from '@/lib/server-api';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { BondRow } from '@/components/bonds/BondRow';
import { ExportWrapper } from '@/components/ExportWrapper';
import { ArrowLeft, ArrowRight as ArrowRightIcon, ChevronsLeft, ChevronsRight, FolderOpen, Trash2 } from 'lucide-react';
import { getBatchBondStats } from '@/actions/bond-actions';
import { QuickFilters } from '@/components/bonds/QuickFilters';
import { authOptions } from '@/lib/auth';
import { getServerSession } from "next-auth";
import FiltersSheet from "@/components/bonds/filters/FiltersSheet";

import { SessionExpiredTrigger } from '@/components/ui/SessionExpiredAlert';
import {getMaintenanceMode, getKeyRate, getShowOfzCurve} from "@/actions/settings-actions";
import {MaintenanceView} from "@/components/ui/MaintenanceView";
import { BondsViewWrapper } from '@/components/bonds/BondsViewWrapper';

function mapSearchParamsToApiRequest(params: {[key: string]: string | string[] | undefined }): ApiV1BondsGetRequest {
    const p = (key: string) => params[key] as string | undefined;
    const num = (key: string) => p(key) ? Number(p(key)) : undefined;
    const date = (key: string) => p(key) ? new Date(p(key)!) : undefined;
    const int = (key: string) => p(key) ? parseInt(p(key)!, 10) : undefined;
    const flag = (key: string): Flag | undefined => int(key) !== undefined ? (int(key) as Flag) : undefined;

    return {
        page: int('page') || 1,
        pageSize: 13,
        currency: p('Currency'),
        nominalCurrency: p('NominalCurrency'),
        nominalStrict: num('NominalStrict'),
        nominalFrom: num('NominalFrom'),
        nominalTo: num('NominalTo'),
        priceFrom: num('PriceFrom'),
        priceTo: num('PriceTo'),
        couponPrcFrom: num('CouponPrcFrom'),
        couponPrcTo: num('CouponPrcTo'),
        couponQuantityPerYear: int('CouponQuantityPerYear'),
        amortizationFlag: flag('AmortizationFlag'),
        floatingCouponFlag: flag('FloatingCouponFlag'),
        marginAbleFlag: flag('MarginAbleFlag'),
        forQualInvestorFlag: flag('ForQualInvestorFlag'),
        hasEventsFlag: flag('HasEventsFlag'),
        defaultFlag: flag('DefaultFlag'),
        technicalDefaultFlag: flag('TechnicalDefaultFlag'),
        availableInTFlag: flag('AvailableInTFlag'),
        markedEmitentsFlag: flag('MarkedEmitentsFlag'),
        inPortfolioFlag: flag('InPortfolioFlag'),
        availableInAutofollowFlag: flag('AvailableInAutofollowFlag'),
        collectionId: p('CollectionId'),
        placementDateFrom: date('PlacementDateFrom'),
        placementDateTo: date('PlacementDateTo'),
        matureDateFrom: date('MatureDateFrom'),
        matureDateTo: date('MatureDateTo'),
        firstCallDateFrom: date('FirstCallDateFrom'),
        firstCallDateTo: date('FirstCallDateTo'),
        firstMtyDateFrom: date('FirstMtyDateFrom'),
        firstMtyDateTo: date('FirstMtyDateTo'),
        nextCouponDateFrom: date('NextCouponDateFrom'),
        nextCouponDateTo: date('NextCouponDateTo'),
        creditRatingFrom: p('CreditRatingFrom'),
        creditRatingTo: p('CreditRatingTo'),
        netDebtToEbitdaFrom: num('NetDebtToEbitdaFrom'),
        netDebtToEbitdaTo: num('NetDebtToEbitdaTo'),
        totalDebtToEquityFrom: num('TotalDebtToEquityFrom'),
        totalDebtToEquityTo: num('TotalDebtToEquityTo'),
        totalDebtToAssetsFrom: num('TotalDebtToAssetsFrom'),
        totalDebtToAssetsTo: num('TotalDebtToAssetsTo'),
        ebitdaToInterestExpenseFrom: num('EbitdaToInterestExpenseFrom'),
        ebitdaToInterestExpenseTo: num('EbitdaToInterestExpenseTo'),
        operatingCashFlowToTotalDebtFrom: num('OperatingCashFlowToTotalDebtFrom'),
        operatingCashFlowToTotalDebtTo: num('OperatingCashFlowToTotalDebtTo'),
        ebitdaMarginFrom: num('EbitdaMarginFrom'),
        ebitdaMarginTo: num('EbitdaMarginTo'),
        netProfitMarginFrom: num('NetProfitMarginFrom'),
        netProfitMarginTo: num('NetProfitMarginTo'),
        returnOnAssetsFrom: num('ReturnOnAssetsFrom'),
        returnOnAssetsTo: num('ReturnOnAssetsTo'),
        returnOnInvestmentFrom: num('ReturnOnInvestmentFrom'),
        returnOnInvestmentTo: num('ReturnOnInvestmentTo'),
        currentRatioFrom: num('CurrentRatioFrom'),
        currentRatioTo: num('CurrentRatioTo'),
        quickRatioFrom: num('QuickRatioFrom'),
        quickRatioTo: num('QuickRatioTo'),
        sorts: p('sorts'),

        yieldFrom: num('YieldFrom'),
        yieldTo: num('YieldTo'),
        durationFrom: num('DurationFrom'),
        durationTo: num('DurationTo'),
        spreadFrom: num('SpreadFrom'),
        spreadTo: num('SpreadTo'),
        rateType: num('RateType') as any,
        currentYieldFrom: num('CurrentYieldFrom'),
        currentYieldTo: num('CurrentYieldTo'),
        gSpreadFrom: num('GSpreadFrom'),
        gSpreadTo: num('GSpreadTo'),
    };
}

async function getBonds(requestParams: ApiV1BondsGetRequest, useGuest: boolean): Promise<BondListResponse> {
    try {
        let api;

        if (!useGuest) {
            api = await getServerApi(BondApi);
        } else {
            const config = new Configuration({
                basePath: process.env.NEXT_PUBLIC_SERVER_URL,
                headers: {
                    'Authorization': `Bearer ${process.env.GUEST_TOKEN}`
                }
            });
            api = new BondApi(config);
        }

        return await api.apiV1BondsGet(requestParams);
    } catch (e) {
        console.error("Ошибка при получении облигаций:", e);
        return { bonds:[], total: 0, page: 1, pageSize: 13 };
    }
}

function getPageNumbers(currentPage: number, totalPages: number): (number | 'dots')[] {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'dots')[] = [1];

    if (currentPage > 3) {
        pages.push('dots');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    if (currentPage < totalPages - 2) {
        pages.push('dots');
    }

    if (totalPages > 1) {
        pages.push(totalPages);
    }

    return pages;
}

export default async function BondsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const resolvedParams = await searchParams;
    const requestRequest = mapSearchParamsToApiRequest(resolvedParams);
    const session = await getServerSession(authOptions);

    const isMaintenance = await getMaintenanceMode();

    let meData = null;
    let authExpired = false;
    let useGuest = !session;

    if (session) {
        try {
            const authApi = await getServerApi(AuthApi);
            meData = await authApi.apiV1AuthMeGet();
        } catch (e: any) {
            console.error("Error fetching me data", e);
            if (e.status === 401 || e.status === 403 || e.response?.status === 401 || e.response?.status === 403) {
                authExpired = true;
                useGuest = true;
            }
        }
    }

    const isAdmin = meData?.role?.toLowerCase() === 'admin';
    const isSubscriber = meData?.hasActiveSubscription || false;

    let data: BondListResponse = { bonds: [], total: 0, page: 1, pageSize: 13 };
    let statsMap: any = {};
    let keyRate = 21;
    let showOfzCurve = true;

    if (!isMaintenance) {
        [data, keyRate, showOfzCurve] = await Promise.all([
            getBonds(requestRequest, useGuest),
            getKeyRate(),
            getShowOfzCurve(),
        ]);
        const bondIds = data.bonds?.map(b => b.bondResponse?.isin || b.bondResponse?.id).filter(Boolean) as string[] || [];
        statsMap = bondIds.length > 0 ? await getBatchBondStats(bondIds) : {};
    }

    const currentPage = data.page || 1;
    const totalPages = Math.ceil((data.total || 0) / (data.pageSize || 13));

    const plainParams: Record<string, string> = {};
    Object.entries(resolvedParams).forEach(([key, value]) => {
        if (value && !Array.isArray(value)) plainParams[key] = value;
        else if (Array.isArray(value) && value.length > 0) plainParams[key] = value[0];
    });
    const collectionId = resolvedParams['CollectionId'] as string | undefined;

    const getPageLink = (page: number) => {
        const params = new URLSearchParams();
        Object.entries(resolvedParams).forEach(([key, value]) => {
            if (key !== 'page' && value) {
                if (Array.isArray(value)) value.forEach(v => params.append(key, v));
                else params.set(key, value);
            }
        });
        params.set('page', page.toString());
        return `/bonds?${params.toString()}`;
    };

    const pageNumbers = getPageNumbers(currentPage, totalPages);

    return (
        <div className="container mx-auto px-4 py-8">
            {authExpired && <SessionExpiredTrigger />}

            <div className="flex flex-col gap-6">


                {isMaintenance ? (
                    <MaintenanceView />
                ) : (
                    <>
                        <BondsViewWrapper
                            key={JSON.stringify(plainParams)}
                            initialBonds={data.bonds || []}
                            initialStats={statsMap}
                            searchParams={plainParams}
                            keyRate={keyRate}
                            isSubscriber={isSubscriber}
                            showOfzCurve={showOfzCurve}
                            initialPage={currentPage}
                            totalPages={totalPages}
                            filtersButton={
                                <FiltersSheet
                                    userProfile={meData}
                                    isMaintenance={isMaintenance}
                                    currentCollectionId={collectionId}
                                />
                            }
                            quickFiltersNode={
                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-widest pl-1">Смотрят чаще всего</h3>
                                    <QuickFilters userProfile={meData} />
                                </div>
                            }
                            titleNode={
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 w-full">
                                    <div className="flex flex-col gap-1 md:gap-2">
                                        <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-foreground)] tracking-tight">Облигации</h1>
                                        {!isMaintenance && (
                                            <p className="text-[var(--color-muted-foreground)] text-sm md:text-base">
                                                Найдено: <span className="text-[var(--color-foreground)] font-semibold">{data.total}</span>
                                            </p>
                                        )}
                                    </div>
                                    {!isMaintenance && isAdmin && (
                                        <div className="shrink-0 mb-1">
                                            <ExportWrapper bonds={data.bonds || []} isSubscriber={isSubscriber} isAdmin={isAdmin} />
                                        </div>
                                    )}
                                </div>
                            }
                            collectionNode={
                                collectionId && !isMaintenance ? (
                                    <div className="flex items-center gap-2 animate-fade-in-up">
                                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-semibold">
                                            <FolderOpen size={14} />
                                            Коллекция активна
                                        </span>
                                        <Link href="/bonds" className="p-2 rounded-lg text-[var(--color-muted-foreground)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors" title="Убрать коллекцию">
                                            <Trash2 size={14} />
                                        </Link>
                                    </div>
                                ) : null
                            }
                        >
                            <div className="flex flex-col gap-3 min-h-[500px]">
                                {data.bonds && data.bonds.length > 0 ? (
                                    data.bonds.map((bondItem) => {
                                        const stats = statsMap[bondItem.bondResponse!.isin || bondItem.bondResponse!.id!] || { likes: 0, dislikes: 0, userVote: null, isFavorite: false };

                                        return (
                                            <BondRow
                                                key={bondItem.bondResponse?.id}
                                                bond={bondItem.bondResponse!}
                                                brand={bondItem.brandBusinessDtoResponse!}
                                                isSubscriber={isSubscriber}
                                                initialStats={stats}
                                                isInPortfolio={bondItem.isInPortfolio}
                                                issuerHoldPercent={bondItem.issuerHoldPercent}
                                            />
                                        )
                                    })
                                ) : (
                                    <div className="text-center py-20 bg-[var(--color-muted)] rounded-2xl">
                                        <p className="text-[var(--color-muted-foreground)]">По вашему запросу ничего не найдено.</p>
                                        <Link href="/bonds">
                                            <Button variant="ghost" className="mt-4">Сбросить фильтры</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>

                        </BondsViewWrapper>
                    </>
                )}
            </div>
        </div>
    );
}
