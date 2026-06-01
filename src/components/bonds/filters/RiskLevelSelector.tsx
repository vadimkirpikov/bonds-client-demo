import React, { useMemo } from 'react';

interface RiskLevelSelectorProps {
    label: string;
    baseKey: string;
    ranges: number[];
    reverse: boolean;
    filters: Record<string, string>;
    onChange: (key: string, val: string) => void;
    onClear: (key: string) => void;
    suffix?: string;
}

export const RiskLevelSelector = ({
                                      label,
                                      baseKey,
                                      ranges,
                                      reverse,
                                      filters,
                                      onChange,
                                      onClear,
                                      suffix = ''
                                  }: RiskLevelSelectorProps) => {
    const fromVal = filters[`${baseKey}From`];
    const toVal = filters[`${baseKey}To`];

    const formatRange = (min?: number, max?: number) => {
        if (min === undefined && max !== undefined) return `< ${max}${suffix}`;
        if (min !== undefined && max === undefined) return `> ${min}${suffix}`;
        if (min !== undefined && max !== undefined) return `${min} - ${max}${suffix}`;
        return '';
    };

    const levels = useMemo(() => {
        const [r1, r2, r3] = ranges;

        const baseStyle = 'bg-[var(--color-card)] shadow-card';

        const styleGood = { style: `${baseStyle} hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-[var(--color-muted-foreground)]`, activeStyle: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 scale-105 shadow-card' };
        const styleMid = { style: `${baseStyle} hover:bg-yellow-50 dark:hover:bg-yellow-500/10 text-[var(--color-muted-foreground)]`, activeStyle: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 scale-105 shadow-card' };
        const stylePoor = { style: `${baseStyle} hover:bg-orange-50 dark:hover:bg-orange-500/10 text-[var(--color-muted-foreground)]`, activeStyle: 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 scale-105 shadow-card' };
        const styleBad = { style: `${baseStyle} hover:bg-red-50 dark:hover:bg-red-500/10 text-[var(--color-muted-foreground)]`, activeStyle: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 scale-105 shadow-card' };

        if (reverse) {
            return [
                { id: 'good', text: 'Отлично', min: undefined, max: r3, rangeLabel: formatRange(undefined, r3), ...styleGood },
                { id: 'mid', text: 'Норма', min: r3, max: r2, rangeLabel: formatRange(r3, r2), ...styleMid },
                { id: 'poor', text: 'Слабо', min: r2, max: r1, rangeLabel: formatRange(r2, r1), ...stylePoor },
                { id: 'bad', text: 'Плохо', min: r1, max: undefined, rangeLabel: formatRange(r1, undefined), ...styleBad }
            ];
        } else {
            return [
                { id: 'bad', text: 'Плохо', min: undefined, max: r1, rangeLabel: formatRange(undefined, r1), ...styleBad },
                { id: 'poor', text: 'Слабо', min: r1, max: r2, rangeLabel: formatRange(r1, r2), ...stylePoor },
                { id: 'mid', text: 'Норма', min: r2, max: r3, rangeLabel: formatRange(r2, r3), ...styleMid },
                { id: 'good', text: 'Отлично', min: r3, max: undefined, rangeLabel: formatRange(r3, undefined), ...styleGood }
            ];
        }
    }, [ranges, reverse, suffix]);

    const isLevelActive = (min?: number, max?: number) => {
        const currentFrom = fromVal ? parseFloat(fromVal) : undefined;
        const currentTo = toVal ? parseFloat(toVal) : undefined;
        const matchMin = min === undefined ? currentFrom === undefined : currentFrom === min;
        const matchMax = max === undefined ? currentTo === undefined : currentTo === max;
        return matchMin && matchMax;
    };

    const handleClick = (min?: number, max?: number) => {
        if (isLevelActive(min, max)) {
            onClear(baseKey);
        } else {
            onClear(baseKey);
            if (min !== undefined) onChange(`${baseKey}From`, min.toString());
            if (max !== undefined) onChange(`${baseKey}To`, max.toString());
        }
    };

    return (
        <div>
            <div className="flex justify-between items-end mb-3">
                <label className="text-xs text-[var(--color-muted-foreground)] font-medium">{label}</label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {levels.map((lvl) => {
                    const active = isLevelActive(lvl.min, lvl.max);
                    return (
                        <button
                            key={lvl.id}
                            onClick={() => handleClick(lvl.min, lvl.max)}
                            className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all duration-300 select-none ${
                                active ? lvl.activeStyle : lvl.style
                            }`}
                        >
                            <span className={`text-xs font-bold leading-tight mb-1 ${active ? 'text-current' : 'text-[var(--color-foreground)]'}`}>{lvl.text}</span>
                            <span className={`text-[10px] font-mono leading-none ${active ? 'text-current opacity-80' : 'text-[var(--color-muted-foreground)]'}`}>{lvl.rangeLabel}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};