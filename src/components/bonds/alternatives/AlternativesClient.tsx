'use client';

import { useState } from 'react';
import { BondDtoResponse, BrandBusinessResponse, FinalBondResponse } from '@/lib/api';
import { cn } from '@/components/ui/Button';
import Link from 'next/link';
import { Copy, TrendingUp, ShieldCheck, ChevronRight } from 'lucide-react';

interface AlternativesClientProps {
    targetBond: BondDtoResponse;
    targetBrand: BrandBusinessResponse;
    higherYield: FinalBondResponse[];
    lowerRisk: FinalBondResponse[];
    isAdmin: boolean;
    isSubscriber: boolean;
    isTrialPeriod: boolean;
    freeAttempts: number;
}

const getCreditRatingColor = (rating: string) => {
    if (!rating || rating === '-' || rating === '?') return "text-[var(--color-foreground)] bg-[var(--color-muted)]/50";
    if (rating.includes('AAA')) return "text-emerald-500 bg-emerald-500/10";
    if (rating.includes('AA')) return "text-green-500 bg-green-500/10";
    if (rating.includes('A') && !rating.includes('B') && !rating.includes('C')) return "text-lime-500 bg-lime-500/10";
    if (rating.includes('BBB')) return "text-yellow-500 bg-yellow-500/10";
    if (rating.includes('BB')) return "text-amber-500 bg-amber-500/10";
    if (rating.includes('B')) return "text-orange-500 bg-orange-500/10";
    if (rating.includes('C')) return "text-red-500 bg-red-500/10";
    if (rating.includes('D')) return "text-red-700 bg-red-700/10";
    return "text-[var(--color-foreground)] bg-[var(--color-muted)]/50";
};

