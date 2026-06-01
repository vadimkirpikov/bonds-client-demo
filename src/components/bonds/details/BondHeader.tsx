'use client';

import { AlertTriangle, Star, Search, Edit3 } from 'lucide-react';
import { VotingBlock } from '@/components/bonds/VotingBlock';
import { EditBrandButton } from '@/components/admin/EditBrandButton';
import { BondDtoResponse, BrandBusinessResponse } from '@/lib/api';
import { BondStats } from '@/actions/bond-actions';
import { cn } from '@/components/ui/Button';
import { Logo } from "@/components/ui/Logo";
import { useState, useTransition } from 'react';
import { toggleMarkedIssuer } from '@/actions/collection-actions';
import { AdminBondEditModal } from '@/components/bonds/details/AdminBondEditModal';
import { SubscriptionModal } from '@/components/modals/SubscriptionModal';
import { useRouter } from 'next/navigation';

interface BondHeaderProps {
    bond: BondDtoResponse;
    brand: BrandBusinessResponse;
    stats: BondStats;
    isAdmin: boolean;
    isLoggedIn?: boolean;
    isSubscriber?: boolean;
}

export const TBankIcon = () => (
    <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block shrink-0">
        <path d="M4 8C4 8 16 2 28 8C28 8 30 22 16 30C2 22 4 8 4 8Z" fill="#FFDD2D"/>
        <path d="M11 12H21V15H17.5V23H14.5V15H11V12Z" fill="#1C1C1E"/>
    </svg>
);

const getCreditRatingColor = (rating: string) => {
    if (!rating || rating === '-') return "text-[var(--color-muted-foreground)] bg-[var(--color-muted)]";
    if (rating.includes('AAA')) return "text-emerald-500 bg-emerald-500/10";
    if (rating.includes('AA')) return "text-green-500 bg-green-500/10";
    if (rating.includes('A') && !rating.includes('B') && !rating.includes('C')) return "text-lime-500 bg-lime-500/10";
    if (rating.includes('BBB')) return "text-yellow-500 bg-yellow-500/10";
    if (rating.includes('BB')) return "text-amber-500 bg-amber-500/10";
    if (rating.includes('B')) return "text-orange-500 bg-orange-500/10";
    if (rating.includes('C')) return "text-red-500 bg-red-500/10";
    if (rating.includes('D')) return "text-red-700 bg-red-700/10";
    return "text-[var(--color-muted-foreground)] bg-[var(--color-muted)]";
};

