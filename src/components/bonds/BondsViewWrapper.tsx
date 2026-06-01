'use client';

import { useState, useEffect, ReactNode, useCallback } from 'react';
import { ViewToggle } from './ViewToggle';
import { MarketMapView } from './MarketMapView';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';
import { fetchMoreBondsAction } from '@/app/bonds/fetchMoreAction';
import { BondRow } from '@/components/bonds/BondRow';
import { BondsTableView } from '@/components/bonds/BondsTableView';
import type { FinalBondResponse } from '@/lib/api';

const STORAGE_KEY = 'bonds_view_mode';

interface BondsViewWrapperProps {
    children: ReactNode;
    initialBonds?: FinalBondResponse[];
    initialStats?: Record<string, any>;
    searchParams: Record<string, string>;
    keyRate: number;
    isSubscriber: boolean;
    showOfzCurve?: boolean;

    filtersButton?: ReactNode;
    quickFiltersNode?: ReactNode;
    titleNode?: ReactNode;
    collectionNode?: ReactNode;
    initialPage?: number;
    totalPages?: number;
}

export const BondsViewWrapper = ({ children, initialBonds = [], initialStats = {}, searchParams, keyRate, isSubscriber, showOfzCurve, filtersButton, quickFiltersNode, titleNode, collectionNode, initialPage = 1, totalPages = 1 }: BondsViewWrapperProps) => {
    const [viewMode, setViewMode] = useState<'list' | 'map' | 'table'>('list');
    const [hydrated, setHydrated] = useState(false);
    
    const [extraBonds, setExtraBonds] = useState<BondItemDto[]>([]);
    const [extraStats, setExtraStats] = useState<Record<string, any>>({});
    const [page, setPage] = useState(initialPage);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    
    const { ref: loadMoreRef, inView } = useInView({ threshold: 0.1 });

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved === 'map' || saved === 'list' || saved === 'table') {
                setViewMode(saved);
            }
        } catch {
        }
        setHydrated(true);
    }, []);

    const handleViewChange = (mode: 'list' | 'map' | 'table') => {
        setViewMode(mode);
        if (mode === 'map') {
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
        try {
            localStorage.setItem(STORAGE_KEY, mode);
        } catch {
        }
    };

    const loadMoreBonds = useCallback(async () => {
        if (isLoadingMore || page >= totalPages) return;
        setIsLoadingMore(true);
        try {
            const nextPage = page + 1;
            const res = await fetchMoreBondsAction({ ...searchParams, page: nextPage.toString() });
            
            if (res.bonds && res.bonds.length > 0) {
                setExtraBonds(prev => [...prev, ...res.bonds]);
                setExtraStats(prev => ({ ...prev, ...(res.statsMap || {}) }));
                setPage(nextPage);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingMore(false);
        }
    }, [isLoadingMore, page, totalPages, searchParams]);

    useEffect(() => {
        if (inView && (viewMode === 'list' || viewMode === 'table')) {
            loadMoreBonds();
        }
    }, [inView, viewMode, loadMoreBonds]);

    useEffect(() => {
        setExtraBonds([]);
        setExtraStats({});
        setPage(initialPage);
    }, [searchParams, initialPage]);

    if (!hydrated) {
        return <div className="min-h-screen">{children}</div>;
    }


    return (
        <div className="flex flex-col gap-4 relative">
            <div className="w-full relative z-10 pointer-events-none">
                <div className="pointer-events-auto">
                    {titleNode}
                </div>
            </div>

            
            <div className="sticky top-[68px] sm:top-[88px] z-40 py-2 flex flex-wrap justify-end items-center gap-2 pointer-events-none mt-2">
                <div className="pointer-events-auto rounded-xl"><ViewToggle viewMode={viewMode} onViewChange={handleViewChange} /></div>
                <div className="pointer-events-auto rounded-xl">{filtersButton}</div>
            </div>

            {collectionNode && (
                <div className="mt-2 md:mt-4 pointer-events-auto">
                    {collectionNode}
                </div>
            )}

            {quickFiltersNode}

            {viewMode === 'map' && (
                <div className="text-right -mt-2">
                    <span className="text-[10px] text-[var(--color-muted-foreground)] font-medium uppercase tracking-wider hidden sm:block">
                        Только фиксированный купон
                    </span>
                </div>
            )}

            
            {viewMode === 'list' ? (
                <div className="flex flex-col gap-3">
                    {children}
                    
                    
                    {extraBonds.map((bondItem) => {
                        const stats = extraStats[bondItem.bondResponse?.isin || bondItem.bondResponse?.id || ''] || { likes: 0, dislikes: 0, userVote: null, isFavorite: false };
                        return (
                            <BondRow
                                key={`extra-${bondItem.bondResponse?.id}`}
                                bond={bondItem.bondResponse!}
                                brand={bondItem.brandBusinessDtoResponse!}
                                isSubscriber={isSubscriber}
                                initialStats={stats}
                                isInPortfolio={bondItem.isInPortfolio}
                                issuerHoldPercent={bondItem.issuerHoldPercent}
                            />
                        )
                    })}
                    
                    {page < totalPages && (
                        <div ref={loadMoreRef} className="flex justify-center items-center py-8">
                            <Loader2 className="animate-spin text-[var(--color-muted-foreground)]" size={32} />
                        </div>
                    )}
                </div>
            ) : viewMode === 'table' ? (
                <div className="flex flex-col gap-3">
                    <BondsTableView
                        bonds={[...initialBonds, ...extraBonds]}
                        statsMap={{...initialStats, ...extraStats}}
                        searchParams={searchParams}
                        loadMoreNode={
                            page < totalPages && (
                                <div ref={loadMoreRef} className="flex justify-center items-center py-8">
                                    <Loader2 className="animate-spin text-[var(--color-muted-foreground)]" size={32} />
                                </div>
                            )
                        }
                    />
                </div>
            ) : (
                <MarketMapView
                    searchParams={searchParams}
                    keyRate={keyRate}
                    showOfzCurve={showOfzCurve}
                />
            )}
        </div>
    );
};
