'use client';

import { useEffect, useState, useMemo } from 'react';
import { AuthApi, TinkoffPortfolioApi, TinkoffPortfolioResponse, TinkoffPortfolioPosition } from '@/lib/api';
import { getClientApi } from '@/lib/client-api';
import { Button } from '@/components/ui/Button';
import { Briefcase, TrendingUp, TrendingDown, Wallet, PieChart, BarChart3, AlertTriangle, Lock, Sparkles, ArrowRight, ShieldAlert, KeyRound, Crown, HelpCircle, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PortfolioTutorialModal } from './PortfolioTutorialModal';

const TBankIcon = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block shrink-0">
        <path d="M4 8C4 8 16 2 28 8C28 8 30 22 16 30C2 22 4 8 4 8Z" fill="#FFDD2D"/>
        <path d="M11 12H21V15H17.5V23H14.5V15H11V12Z" fill="#1C1C1E"/>
    </svg>
);

const getCreditRatingColor = (rating: string | null | undefined) => {
    if (!rating) return 'text-[var(--color-muted-foreground)] bg-[var(--color-muted)]';
    if (rating.includes('AAA')) return 'text-emerald-600 bg-emerald-500/10';
    if (rating.includes('AA')) return 'text-green-600 bg-green-500/10';
    if (rating.startsWith('A')) return 'text-lime-600 bg-lime-500/10';
    if (rating.includes('BBB')) return 'text-yellow-600 bg-yellow-500/10';
    if (rating.includes('BB')) return 'text-amber-600 bg-amber-500/10';
    if (rating.startsWith('B')) return 'text-orange-600 bg-orange-500/10';
    if (rating.startsWith('C')) return 'text-red-500 bg-red-500/10';
    if (rating.startsWith('D')) return 'text-red-700 bg-red-700/10';
    return 'text-[var(--color-muted-foreground)] bg-[var(--color-muted)]';
};

const formatCurrency = (val: number | undefined) => {
    if (val === undefined || val === null) return '—';
    return new Intl.NumberFormat('ru-RU', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
};

const formatPercent = (val: number | undefined | null) => {
    if (val === undefined || val === null) return '—';
    return new Intl.NumberFormat('ru-RU', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val) + '%';
};

const formatDate = (dateString: Date | string | null | undefined) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
};

const MetricRow = ({ label, value, subValue, valueColor }: { label: string; value: React.ReactNode; subValue?: React.ReactNode; valueColor?: string }) => (
    <div className="flex justify-between items-start md:items-center py-2 gap-2 md:gap-4">
        <span className="text-[var(--color-muted-foreground)] text-[14px] md:text-[15px] flex-1 leading-snug break-words min-w-0 shrink">{label}</span>
        <div className="flex flex-col md:flex-row items-end md:items-center gap-1 md:gap-2 shrink-0 text-right max-w-[55%] md:max-w-[60%]">
            <span className={`font-medium text-[14px] md:text-[15px] text-[var(--color-foreground)] truncate max-w-full ${valueColor || ''}`}>
                {value}
            </span>
            {subValue && (
                <span className={`text-[14px] md:text-[15px] truncate max-w-full ${valueColor || 'text-[var(--color-muted-foreground)]'}`}>
                    {subValue}
                </span>
            )}
        </div>
    </div>
);

const getRatingHexColor = (rating: string) => {
    if (rating.includes('AAA')) return '#10b981';
    if (rating.includes('AA')) return '#22c55e';
    if (rating.startsWith('A')) return '#84cc16';
    if (rating.includes('BBB')) return '#eab308';
    if (rating.includes('BB')) return '#f59e0b';
    if (rating.startsWith('B')) return '#f97316';
    if (rating.startsWith('C')) return '#ef4444';
    if (rating.startsWith('D')) return '#b91c1c';
    return '#71717a';
};

