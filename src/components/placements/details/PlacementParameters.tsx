import { Activity, Info } from 'lucide-react';
import { PublicOfferingResponseDto } from '@/lib/api';
import { cn } from '@/components/ui/Button';

export const StatBox = ({ label, value, suffix = '', highlight, color, className }: any) => {
    const displayValue = (value === undefined || value === null) ? '-' : `${typeof value === 'number' ? value.toFixed(2) : value}${suffix}`;

    let containerClass = "p-5 rounded-3xl flex flex-col justify-center transition-all bg-[var(--color-muted)] hover:shadow-card";
    let valColor = color || "text-[var(--color-foreground)]";
    let labelColor = "text-[var(--color-muted-foreground)]";

    if (highlight) {
        containerClass = "p-5 rounded-3xl flex flex-col justify-center transition-all bg-[var(--color-muted)] shadow-card";
    }

    return (
        <div className={cn(containerClass, className)}>
            <p className={cn("text-xs mb-1.5 truncate", labelColor)} title={label}>{label}</p>
            <p className={cn("text-sm sm:text-base md:text-xl", valColor)}>{displayValue}</p>
        </div>
    );
};

export const PlacementParameters = ({ placement }: { placement: PublicOfferingResponseDto }) => {
    
    const formatPrefixes = (val?: string | null) => {
        if (!val) return val;
        return val
            .replace(/не\s*менее/gi, '≥')
            .replace(/не\s*более/gi, '≤')
            .replace(/более/gi, '>')
            .replace(/менее/gi, '<');
    };
    
    const stats = [
        { label: "Купон", value: placement.couponRate, color: "text-primary" },
        { label: "Период купона", value: placement.couponPeriod },
        { label: "Дюрация", value: placement.duration },
        { label: "Дата размещения", value: placement.placementDateLabel },
        { label: "Дата погашения", value: placement.maturityDateLabel },
        { label: "Объем", value: formatPrefixes(placement.volume) },
    ].filter(stat => stat.value); // Only show non-empty

    const isOdd = stats.length % 2 !== 0;

    return (
        <section>
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2 text-[var(--color-foreground)]">
                <Activity size={20} className="text-primary"/> Параметры размещения
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                
                <div className="bg-[var(--color-muted)] p-5 rounded-3xl flex flex-col justify-center transition-all hover:shadow-card col-span-2 sm:col-span-3">
                    <p className="text-xs mb-1.5 font-bold text-[var(--color-muted-foreground)]">Полное наименование</p>
                    <p className="text-sm sm:text-base md:text-lg text-[var(--color-foreground)] leading-snug">
                        {placement.name || '-'}
                    </p>
                </div>

                
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

            {placement.comment && (
                <div className="mt-4 bg-primary/5 dark:bg-primary/10 p-5 rounded-3xl">
                    <h3 className="font-bold text-lg mb-2 text-[var(--color-foreground)] flex items-center gap-2">
                        <Info size={18} className="text-primary"/> Комментарий
                    </h3>
                    <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed whitespace-pre-wrap">
                        {placement.comment}
                    </p>
                </div>
            )}
        </section>
    );
};
