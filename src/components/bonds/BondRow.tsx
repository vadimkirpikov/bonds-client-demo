'use client';

import { BondDtoResponse, BrandBusinessResponse } from '@/lib/api';
import { ChevronRight, Star, TriangleAlert } from 'lucide-react';
import { cn, getCreditRatingColor, getRateTypeName } from '@/lib/utils';
import Link from 'next/link';
import { Logo } from "@/components/ui/Logo";
import { VotingBlock } from "@/components/bonds/VotingBlock";
import { useState, useTransition } from 'react';
import { toggleMarkedIssuer } from '@/actions/collection-actions';

interface BondRowProps {
    bond: BondDtoResponse;
    brand: BrandBusinessResponse;
    isSubscriber?: boolean;
    initialStats?: {
        likes: number;
        dislikes: number;
        userVote: 'LIKE' | 'DISLIKE' | null;
        isFavorite?: boolean;
    };
    isInPortfolio?: boolean | null;
    issuerHoldPercent?: number | null;
}

export const BondRow = ({ bond, brand, isSubscriber = false, initialStats, isInPortfolio, issuerHoldPercent }: BondRowProps) => {
    const parts = brand.logoName?.split('.') || [];
    const finalLogoName =
        parts.length > 1 ? parts[0] + 'x640' + '.' + parts[1] : '';
    const logoSrc = finalLogoName
        ? `https://invest-brands.cdn-tinkoff.ru/${finalLogoName}`
        : '';

    const isDefault = bond.defaultFlag;
    const isTechDefault = bond.technicalDefaultFlag && !bond.defaultFlag;

    const [isMarked, setIsMarked] = useState<boolean>(bond.isMarkedIssuer || false);
    const [isPending, startTransition] = useTransition();

    const handleToggleMarked = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!brand.inn) return;
        startTransition(async () => {
            const result = await toggleMarkedIssuer(brand.inn!);
            if (result.success) {
                setIsMarked(prev => !prev);
            }
        });
    };



    const renderCouponRate = () => {
        if (bond.floatingCouponFlag) {
             const baseName = getRateTypeName(bond.rateType as number);
             const sprd = bond.spread ? `${bond.spread < 0 ? " - " : ""}${Math.abs(bond.spread)}%` : '';
             return <span className="font-sans text-sm">{baseName}{bond.spread! > 0 ? ' + ' : ""}{sprd}</span>;
        }
        if (bond.nextCouponValuePrc === 0) return '-';
        return bond.nextCouponValuePrc ? `${bond.nextCouponValuePrc.toFixed(2)}%` : '-';
    };

    const yieldVal = bond._yield;
    const durationInYears = bond.duration ? bond.duration / 365 : null;

    const renderYield = () => {
        if (!yieldVal) return '-';
        const isExtreme = yieldVal > 50;
        return (
            <span className="flex items-center gap-1">
                {yieldVal.toFixed(2)}%
                {isExtreme && <span title="Экстремально высокая доходность! Проверьте параметры" className="flex shrink-0 text-danger"><TriangleAlert size={13} /></span>}
            </span>
        );
    };

    const renderDuration = () => {
        if (!durationInYears) return '-';
        const isExtreme = durationInYears < 0.25;
        return (
            <span className="flex items-center gap-1">
                {durationInYears.toFixed(2)}
                {isExtreme && <span title="Экстремально низкая дюрация" className="flex shrink-0 text-danger"><TriangleAlert size={13} /></span>}
            </span>
        );
    };

    const maturityDays = (() => {
        if (!bond.maturityDate) return null;
        const date = new Date(bond.maturityDate);
        const today = new Date();
        return Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    })();

    const cp = (bond.nextCouponValue || 0).toFixed(2);
    const cpExists = bond.nextCouponValue !== 0.00;
    const isFloater = bond.floatingCouponFlag;

    return (
        <div
            className={cn(
                "group relative rounded-3xl p-5 transition-all duration-300 flex flex-col xl:flex-row items-stretch xl:items-center gap-4 xl:gap-6",
                isDefault
                    ? "bg-[var(--color-card)] shadow-card"
                    : "bg-[var(--color-card)] shadow-card hover:shadow-card-hover hover:-translate-y-0.5"
            )}
        >
            
            <Link href={`/bonds/${bond.id}`} target="_blank" className="absolute inset-0 z-10 rounded-3xl" aria-label={`Перейти к ${bond.shortName}`} prefetch={false} />

            
            {isMarked && (
                <div className="absolute top-0 left-0 w-32 h-32 blur-[80px] rounded-full pointer-events-none bg-amber-400/10 dark:bg-amber-400/5 z-0" />
            )}

            
            <div className="flex items-start gap-3 w-full xl:w-1/3 min-w-0">
                <div className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center relative shadow-card bg-[var(--color-card)]">
                    <Logo logoSrc={logoSrc} title={bond.name!} />
                </div>

                <div className="min-w-0 flex-1 flex flex-col gap-1">
                    <h3
                        className={cn(
                            "font-bold text-base leading-tight transition-colors line-clamp-1 break-words",
                            isDefault
                                ? "text-danger"
                                : "text-[var(--color-foreground)]"
                        )}
                        title={bond.shortName || ''}
                    >
                        {bond.shortName}
                    </h3>

                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md",
                            isFloater
                                ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                                : "bg-[var(--color-muted)] text-[var(--color-foreground)]"
                        )}>
                            {isFloater ? 'Флоатер' : 'Фикс'}
                        </span>

                        {isMarked && (
                            <span className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest shrink-0 flex items-center gap-0.5">
                                <Star size={8} className="fill-current" /> Отслеживаю
                            </span>
                        )}

                        {isDefault && (
                            <span className="bg-danger text-white text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest shrink-0 shadow-sm shadow-danger/30">
                                Дефолт
                            </span>
                        )}

                        {isTechDefault && (
                            <span className="bg-accent text-slate-100 text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest shrink-0">
                                Тех. дефолт
                            </span>
                        )}

                        <span className="px-1.5 py-0.5 rounded-md text-[11px] bg-[var(--color-muted)] text-[var(--color-muted-foreground)]">
                            {bond.ticker}
                        </span>

                        <span className="px-1 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[var(--color-muted)] text-[var(--color-muted-foreground)]">
                            {bond.currency}
                        </span>

                        {maturityDays !== null && maturityDays > 0 && (
                            <span className="text-[10px] text-[var(--color-muted-foreground)]">
                                {maturityDays} дн.
                            </span>
                        )}

                        {isInPortfolio && (
                            <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest shrink-0">
                                <svg width="9" height="9" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block shrink-0">
                                    <path d="M4 8C4 8 16 2 28 8C28 8 30 22 16 30C2 22 4 8 4 8Z" fill="#FFDD2D"/>
                                    <path d="M11 12H21V15H17.5V23H14.5V15H11V12Z" fill="#1C1C1E"/>
                                </svg>
                                В портфеле
                            </span>
                        )}
                    </div>
                </div>
            </div>

            
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 w-full xl:flex-1 text-sm pointer-events-none">
                <div className="flex flex-col justify-center min-w-[60px]">
                    <span className="text-[var(--color-muted-foreground)] text-[11px] mb-0.5 font-bold">
                        {isFloater ? 'Ставка' : 'Доходность'}
                    </span>
                    <span
                        className={cn(
                            "text-lg",
                            isDefault ? "text-danger" : "text-primary",
                            isFloater && "text-sm font-bold whitespace-nowrap"
                        )}
                    >
                        {isFloater ? renderCouponRate() : renderYield()}
                    </span>
                </div>

                <div className="flex flex-col justify-center min-w-[60px]">
                    <span className="text-[var(--color-muted-foreground)] text-[11px] mb-0.5 font-bold">
                        {isFloater ? 'Купон' : 'Дюрация'}
                    </span>
                    <span className="text-[var(--color-muted-foreground)] text-lg font-bold flex items-center">
                        {isFloater ? (!cpExists ? "-" : cp) : renderDuration()}
                    </span>
                </div>

                <div className="flex flex-col justify-center min-w-[60px]">
                    <span className="text-[var(--color-muted-foreground)] text-[11px] mb-0.5 font-bold">Цена</span>
                    <span
                        className={cn(
                            "text-lg",
                            (bond.price || 0) < 100
                                ? isDefault
                                    ? "text-danger"
                                    : "text-amber-500"
                                : "text-[var(--color-foreground)]"
                        )}
                    >
                        {bond.price && bond.price !== 0.00 ? `${bond.price.toFixed(2)}%` : '-'}
                    </span>
                </div>

                <div className="flex flex-col justify-center min-w-[60px]">
                    <span className="text-[var(--color-muted-foreground)] text-[11px] mb-0.5 font-bold">Рейтинг</span>
                    <span
                        className={cn(
                            "font-bold text-sm px-1.5 py-0.5 rounded-md text-center max-w-fit",
                            getCreditRatingColor(bond.creditRating || brand.creditRating || ""),
                            isDefault && "text-danger bg-danger/10"
                        )}
                    >
                        {bond.creditRating || brand.creditRating || '-'}
                    </span>
                </div>

                <div className="flex flex-col justify-center min-w-[60px]">
                    <span className="text-[var(--color-muted-foreground)] text-[11px] mb-0.5 font-bold">
                        {isFloater ? 'Выплат/год' : 'Ставка'}
                    </span>
                    <span className="text-[var(--color-muted-foreground)] text-lg font-bold">
                        {isFloater ? (bond.couponQuantityPerYear || '-') : renderCouponRate()}
                    </span>
                </div>

                <div className="flex flex-col justify-center min-w-[60px]">
                    <span className="text-[var(--color-muted-foreground)] text-[11px] mb-0.5 font-bold">
                        Купон/год
                    </span>
                    <span className="text-[var(--color-muted-foreground)] text-lg font-bold">
                        {bond.couponQuantityPerYear || '-'}
                    </span>
                </div>
            </div>

            
            <div className="flex items-center justify-between gap-2 w-full xl:w-auto xl:justify-end xl:ml-auto">
                
                {isSubscriber && brand.inn && (
                    <button
                        onClick={handleToggleMarked}
                        disabled={isPending}
                        className={cn(
                            "relative z-20 p-2 rounded-xl transition-all flex-shrink-0",
                            isMarked
                                ? "bg-amber-500 text-white shadow-glow-accent hover:bg-amber-600"
                                : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10",
                            isPending && "opacity-50 pointer-events-none"
                        )}
                        title={isMarked ? "Убрать из особого списка" : "Добавить в особый список"}
                    >
                        <Star size={16} className={isMarked ? "fill-current" : ""} />
                    </button>
                )}

                <div className="relative z-20">
                    <VotingBlock
                        bondId={bond.isin || bond.id!}
                        initialStats={initialStats}
                    />
                </div>

                <div
                    className={cn(
                        "p-2.5 rounded-xl transition-all flex-shrink-0",
                        isDefault
                            ? "bg-danger text-white group-hover:shadow-glow-danger-hover group-hover:-translate-y-0.5"
                            : isTechDefault
                                ? "bg-accent text-white group-hover:shadow-glow-accent-hover group-hover:-translate-y-0.5"
                                : "bg-primary text-white group-hover:shadow-glow-primary-hover group-hover:-translate-y-0.5"
                    )}
                >
                    <ChevronRight size={18} />
                </div>
            </div>
        </div>
    );
};