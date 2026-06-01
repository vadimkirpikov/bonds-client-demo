'use client';

import { PublicOfferingResponseDto } from '@/lib/api';
import { cn, getCreditRatingColor } from '@/lib/utils';
import { Logo } from "@/components/ui/Logo";
import { Star } from 'lucide-react';

interface PlacementHeaderProps {
    placement: PublicOfferingResponseDto;
}

export const PlacementHeader = ({ placement }: PlacementHeaderProps) => {
    const brand = placement.brand;
    const parts = brand?.logoName?.split('.') || [];
    const logoSrc = parts.length > 1 ? `https://invest-brands.cdn-tinkoff.ru/${parts[0]}x640.${parts[1]}` : '';

    return (
        <div className="bg-[var(--color-card)] rounded-3xl p-6 md:p-8 mb-8 shadow-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full pointer-events-none bg-primary/5 dark:bg-primary/10" />

            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 relative z-10">
                
                <div className="flex items-center gap-5 w-full xl:w-auto">
                    <div className="w-20 h-20 rounded-full flex-shrink-0 overflow-hidden relative shadow-card bg-[var(--color-background)]">
                        <Logo logoSrc={logoSrc} title={placement.name || ''} />
                    </div>

                    <div>
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[var(--color-foreground)]">
                                {placement.name}
                            </h1>
                        </div>

                        
                        <div className="flex flex-wrap gap-2 text-sm items-center mt-3">
                            {placement.orderDate && (
                                <span className="bg-primary/10 text-primary px-2.5 py-1.5 rounded-lg flex items-center gap-1 text-xs font-bold uppercase tracking-wider shadow-sm">
                                    Сбор до {new Date(placement.orderDate).toLocaleDateString('ru-RU')}
                                </span>
                            )}
                            
                            {placement.ratings && placement.ratings.map((r, i) => (
                                <span key={i} className={cn(
                                    "px-2.5 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider shadow-sm",
                                    getCreditRatingColor(r.value || "")
                                )}>
                                    {r.agency ? `${r.agency}: ` : ''}{r.value || '-'}
                                </span>
                            ))}
                            
                            {(!placement.ratings || placement.ratings.length === 0) && brand?.creditRating && (
                                <span className={cn(
                                    "px-2.5 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider shadow-sm",
                                    getCreditRatingColor(brand.creditRating)
                                )}>
                                    {brand.creditRating}
                                </span>
                            )}

                            {brand?.inn && (
                                <span className="bg-[var(--color-muted)] text-[var(--color-muted-foreground)] px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-sm uppercase">
                                    ИНН: {brand.inn}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
