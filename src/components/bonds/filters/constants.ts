export const CURRENCIES = [
    { value: 'RUB', label: 'RUB' },
    { value: 'USD', label: 'USD' },
    { value: 'CNY', label: 'CNY' },
    { value: 'EUR', label: 'EUR' },
    { value: 'CHF', label: 'CHF' },
];

export const RATINGS = ['AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-', 'BBB+', 'BBB', 'BBB-', 'BB+', 'BB', 'BB-', 'B+', 'B', 'B-', 'CCC+', 'CCC', 'CCC-', "CC+", "CC", "CC-", "C+", "C", "C-", 'D'];

export const FLAG_OPTIONS = [
    { value: '0', label: 'Не важно' },
    { value: '2', label: 'Да' },
    { value: '1', label: 'Нет' },
];

export const COUPON_QUANTITY_OPTIONS = [1, 2, 4, 6, 12];

export const SORT_OPTIONS = [
    { value: 'price', label: 'Цена' },
    { value: 'yield', label: 'Доходность' },
    { value: 'duration', label: 'Дюрация' },
    { value: 'coupon', label: 'Ставка купона' },
    { value: 'nominal', label: 'Номинал' },
    { value: 'maturitydate', label: 'Дата погашения' },
    { value: 'placementdate', label: 'Дата размещения' },
    { value: 'rating', label: 'Рейтинг' },
];

export const FINANCIAL_METRICS = [
    { label: 'Чистый долг / EBITDA', key: 'NetDebtToEbitda', reverse: true, ranges: [6, 4, 3] },
    { label: 'Долг / Активы', key: 'TotalDebtToAssets', reverse: true, ranges: [0.8, 0.6, 0.5] },
    { label: 'Долг / Капитал', key: 'TotalDebtToEquity', reverse: true, ranges: [3, 2, 1] },
    { label: 'Покрытие процентов (ICR)', key: 'EbitdaToInterestExpense', reverse: false, ranges: [1, 2, 3] },
    { label: 'OCF / Долг', key: 'OperatingCashFlowToTotalDebt', reverse: false, ranges: [0.05, 0.1, 0.2] },
    { label: 'Маржа по EBITDA', key: 'EbitdaMargin', reverse: false, ranges: [5, 10, 15], suffix: '%' },
    { label: 'Чистая маржа', key: 'NetProfitMargin', reverse: false, ranges: [0, 5, 10], suffix: '%' },
    { label: 'ROA', key: 'ReturnOnAssets', reverse: false, ranges: [0, 2, 5], suffix: '%' },
    { label: 'ROI', key: 'ReturnOnInvestment', reverse: false, ranges: [0, 5, 10], suffix: '%' },
    { label: 'Текущая ликвидность', key: 'CurrentRatio', reverse: false, ranges: [0.5, 1, 1.5] },
    { label: 'Быстрая ликвидность', key: 'QuickRatio', reverse: false, ranges: [0.5, 1, 1.5] },
];

export interface FilterSectionItem {
    index: number;
    label: string;
    icon: string;
    hasChildren?: boolean;
}

export const FILTER_SECTIONS: FilterSectionItem[] = [
    { index: 0, label: 'Сортировка', icon: '↕️' },
    { index: 1, label: 'Цена', icon: '💰' },
    { index: 2, label: 'Ставка купона', icon: '📊' },
    { index: 3, label: 'Номинал', icon: '💵' },
    { index: 4, label: 'Валюта цены', icon: '🏦' },
    { index: 5, label: 'Валюта номинала', icon: '🏧' },
    { index: 6, label: 'Дата купона', icon: '📅' },
    { index: 7, label: 'Купонов в год', icon: '🔢' },
    { index: 8, label: 'Для квал. инвесторов', icon: '🎓' },
    { index: 9, label: 'Амортизация', icon: '📉', hasChildren: true },
    { index: 10, label: 'Плавающий купон', icon: '🌊', hasChildren: true },
    { index: 11, label: 'Доступно с плечом', icon: '⚖️' },
    { index: 12, label: 'Оферта / Опцион', icon: '📋' },
    { index: 13, label: 'Доступно в Т-Банке', icon: '🟡' },
    { index: 14, label: 'Был тех. дефолт', icon: '⚠️' },
    { index: 15, label: 'В дефолте', icon: '🚨' },
    { index: 16, label: 'Из особого списка', icon: '⭐' },
    { index: 17, label: 'Дней после размещения', icon: '📆' },
    { index: 18, label: 'Дней до погашения', icon: '⏰' },
    { index: 19, label: 'Дней до след. события', icon: '🔔' },
    { index: 20, label: 'Рейтинг', icon: '🏅' },
    { index: 21, label: 'Чистый долг / EBITDA', icon: '📈' },
    { index: 22, label: 'Долг / Активы', icon: '📈' },
    { index: 23, label: 'Долг / Капитал', icon: '📈' },
    { index: 24, label: 'Покрытие процентов', icon: '📈' },
    { index: 25, label: 'OCF / Долг', icon: '📈' },
    { index: 26, label: 'Маржа по EBITDA', icon: '📈' },
    { index: 27, label: 'Чистая маржа', icon: '📈' },
    { index: 28, label: 'ROA', icon: '📈' },
    { index: 29, label: 'ROI', icon: '📈' },
    { index: 30, label: 'Текущая ликвидность', icon: '📈' },
    { index: 31, label: 'Быстрая ликвидность', icon: '📈' },
    { index: 32, label: 'Есть в портфеле', icon: '💼' },
];

export const ALL_FILTER_INDICES = FILTER_SECTIONS.map(s => s.index);