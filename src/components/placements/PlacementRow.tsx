'use client';

import { PublicOfferingResponseDto } from '@/lib/api';
import { ChevronRight } from 'lucide-react';
import { cn, getCreditRatingColor } from '@/lib/utils';
import Link from 'next/link';
import { Logo } from "@/components/ui/Logo";

interface PlacementRowProps {
    placement: PublicOfferingResponseDto;
}

export const PlacementRow = ({ placement }: PlacementRowProps) => {
    const brand = placement.brand;
    const parts = brand?.logoName?.split('.') || [];
    const finalLogoName = parts.length > 1 ? parts[0] + 'x640' + '.' + parts[1] : '';
    const logoSrc = finalLogoName ? `https://invest-brands.cdn-tinkoff.ru/${finalLogoName}` : '';

    const formatPrefixes = (val?: string | null) => {
        if (!val) return val;
        return val
            .replace(/не\s*менее/gi, '≥')
            .replace(/не\s*более/gi, '≤')
            .replace(/более/gi, '>')
            .replace(/менее/gi, '<');
    };

    const renderRating = () => {
        if (placement.ratings && placement.ratings.length > 0) {
            return placement.ratings.map((r, i) => (
                <span key={i} className={cn(
                    "font-bold text-[10px] px-1.5 py-0.5 rounded-md text-center shrink-0 uppercase tracking-widest",
                    getCreditRatingColor(r.value || "")
                )}>
                    {r.value || '-'}
                </span>
            ));
        } else if (brand?.creditRating) {
            return (
                <span className={cn(
                    "font-bold text-[10px] px-1.5 py-0.5 rounded-md text-center shrink-0 uppercase tracking-widest",
                    getCreditRatingColor(brand.creditRating)
                )}>
                    {brand.creditRating}
                </span>
            );
        }
        return <span className="text-[10px] text-[var(--color-muted-foreground)]">-</span>;
    };

    return (
        <div
            className="group relative rounded-3xl p-5 transition-all duration-300 flex flex-col gap-4 bg-[var(--color-card)] shadow-card hover:shadow-card-hover hover:-translate-y-0.5"
        >
            <Link href={`/placements/${placement.id}`} target="_blank" className="absolute inset-0 z-10 rounded-3xl" aria-label={`Перейти к ${placement.name}`} prefetch={false} />

            <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-4 xl:gap-6">
                
                <div className="flex items-start gap-3 w-full xl:w-1/3 min-w-0">
                    <div className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center relative shadow-card bg-[var(--color-card)]">
                        <Logo logoSrc={logoSrc} title={placement.name || 'Облигация'} />
                    </div>

                    <div className="min-w-0 flex-1 flex flex-col gap-1">
                        <h3
                            className="font-bold text-base leading-tight transition-colors line-clamp-1 break-words text-[var(--color-foreground)]"
                            title={placement.name || ''}
                        >
                            {placement.name}
                        </h3>

                        <div className="flex flex-wrap items-center gap-1.5">
                            {placement.orderDate && (
                                <span className="bg-primary/10 text-primary text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest shrink-0">
                                    Сбор до {new Date(placement.orderDate).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit'})}
                                </span>
                            )}
                            
                            {renderRating()}
                        </div>
                    </div>
                </div>

                
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full xl:flex-1 text-sm pointer-events-none">
                    <div className="flex flex-col justify-center min-w-[60px]">
                        <span className="text-[var(--color-muted-foreground)] text-[11px] mb-0.5 font-bold">Купон</span>
                        <span className="text-lg font-bold text-[var(--color-foreground)]">
                            {placement.couponRate || '-'}
                        </span>
                    </div>

                    <div className="flex flex-col justify-center min-w-[60px]">
                        <span className="text-[var(--color-muted-foreground)] text-[11px] mb-0.5 font-bold">Период</span>
                        <span className="text-[var(--color-muted-foreground)] text-lg font-bold">
                            {placement.couponPeriod || '-'}
                        </span>
                    </div>

                    <div className="flex flex-col justify-center min-w-[60px]">
                        <span className="text-[var(--color-muted-foreground)] text-[11px] mb-0.5 font-bold">Размещение</span>
                        <span className="text-[var(--color-muted-foreground)] text-sm font-bold truncate max-w-full">
                            {placement.placementDateLabel || '-'}
                        </span>
                    </div>
                    
                    <div className="flex flex-col justify-center min-w-[60px]">
                        <span className="text-[var(--color-muted-foreground)] text-[11px] mb-0.5 font-bold">Погашение</span>
                        <span className="text-[var(--color-muted-foreground)] text-sm font-bold truncate max-w-full">
                            {placement.maturityDateLabel || '-'}
                        </span>
                    </div>

                    <div className="flex flex-col justify-center min-w-[60px] col-span-2 sm:col-span-1">
                        <span className="text-[var(--color-muted-foreground)] text-[11px] mb-0.5 font-bold">Объем</span>
                        <span className="text-[var(--color-muted-foreground)] text-lg font-bold">
                            {formatPrefixes(placement.volume) || '-'}
                        </span>
                    </div>
                </div>

                
                <div className="flex items-center justify-between gap-2 w-full xl:w-auto xl:justify-end xl:ml-auto">
                    <div className="p-2.5 rounded-xl transition-all flex-shrink-0 bg-primary text-white group-hover:shadow-glow-primary-hover group-hover:-translate-y-0.5 relative z-20 pointer-events-none">
                        <ChevronRight size={18} />
                    </div>
                </div>
            </div>
            
            {placement.comment && (
                <div className="bg-[var(--color-muted)]/50 rounded-2xl p-4 text-sm text-[var(--color-muted-foreground)] leading-relaxed">
                    {placement.comment}
                </div>
            )}
        </div>
    );
};
