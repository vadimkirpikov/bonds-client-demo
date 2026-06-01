'use server';

import { BondApi, Configuration, MarketMapResponse, ApiV1BondsMarketMapGetRequest, Flag, BondRateType } from '@/lib/api';
import { getServerApi } from '@/lib/server-api';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function getMarketMapData(
    filters: Record<string, string>
): Promise<MarketMapResponse> {
    const session = await getServerSession(authOptions);

    let api: BondApi;

    if (session) {
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

    const p = (key: string) => filters[key] || undefined;
    const num = (key: string) => p(key) ? Number(p(key)) : undefined;
    const date = (key: string) => p(key) ? new Date(p(key)!) : undefined;
    const int = (key: string) => p(key) ? parseInt(p(key)!, 10) : undefined;
    const flag = (key: string): Flags | undefined => int(key) !== undefined ? (int(key) as Flags) : undefined;

    const request: ApiV1BondsMarketMapGetRequest = {
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
        inPortfolioFlag: flag('InPortfolioFlag'),
        markedEmitentsFlag: flag('MarkedEmitentsFlag'),
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
        yieldFrom: num('YieldFrom'),
        yieldTo: num('YieldTo'),
        durationFrom: num('DurationFrom'),
        durationTo: num('DurationTo'),
        currentYieldFrom: num('CurrentYieldFrom'),
        currentYieldTo: num('CurrentYieldTo'),
        spreadFrom: num('SpreadFrom'),
        spreadTo: num('SpreadTo'),
        rateType: num('RateType') as BondRateType | undefined,
        gSpreadFrom: num('GSpreadFrom'),
        gSpreadTo: num('GSpreadTo'),
        sorts: p('sorts'),
    };

    try {
        return await api.apiV1BondsMarketMapGet(request);
    } catch (e) {
        console.error('Error fetching market map data:', e);
        return { ofzYieldCurve: [], bonds: [] };
    }
}
