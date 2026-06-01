import { ApiV1BondsGetRequest, BondInstrument, BrandBusinessResponse, Flag } from '@/lib/api';

export const convertRating = (rating: string | null | undefined) => {
    if (!rating) return '➖';
    return rating
        .replaceAll('A', '🅰️')
        .replaceAll('B', '🅱️')
        .replaceAll('+', '➕')
        .replaceAll('-', '➖');
};

const getRateTypeName = (type: number | undefined) => {
    if (type === 1) return 'КС ЦБ';
    if (type === 2) return 'RUONIA';
    if (type === 0) return 'Другое';
    return 'Базовая ставка';
};

export const convertBondToText = (
    bond: BondInstrument,
    brand: BrandBusinessResponse,
    keyRate: number // Оставили параметр для обратной совместимости, если где-то вызывается
): string => {
    const lines: string[] = [];
    const currencyMap: Record<string, string> = {
        rub: 'руб.', usd: 'USD', cny: 'CNY', eur: 'EUR', chf: 'CHF',
    };

    lines.push(`📜 ${bond.name} $${bond.ticker}`);
    if (bond.defaultFlag) lines.push('❌ СТАТУС: ДЕФОЛТ');
    if (bond.technicalDefaultFlag) lines.push('⚠️ Был тех. дефолт');
    if (bond.forQualInvestorFlag) lines.push('⚠️ Для квалов');
    if (bond.nextCall) {
        lines.push(`❗ Оферта/Опцион: ${new Date(bond.nextCall).toLocaleDateString('ru-RU')}`);
    }

    if (!bond.defaultFlag && bond.floatingCouponFlag) {
        const spreadStr = bond.spread !== undefined && bond.spread !== null ? `${bond.spread >= 0 ? '+' : ''}${bond.spread.toFixed(2)}%` : '';
        lines.push(`♻️ Флоатер: ${getRateTypeName(bond.rateType as number)} ${spreadStr}`);
    } else if (!bond.defaultFlag && bond.nextCouponValuePrc !== undefined) {
        lines.push(`🔸 Ставка %: ${bond.nextCouponValuePrc!.toFixed(2)}`);
        if (bond._yield && bond._yield > 0) {
            const ytText = bond.nextCall ? "YTO" : "YTM";
            lines.push(`🔸 ${ytText}: ${bond._yield.toFixed(2)}%`);
        }
    }
    if (!bond.defaultFlag && !bond.floatingCouponFlag) {
        lines.push(`🔸 Дюрация (дней): ${bond.duration}`)
    }
    lines.push(`🔸 Погашение: ${new Date(bond.maturityDate!).toLocaleDateString('ru-RU')}`);

    if (bond.price !== undefined && bond.currentNominal !== undefined && !bond.defaultFlag) {
        lines.push(`🔸 Цена: ${bond.price.toFixed(2)} %`);
    }
    if (bond.aciValue) lines.push(`🔸 НКД: ${bond.aciValue.toFixed(2)} руб.`);

    if (bond.nextCouponValue !== undefined && bond.nextCouponDate) {
        lines.push(`🔸 След. купон: ${new Date(bond.nextCouponDate).toLocaleDateString('ru-RU')}`);
        const curr = bond.nominalCurrency ? currencyMap[bond.nominalCurrency.toLowerCase()] || bond.nominalCurrency : 'руб.';
        lines.push(`🔸 Размер: ${bond.nextCouponValue!.toFixed(2)} ${curr}`);
    }

    if (bond.couponQuantityPerYear && bond.couponQuantityPerYear > 0) {
        lines.push(`🔸 Выплат в год: ${bond.couponQuantityPerYear}`);
    }
    if (bond.amortizationFlag !== true) {
        lines.push(`🔸 Амортизация: ✖️`);
    }
    if (bond.amortizationFlag === true) {
        lines.push(`🔹 Ближ. аморт: ${new Date(bond.nextMaturityDate!).toLocaleDateString('ru-RU')}`);
        lines.push(`🔹 Доля: ${bond.nextMaturityValue!.toFixed(2)} %`);
    }
    if (bond.marginAbleFlag === true) {
        lines.push(`🔸 Плечо: ✔️}`);
    }

    lines.push(`🔸 Рейтинг: ${convertRating(bond.creditRating || brand.creditRating)}`);

    return lines.join('\n') + '\n';
};

export const convertBusinessToText = (
    business: BrandBusinessResponse
): string => {
    const withEmoji = (
        value: number | null | undefined,
        ranges: [number, number, number, number],
        reverse: boolean = false
    ) => {
        if (value == null || isNaN(value) || value == 0) return '⚪';

        const [r1, r2, r3, r4] = ranges;

        if (!reverse) {
            if (value < r1) return `🔴 ${value.toFixed(2)}`;
            if (value < r2) return `🟠 ${value.toFixed(2)}`;
            if (value < r3) return `🟡 ${value.toFixed(2)}`;
            if (value < r4) return `🟢 ${value.toFixed(2)}`;
            return `🟢 ${value.toFixed(2)}`;
        } else {
            if (value > r1) return `🔴 ${value.toFixed(2)}`;
            if (value > r2) return `🟠 ${value.toFixed(2)}`;
            if (value > r3) return `🟡 ${value.toFixed(2)}`;
            if (value > r4) return `🟢 ${value.toFixed(2)}`;
            return `🟢 ${value.toFixed(2)}`;
        }
    };

    if (!business.docType || business.docType === '-') {
        return '';
    }

    return "";
};

