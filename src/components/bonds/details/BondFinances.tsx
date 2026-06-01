'use client';

import { useState, type ReactNode } from 'react';
import {
    Wallet, Download, Lock, TrendingUp, TrendingDown, Minus,
    Copy, Check, ChevronRight, Info, AlertTriangle,
    ShieldAlert, ThumbsUp, ThumbsDown, Building2, Tag, Crown
} from 'lucide-react';
import { BrandBusinessResponse, FinancialMetricResponse, ReportApi, BondDtoResponse } from '@/lib/api';
import { cn } from '@/components/ui/Button';
import { getClientApi } from '@/lib/client-api';
import { SubscriptionModal } from '@/components/modals/SubscriptionModal';
import { Button } from '@/components/ui/Button';


function fmtAbs(v: number | string | null | undefined): string {
    const num = Number(v);
    if (!isFinite(num)) return '—';
    const a = Math.abs(num), s = num < 0 ? '-' : '';
    if (a >= 1_000_000_000) return `${s}${(a / 1_000_000_000).toFixed(1)} млрд`;
    if (a >= 1_000_000)     return `${s}${(a / 1_000_000).toFixed(1)} млн`;
    if (a >= 1_000)         return `${s}${(a / 1_000).toFixed(1)} тыс`;
    return `${s}${a.toFixed(2)}`;
}
function fmtRel(v: number): string { return `${v.toFixed(2)}x`; }
function pctDiff(cur: number, prev: number) {
    if (prev === 0) return 0;
    return ((cur - prev) / Math.abs(prev)) * 100;
}

function formatCurrency(curr: string | null | undefined): string | null {
    if (!curr) return null;
    const c = curr.toLowerCase();
    if (c.includes('rubles') || c === '0' || c === 'rub' || c === 'руб' || c === 'рубли') return '₽';
    if (c.includes('thousands') || c === '1' || c.includes('тысяч')) return 'тыс. ₽';
    if (c.includes('millions') || c === '2' || c.includes('миллион')) return 'млн ₽';
    if (c.includes('billions') || c === '3' || c.includes('миллиард')) return 'млрд ₽';
    return curr;
}

type Zone = 'Green' | 'Red' | 'Yellow' | 'Orange' | 'grey' | 'None' | null | undefined;

const ZONE_BG: Record<string, string> = {
    Green:  'bg-emerald-500/10 dark:bg-emerald-500/15',
    Red:    'bg-red-500/10 dark:bg-red-500/15',
    Yellow: 'bg-amber-500/10 dark:bg-amber-500/15',
    Orange: 'bg-orange-500/10 dark:bg-orange-500/15',
    grey:   'bg-[var(--color-muted)]',
    None:   'bg-[var(--color-card)]',
};

const ZONE_TEXT: Record<string, string> = {
    Green:  'text-emerald-600 dark:text-emerald-400',
    Red:    'text-red-600 dark:text-red-400',
    Yellow: 'text-amber-600 dark:text-amber-400',
    Orange: 'text-orange-600 dark:text-orange-400',
};

function zoneEmoji(z: Zone) {
    if (z === 'Green') return '🟢';
    if (z === 'Red')   return '🔴';
    if (z === 'Yellow')return '🟡';
    if (z === 'Orange')return '🟠';
    return '⚪';
}

function zoneBg(z: Zone) { return ZONE_BG[z ?? 'None'] ?? ZONE_BG.None; }


