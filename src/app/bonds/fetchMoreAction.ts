'use server';

import { BondApi, AuthApi, ApiV1BondsGetRequest, Flag, Configuration } from '@/lib/api';
import { getServerApi } from '@/lib/server-api';
import { getBatchBondStats } from '@/actions/bond-actions';
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';

function mapSearchParamsToApiRequest(params: {[key: string]: string | string[] | undefined }): ApiV1BondsGetRequest {
    const p = (key: string) => params[key] as string | undefined;
    const num = (key: string) => p(key) ? Number(p(key)) : undefined;
    const date = (key: string) => p(key) ? new Date(p(key)!) : undefined;
    const int = (key: string) => p(key) ? parseInt(p(key)!, 10) : undefined;
    const flag = (key: string): Flags | undefined => int(key) !== undefined ? (int(key) as Flags) : undefined;

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

export async function fetchMoreBondsAction(searchParamsObj: any) {
    const requestParams = mapSearchParamsToApiRequest(searchParamsObj);
    const session = await getServerSession(authOptions);
    let useGuest = !session;
    
    if (session) {
        try {
            const authApi = await getServerApi(AuthApi);
            await authApi.apiV1AuthMeGet();
        } catch (e: any) {
            if (e.status === 401 || e.status === 403 || e.response?.status === 401 || e.response?.status === 403) {
                useGuest = true;
            }
        }
    }
    
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

    try {
        const data = await api.apiV1BondsGet(requestParams);
        const bondIds = data.bonds?.map(b => b.bondResponse?.isin || b.bondResponse?.id).filter(Boolean) as string[] || [];
        const statsMap = bondIds.length > 0 ? await getBatchBondStats(bondIds) : {};
        
        return {
            bonds: JSON.parse(JSON.stringify(data.bonds || [])),
            statsMap: JSON.parse(JSON.stringify(statsMap)),
            total: data.total || 0,
            page: data.page || 1,
            pageSize: data.pageSize || 13
        };
    } catch (e) {
        console.error("Error fetching more bonds:", e);
        return { bonds: [], statsMap: {}, total: 0, page: 1, pageSize: 13 };
    }
}
