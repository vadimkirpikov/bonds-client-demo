'use client';

import { BondDtoResponse } from '@/lib/api';
import { cn } from '@/components/ui/Button';
import Link from 'next/link';
import { ChevronRight, Layers, MapPin } from 'lucide-react';

interface OtherIssuesProps {
    bonds: BondDtoResponse[];
    currentBondId?: string;
    hasAccess: boolean;
}

export const OtherIssues = ({ bonds, currentBondId, hasAccess }: OtherIssuesProps) => {
    const otherBonds = bonds.filter(b => b.id !== currentBondId && b.ticker !== currentBondId);

    if (!otherBonds || otherBonds.length === 0) {
        return null;
    }

    const fixedBonds = otherBonds.filter(b => !b.floatingCouponFlag);
    const floaterBonds = otherBonds.filter(b => b.floatingCouponFlag);

    const mapBonds = fixedBonds.filter(b => 
        b._yield != null && b._yield > 0 && 
        b.duration != null && b.duration > 0 &&
        !b.defaultFlag
    );

    let minDur = 0, maxDur = 0, minYield = 0, maxYield = 0;
    if (mapBonds.length > 0) {
        minDur = Math.min(...mapBonds.map(b => b.duration!));
        maxDur = Math.max(...mapBonds.map(b => b.duration!));
        minYield = Math.min(...mapBonds.map(b => b._yield!));
        maxYield = Math.max(...mapBonds.map(b => b._yield!));

        const durPadding = Math.max((maxDur - minDur) * 0.1, 30);
        const yieldPadding = Math.max((maxYield - minYield) * 0.1, 0.5);

        minDur = Math.max(0, minDur - durPadding);
        maxDur = maxDur + durPadding;
        minYield = Math.max(0, minYield - yieldPadding);
        maxYield = maxYield + yieldPadding;
    }

    const getX = (dur: number) => {
        if (maxDur === minDur) return 50;
        return ((dur - minDur) / (maxDur - minDur)) * 100;
    };

    const getY = (y: number) => {
        if (maxYield === minYield) return 50;
        return 100 - (((y - minYield) / (maxYield - minYield)) * 100);
    };

    const getYearWord = (days: number) => {
        const value = days / 365;
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

    const formatDur = (days: number) => {
        const years = days / 365;
        return `${years.toFixed(1)} ${getYearWord(days)}`;
    };

    return (
        <div className="flex flex-col gap-6">
            <h3 className="font-bold text-xl text-[var(--color-foreground)] flex items-center gap-2 mb-2">
                <Layers size={22} className="text-primary"/> Другие выпуски эмитента
            </h3>

            
            {fixedBonds.length > 0 && (
                <div className="flex flex-col gap-4">
                    <h4 className="font-bold text-lg text-[var(--color-foreground)] pb-2">Фиксы</h4>
                    
                    
                    {mapBonds.length > 0 && (
                        <div className="bg-[var(--color-card)] rounded-3xl shadow-card p-5  relative h-[300px] flex flex-col mb-2">
                            
                            <div className="absolute left-10 top-5 bottom-10 w-px bg-[var(--color-muted)]" />
                            <div className="absolute left-10 bottom-10 right-5 h-px bg-[var(--color-muted)]" />
                            
                            <span className="absolute left-2 top-2 text-[10px] text-[var(--color-muted-foreground)] font-bold uppercase tracking-wider">Доходность, %</span>
                            <span className="absolute right-5 bottom-3 text-[10px] text-[var(--color-muted-foreground)] font-bold uppercase tracking-wider">Дюрация</span>

                            <span className="absolute left-2 bottom-8 text-[10px] text-[var(--color-muted-foreground)] font-mono">{minYield.toFixed(1)}</span>
                            <span className="absolute left-2 top-8 text-[10px] text-[var(--color-muted-foreground)] font-mono">{maxYield.toFixed(1)}</span>
                            
                            <span className="absolute left-9 bottom-3 text-[10px] text-[var(--color-muted-foreground)] font-mono">{formatDur(minDur)}</span>
                            <span className="absolute right-5 bottom-12 text-[10px] text-[var(--color-muted-foreground)] font-mono">{formatDur(maxDur)}</span>

                            
                            <div className="absolute left-10 top-8 bottom-10 right-5">
                                {mapBonds.map(bond => {
                                    const isOffer = !!bond.nextCall;
                                    const x = getX(bond.duration!);
                                    const y = getY(bond._yield!);
                                    
                                    return (
                                        <Link
                                            key={bond.id || bond.ticker}
                                            href={hasAccess ? `/bonds/${bond.id || bond.ticker}` : '/dashboard'}
                                            className="absolute w-4 h-4 -ml-2 -mt-2 group z-10 transition-transform hover:scale-125"
                                            style={{ left: `${x}%`, top: `${y}%` }}
                                        >
                                            <div className={cn(
                                                "w-full h-full rounded-full shadow-sm ring-2 ring-[var(--color-background)]",
                                                isOffer 
                                                    ? "bg-[var(--color-background)] border-[3px] border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" 
                                                    : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                                            )} />
                                            
                                            
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-20">
                                                <div className="bg-[var(--color-foreground)] text-[var(--color-background)] text-xs p-2.5 rounded-xl shadow-xl flex flex-col gap-1">
                                                    <span className="font-bold truncate">{bond.shortName || bond.name}</span>
                                                    <div className="flex justify-between items-center gap-3">
                                                        <span className="opacity-80">Дох.</span>
                                                        <span className="font-mono font-bold text-emerald-400">{bond._yield!.toFixed(2)}%</span>
                                                    </div>
                                                    <div className="flex justify-between items-center gap-3">
                                                        <span className="opacity-80">Дюр.</span>
                                                        <span className="font-mono font-bold opacity-90">{formatDur(bond.duration!)}</span>
                                                    </div>
                                                    <div className="mt-1 flex items-center gap-1 opacity-90">
                                                        <MapPin size={10} className={isOffer ? "text-amber-400" : "text-emerald-400"} />
                                                        <span className="text-[9px] uppercase tracking-wider font-bold">
                                                            {isOffer ? 'К оферте' : 'К погашению'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                            
                            
                            <div className="absolute top-4 right-5 flex flex-col gap-2 bg-[var(--color-background)]/80 backdrop-blur-sm p-2 rounded-xl shadow-sm  text-[10px] font-medium text-[var(--color-muted-foreground)]">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                    <span>К погашению</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full border-2 border-amber-500" />
                                    <span>К оферте</span>
                                </div>
                            </div>
                        </div>
                    )}

                    
                    <div className="flex flex-col gap-2">
                        {fixedBonds.map(bond => {
                            const isOffer = !!bond.nextCall;
                            const hasYield = bond._yield != null && bond._yield > 0;
                            
                            return (
                                <Link 
                                    key={bond.id || bond.ticker} 
                                    href={hasAccess ? `/bonds/${bond.id || bond.ticker}` : '/dashboard'}
                                    className="bg-[var(--color-muted)] p-4 rounded-2xl transition-all flex flex-col gap-3 group relative overflow-hidden hover:bg-[var(--color-muted)]/80"
                                >
                                    <div className={cn("flex items-center justify-between", !hasAccess && "filter blur-[4px] opacity-60 select-none")}>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-[var(--color-foreground)] truncate max-w-[200px] sm:max-w-[300px]">{bond.shortName || bond.name}</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-mono text-[var(--color-muted-foreground)] bg-[var(--color-muted)] px-1.5 py-0.5 rounded">{bond.ticker}</span>
                                                {bond.creditRating && bond.creditRating !== '?' && (
                                                    <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] bg-[var(--color-muted)] px-1.5 py-0.5 rounded">{bond.creditRating}</span>
                                                )}
                                                {isOffer && (
                                                    <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">Оферта</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                {hasYield ? (
                                                    <span className="text-emerald-500 text-lg">{bond._yield!.toFixed(1)}%</span>
                                                ) : (
                                                    <span className="text-[var(--color-muted-foreground)] text-lg">-</span>
                                                )}
                                                <span className="block text-[10px] text-[var(--color-muted-foreground)] uppercase font-bold tracking-wider">Доходность</span>
                                            </div>
                                            <div className="w-8 h-8 rounded-lg bg-[var(--color-muted)] flex items-center justify-center text-[var(--color-muted-foreground)] group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                                                <ChevronRight size={16} />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    
                                    <div className={cn("grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2", !hasAccess && "filter blur-[4px] opacity-60 select-none")}>
                                        <div>
                                            <span className="block text-[9px] text-[var(--color-muted-foreground)] uppercase">Ставка</span>
                                            <span className="text-xs font-bold text-[var(--color-foreground)]">{bond.nextCouponValuePrc ? `${bond.nextCouponValuePrc}%` : '-'}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[9px] text-[var(--color-muted-foreground)] uppercase">Дюрация</span>
                                            <span className="text-xs font-bold text-[var(--color-foreground)]">{bond.duration ? formatDur(bond.duration) : '-'}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[9px] text-[var(--color-muted-foreground)] uppercase">Выплат в год</span>
                                            <span className="text-xs font-bold text-[var(--color-foreground)]">{bond.couponQuantityPerYear || '-'}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[9px] text-[var(--color-muted-foreground)] uppercase">Цена</span>
                                            <span className="text-xs font-bold text-[var(--color-foreground)]">{bond.price ? `${bond.price.toFixed(2)}%` : '-'}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[9px] text-[var(--color-muted-foreground)] uppercase">Номинал</span>
                                            <span className="text-xs font-bold text-[var(--color-foreground)]">{bond.currentNominal ? `${bond.currentNominal} ${bond.nominalCurrency?.toUpperCase() || ''}` : '-'}</span>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}

            
            {floaterBonds.length > 0 && (
                <div className="flex flex-col gap-4 mt-2">
                    <h4 className="font-bold text-lg text-[var(--color-foreground)] pb-2">Флоатеры</h4>
                    <div className="flex flex-col gap-2">
                        {floaterBonds.map(bond => {
                            const isOffer = !!bond.nextCall;
                            const hasSpread = bond.spread != null;
                            
                            return (
                                <Link 
                                    key={bond.id || bond.ticker} 
                                    href={hasAccess ? `/bonds/${bond.id || bond.ticker}` : '/dashboard'}
                                    className="bg-[var(--color-muted)] p-4 rounded-2xl transition-all flex flex-col gap-3 group relative overflow-hidden hover:bg-[var(--color-muted)]/80"
                                >
                                    <div className={cn("flex items-center justify-between", !hasAccess && "filter blur-[4px] opacity-60 select-none")}>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-[var(--color-foreground)] truncate max-w-[200px] sm:max-w-[300px]">{bond.shortName || bond.name}</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-mono text-[var(--color-muted-foreground)] bg-[var(--color-muted)] px-1.5 py-0.5 rounded">{bond.ticker}</span>
                                                <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded">Флоатер</span>
                                                {bond.creditRating && bond.creditRating !== '?' && (
                                                    <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] bg-[var(--color-muted)] px-1.5 py-0.5 rounded">{bond.creditRating}</span>
                                                )}
                                                {isOffer && (
                                                    <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">Оферта</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                {hasSpread ? (
                                                    <span className="font-mono  text-emerald-500 text-lg">{bond.spread!.toFixed(1)}%</span>
                                                ) : (
                                                    <span className="font-mono  text-[var(--color-muted-foreground)] text-lg">-</span>
                                                )}
                                                <span className="block text-[10px] text-[var(--color-muted-foreground)] uppercase font-bold tracking-wider">Премия</span>
                                            </div>
                                            <div className="w-8 h-8 rounded-lg bg-[var(--color-muted)] flex items-center justify-center text-[var(--color-muted-foreground)] group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                                                <ChevronRight size={16} />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    
                                    <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2", !hasAccess && "filter blur-[4px] opacity-60 select-none")}>
                                        <div>
                                            <span className="block text-[9px] text-[var(--color-muted-foreground)] uppercase">База</span>
                                            <span className="text-xs font-mono font-bold text-[var(--color-foreground)]">{bond.rateType === 1 ? 'КС ЦБ' : bond.rateType === 2 ? 'RUONIA' : 'Не указана'}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[9px] text-[var(--color-muted-foreground)] uppercase">Выплат в год</span>
                                            <span className="text-xs font-mono font-bold text-[var(--color-foreground)]">{bond.couponQuantityPerYear || '-'}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[9px] text-[var(--color-muted-foreground)] uppercase">Цена</span>
                                            <span className="text-xs font-mono font-bold text-[var(--color-foreground)]">{bond.price ? `${bond.price.toFixed(2)}%` : '-'}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[9px] text-[var(--color-muted-foreground)] uppercase">Номинал</span>
                                            <span className="text-xs font-mono font-bold text-[var(--color-foreground)]">{bond.currentNominal ? `${bond.currentNominal} ${bond.nominalCurrency?.toUpperCase() || ''}` : '-'}</span>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