export const BondHeader = ({ bond, brand, stats, isAdmin, isLoggedIn = false, isSubscriber = false }: BondHeaderProps) => {
    const router = useRouter();
    const isDefault = bond.defaultFlag;
    const isTechDefault = bond.technicalDefaultFlag && !bond.defaultFlag;
    const isAvailableInT = (bond as any).availableInT || (bond as any).availableInTFlag;

    const parts = brand.logoName?.split('.') || [];
    const logoSrc = parts.length > 1 ? `https://invest-brands.cdn-tinkoff.ru/${parts[0]}x640.${parts[1]}` : '';

    const [isMarked, setIsMarked] = useState<boolean>((bond as any).isMarkedIssuer || false);
    const [isPending, startTransition] = useTransition();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [showSubModal, setShowSubModal] = useState(false);

    const handleToggleMarked = () => {
        if (!isLoggedIn || !brand.inn) return;
        startTransition(async () => {
            const result = await toggleMarkedIssuer(brand.inn!);
            if (result.success) {
                setIsMarked(!isMarked);
            }
        });
    };

    const handleAlternativesClick = () => {
        if (!isSubscriber && !isAdmin) {
            setShowSubModal(true);
        } else {
            const targetIsin = bond.isin || bond.ticker;
            router.push(`/alternatives?isin=${targetIsin}`);
        }
    };
    const rating = bond.creditRating ?? brand.creditRating;


    return (
        <div className={cn(
            "bg-[var(--color-card)] rounded-3xl p-6 md:p-8 mb-8 shadow-card relative overflow-hidden"
        )}>
            <div className={cn(
                "absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full pointer-events-none",
                isDefault ? "bg-danger/10" : "bg-primary/5 dark:bg-primary/10"
            )} />

            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 relative z-10">
                
                <div className="flex items-center gap-5 w-full xl:w-auto">
                    <div className={cn(
                        "w-20 h-20 rounded-full flex-shrink-0 overflow-hidden relative shadow-card bg-[var(--color-background)]"
                    )}>
                        <Logo logoSrc={logoSrc} title={bond.shortName || bond.name || ''} />
                    </div>

                    <div>
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h1 className={cn(
                                "text-2xl md:text-3xl font-black tracking-tight",
                                isDefault ? "text-danger" : "text-[var(--color-foreground)]"
                            )}>
                                {bond.shortName || bond.name}
                            </h1>
                            {isDefault && (
                                <span className="bg-danger/10 text-danger px-3 py-1 rounded-md flex items-center gap-1 text-sm font-bold uppercase tracking-wider">
                                    <AlertTriangle size={16} /> Дефолт
                                </span>
                            )}
                            {isTechDefault && (
                                <span className="bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-md flex items-center gap-1 text-sm font-bold uppercase tracking-wider">
                                    <AlertTriangle size={16} /> Был тех. дефолт
                                </span>
                            )}
                        </div>

                        
                        <div className="flex flex-wrap gap-2 text-sm items-center mt-3">
                            <span className="bg-[var(--color-muted)] text-[var(--color-muted-foreground)] px-2.5 py-1.5 rounded-lg text-xs shadow-sm">
                                {bond.ticker}
                            </span>
                            <span
                                className={cn(
                                    "px-2.5 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider shadow-sm",
                                    rating
                                        ? getCreditRatingColor(rating)
                                        : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"
                                )}
                            >
  {rating ?? 'Без рейтинга'}
</span>
                            <span className="text-[var(--color-muted-foreground)] font-bold text-xs bg-[var(--color-muted)] px-2.5 py-1.5 rounded-lg uppercase shadow-sm">
                                {bond.currency}
                            </span>
                            {bond.forQualInvestorFlag && (
                                <span className="bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2.5 py-1.5 rounded-lg flex items-center gap-1 text-xs font-bold uppercase tracking-wider shadow-sm">
                                    Для квалов
                                </span>
                            )}
                            {isMarked && (
                                <span className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1.5 rounded-lg flex items-center gap-1 text-xs font-bold uppercase tracking-wider shadow-sm">
                                    <Star size={12} className="fill-current" /> В списке
                                </span>
                            )}
                            {isAdmin && (
                                <span className={cn(
                                    "px-2.5 py-1.5 rounded-lg flex items-center gap-1 text-xs font-bold uppercase tracking-wider shadow-sm",
                                    bond.availableInAutofollow
                                        ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                        : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"
                                )}>
                                    Автоследование: {bond.availableInAutofollow ? 'Да' : 'Нет'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                
                <div className="mt-4 xl:mt-0 flex flex-wrap items-center justify-start xl:justify-end gap-3 w-full xl:w-auto shrink-0">
                    <VotingBlock bondId={bond.isin || bond.id!} initialStats={stats} />

                    {isLoggedIn && brand.inn && (
                        <button
                            onClick={handleToggleMarked}
                            disabled={isPending}
                            className={cn(
                                "px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm h-[44px] transition-all shadow-sm",
                                isMarked
                                    ? "bg-amber-500 text-white shadow-glow-accent hover:bg-amber-600"
                                    : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10",
                                isPending && "opacity-50 pointer-events-none"
                            )}
                        >
                            <Star size={16} className={isMarked ? "fill-current" : ""} />
                            {isMarked ? "В списке" : "Отслеживать"}
                        </button>
                    )}

                    {isAvailableInT && (
                        <a
                            href={`https://www.tbank.ru/invest/bonds/${bond.ticker}/`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-[#FFDD2D] hover:bg-[#F2C900] text-black px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all text-sm h-[44px]"
                        >
                            <TBankIcon /> В Т-Банк
                        </a>
                    )}

                    {isAdmin && <EditBrandButton brandId={brand.id!} />}
                    {isAdmin && (
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="bg-blue-500/10 hover:bg-blue-500 text-blue-600 hover:text-white dark:text-blue-400 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm text-sm h-[44px]"
                        >
                            <Edit3 size={16} /> Изменить
                        </button>
                    )}

                    <button
                        onClick={handleAlternativesClick}
                        className="bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500 hover:text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm text-sm h-[44px]"
                    >
                        <Search size={16} /> Альтернативы
                    </button>
                </div>
            </div>

            {isEditModalOpen && <AdminBondEditModal bond={bond} onClose={() => setIsEditModalOpen(false)} />}
            <SubscriptionModal isOpen={showSubModal} onClose={() => setShowSubModal(false)} isLoggedIn={isLoggedIn} />
        </div>
    );
};