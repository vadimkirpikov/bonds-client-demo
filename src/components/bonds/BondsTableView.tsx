'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FinalBondResponse } from '@/lib/api';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { SORT_OPTIONS } from '@/components/bonds/filters/constants';
import { getCreditRatingColor, getRateTypeName } from '@/lib/utils';

interface BondsTableViewProps {
    bonds: FinalBondResponse[];
    statsMap: Record<string, any>;
    searchParams: Record<string, string>;
    loadMoreNode?: React.ReactNode;
}

export const BondsTableView = ({ bonds, statsMap, searchParams, loadMoreNode }: BondsTableViewProps) => {
    const router = useRouter();

    const handleSort = (field: string) => {
        const currentSorts = searchParams['sorts'] ? searchParams['sorts'].split(',') : [];
        let newSorts = [...currentSorts];
        
        const existingIdx = newSorts.findIndex(s => s.startsWith(`${field}_`));
        if (existingIdx >= 0) {
            const dir = newSorts[existingIdx].endsWith('_asc') ? 'desc' : 'asc';
            newSorts[existingIdx] = `${field}_${dir}`;
        } else {
            newSorts.push(`${field}_desc`);
        }
        
        const params = new URLSearchParams(searchParams);
        params.set('sorts', newSorts.join(','));
        params.set('page', '1');
        router.push(`?${params.toString()}`);
    };

    const getSortIcon = (field: string) => {
        const currentSorts = searchParams['sorts'] ? searchParams['sorts'].split(',') : [];
        const existing = currentSorts.find(s => s.startsWith(`${field}_`));
        if (!existing) return <ArrowUpDown size={12} className="text-[var(--color-muted-foreground)] opacity-30" />;
        return existing.endsWith('_desc') ? <ArrowDown size={14} className="text-primary" /> : <ArrowUp size={14} className="text-primary" />;
    };

    const isSortable = (field: string) => SORT_OPTIONS.some(o => o.value === field);

    const Th = ({ label, field, minW = '100px', stickyLeft }: { label: string, field?: string, minW?: string, stickyLeft?: boolean }) => {
        const sortable = field && isSortable(field);
        return (
            <th 
                className={`p-3 text-left text-xs uppercase font-bold tracking-wider text-[var(--color-muted-foreground)] whitespace-nowrap bg-[var(--color-card)] sticky top-0 ${stickyLeft ? 'left-0 z-20 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)] border-r border-slate-200/40 dark:border-white/5' : 'z-10'} ${sortable ? 'cursor-pointer hover:bg-[var(--color-muted)] transition-colors' : ''}`}
                style={{ minWidth: minW }}
                onClick={() => sortable && field && handleSort(field)}
            >
                <div className="flex items-center gap-1.5">
                    {label}
                    {sortable && getSortIcon(field!)}
                </div>
            </th>
        );
    };

    const formatDt = (dt?: Date | string | null) => dt ? new Date(dt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—';
    const num = (v?: number | null, fallback = '—') => v !== undefined && v !== null ? v.toLocaleString('ru-RU', { maximumFractionDigits: 2 }) : fallback;

    return (
        <div className="w-full overflow-auto rounded-2xl bg-[var(--color-card)] custom-scrollbar relative" style={{ maxHeight: 'calc(100vh - 180px)' }}>
            <table className="w-full text-sm">
                <thead>
                    <tr>
                        <Th label="Название / ISIN" minW="200px" stickyLeft />
                        <Th label="Цена, %" field="price" />
                        <Th label="Рейтинг" field="rating" />
                        <Th label="Доходность" field="yield" />
                        <Th label="Премия" />
                        <Th label="G-Спред" />
                        <Th label="Дюрация" field="duration" />
                        <Th label="Купон, %" field="coupon" />
                        <Th label="Выплат в год" />
                        <Th label="Дата купона" />
                        <Th label="Погашение" field="maturitydate" />
                        <Th label="Номинал" field="nominal" />
                        <Th label="НКД" />
                        <Th label="Оферта" />
                    </tr>
                </thead>
                <tbody>
                    {bonds.map((b) => {
                        const bond = b.bondResponse!;
                        const brand = b.brandBusinessDtoResponse;
                        const rating = bond.creditRating || brand?.creditRating || '—';
                        
                        return (
                            <tr key={bond.id} className="hover:bg-[var(--color-muted)]/40 transition-colors group">
                                <td className="p-3 sticky left-0 z-10 bg-[var(--color-card)] group-hover:bg-[#f8f9fa] dark:group-hover:bg-[#1f2023] shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)] border-r border-slate-200/40 dark:border-white/5 transition-colors">
                                    <Link href={`/bonds/${bond.id}`} target="_blank" className="block">
                                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                            <span className="font-bold text-[var(--color-foreground)] group-hover:text-primary transition-colors">{bond.shortName || bond.name}</span>
                                            {bond.defaultFlag && <span className="bg-danger text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">Дефолт</span>}
                                            {bond.technicalDefaultFlag && !bond.defaultFlag && <span className="bg-accent text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">Тех. дефолт</span>}
                                        </div>
                                        <div className="text-xs text-[var(--color-muted-foreground)] font-mono">{bond.isin}</div>
                                    </Link>
                                </td>
                                <td className="p-3 font-medium">
                                    {bond.price ? (
                                        <span className={bond.price < 100 ? (bond.defaultFlag ? 'text-danger' : 'text-amber-500') : 'text-[var(--color-foreground)]'}>
                                            {num(bond.price)}
                                        </span>
                                    ) : '—'}
                                </td>
                                <td className="p-3">
                                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${getCreditRatingColor(rating)}`}>
                                        {rating}
                                    </span>
                                </td>
                                <td className="p-3">
                                    {bond._yield ? (
                                        <div className="font-bold text-emerald-600 dark:text-emerald-400">{num(bond._yield)}%</div>
                                    ) : '—'}
                                </td>
                                <td className="p-3">
                                    {bond.floatingCouponFlag ? (
                                        <div className="text-xs">
                                            <span className="text-[var(--color-muted-foreground)] mr-1">{getRateTypeName(bond.rateType)}</span>
                                            <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono font-medium">
                                                {bond.spread !== undefined && bond.spread !== null ? `${bond.spread > 0 ? '+' : ''}${bond.spread}%` : '—'}
                                            </span>
                                        </div>
                                    ) : '—'}
                                </td>
                                <td className="p-3">
                                    {!bond.floatingCouponFlag && bond.gSpread ? (
                                        <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono font-medium">
                                            {bond.gSpread} бп
                                        </span>
                                    ) : '—'}
                                </td>
                                <td className="p-3">{!bond.floatingCouponFlag ? `${num(bond.duration)} дн.` : '—'}</td>
                                <td className="p-3 font-medium">{num(bond.nextCouponValuePrc)}%</td>
                                <td className="p-3 font-medium">{bond.couponQuantityPerYear || '—'}</td>
                                <td className="p-3 text-[var(--color-muted-foreground)]">{formatDt(bond.nextCouponDate)}</td>
                                <td className="p-3 text-[var(--color-muted-foreground)]">{formatDt(bond.maturityDate)}</td>
                                <td className="p-3 font-medium">{num(bond.currentNominal)} <span className="text-[10px] text-[var(--color-muted-foreground)]">{bond.nominalCurrency}</span></td>
                                <td className="p-3 text-[var(--color-muted-foreground)]">{num(bond.aciValue)}</td>
                                <td className="p-3 text-[var(--color-muted-foreground)]">{formatDt(bond.nextCall)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {loadMoreNode}
        </div>
    );
};