export const convertFiltersToText = (baseFilters: ApiV1BondsGetRequest): string => {
    const filters = baseFilters;
    let result = '➖➖➖➖➖➖➖➖➖➖\n📒 Описание подборки:\n';

    const addRange = (label: string, from?: number, to?: number) => {
        if (from !== undefined || to !== undefined) {
            result += `${label}${from !== undefined ? ` от ${from}` : ''}${to !== undefined ? ` до ${to}` : ''}\n`;
        }
    };

    const addDateRange = (label: string, from?: Date | string | number, to?: Date | string | number) => {
        if (from || to) {
            const format = (d?: Date | string | number) => d ? new Date(d).toLocaleDateString('ru-RU') : '';
            result += `${label}${from ? ` от ${format(from)}` : ''}${to ? ` до ${format(to)}` : ''}\n`;
        }
    };

    const addFlag = (labelYes: string, labelNo: string, flag?: Flag) => {
        if (flag !== undefined && flag !== 0) {
            result += `${flag === 2 ? labelYes : labelNo}\n`;
        }
    };

    if (filters.currency) result += `📌 Валюта: ${filters.currency}\n`;
    if (filters.nominalCurrency) result += `📌 Валюта номинала: ${filters.nominalCurrency}\n`;
    if (filters.couponQuantityPerYear !== undefined && filters.couponQuantityPerYear !== null) {
        result += `📌 Купонов в год: ${filters.couponQuantityPerYear}\n`;
    }
    if (filters.rateType !== 0) {
        result += `📌 Базовая ставка: ${getRateTypeName(filters.rateType)}\n`;
    }

    addRange('📌 Номинал', filters.nominalFrom, filters.nominalTo);
    addRange('📌 Цена', filters.priceFrom, filters.priceTo);
    addRange('📌 Ставка купона %', filters.couponPrcFrom, filters.couponPrcTo);
    addRange('📌 Тек. купонная доходность %', filters.currentYieldFrom, filters.currentYieldTo);
    addRange('📌 Доходность %', filters.yieldFrom, filters.yieldTo);
    addRange('📌 Дюрация (дни)', filters.durationFrom, filters.durationTo);
    addRange('📌 Премия флоатера %', filters.spreadFrom, filters.spreadTo);

    addDateRange('📌 Дата размещения', filters.placementDateFrom, filters.placementDateTo);
    addDateRange('📌 Дата погашения', filters.matureDateFrom, filters.matureDateTo);
    addDateRange('📌 След. оферта', filters.firstCallDateFrom, filters.firstCallDateTo);
    addDateRange('📌 Первая амортизация', filters.firstMtyDateFrom, filters.firstMtyDateTo);

    addFlag('📌 С амортизацией', '📌 Без амортизации', filters.amortizationFlag);
    addFlag('📌 Плав. купон', '📌 Фикс. купон', filters.floatingCouponFlag);
    addFlag('📌 Доступно с плечом', '📌 Недоступно с плечом', filters.marginAbleFlag);
    addFlag('📌 Для квалов', '📌 Для неквалов', filters.forQualInvestorFlag);
    addFlag('📌 С офертой/опционом', '📌 Без оферт/опционов', filters.hasEventsFlag);
    addFlag('📌 В дефолте', '📌 Без дефолта', filters.defaultFlag);

    addRange('📌 ЧД / EBITDA', filters.netDebtToEbitdaFrom, filters.netDebtToEbitdaTo);
    addRange('📌 Общий долг / Соб. капитал', filters.totalDebtToEquityFrom, filters.totalDebtToEquityTo);
    addRange('📌 Общий долг / Активы', filters.totalDebtToAssetsFrom, filters.totalDebtToAssetsTo);
    addRange('📌 EBITDA / % расходы', filters.ebitdaToInterestExpenseFrom, filters.ebitdaToInterestExpenseTo);
    addRange('📌 OCF / Общий долг', filters.operatingCashFlowToTotalDebtFrom, filters.operatingCashFlowToTotalDebtTo);
    addRange('📌 Маржа EBITDA %', filters.ebitdaMarginFrom, filters.ebitdaMarginTo);
    addRange('📌 Чистая маржа %', filters.netProfitMarginFrom, filters.netProfitMarginTo);
    addRange('📌 ROA %', filters.returnOnAssetsFrom, filters.returnOnAssetsTo);
    addRange('📌 ROI %', filters.returnOnInvestmentFrom, filters.returnOnInvestmentTo);
    addRange('📌 Текущая ликвидность', filters.currentRatioFrom, filters.currentRatioTo);
    addRange('📌 Быстрая ликвидность', filters.quickRatioFrom, filters.quickRatioTo);

    return result.trim();
};