export const AlternativesClient = ({ targetBond, targetBrand, higherYield, lowerRisk, isAdmin, isSubscriber, isTrialPeriod, freeAttempts }: AlternativesClientProps) => {
    const [activeTab, setActiveTab] = useState<'highYield' | 'lowRisk'>('highYield');

    const handleCopyAllExport = () => {
        let text = `Сравнение альтернатив для: ${targetBond.name}\n\n`;

        const formatBonds = (bonds: FinalBondResponse[]) => {
            let sectionText = '';
            bonds.slice(0, 10).forEach((item, idx) => {
                const b = item.bondResponse;
                if (!b) return;

                const brand = item.brandBusinessDtoResponse;
                const hasRate = b.nextCouponValuePrc !== null && b.nextCouponValuePrc !== undefined;
                const yieldVal = b._yield ? `${b._yield.toFixed(1)}%` : hasRate ? `${b.nextCouponValuePrc}%` : '?';
                const priceVal = b.price && b.price > 0 ? `${b.price.toFixed(1)}%` : '-';
                const risk = b?.creditRating || brand?.creditRating || '-';

                const cTicker = b.ticker || '';

                sectionText += `${b.name} $${cTicker}\n`;
                sectionText += `${!b.floatingCouponFlag ? `Доходность: ${yieldVal}`: `Премия: ${b.spread}%`}\nЦена: ${priceVal}\nРейтинг: ${risk}\n\n`;
            });
            return sectionText || 'Нет подходящих бумаг\n\n';
        };

        text += `🚀 Больше денег:\n`;
        text += formatBonds(higherYield);

        text += `🛡️ Меньше риска:\n`;
        text += formatBonds(lowerRisk);

        text += `На этом пока всё, буду рад любой вашей поддержке! Всем удачи на рынке💸\n\n🔔Подписывайтесь❤️\n\n#новичок\n#облигации\n#рынок\n#обучение\n#помощь
        `

        navigator.clipboard.writeText(text);
        alert('Сводка по альтернативам скопирована!');
    };

    const renderColumn = (title: string, subtitle: string, icon: React.ReactNode, type: 'higherYield' | 'lowerRisk', list: FinalBondResponse[]) => {
        const isYield = type === 'higherYield';
        return (
            <div className="flex flex-col gap-4">
                <div className="mb-2">
                    <h2 className={cn(
                        "text-xl font-bold flex items-center gap-2",
                        isYield ? "text-emerald-500" : "text-blue-500"
                    )}>
                        {icon} {title}
                    </h2>
                    <span className="text-sm text-[var(--color-muted-foreground)]">{subtitle}</span>
                </div>

                {list.length === 0 ? (
                    <div className="bg-[var(--color-card)] p-8 rounded-3xl text-center shadow-card text-[var(--color-muted-foreground)] text-sm font-medium borderless">
                        Альтернативы не найдены
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {list.slice(0, 10).map(item => (
                            <AlternativeCard
                                key={item.bondResponse?.id || item.bondResponse?.ticker}
                                item={item}
                                target={targetBond}
                                isYieldColumn={isYield}
                                hasAccess={isAdmin || isSubscriber || isTrialPeriod}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="text-[var(--color-foreground)]">
            
            {(!isSubscriber && Number.isInteger(freeAttempts)) && (
                <div className="mb-6 flex justify-center">
                    <div className="inline-flex items-center gap-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-4 py-2 rounded-xl font-bold shadow-sm">
                        <span>Осталось бесплатных попыток:</span>
                        <span className="text-xl">{freeAttempts}</span>
                    </div>
                </div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                
                <div className="sm:hidden flex w-full bg-[var(--color-card)] rounded-2xl p-1 shadow-card borderless">
                    <button
                        onClick={() => setActiveTab('highYield')}
                        className={cn(
                            "flex-1 py-2.5 text-sm font-bold rounded-xl transition-all",
                            activeTab === 'highYield' ? "bg-[var(--color-background)] shadow-sm text-emerald-500" : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                        )}
                    >
                        Больше доходность
                    </button>
                    <button
                        onClick={() => setActiveTab('lowRisk')}
                        className={cn(
                            "flex-1 py-2.5 text-sm font-bold rounded-xl transition-all",
                            activeTab === 'lowRisk' ? "bg-[var(--color-background)] shadow-sm text-blue-500" : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                        )}
                    >
                        Меньше риск
                    </button>
                </div>

                
                {isAdmin && (
                    <button
                        onClick={handleCopyAllExport}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-card)] shadow-card hover:shadow-card-hover rounded-xl text-[var(--color-foreground)] transition-all text-sm font-bold sm:ml-auto w-full sm:w-auto justify-center borderless"
                    >
                        <Copy size={16} className="text-primary" />
                        <span>Скопировать все</span>
                    </button>
                )}
            </div>

            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className={cn("sm:block", activeTab === 'highYield' ? "block" : "hidden")}>
                    {renderColumn(
                        "Выше доходность",
                        "Зачастую это сопряжено с бóльшим риском",
                        <TrendingUp size={22} />,
                        'higherYield',
                        higherYield
                    )}
                </div>
                <div className={cn("sm:block", activeTab === 'lowRisk' ? "block" : "hidden")}>
                    {renderColumn(
                        "Ниже риск",
                        "Надежнее, но потенциальная доходность или премия ниже",
                        <ShieldCheck size={22} />,
                        'lowerRisk',
                        lowerRisk
                    )}
                </div>
            </div>
        </div>
    );
};

const AlternativeCard = ({ item, target, isYieldColumn, hasAccess }: { item: FinalBondResponse, target: BondDtoResponse, isYieldColumn: boolean, hasAccess: boolean }) => {
    const bond = item.bondResponse;
    const brand = item.brandBusinessDtoResponse;

    if (!bond) return null;

    const isFloater = !!bond.floatingCouponFlag;


    const tYield = target._yield || 0;
    const bYield = bond._yield || 0;
    const yieldDiff = bYield - tYield;

    const tSpread = target.spread || 0;
    const bSpread = bond.spread || 0;
    const spreadDiff = bSpread - tSpread;

    const tPrice = target.price || 100;
    const bPrice = bond.price || 0;
    const priceDiff = bPrice - tPrice;

    const formatDiff = (diff: number, type: 'metric1' | 'price') => {
        if (Math.abs(diff) < 0.001) return null;
        const sign = diff > 0 ? '+' : '';

        let isPlus = false;
        if (type === 'metric1') {
            isPlus = diff > 0;
        } else if (type === 'price') {
            isPlus = diff < 0;
        }

        const actualColor = isPlus ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10';

        return <span className={cn("ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-md", actualColor)}>{sign}{diff.toFixed(1)}%</span>;
    };

    const rating = brand?.creditRating || '?';
    const showPrice = bPrice > 0;

    return (
        <div className="bg-[var(--color-card)] p-4 sm:p-5 rounded-2xl shadow-card hover:shadow-card-hover transition-all flex flex-col group relative borderless overflow-hidden">
            <Link href={hasAccess ? `/bonds/${bond.id || bond.ticker}` : '/dashboard'} className="absolute inset-0 z-10 opacity-0">Link</Link>

            <div className="flex justify-between items-start mb-3 gap-2">
                <div className={cn(!hasAccess && "filter blur-[12px] opacity-50 select-none")}>
                    <h4 className="font-bold text-[var(--color-foreground)] line-clamp-2 text-sm max-w-[200px]" title={hasAccess ? (bond.shortName || bond.name!) : undefined}>{bond.shortName || bond.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-[var(--color-muted-foreground)] bg-[var(--color-muted)] px-1.5 py-0.5 rounded">{bond.ticker}</span>
                        {rating && rating !== '?' && (
                            <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", getCreditRatingColor(rating))}>
                                {rating}
                            </span>
                        )}
                    </div>
                </div>
                <Link href={hasAccess ? `/bonds/${bond.id || bond.ticker}` : '/dashboard'} className="p-1.5 rounded-lg bg-[var(--color-muted)] text-[var(--color-muted-foreground)] group-hover:bg-primary/10 group-hover:text-primary transition-colors z-20 borderless">
                    <ChevronRight size={16} />
                </Link>
            </div>

            <div className={cn("grid gap-3 mt-auto", showPrice ? "grid-cols-2" : "grid-cols-1", !hasAccess && "filter blur-[14px] opacity-30 select-none")}>
                
                <div className="bg-[var(--color-background)] rounded-xl p-3 shadow-sm borderless">
                    <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider block mb-1">
                        {isFloater ? 'Премия' : 'Доходность'}
                    </span>
                    <div className="flex items-center flex-wrap">
                        <span className="font-mono font-black text-base text-[var(--color-foreground)]">
                            {isFloater
                                ? (bond.spread ? `${bond.spread}%` : '?')
                                : (bond._yield ? `${bond._yield.toFixed(1)}%` : '?')
                            }
                        </span>
                        {formatDiff(isFloater ? spreadDiff : yieldDiff, 'metric1')}
                    </div>
                </div>
                
                {showPrice && (
                    <div className="bg-[var(--color-background)] rounded-xl p-3 shadow-sm borderless">
                        <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider block mb-1">Цена</span>
                        <div className="flex items-center flex-wrap">
                            <span className="font-mono font-black text-base text-[var(--color-foreground)]">
                                {bPrice.toFixed(1)}%
                            </span>
                            {formatDiff(priceDiff, 'price')}
                        </div>
                    </div>
                )}
            </div>

            {!hasAccess && (
                <Link className="absolute inset-0 z-30 flex items-center justify-center bg-[var(--color-background)]/10 backdrop-blur-[2px] cursor-pointer" href="/dashboard">
                    <div className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-xl font-bold shadow-lg flex items-center gap-2">
                        <ShieldCheck size={18} />
                        Оформите подписку PRO
                    </div>
                </Link>
            )}
        </div>
    );
};