const MetricCard = ({ m, isHigh }: { m: FinancialMetricResponse; isHigh: boolean }) => {
    const hasVal  = m.value  !== null && m.value  !== undefined;
    const hasPrev = m.previousValue !== null && m.previousValue !== undefined;
    const showDiff = !m.isRelative && hasVal && hasPrev;
    const isReversed = m.isReversed;
    const diff = showDiff ? pctDiff(m.value!, m.previousValue!) : null;
    const bg = zoneBg(m.zone as Zone);

    return (
        <div className={cn(
            'rounded-2xl p-4 flex flex-col justify-between gap-2 transition-all duration-200 hover:brightness-105',
            bg,
            isHigh && 'sm:col-span-2'
        )}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] leading-tight">
                {m.name}
                {m.isLtm && <span className="ml-1 text-[9px] bg-[var(--color-muted)] px-1 py-0.5 rounded font-bold">LTM</span>}
            </p>

            <div>
                {hasVal ? (
                    <>
                        <p className={cn(
                            'font-black leading-none',
                            isHigh ? 'text-3xl' : 'text-xl',
                            m.zone && m.zone !== 'None' ? (ZONE_TEXT[m.zone as string] ?? 'text-[var(--color-foreground)]') : 'text-[var(--color-foreground)]'
                        )}>
                            {m.isPercentage ? `${m.value!.toFixed(2)}%` : m.isRelative ? fmtRel(m.value!) : fmtAbs(m.value!)}
                        </p>
                        {showDiff && diff !== null && (() => {
                            const isNeutral = Math.abs(diff) < 0.05
                            const isPositive = diff >= 0

                            const trendUp = isReversed ? !isPositive : isPositive

                            const Icon = isNeutral
                                ? Minus
                                : trendUp
                                    ? TrendingUp
                                    : TrendingDown

                            const colorClass = isNeutral
                                ? 'text-[var(--color-muted-foreground)]'
                                : trendUp
                                    ? 'text-emerald-500'
                                    : 'text-red-500'

                            return (
                                <div className={cn('flex items-center gap-1 mt-1.5', colorClass)}>
                                    <Icon size={10} />
                                    <span className="text-[10px] font-bold">
                {isPositive ? '+' : ''}{diff.toFixed(1)}%
            </span>
                                    <span className="text-[10px] text-[var(--color-muted-foreground)]">
                к пред.
            </span>
                                </div>
                            )
                        })()}
                    </>
                ) : (
                    <p className="text-xl font-black text-[var(--color-muted-foreground)]">—</p>
                )}
            </div>
        </div>
    );
};

