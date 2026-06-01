import { Activity } from 'lucide-react';
import { BondDtoResponse, BondRateType } from '@/lib/api';
import { cn } from '@/components/ui/Button';

export const StatBox = ({ label, value, suffix = '', highlight, color, indicator, className }: any) => {
    const displayValue = (value === undefined || value === null) ? '-' : `${typeof value === 'number' ? value.toFixed(2) : value}${suffix}`;

    let containerClass = "p-5 rounded-3xl flex flex-col justify-center transition-all bg-[var(--color-muted)] hover:shadow-card";
    let valColor = color || "text-[var(--color-foreground)]";
    let labelColor = "text-[var(--color-muted-foreground)]";

    if (highlight) {
        containerClass = "p-5 rounded-3xl flex flex-col justify-center transition-all bg-[var(--color-muted)] shadow-card";
    }

    if (indicator) {
        if (indicator === 'bad') {
            containerClass = "p-5 rounded-3xl flex flex-col justify-center transition-all bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/15";
            valColor = "text-red-600 dark:text-red-400";
            labelColor = "text-red-600/80 dark:text-red-400/80";
        } else if (indicator === 'poor') {
            containerClass = "p-5 rounded-3xl flex flex-col justify-center transition-all bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-100 dark:hover:bg-orange-500/15";
            valColor = "text-orange-600 dark:text-orange-400";
            labelColor = "text-orange-600/80 dark:text-orange-400/80";
        } else if (indicator === 'mid') {
            containerClass = "p-5 rounded-3xl flex flex-col justify-center transition-all bg-yellow-50 dark:bg-yellow-500/10 hover:bg-yellow-100 dark:hover:bg-yellow-500/15";
            valColor = "text-yellow-600 dark:text-yellow-400";
            labelColor = "text-yellow-600/80 dark:text-yellow-400/80";
        } else if (indicator === 'good') {
            containerClass = "p-5 rounded-3xl flex flex-col justify-center transition-all bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/15";
            valColor = "text-emerald-600 dark:text-emerald-400";
            labelColor = "text-emerald-600/80 dark:text-emerald-400/80";
        }
    }

    return (
        <div className={cn(containerClass, className)}>
            <p className={cn("text-xs mb-1.5 truncate", labelColor)} title={label}>{label}</p>
            <p className={cn("text-base md:text-xl truncate", valColor)}>{displayValue}</p>
        </div>
    );
};

export const BondParameters = ({ bond }: { bond: BondDtoResponse }) => {
    const getYearWord = (value: number) => {
        const fixed = value.toFixed(2);
        if (fixed.endsWith('.00')) {
            const n = Math.abs(Math.round(value)) % 100;
            const n1 = n % 10;
            if (n > 10 && n < 20) return 'лет';
            if (n1 === 1) return 'год';
            if (n1 >= 2 && n1 <= 4) return 'года';
            return 'лет';
        }
        return 'года';
    };

    const formatRateType = (rt?: BondRateType) => {
        if (!rt) return 'Ошибка';
        if (rt === 1) return "КС ЦБ";
        if (rt === 2) return "RUONIA";
    };

    const durationInYears = bond.duration ? bond.duration / 365 : null;

    const isLong = (val: any) => val !== undefined && val !== null && String(val).length > 7;

    const showPrice = bond.price && bond.price > 0;
    const showDuration = !bond.floatingCouponFlag && durationInYears !== null && durationInYears > 0 && !bond.defaultFlag;
    const showYield = bond._yield !== undefined && bond._yield !== null && bond._yield > 0 && !bond.defaultFlag;
    const showRateType = bond.floatingCouponFlag && !!bond.rateType;
    const showSpread = showRateType && bond.spread !== undefined && bond.spread !== null;

    const showCouponVal = bond.nextCouponValue !== undefined && bond.nextCouponValue !== null && !(bond.floatingCouponFlag && bond.nextCouponValue === 0);

    const aciLong = isLong(bond.aciValue);
    const couponLong = showCouponVal && isLong(bond.nextCouponValue);
    const nominalLong = isLong(bond.currentNominal);

    const stats = [
        showPrice ? { label: "Текущая цена", value: `${bond.price?.toFixed(2)}%` } : null,
        showYield ? { label: "Доходность", value: bond._yield, suffix: "%", color: "text-emerald-600 dark:text-emerald-400" } : null,
        { label: "Ставка", value: `${bond.nextCouponValuePrc?.toFixed(2)}%`, color: "text-primary" },
        showRateType ? { label: "Привязка", value: formatRateType(bond.rateType) } : null,
        showSpread ? { label: "Премия", value: bond.spread, suffix: "%" } : null,
        !aciLong ? { label: "НКД", value: bond.aciValue, suffix: ` ${bond.currency?.toUpperCase() || ''}` } : null,
        (!couponLong && showCouponVal) ? { label: "Купон", value: bond.nextCouponValue, suffix: ` ${bond.nominalCurrency?.toUpperCase() || ''}` } : null,
        { label: "Выплат в год", value: bond.couponQuantityPerYear?.toFixed(0) },
        !nominalLong ? { label: "Номинал", value: bond.currentNominal, suffix: ` ${bond.nominalCurrency?.toUpperCase() || ''}` } : null,
        { label: "Тип купона", value: bond.floatingCouponFlag ? 'Флоатер' : 'Фикс' },
        { label: "Амортизация", value: bond.amortizationFlag ? 'Да' : 'Нет' },
        showDuration ? { label: "Дюрация", value: durationInYears, suffix: ` ${getYearWord(durationInYears!)}` } : null,
    ].filter(Boolean);

    const isOdd = stats.length % 2 !== 0;

    const renderWideBlock = (label: string, value: string) => (
        <div className="bg-[var(--color-muted)] p-5 rounded-3xl flex flex-col justify-center transition-all hover:shadow-card col-span-2 sm:col-span-3">
            <p className="text-xs mb-1.5 text-[var(--color-muted-foreground)]">{label}</p>
            <p className="text-sm sm:text-base md:text-lg text-[var(--color-foreground)] leading-snug">
                {value}
            </p>
        </div>
    );

    return (
        <section>
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2 text-[var(--color-foreground)]">
                <Activity size={20} className="text-primary"/> Параметры облигации
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                
                <div className="bg-[var(--color-muted)] p-5 rounded-3xl flex flex-col justify-center transition-all hover:shadow-card col-span-2 sm:col-span-3">
                    <p className="text-xs mb-1.5 font-bold text-[var(--color-muted-foreground)]">Полное наименование</p>
                    <p className="text-sm sm:text-base md:text-lg text-[var(--color-foreground)] leading-snug">
                        {bond.fullName || bond.name || '-'}
                    </p>
                </div>

                
                {nominalLong && renderWideBlock("Номинал", `${bond.currentNominal} ${bond.nominalCurrency?.toUpperCase() || ''}`)}
                {couponLong && renderWideBlock("Купон", `${bond.nextCouponValue} ${bond.nominalCurrency?.toUpperCase() || ''}`)}
                {aciLong && renderWideBlock("НКД", `${bond.aciValue} ${bond.currency?.toUpperCase() || ''}`)}

                
                {stats.map((stat: any, index: number) => {
                    const isLast = index === stats.length - 1;
                    const spanClass = (isOdd && isLast) ? 'col-span-2 sm:col-span-1' : '';

                    return (
                        <StatBox
                            key={stat.label}
                            {...stat}
                            className={spanClass}
                        />
                    );
                })}
            </div>
        </section>
    );
};