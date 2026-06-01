'use client';

import { useState } from 'react';
import { Calendar, TrendingDown, ListOrdered, Banknote, ChevronDown, ChevronUp } from 'lucide-react';
import { BondDtoResponse } from '@/lib/api';

const DateRow = ({ label, date, value, highlight }: { label: string, date?: Date | null, value: string, highlight?: boolean }) => (
    <div className={`flex justify-between items-center p-4 sm:p-5 transition-colors ${highlight ? 'bg-orange-50/50 dark:bg-orange-500/10' : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50'}`}>
        <span className={highlight ? "text-orange-600 dark:text-orange-400 font-semibold" : "text-muted-foreground dark:text-zinc-400 font-medium"}>{label}</span>
        <div className="text-right">
            <span className={`block font-bold text-base ${highlight ? 'text-orange-600 dark:text-orange-400' : 'text-slate-900 dark:text-zinc-100'}`}>
                {date ? new Date(date).toLocaleDateString('ru-RU') : '-'}
            </span>
            <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">{value}</span>
        </div>
    </div>
);

export const BondCalendar = ({ bond }: { bond: BondDtoResponse }) => {
    const[showCoupons, setShowCoupons] = useState(false);
    const[showAmortizations, setShowAmortizations] = useState(false);

    return (
        <div className="space-y-8">
            
            <section>
                <h2 className="text-xl font-bold mb-4 sm:mb-5 flex items-center gap-2 text-slate-900 dark:text-zinc-100">
                    <Calendar size={20} className="text-primary"/> Календарь событий
                </h2>
                <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm dark:shadow-none  overflow-hidden">
                    <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                        <DateRow label="Дата погашения" date={bond.maturityDate} value="Номинал" />
                        {bond.nextCall && (
                            <DateRow label="Оферта/Опцион" date={bond.nextCall} value="Досрочное погашение" highlight />
                        )}
                        {bond.nextMaturityDate && (
                            <DateRow label="Амортизация" date={bond.nextMaturityDate} value={`${bond.nextMaturityValue?.toFixed(2)}% от номинала`} />
                        )}
                        <DateRow label="След. купон" date={bond.nextCouponDate} value={`${bond.nextCouponValue?.toFixed(2)} ${bond.nominalCurrency?.toUpperCase()}`} />
                    </div>
                </div>
            </section>

            
            {bond.coupons7Months && bond.coupons7Months.length > 0 && !bond.floatingCouponFlag && (
                <section>
                    <div
                        className="flex items-center justify-between cursor-pointer group mb-4 sm:mb-5"
                        onClick={() => setShowCoupons(!showCoupons)}
                    >
                        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-zinc-100 group-hover:text-primary transition-colors">
                            <Banknote size={20} className="text-primary"/> Выплаты купонов (ближайшие 7 мес.)
                        </h2>
                        <button className="p-2 rounded-full bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            {showCoupons ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                    </div>

                    {showCoupons && (
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm dark:shadow-none overflow-hidden animate-fade-in">
                            <table className="w-full text-left border-none">
                                <thead className="bg-slate-50/50 dark:bg-zinc-900/50 text-slate-400 dark:text-zinc-500 font-bold text-[10px] sm:text-xs uppercase tracking-tight sm:tracking-wider">
                                <tr>
                                    <th className="px-3 sm:px-4 py-3 sm:py-4 font-medium">Дата</th>
                                    <th className="px-2 sm:px-4 py-3 sm:py-4 font-medium text-center sm:text-left">Ставка</th>
                                    <th className="px-3 sm:px-4 py-3 sm:py-4 font-medium text-right">Сумма</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-zinc-800/50">
                                {bond.coupons7Months.map((c, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-3 sm:px-4 py-3 sm:py-4 font-medium text-slate-700 dark:text-zinc-300 text-[11px] sm:text-sm whitespace-nowrap">
                                            {c.date ? new Date(c.date).toLocaleDateString('ru-RU') : '-'}
                                        </td>
                                        <td className="px-2 sm:px-4 py-3 sm:py-4 font-bold text-primary text-[11px] sm:text-sm text-center sm:text-left whitespace-nowrap">
                                            {c.valuePrc !== null && c.valuePrc !== undefined ? `${c.valuePrc.toFixed(2)}%` : '-'}
                                        </td>
                                        <td className="px-3 sm:px-4 py-3 sm:py-4 font-bold text-slate-900 dark:text-zinc-100 text-right text-[11px] sm:text-sm whitespace-nowrap">
                                            {c.value !== null && c.value !== undefined ? (
                                                <>
                                                    {c.value.toFixed(2)} <span className="text-[9px] sm:text-xs text-slate-400 dark:text-zinc-500 font-sans ml-0.5">{bond.nominalCurrency?.toUpperCase()}</span>
                                                </>
                                            ) : '-'}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}

            
            {bond.amortizations && bond.amortizations.length > 0 && (
                <section>
                    <div
                        className="flex items-center justify-between cursor-pointer group mb-4 sm:mb-5"
                        onClick={() => setShowAmortizations(!showAmortizations)}
                    >
                        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-zinc-100 group-hover:text-primary transition-colors">
                            <TrendingDown size={20} className="text-primary"/> График амортизации
                        </h2>
                        <button className="p-2 rounded-full bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            {showAmortizations ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                    </div>

                    {showAmortizations && (
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm dark:shadow-none overflow-hidden animate-fade-in">
                            <table className="w-full text-left border-none">
                                <thead className="bg-slate-50/50 dark:bg-zinc-900/50 text-slate-400 dark:text-zinc-500 font-bold text-[10px] sm:text-xs uppercase tracking-tight sm:tracking-wider">
                                <tr>
                                    <th className="px-3 sm:px-4 py-3 sm:py-4 font-medium">Дата</th>
                                    <th className="px-2 sm:px-4 py-3 sm:py-4 font-medium text-center sm:text-left">
                                        % <span className="hidden sm:inline">погашения</span><span className="sm:hidden">пог.</span>
                                    </th>
                                    <th className="px-3 sm:px-4 py-3 sm:py-4 font-medium text-right">Сумма</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-zinc-800/50">
                                {bond.amortizations.map((a, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-3 sm:px-4 py-3 sm:py-4 font-medium text-slate-700 dark:text-zinc-300 text-[11px] sm:text-sm whitespace-nowrap">
                                            {a.date ? new Date(a.date).toLocaleDateString('ru-RU') : '-'}
                                        </td>
                                        <td className="px-2 sm:px-4 py-3 sm:py-4 font-bold text-slate-900 dark:text-zinc-100 text-[11px] sm:text-sm text-center sm:text-left whitespace-nowrap">
                                            {a.percent?.toFixed(2)}%
                                        </td>
                                        <td className="px-3 sm:px-4 py-3 sm:py-4 font-bold text-slate-900 dark:text-zinc-100 text-right text-[11px] sm:text-sm whitespace-nowrap">
                                            {a.value?.toFixed(2)} <span className="text-[9px] sm:text-xs text-slate-400 dark:text-zinc-500 font-sans ml-0.5">{bond.nominalCurrency?.toUpperCase()}</span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}

            
            {bond.couponLadders && bond.couponLadders.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold mb-4 sm:mb-5 flex items-center gap-2 text-slate-900 dark:text-zinc-100">
                        <ListOrdered size={20} className="text-primary"/> Купонная лесенка
                    </h2>
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm dark:shadow-none overflow-hidden animate-fade-in">
                        <table className="w-full text-left border-none">
                            <thead className="bg-slate-50/50 dark:bg-zinc-900/50 text-slate-400 dark:text-zinc-500 font-bold text-[10px] sm:text-xs uppercase tracking-tight sm:tracking-wider">
                            <tr>
                                <th className="px-3 sm:px-4 py-3 sm:py-4 font-medium">Начало</th>
                                <th className="px-2 sm:px-4 py-3 sm:py-4 font-medium text-center sm:text-left">Новый %</th>
                                <th className="px-3 sm:px-4 py-3 sm:py-4 font-medium text-right">
                                    <span className="hidden sm:inline">Кол-во платежей</span><span className="sm:hidden">Платежи</span>
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-zinc-800/50">
                            {bond.couponLadders.map((l, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                    <td className="px-3 sm:px-4 py-3 sm:py-4 font-medium text-slate-700 dark:text-zinc-300 text-[11px] sm:text-sm whitespace-nowrap">
                                        {l.startDate ? new Date(l.startDate).toLocaleDateString('ru-RU') : '-'}
                                    </td>
                                    <td className="px-2 sm:px-4 py-3 sm:py-4font-bold text-primary text-[11px] sm:text-sm text-center sm:text-left whitespace-nowrap">
                                        {l.newPercent?.toFixed(2)}%
                                    </td>
                                    <td className="px-3 sm:px-4 py-3 sm:py-4 font-bold text-slate-900 dark:text-zinc-100 text-right text-[11px] sm:text-sm whitespace-nowrap">
                                        {l.paymentsCount} <span className="text-[9px] sm:text-xs text-slate-400 dark:text-zinc-500 font-sans ml-0.5">шт.</span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
};