const DebtPie = ({ total, shortTerm }: { total: number; shortTerm: number }) => {
    const longTerm = total - shortTerm;
    if (longTerm < 0) return null;

    const pct = total > 0 ? shortTerm / total : 0;
    const R = 54, cx = 64, cy = 64, r = R;

    const shortPct = Math.round(pct * 100);
    const longPct = 100 - shortPct;

    const isFullShort = pct >= 0.999;
    const isFullLong = pct <= 0.001;

    const angle = pct * 2 * Math.PI;
    const x1 = cx + r * Math.sin(0);
    const y1 = cy - r * Math.cos(0);
    const x2 = cx + r * Math.sin(angle);
    const y2 = cy - r * Math.cos(angle);

    const largeShort = pct > 0.5 ? 1 : 0;
    const largeLong = pct <= 0.5 ? 1 : 0;

    return (
        <div className="rounded-2xl bg-[var(--color-card)] p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] mb-4">Структура долга</p>
            <div className="flex items-center gap-6 flex-wrap">
                <svg width="128" height="128" viewBox="0 0 128 128">
                    
                    {isFullLong ? (
                        <circle cx={cx} cy={cy} r={r} className="fill-[var(--color-primary)]" opacity="0.85" />
                    ) : !isFullShort && (
                        <path
                            d={`M ${cx} ${cy} L ${x2} ${y2} A ${r} ${r} 0 ${largeLong} 1 ${x1} ${y1} Z`}
                            className="fill-[var(--color-primary)]" opacity="0.85"
                        />
                    )}

                    
                    {isFullShort ? (
                        <circle cx={cx} cy={cy} r={r} className="fill-amber-500" opacity="0.85" />
                    ) : !isFullLong && (
                        <path
                            d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeShort} 1 ${x2} ${y2} Z`}
                            className="fill-amber-500" opacity="0.85"
                        />
                    )}

                    
                    <circle cx={cx} cy={cy} r={R * 0.55} className="fill-[var(--color-card)]"/>

                    <text x={cx} y={cy - 5} textAnchor="middle" className="fill-[var(--color-foreground)]" fontSize="13" fontWeight="800">{fmtAbs(total)}</text>
                    <text x={cx} y={cy + 10} textAnchor="middle" className="fill-[var(--color-muted-foreground)]" fontSize="9">долг</text>
                </svg>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-[var(--color-primary)]"/>
                        <span className="text-[var(--color-muted-foreground)]">Долгосрочный</span>
                        <span className="font-bold text-[var(--color-foreground)] ml-auto">{longPct}%</span>
                    </div>
                    <div className="text-[11px] text-[var(--color-muted-foreground)] pl-5">{fmtAbs(longTerm)}</div>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-3 h-3 rounded-sm bg-amber-500"/>
                        <span className="text-[var(--color-muted-foreground)]">Краткосрочный</span>
                        <span className="font-bold text-[var(--color-foreground)] ml-auto">{shortPct}%</span>
                    </div>
                    <div className="text-[11px] text-[var(--color-muted-foreground)] pl-5">{fmtAbs(shortTerm)}</div>
                </div>
            </div>
        </div>
    );
};


type Tab = 'pros' | 'cons' | 'risks';

const TAB_CFG: Record<Tab, { label: string; icon: ReactNode; active: string }> = {
    pros:  { label: 'Плюсы',  icon: <ThumbsUp size={13}/>,   active: 'text-emerald-500 border-emerald-500' },
    cons:  { label: 'Минусы', icon: <ThumbsDown size={13}/>,  active: 'text-red-500 border-red-500' },
    risks: { label: 'Риски',  icon: <ShieldAlert size={13}/>, active: 'text-amber-500 border-amber-500' },
};
const BULLET: Record<Tab, string> = { pros: 'bg-emerald-500', cons: 'bg-red-500', risks: 'bg-amber-500' };

const ProsConsRisks = ({ pros, cons, risks }: { pros?: string[]|null; cons?: string[]|null; risks?: string[]|null }) => {
    const [tab, setTab] = useState<Tab>('pros');
    const map: Record<Tab, string[]> = { pros: pros ?? [], cons: cons ?? [], risks: risks ?? [] };
    if (!map.pros.length && !map.cons.length && !map.risks.length) return null;

    return (
        <div className="rounded-2xl bg-[var(--color-card)] overflow-hidden">
            <div className="flex border-b border-[var(--color-card-border)]">
                {(Object.keys(TAB_CFG) as Tab[]).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={cn(
                            'flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold border-b-2 transition-all',
                            tab === t ? TAB_CFG[t].active : 'border-transparent text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                        )}>
                        {TAB_CFG[t].icon}{TAB_CFG[t].label}
                        {map[t].length > 0 && (
                            <span className="text-[9px] bg-[var(--color-muted)] px-1.5 py-0.5 rounded-full font-black">{map[t].length}</span>
                        )}
                    </button>
                ))}
            </div>
            <div className="p-4 space-y-2.5">
                {map[tab].length ? map[tab].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                        <div className={cn('w-1.5 h-1.5 rounded-full shrink-0 mt-2', BULLET[tab])}/>
                        <p className="text-sm text-[var(--color-foreground)] leading-relaxed">{item}</p>
                    </div>
                )) : (
                    <p className="text-sm text-[var(--color-muted-foreground)] py-2">Нет данных</p>
                )}
            </div>
        </div>
    );
};


const ReportDownloadItem = ({ brandId, name, type, isLoggedIn }: { brandId: string; name: string; type: 'msfo'|'rsbu'; isLoggedIn: boolean }) => {
    const [loading, setLoading] = useState(false);
    const handle = async () => {
        if (!isLoggedIn) return;
        setLoading(true);
        try {
            const api = getClientApi(ReportApi);
            const res = await api.apiV1ReportsBrandIdPresignedGet({ brandId, type });
            if (res.url) window.open(res.url, '_blank');
        } catch { alert('Ошибка загрузки'); }
        finally { setLoading(false); }
    };
    return (
        <div onClick={handle} className="group relative flex items-center justify-between p-4 rounded-xl bg-[var(--color-muted)] hover:bg-[var(--color-card)] transition-all cursor-pointer">
            {!isLoggedIn && (
                <div className="absolute inset-0 rounded-xl bg-[var(--color-background)]/60 backdrop-blur-sm z-10 flex items-center justify-center">
                    <span className="text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1 rounded-lg flex items-center gap-1"><Lock size={11}/> Войдите</span>
                </div>
            )}
            <div className="min-w-0 flex-1 pr-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] mb-0.5">
                    {type === 'msfo' ? 'МСФО' : 'РСБУ'}
                </p>
                <p className="text-sm font-bold text-[var(--color-foreground)] truncate">{name}</p>
            </div>
            <button disabled={loading} className="w-9 h-9 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all shrink-0">
                {loading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"/> : <Download size={15}/>}
            </button>
        </div>
    );
};


function buildExport(brand: BrandBusinessResponse, otherBonds?: BondDtoResponse[]): string {
    const lines: string[] = [];
    lines.push(`📊 Финансовый анализ эмитента: "${brand.name ?? 'Эмитент'}"`);
    if (brand.sector) lines.push(`🏭 Сектор: ${brand.sector}${brand.subSector ? ` / ${brand.subSector}` : ''}`);
    if (brand.currentPeriodLabel) lines.push(`📅 Период: ${brand.currentPeriodLabel}${brand.previousPeriodLabel ? ` (пред.: ${brand.previousPeriodLabel})` : ''}`);
    if (brand.latestReportStandard) lines.push(`📋 Стандарт: ${brand.docType}`);
    lines.push('');
    if (brand.description) { lines.push('📝 О компании:'); lines.push(brand.description); lines.push(''); }
    const metrics = brand.latestMetrics ?? [];
    if (metrics.length) {
        lines.push(`📈 Показатели:`);
        [...metrics].sort((a,b) => ({ high:0,medium:1,low:2 }[(a.priority?.toLowerCase()??'low') as 'high'|'medium'|'low'] ?? 2) - ({ high:0,medium:1,low:2 }[(b.priority?.toLowerCase()??'low') as 'high'|'medium'|'low'] ?? 2))
            .forEach(m => {
                if (m.value == null) return;
                const z = zoneEmoji(m.zone as Zone);
                const val = m.isPercentage ? `${m.value.toFixed(2)}%` : m.isRelative ? fmtRel(m.value) : fmtAbs(m.value);
                let d = '';
                if (!m.isRelative && m.previousValue != null) { 
                    const p = pctDiff(m.value, m.previousValue); 
                    const isPositive = p >= 0;
                    const trendUp = m.isReversed ? !isPositive : isPositive;
                    const emoji = trendUp ? '📈' : '📉';
                    d = ` (${p>=0?'+':''}${p.toFixed(1)}% ${emoji})`; 
                }
                lines.push(`${z} ${m.name}: ${val}${d}`);
            });
    }
    (brand.investmentPros ?? []).length && (lines.push('💚 Плюсы:'), (brand.investmentPros!).forEach(p => lines.push(`✔️ ${p}`)), lines.push(''));
    (brand.investmentCons ?? []).length && (lines.push('⛔ Минусы:'), (brand.investmentCons!).forEach(c => lines.push(`✔️ ${c}`)), lines.push(''));
    (brand.keyRisks ?? []).length && (lines.push('⚠️ Риски:'), (brand.keyRisks!).forEach(r => lines.push(`✔️ ${r}`)), lines.push(''));
    
    if (otherBonds && otherBonds.length > 0) {
        const shuffled = [...otherBonds].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 10).map(b => `$${b.ticker}`).join(' ');
        lines.push('');
        lines.push('🌟 Другие выпуски эмитента:');
        lines.push(selected);
    }
    
    return lines.join('\n');
}

const AdminExportBtn = ({ brand, otherBonds }: { brand: BrandBusinessResponse, otherBonds?: BondDtoResponse[] }) => {
    const [copied, setCopied] = useState(false);
    return (
        <button onClick={async () => { await navigator.clipboard.writeText(buildExport(brand, otherBonds)); setCopied(true); setTimeout(()=>setCopied(false),2000); }}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all',
                copied ? 'bg-emerald-500 text-white' : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500 hover:text-white')}>
            {copied ? <Check size={14}/> : <Copy size={14}/>}
            {copied ? 'Скопировано!' : 'Экспорт для блога'}
        </button>
    );
};


export const BondFinances = ({
    brand, isSubscriber, isLoggedIn, isAdmin = false, otherBonds,
}: {
    brand: BrandBusinessResponse; isSubscriber: boolean; isLoggedIn: boolean; isAdmin?: boolean; otherBonds?: BondDtoResponse[];
}) => {
    if (!brand) return null;

    const [showSubModal, setShowSubModal] = useState(false);
    const canSeeFinances = isSubscriber || isAdmin;

    const metrics = brand.latestMetrics ?? [];
    const relMetrics = metrics.filter(m => m.isRelative).sort((a,b) => {
        const o: Record<string,number> = { High:0, Medium:1, Low:2, None:3 };
        return (o[a.priority ?? 'None'] ?? 3) - (o[b.priority ?? 'None'] ?? 3);
    });
    const absMetrics = metrics.filter(m => !m.isRelative && m.value !== null && m.value !== undefined);

    const totalDebtM  = metrics.find(m => m.key === 'TotalDebt');
    const shortDebtM  = metrics.find(m => m.key === 'ShortTermDebt');
    const showDebtPie = totalDebtM?.value != null && shortDebtM?.value != null && totalDebtM.value > 0;

    const stdLabel = brand.docType || "";

    return (
        <section className="space-y-5 animate-fade-in-up">
            
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
                        <Wallet size={16} className="text-[var(--color-primary)]"/>
                    </div>
                    <h2 className="text-xl font-black text-[var(--color-foreground)]">Финансы эмитента</h2>
                </div>
                {isAdmin && <AdminExportBtn brand={brand} otherBonds={otherBonds}/>}
            </div>

            
            {(brand.sector || brand.subSector || (brand.description && brand.description !== 'string') || brand.inn) && (
                <div className="rounded-2xl bg-[var(--color-card)] p-5 space-y-3">
                    <div className="flex flex-wrap gap-2">
                        {brand.sector && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-bold">
                                <Building2 size={12}/>{brand.sector}
                            </span>
                        )}
                        {brand.subSector && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-muted)] text-[var(--color-muted-foreground)] text-xs font-semibold">
                                <Tag size={11}/>{brand.subSector}
                            </span>
                        )}
                        {brand.inn && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-muted)] text-[var(--color-muted-foreground)] text-xs font-semibold">
                                ИНН: {brand.inn}
                            </span>
                        )}
                    </div>
                    {brand.description && brand.description !== 'string' && (
                        <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">{brand.description}</p>
                    )}
                </div>
            )}

            
            {!canSeeFinances ? (
                <div className="relative rounded-2xl overflow-hidden">
                    
                    <div className="blur-md pointer-events-none select-none opacity-40 space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="rounded-2xl bg-[var(--color-muted)] p-4 h-20"/>
                            ))}
                        </div>
                        <div className="rounded-2xl bg-[var(--color-muted)] h-28"/>
                    </div>

                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[var(--color-card)]/80 backdrop-blur-sm rounded-2xl">
                        <div className="w-14 h-14 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mb-4">
                            <Crown size={26} className="text-[var(--color-primary)]"/>
                        </div>
                        <h3 className="text-lg font-black text-[var(--color-foreground)] mb-2 tracking-tight">
                            Финансы эмитента
                        </h3>
                        <p className="text-sm text-[var(--color-muted-foreground)] mb-5 max-w-xs leading-relaxed">
                            Оформите подписку, чтобы разблокировать финансовую аналитику: метрики, плюсы, минусы и риски.
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => setShowSubModal(true)}
                            className="px-6 h-11 font-bold shadow-md"
                        >
                            Оформить подписку
                        </Button>
                    </div>

                    <SubscriptionModal
                        isOpen={showSubModal}
                        onClose={() => setShowSubModal(false)}
                        isLoggedIn={isLoggedIn}
                    />
                </div>
            ) : (
                <>
                    
                    <ProsConsRisks pros={brand.investmentPros} cons={brand.investmentCons} risks={brand.keyRisks}/>

                    
                    {metrics.length > 0 && (
                        <div className="space-y-4">
                            
                            {(brand.currentPeriodLabel || brand.previousPeriodLabel) && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <Info size={13} className="text-[var(--color-muted-foreground)]"/>
                                    {brand.currentPeriodLabel && (
                                        <span className="text-xs font-bold text-[var(--color-foreground)] bg-[var(--color-muted)] px-2.5 py-1 rounded-lg">
                                            Период: {brand.currentPeriodLabel}
                                        </span>
                                    )}
                                    {brand.previousPeriodLabel && (
                                        <>
                                            <ChevronRight size={12} className="text-[var(--color-muted-foreground)]"/>
                                            <span className="text-xs text-[var(--color-muted-foreground)] bg-[var(--color-muted)] px-2.5 py-1 rounded-lg">
                                                Пред.: {brand.previousPeriodLabel}
                                            </span>
                                        </>
                                    )}
                                    {stdLabel && (
                                        <span className="text-xs font-bold text-[var(--color-muted-foreground)] bg-[var(--color-muted)] px-2.5 py-1 rounded-lg uppercase">{stdLabel}</span>
                                    )}
                                    {brand.latestReportCurrency && (
                                        <span className="text-xs font-bold text-[var(--color-muted-foreground)] bg-[var(--color-muted)] px-2.5 py-1 rounded-lg">{formatCurrency(brand.latestReportCurrency)}</span>
                                    )}
                                </div>
                            )}

                            
                            {relMetrics.length > 0 && (
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-muted-foreground)] mb-2 px-0.5">Относительные показатели</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                                        {relMetrics.map((m, i) => (
                                            <MetricCard key={m.key ?? i} m={m} isHigh={m.priority === 'High'}/>
                                        ))}
                                    </div>
                                </div>
                            )}

                            
                            {absMetrics.length > 0 && (
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-muted-foreground)] mb-2 px-0.5">Абсолютные показатели</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                                        {absMetrics.map((m, i) => (
                                            <MetricCard key={m.key ?? i} m={m} isHigh={false}/>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    
                    {showDebtPie && (
                        <DebtPie total={totalDebtM!.value!} shortTerm={shortDebtM!.value!}/>
                    )}

                    
                    {(brand.msfoReportName || brand.rsbuReportName) && (
                        <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-muted-foreground)] px-0.5">Отчётность</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {brand.msfoReportName && (
                                    <ReportDownloadItem brandId={brand.id!} name={brand.msfoReportName} type="msfo" isLoggedIn={isLoggedIn}/>
                                )}
                                {brand.rsbuReportName && (
                                    <ReportDownloadItem brandId={brand.id!} name={brand.rsbuReportName} type="rsbu" isLoggedIn={isLoggedIn}/>
                                )}
                            </div>
                        </div>
                    )}

                    
                    {!metrics.length && !(brand.investmentPros?.length) && !(brand.investmentCons?.length) && !(brand.keyRisks?.length) && !(brand.description && brand.description !== 'string') && (
                        <div className="rounded-2xl bg-[var(--color-muted)] p-8 flex flex-col items-center gap-3 text-center">
                            <AlertTriangle size={28} className="text-[var(--color-muted-foreground)] opacity-40"/>
                            <p className="text-sm text-[var(--color-muted-foreground)]">Финансовые данные не загружены</p>
                        </div>
                    )}
                </>
            )}
        </section>
    );
};