const CreditRatingDonut = ({ positions }: { positions: any[] }) => {
    const data = useMemo(() => {
        if (!positions || positions.length === 0) return [];
        const groups: Record<string, number> = {};
        let total = 0;
        
        positions.forEach(pos => {
            const rating = pos.creditRating && pos.creditRating !== '-' ? pos.creditRating : 'Без рейтинга';
            const val = pos.currentValue || 0;
            groups[rating] = (groups[rating] || 0) + val;
            total += val;
        });
        
        return Object.entries(groups)
            .map(([rating, value]) => ({
                rating,
                value,
                percent: total > 0 ? (value / total) * 100 : 0,
                color: getRatingHexColor(rating)
            }))
            .sort((a, b) => b.value - a.value);
    }, [positions]);

    if (data.length === 0) return null;

    let currentPercent = 0;
    const gradient = data.map(item => {
        const start = currentPercent;
        currentPercent += item.percent;
        return `${item.color} ${start}%, ${item.color} ${currentPercent}%`;
    }).join(', ');

    return (
        <div className="flex flex-col items-center">
            <div 
                className="w-40 h-40 md:w-48 md:h-48 rounded-full shadow-inner relative mb-6"
                style={{ background: `conic-gradient(${gradient})` }}
            >
                <div className="absolute inset-4 md:inset-5 bg-[var(--color-background)] rounded-full shadow-sm flex flex-col items-center justify-center">
                    <span className="text-xs text-[var(--color-muted-foreground)]">Активы</span>
                    <span className="text-lg font-bold text-[var(--color-foreground)]">{data.length}</span>
                </div>
            </div>
            <div className="w-full grid grid-cols-2 gap-3 text-sm px-4">
                {data.map((d, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }}></div>
                            <span className="font-medium text-[var(--color-foreground)] truncate max-w-[80px]" title={d.rating}>{d.rating}</span>
                        </div>
                        <span className="font-bold text-[var(--color-muted-foreground)]">{d.percent.toFixed(1)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MonthlyIncomeChart = ({ income, hideAbsolute }: { income: any[] | null | undefined; hideAbsolute?: boolean }) => {
    if (!income || income.length === 0) return null;
    
    const data = income.slice(0, 12);
    const maxAmount = Math.max(...data.map(d => d.totalAmount), 1); 

    return (
        <div className="flex items-end justify-between gap-1.5 md:gap-3 h-56 w-full mt-8">
            {data.map((m, i) => {
                const totalH = (m.totalAmount / maxAmount) * 100;
                const fixH = m.totalAmount > 0 ? (m.fixedCouponAmount / m.totalAmount) * 100 : 0;
                const floatH = m.totalAmount > 0 ? (m.floaterCouponAmount / m.totalAmount) * 100 : 0;
                const amortH = m.totalAmount > 0 ? (m.amortizationAmount / m.totalAmount) * 100 : 0;
                
                const monthName = new Date(m.year, m.month - 1).toLocaleString('ru-RU', { month: 'short' });
                
                const isFirstCols = i < 3;
                const isLastCols = i > data.length - 4;
                const tooltipPositionClass = isFirstCols ? 'left-0 translate-x-0' : isLastCols ? 'right-0 translate-x-0' : 'left-1/2 -translate-x-1/2';
                
                return (
                    <div key={i} tabIndex={0} className="flex-1 min-w-0 flex flex-col items-center gap-2 group relative h-full justify-end cursor-pointer outline-none">
                        <div className={`invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus:visible group-focus:opacity-100 absolute bottom-full mb-3 ${tooltipPositionClass} bg-[var(--color-card)] border border-[var(--color-muted)] shadow-xl rounded-xl p-3 text-xs w-52 z-20 pointer-events-none transition-all duration-200 translate-y-2 group-hover:translate-y-0 group-focus:translate-y-0`}>
                            <div className="font-bold text-[var(--color-foreground)] mb-2 text-sm capitalize">{monthName} {m.year}</div>
                            {m.fixedCouponAmount > 0 && <div className="flex justify-between gap-4 mb-1"><span className="text-[var(--color-muted-foreground)] flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></div> Фикс.</span><span className="font-medium text-[var(--color-foreground)]">{hideAbsolute ? '•••' : formatCurrency(m.fixedCouponAmount)} ₽</span></div>}
                            {m.floaterCouponAmount > 0 && <div className="flex justify-between gap-4 mb-1"><span className="text-[var(--color-muted-foreground)] flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[var(--color-primary)] opacity-60"></div> Флоатер</span><span className="font-medium text-[var(--color-foreground)]">{hideAbsolute ? '•••' : formatCurrency(m.floaterCouponAmount)} ₽</span></div>}
                            {m.amortizationAmount > 0 && <div className="flex justify-between gap-4 mb-1"><span className="text-[var(--color-muted-foreground)] flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[var(--color-primary)] opacity-30"></div> Аморт.</span><span className="font-medium text-[var(--color-foreground)]">{hideAbsolute ? '•••' : formatCurrency(m.amortizationAmount)} ₽</span></div>}
                            <div className="border-t border-[var(--color-muted)] mt-2 pt-2 flex justify-between gap-4 font-bold text-sm"><span className="text-[var(--color-foreground)]">Итого</span><span>{hideAbsolute ? '•••' : formatCurrency(m.totalAmount)} ₽</span></div>
                        </div>

                        <div className="w-full relative flex flex-col justify-end group-hover:opacity-80 transition-opacity rounded-t-md overflow-hidden bg-[var(--color-muted)]/30" style={{ height: `${totalH}%`, minHeight: totalH > 0 ? '4px' : '0' }}>
                            <div className="w-full bg-[var(--color-primary)] opacity-30 transition-all duration-500" style={{ height: `${amortH}%` }} />
                            <div className="w-full bg-[var(--color-primary)] opacity-60 transition-all duration-500" style={{ height: `${floatH}%` }} />
                            <div className="w-full bg-[var(--color-primary)] transition-all duration-500" style={{ height: `${fixH}%` }} />
                        </div>
                        
                        <span className="text-[10px] md:text-xs font-medium text-[var(--color-muted-foreground)] capitalize w-full text-center truncate">{monthName}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default function PortfolioClient() {
    const [loading, setLoading] = useState(true);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [hasToken, setHasToken] = useState(false);
    const [portfolio, setPortfolio] = useState<TinkoffPortfolioResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showTutorial, setShowTutorial] = useState(false);
    const [hideAbsolute, setHideAbsolute] = useState(false);
    const router = useRouter();

    const displayCurrency = (val: number | undefined | null) => hideAbsolute ? '•••' : formatCurrency(val ?? undefined);
    const displayQuantity = (val: number | undefined | null) => hideAbsolute ? '•••' : (val ?? '—');

    useEffect(() => {
        const init = async () => {
            try {
                const authApi = getClientApi(AuthApi);
                const me = await authApi.apiV1AuthMeGet();

                if (!me.hasActiveSubscription) {
                    setIsSubscribed(false);
                    setLoading(false);
                    return;
                }

                setIsSubscribed(true);

                if (!me.hasValidTinkoffToken) {
                    setHasToken(false);
                    setLoading(false);
                    return;
                }

                setHasToken(true);
                const portfolioApi = getClientApi(TinkoffPortfolioApi);
                const data = await portfolioApi.apiV1PortfolioTinkoffGet();
                setPortfolio(data);
            } catch (e: any) {
                console.error('Portfolio fetch error', e);
                setError('Ошибка загрузки портфеля. Попробуйте позже.');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    if (loading) {
        return (
            <div className="w-full max-w-6xl mx-auto px-4 py-20 text-center">
                <Crown className="animate-spin mx-auto mb-4 text-primary" size={32} />
                <p className="text-[var(--color-muted-foreground)] font-medium">Загрузка портфеля...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-6xl mx-auto px-4 py-20 text-center">
                <AlertTriangle className="mx-auto mb-4 text-red-500" size={32} />
                <p className="text-red-500 font-bold">{error}</p>
            </div>
        );
    }

    if (!isSubscribed) {
        return (
            <div className="w-full max-w-4xl mx-auto px-4 py-20">
                <div className="bg-[var(--color-card)] rounded-[2.5rem] p-10 md:p-16 shadow-card text-center relative overflow-hidden">
                    
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-[300px] h-[200px] bg-amber-400/5 blur-[80px] rounded-full pointer-events-none" />

                    <div className="relative z-10">
                        
                        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 relative">
                            <Lock size={36} className="text-primary" />
                            <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center shadow-lg">
                                <Crown size={14} className="text-amber-900" />
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-black text-[var(--color-foreground)] mb-3 tracking-tight">
                            Портфель — только для подписчиков
                        </h1>
                        <p className="text-[var(--color-muted-foreground)] text-lg leading-relaxed max-w-lg mx-auto mb-8">
                            Синхронизация с Т-Инвестициями, анализ доходности и отслеживание позиций
                            доступны в рамках подписки Bonds-Lab.
                        </p>

                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left">
                            {[
                                { icon: <Briefcase size={18} className="text-primary" />, text: 'Синхронизация портфеля из Т-Инвестиций' },
                                { icon: <TrendingUp size={18} className="text-emerald-500" />, text: 'Личная и базовая доходность по каждой позиции' },
                                { icon: <PieChart size={18} className="text-amber-500" />, text: 'Диверсификация по эмитентам в реальном времени' },
                            ].map((f, i) => (
                                <div key={i} className="flex items-start gap-3 bg-[var(--color-muted)]/50 rounded-2xl p-4">
                                    <div className="p-1.5 rounded-lg bg-[var(--color-background)] shadow-sm shrink-0">{f.icon}</div>
                                    <span className="text-sm font-medium text-[var(--color-foreground)] leading-snug">{f.text}</span>
                                </div>
                            ))}
                        </div>

                        <Link href="/dashboard">
                            <Button size="lg" className="shadow-glow-primary hover:shadow-glow-primary-hover group">
                                <Sparkles size={18} />
                                Оформить подписку
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!hasToken) {
        return (
            <div className="w-full max-w-4xl mx-auto px-4 py-20">
                <div className="bg-[var(--color-card)] rounded-[2.5rem] p-10 md:p-16 shadow-card text-center relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-amber-400/5 blur-[100px] rounded-full pointer-events-none" />
                    <div className="relative z-10">
                        <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-8">
                            <TBankIcon size={48} />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-foreground)] mb-4 tracking-tight">
                            Подключите Т-Инвестиции
                        </h1>
                        <p className="text-[var(--color-muted-foreground)] text-lg leading-relaxed max-w-lg mx-auto mb-10">
                            Для просмотра портфеля облигаций необходимо добавить API-ключ Т-Инвестиций
                            в личном кабинете. Используйте токен с правами «только для чтения».
                        </p>
                        <Link href="/dashboard">
                            <Button size="lg" className="shadow-glow-primary hover:shadow-glow-primary-hover group">
                                <KeyRound size={18} />
                                Настроить в личном кабинете
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const positions = portfolio?.positions || [];
    const currentTotal = portfolio?.currentTotalValue || 0;
    const investedTotal = portfolio?.investedTotalValue || 0;
    const nominalTotal = portfolio?.nominalTotalValue || 0;
    const pnl = currentTotal - investedTotal;
    const pnlPct = investedTotal > 0 ? (pnl / investedTotal) * 100 : 0;

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-10">
            <PortfolioTutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
            
            
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-amber-500/10">
                    <TBankIcon size={32} />
                </div>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl md:text-3xl font-black text-[var(--color-foreground)] tracking-tight">Мой портфель</h1>
                        <button onClick={() => setHideAbsolute(!hideAbsolute)} className="w-8 h-8 rounded-full bg-[var(--color-muted)] hover:bg-[var(--color-primary)]/20 hover:text-[var(--color-primary)] text-[var(--color-muted-foreground)] flex items-center justify-center transition-colors" title={hideAbsolute ? "Показать значения" : "Скрыть значения"}>
                            {hideAbsolute ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button onClick={() => setShowTutorial(true)} className="w-8 h-8 rounded-full bg-[var(--color-muted)] hover:bg-[var(--color-primary)]/20 hover:text-[var(--color-primary)] text-[var(--color-muted-foreground)] flex items-center justify-center transition-colors" title="Справка по метрикам">
                            <HelpCircle size={18} />
                        </button>
                    </div>
                    <p className="text-sm text-[var(--color-muted-foreground)] mt-1">{hideAbsolute ? '•••' : positions.length} позиций в портфеле</p>
                </div>
            </div>

            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 mb-12">
                <div>
                    <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-4">Стоимость</h3>
                    <div className="flex flex-col">
                        <MetricRow label="Текущая стоимость" value={`${displayCurrency(currentTotal)} ₽`} />
                        <MetricRow label="Вложено" value={`${displayCurrency(investedTotal)} ₽`} />
                        <MetricRow label="Номинал" value={`${displayCurrency(nominalTotal)} ₽`} />
                    </div>

                    <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-4 mt-8">Прибыль</h3>
                    <div className="flex flex-col">
                        <MetricRow 
                            label="Общая прибыль" 
                            value={`${(portfolio?.totalProfit || 0) > 0 && !hideAbsolute ? '+' : ''}${displayCurrency(portfolio?.totalProfit)} ₽`} 
                            valueColor={(portfolio?.totalProfit || 0) > 0 ? 'text-emerald-500' : (portfolio?.totalProfit || 0) < 0 ? 'text-red-500' : ''}
                            subValue={`${(portfolio?.totalProfitPercent || 0) > 0 ? '+' : ''}${formatPercent(portfolio?.totalProfitPercent)}`}
                        />
                        <MetricRow label="Прибыль от изменения цены" value={`${(portfolio?.profitFromPriceAppreciation || 0) > 0 && !hideAbsolute ? '+' : ''}${displayCurrency(portfolio?.profitFromPriceAppreciation)} ₽`} />
                        <MetricRow label="Уплаченные комиссии" value={`${displayCurrency(portfolio?.paidCommissions)} ₽`} />
                    </div>

                    <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-4 mt-8">Доходы и выплаты</h3>
                    <div className="flex flex-col">
                        <MetricRow label="Полученные выплаты" value={`${displayCurrency(portfolio?.receivedAccruals)} ₽`} />
                        <MetricRow label="Купоны (за последний месяц)" value={`${displayCurrency(portfolio?.receivedCouponsLastMonth)} ₽`} />
                        <MetricRow label="Купоны (за последний год)" value={`${displayCurrency(portfolio?.receivedCouponsLastYear)} ₽`} />
                        <MetricRow label="НКД (Накопленный купонный доход)" value={`${displayCurrency(portfolio?.totalAci)} ₽`} />
                    </div>

                    <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-4 mt-8">Показатели</h3>
                    <div className="flex flex-col">
                        <MetricRow label="Старт портфеля" value={formatDate(portfolio?.portfolioStartDate)} />
                        <MetricRow label="Дюрация" value={portfolio?.weightedAverageDuration ? `${formatCurrency(portfolio.weightedAverageDuration)} дн.` : '—'} />
                        <MetricRow label="Ближайшая выплата" value={`${displayCurrency(portfolio?.nextPayoutAmount)} ₽`} subValue={formatDate(portfolio?.nextPayoutDate)} />
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-4">Доходность</h3>
                    <div className="flex flex-col">
                        <MetricRow label="XIRR (годовая)" value={formatPercent(portfolio?.lifetimeXirr)} />
                        <MetricRow label="Средневзвешенная" value={formatPercent(portfolio?.weightedAverageYield)} />
                        <MetricRow label="Доходность фикс. купонов" value={formatPercent(portfolio?.fixedWeightedAverageYield)} />
                        <MetricRow label="Доходность корп. фикс." value={formatPercent(portfolio?.corporateFixedWeightedAverageYield)} />
                    </div>

                    <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-4 mt-8">Прогноз выплат</h3>
                    <div className="flex flex-col">
                        <MetricRow label="Общий доход за год" value={`${displayCurrency(portfolio?.estimatedAnnualIncome)} ₽`} />
                        {portfolio?.estimatedDailyIncome !== undefined && (
                            <MetricRow label="В среднем за день" value={`${displayCurrency(portfolio.estimatedDailyIncome)} ₽`} />
                        )}
                        <MetricRow label="Фикс. купоны" value={`${displayCurrency(portfolio?.estimatedFixedCouponIncome)} ₽`} />
                        <MetricRow label="Флоатеры" value={`${displayCurrency(portfolio?.estimatedFloaterCouponIncome)} ₽`} />
                        <MetricRow label="Амортизация" value={`${displayCurrency(portfolio?.estimatedAmortizationIncome)} ₽`} />
                    </div>
                    
                    {portfolio?.benchmarks && portfolio.benchmarks.length > 0 && (
                        <>
                            <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-4 mt-8">Бенчмарки (доходность за 1 год)</h3>
                            <div className="flex flex-col">
                                {portfolio.benchmarks.map((b, i) => (
                                    <MetricRow 
                                        key={i} 
                                        label={b.name || b.ticker || '—'} 
                                        value={formatPercent(b.oneYearReturn)} 
                                        valueColor={(b.oneYearReturn || 0) > 0 ? 'text-emerald-500' : (b.oneYearReturn || 0) < 0 ? 'text-red-500' : ''}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
                <div className="lg:col-span-2">
                    <h3 className="text-lg font-bold text-[var(--color-foreground)]">Прогноз выплат (следующие 12 месяцев)</h3>
                    <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-2 mb-2 text-xs">
                        <div className="flex items-center gap-1.5 text-[var(--color-muted-foreground)]"><div className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></div>Фикс. купоны</div>
                        <div className="flex items-center gap-1.5 text-[var(--color-muted-foreground)]"><div className="w-2 h-2 rounded-full bg-[var(--color-primary)] opacity-60"></div>Флоатеры</div>
                        <div className="flex items-center gap-1.5 text-[var(--color-muted-foreground)]"><div className="w-2 h-2 rounded-full bg-[var(--color-primary)] opacity-30"></div>Амортизация</div>
                    </div>
                    <MonthlyIncomeChart income={portfolio?.monthlyIncome} hideAbsolute={hideAbsolute} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-6 text-center">Активы по кредитному рейтингу</h3>
                    <CreditRatingDonut positions={positions} />
                </div>
            </div>

            
            {positions.length === 0 ? (
                <div className="bg-[var(--color-card)] rounded-2xl p-12 shadow-card text-center">
                    <Briefcase size={48} className="mx-auto mb-4 text-[var(--color-muted-foreground)]" />
                    <p className="text-lg font-bold text-[var(--color-foreground)] mb-2">Портфель пуст</p>
                    <p className="text-[var(--color-muted-foreground)]">В вашем портфеле нет облигаций</p>
                </div>
            ) : (
                <>
                    
                    <div className="hidden lg:block bg-[var(--color-card)] rounded-2xl shadow-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[var(--color-muted)]">
                                        <th className="text-left px-6 py-4 text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">Название</th>
                                        <th className="text-center px-4 py-4 text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">Рейтинг</th>
                                        <th className="text-center px-4 py-4 text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">Купон</th>
                                        <th className="text-center px-4 py-4 text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">Кол-во</th>
                                        <th className="text-right px-4 py-4 text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">Ср. цена</th>
                                        <th className="text-right px-4 py-4 text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">Текущая</th>
                                        <th className="text-right px-4 py-4 text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                                            YTM / YTO
                                            <div className="text-[10px] font-normal opacity-70 normal-case mt-0.5">Баз / Личн</div>
                                        </th>
                                        <th className="text-right px-6 py-4 text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">Доля эмитента</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {positions.map((pos, i) => (
                                        <tr 
                                            key={pos.bondId || i} 
                                            className="border-b border-[var(--color-muted)] last:border-b-0 hover:bg-[var(--color-muted)]/50 transition-colors cursor-pointer"
                                            onClick={() => pos.bondId && router.push(`/bonds/${pos.bondId}`)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {pos.defaultFlag && <ShieldAlert size={16} className="text-red-500 shrink-0" />}
                                                    <span className="font-bold text-sm text-[var(--color-foreground)] truncate max-w-[200px]">{pos.name || '—'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${getCreditRatingColor(pos.creditRating)}`}>
                                                    {pos.creditRating || '—'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="text-xs">
                                                    <span className="font-bold text-[var(--color-foreground)]">{pos.couponRateOrFormula || '—'}</span>
                                                    {pos.couponType && <span className="text-[var(--color-muted-foreground)] block">{pos.couponType}</span>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center font-bold text-sm text-[var(--color-foreground)]">{displayQuantity(pos.quantity)}</td>
                                            <td className="px-4 py-4 text-right text-sm font-medium text-[var(--color-foreground)] whitespace-nowrap">{displayCurrency(pos.averagePositionPrice)}</td>
                                            <td className="px-4 py-4 text-right text-sm font-bold text-[var(--color-foreground)] whitespace-nowrap">{displayCurrency(pos.currentValue)}</td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex flex-col items-end gap-0.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs font-medium text-[var(--color-muted-foreground)]" title="Базовая доходность">
                                                            {pos.couponType?.toLowerCase().includes('плавающий') || pos.couponType?.toLowerCase().includes('флоатер') ? '-' : (pos.baseYield ? `${pos.baseYield}%` : '—')}
                                                        </span>
                                                        <span className="text-xs text-[var(--color-muted-foreground)]">/</span>
                                                        <span className="text-sm font-bold text-[var(--color-foreground)]" title="Личная доходность">
                                                            {pos.couponType?.toLowerCase().includes('плавающий') || pos.couponType?.toLowerCase().includes('флоатер') ? '-' : (pos.personalYield ? `${pos.personalYield}%` : '—')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 justify-end">
                                                    <div className="w-20 h-2 bg-[var(--color-muted)] rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary rounded-full transition-all"
                                                            style={{ width: `${Math.min(pos.issuerSharePercent ?? 0, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-bold text-[var(--color-muted-foreground)] w-10 text-right">
                                                        {(pos.issuerSharePercent ?? 0).toFixed(1)}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    
                    <div className="lg:hidden space-y-4">
                        {positions.map((pos, i) => (
                            <div 
                                key={pos.bondId || i} 
                                className="bg-[var(--color-card)] rounded-2xl p-5 shadow-card cursor-pointer hover:shadow-card-hover transition-all"
                                onClick={() => pos.bondId && router.push(`/bonds/${pos.bondId}`)}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        {pos.defaultFlag && <ShieldAlert size={16} className="text-red-500 shrink-0" />}
                                        <span className="font-bold text-[var(--color-foreground)] text-sm truncate">{pos.name || '—'}</span>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-lg shrink-0 ml-2 ${getCreditRatingColor(pos.creditRating)}`}>
                                        {pos.creditRating || '—'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-xs text-[var(--color-muted-foreground)]">Купон</span>
                                        <p className="font-bold text-[var(--color-foreground)]">{pos.couponRateOrFormula || '—'}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-[var(--color-muted-foreground)]">Кол-во</span>
                                        <p className="font-bold text-[var(--color-foreground)]">{displayQuantity(pos.quantity)}</p>
                                    </div>
                                    <div className="min-w-0">
                                        <span className="text-xs text-[var(--color-muted-foreground)]">Текущая стоимость</span>
                                        <p className="font-bold text-[var(--color-foreground)] truncate">{displayCurrency(pos.currentValue)} ₽</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-[var(--color-muted-foreground)]">YTM / YTO (Баз / Личн)</span>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-sm font-medium text-[var(--color-muted-foreground)]">
                                                {pos.couponType?.toLowerCase().includes('плавающий') || pos.couponType?.toLowerCase().includes('флоатер') ? '-' : (pos.baseYield ? `${pos.baseYield}%` : '—')}
                                            </span>
                                            <span className="text-xs text-[var(--color-muted-foreground)]">/</span>
                                            <span className="text-sm font-bold text-[var(--color-foreground)]">
                                                {pos.couponType?.toLowerCase().includes('плавающий') || pos.couponType?.toLowerCase().includes('флоатер') ? '-' : (pos.personalYield ? `${pos.personalYield}%` : '—')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-[var(--color-muted)]">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="text-[var(--color-muted-foreground)]">Доля эмитента</span>
                                        <span className="font-bold text-[var(--color-foreground)]">{(pos.issuerSharePercent ?? 0).toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-[var(--color-muted)] rounded-full overflow-hidden">
                                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(pos.issuerSharePercent ?? 0, 100)}%` }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
