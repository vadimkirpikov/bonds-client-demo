'use client';
import { useState, useEffect, useMemo } from 'react';
import { Job, JobApi, BrandApi, SimplifiedBrandResponse } from '@/lib/api';
import { getClientApi } from '@/lib/client-api';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { X, CheckCircle, AlertTriangle, Eye, Search, Check } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface ReviewModalProps {
    job: Job | null;
    onClose: () => void;
}

const formatMoney = (val?: number | null) => {
    if (val === undefined || val === null) return '-';
    return new Intl.NumberFormat('ru-RU', {
        style: 'decimal',
        maximumFractionDigits: 0
    }).format(val);
};

const formatPercent = (val?: number | null) => {
    if (val === undefined || val === null || isNaN(val)) return '-';
    return `${val.toFixed(2)}%`;
};

const formatRatio = (val?: number | null) => {
    if (val === undefined || val === null || isNaN(val)) return '-';
    return val.toFixed(2);
};

const getLogoUrl = (logoName?: string | null) => {
    if (!logoName) return undefined;
    const parts = logoName.split('.');
    const finalLogoName = parts.length > 1 ? parts[0] + 'x640' + '.' + parts[1] : '';
    return finalLogoName ? `https://invest-brands.cdn-tinkoff.ru/${finalLogoName}` : undefined;
};

const getIndicatorColor = (
    value: number | undefined | null,
    ranges: [number, number, number, number],
    reverse: boolean = false
): string | undefined => {
    if (value === undefined || value === null || isNaN(value)) return undefined;

    const [r1, r2, r3, r4] = ranges;

    if (reverse) {
        if (value > r1) return 'text-red-500';
        if (value > r2) return 'text-orange-500';
        if (value > r3) return 'text-yellow-500';
        return 'text-green-500';
    } else {
        if (value < r1) return 'text-red-500';
        if (value < r2) return 'text-orange-500';
        if (value < r3) return 'text-yellow-500';
        return 'text-green-500';
    }
};

export const ReviewModal = ({ job, onClose }: ReviewModalProps) => {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role?.toLowerCase() === 'admin';

    const [brandId, setBrandId] = useState('');
    const [selectedBrand, setSelectedBrand] = useState<SimplifiedBrandResponse | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [brands, setBrands] = useState<SimplifiedBrandResponse[]>([]);
    const [isLoadingBrands, setIsLoadingBrands] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [calcStats, setCalcStats] = useState<any>({});

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    useEffect(() => {
        if (job?.brandBusinessId) {
            setBrandId(job.brandBusinessId);
        } else {
            setBrandId('');
            setSelectedBrand(null);
        }

        if (job) {
            calculateIndicators(job);
        }
    }, [job]);

    useEffect(() => {
        if (brands.length > 0 && brandId) {
            const found = brands.find(b => b.id === brandId);
            if (found) setSelectedBrand(found);
        }
    }, [brandId, brands]);

    useEffect(() => {
        const fetchBrands = async () => {
            if (!isAdmin) return;
            setIsLoadingBrands(true);
            try {
                const api = getClientApi(BrandApi);
                const response = await api.apiV1BrandsGet();
                if (response && response.brands) {
                    setBrands(response.brands);
                }
            } catch (e) {
                console.error("Failed to fetch brands list", e);
            } finally {
                setIsLoadingBrands(false);
            }
        };

        if (isAdmin) {
            fetchBrands();
        }
    }, [isAdmin]);

    const filteredBrands = useMemo(() => {
        if (!searchQuery) return brands;
        return brands.filter(b =>
            b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.bondName?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [brands, searchQuery]);

    const calculateIndicators = (job: Job) => {
        const val = (v?: number | null) => v ?? 0;

        const operatingProfit = val(job.operatingProfit);
        const amortization = val(job.amortization);
        const longTermDebt = val(job.longTermDebt);
        const shortTermDebt = val(job.shortTermDebt);
        const totalCurrentLiab = val(job.totalCurrentLiabilities);
        const cash = val(job.cashAndEquivalents);
        const ocf = val(job.operationCashFlow);
        const equity = val(job.totalEquity);
        const totalAssets = val(job.totalAssets);
        const interestExpense = Math.abs(val(job.interestExpense));
        const revenue = val(job.revenue);
        const netProfit = val(job.netProfit);
        const currentAssets = val(job.currentAssets);
        const inventory = val(job.inventory);

        const kAnnual = job.ebitdaLtmMultiplier || 1;

        const totalFinancialDebt = longTermDebt + shortTermDebt;
        const netDebt = totalFinancialDebt - cash;
        const ebitda = operatingProfit + amortization;

        const ebitdaAnnual = ebitda * kAnnual;
        const netProfitAnnual = netProfit * kAnnual;
        const ocfAnnual = ocf * kAnnual;
        const revenueAnnual = revenue * kAnnual;
        const interestExpenseAnnual = interestExpense * kAnnual;

        const stats = {
            TotalDebtToEquity: (equity !== 0) ? totalFinancialDebt / equity : 0,
            TotalDebtToAssets: (totalAssets !== 0) ? totalFinancialDebt / totalAssets : 0,
            EbitdaToInterestExpense: (interestExpenseAnnual !== 0) ? ebitdaAnnual / interestExpenseAnnual : 0,
            OperatingCashFlowToTotalDebt: (totalFinancialDebt !== 0) ? ocfAnnual / totalFinancialDebt : 0,
            EbitdaMargin: (revenueAnnual !== 0) ? (ebitdaAnnual / revenueAnnual) * 100 : 0,
            NetProfitMargin: (revenueAnnual !== 0) ? (netProfitAnnual / revenueAnnual) * 100 : 0,
            ReturnOnAssets: (totalAssets !== 0) ? netProfitAnnual / totalAssets * 100 : 0,
            ReturnOnInvestment: (equity + totalFinancialDebt !== 0) ? netProfitAnnual / (equity + totalFinancialDebt) * 100 : 0,
            CurrentRatio: (totalCurrentLiab !== 0) ? currentAssets / totalCurrentLiab : 0,
            QuickRatio: (totalCurrentLiab !== 0) ? (currentAssets - inventory) / totalCurrentLiab : 0,
            NetDebtToEbitda: (ebitdaAnnual !== 0) ? netDebt / ebitdaAnnual : 0,

            EbitdaAnnual: ebitdaAnnual,
            NetDebt: netDebt
        };

        setCalcStats(stats);
    };

    if (!job) return null;

    const handleAction = async (approved: boolean) => {
        setIsSubmitting(true);
        try {
            const api = getClientApi(JobApi);
            await api.apiV1JobsIdReviewPost({
                id: job.id!,
                reviewJobRequest: {
                    approved,
                    brandId: approved ? brandId : undefined
                }
            });
            onClose();
        } catch (error) {
            console.error('Failed to review job:', error);
            alert('Ошибка при отправке решения');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBrandSelect = (brand: SimplifiedBrandResponse) => {
        if (brand.id) {
            setBrandId(brand.id);
            setSelectedBrand(brand);
        }
    };

    const isEbitdaNegative = calcStats.EbitdaAnnual < 0;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-2 sm:p-4 backdrop-blur-sm">
            <div className="bg-card border border-card-border w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[95vh] animate-fade-in">

                
                <div className="p-4 md:p-6 border-b border-card-border flex justify-between items-start md:items-center bg-zinc-900/50 shrink-0">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 w-full pr-8 md:pr-0">
                        <div>
                            <h3 className="text-lg md:text-xl font-bold text-white mb-1">Проверка отчета</h3>
                            <p className="text-xs text-zinc-400 font-mono truncate max-w-[200px] md:max-w-md">
                                {job.jobName || job.fileName}
                            </p>
                        </div>
                        {job.fileUrl && (
                            <a
                                href={"https://s3.bonds-lab.ru" + job.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center w-8 h-8 md:w-auto md:h-auto md:px-3 md:py-1 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                                title="Смотреть отчет"
                            >
                                <Eye size={16} />
                                <span className="hidden md:inline ml-2 text-xs font-medium">Смотреть отчет</span>
                            </a>
                        )}
                    </div>
                    <button onClick={onClose} className="absolute right-4 top-4 p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                
                <div className="p-4 md:p-6 overflow-y-auto flex-grow custom-scrollbar space-y-6 md:space-y-8">

                    
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm text-zinc-400">Тип документа:</span>
                            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold border border-primary/30">
                                {job.detectedDocType || 'Не определен'}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                            
                            <div>
                                <h4 className="text-white font-bold mb-4 border-b border-zinc-800 pb-2">Сырые данные (RU)</h4>
                                <div className="grid grid-cols-1 gap-1.5">
                                    <DataRow label="Выручка" value={formatMoney(job.revenue)} />
                                    <DataRow label="Операционная прибыль" value={formatMoney(job.operatingProfit)} />
                                    <DataRow label="Чистая прибыль" value={formatMoney(job.netProfit)} />
                                    <DataRow label="Процентные расходы" value={formatMoney(job.interestExpense)} />
                                    <DataRow label="Амортизация" value={formatMoney(job.amortization)} />
                                    <DataRow label="Собственный капитал" value={formatMoney(job.totalEquity)} />
                                    <DataRow label="Итого активы" value={formatMoney(job.totalAssets)} />
                                    <DataRow label="Долгосрочный долг" value={formatMoney(job.longTermDebt)} />
                                    <DataRow label="Краткосрочный долг" value={formatMoney(job.shortTermDebt)} />
                                    <DataRow label="Краткосрочные обяз-ва (Итого)" value={formatMoney(job.totalCurrentLiabilities)} />
                                    <DataRow label="Денежные средства" value={formatMoney(job.cashAndEquivalents)} />
                                    <DataRow label="Оборотные активы" value={formatMoney(job.currentAssets)} />
                                    <DataRow label="Запасы" value={formatMoney(job.inventory)} />
                                </div>
                            </div>

                            
                            <div>
                                <h4 className="text-primary font-bold mb-4 border-b border-zinc-800 pb-2">Расчетные показатели</h4>
                                <div className="grid grid-cols-1 gap-1.5">
                                    <DataRow label="K Annual" value={job.ebitdaLtmMultiplier!.toString()} />
                                    <DataRow
                                        label="EBITDA (LTM)"
                                        value={formatMoney(calcStats.EbitdaAnnual)}
                                        highlight
                                        textColor={isEbitdaNegative ? 'text-red-500' : undefined}
                                    />
                                    <DataRow label="Чистый долг" value={formatMoney(calcStats.NetDebt)} />
                                    <div className="my-2 border-t border-zinc-800" />

                                    <DataRow
                                        label="Чистый долг / EBITDA"
                                        value={isEbitdaNegative ? 'EBITDA < 0' : formatRatio(calcStats.NetDebtToEbitda)}
                                        highlight
                                        textColor={isEbitdaNegative
                                            ? 'text-red-500'
                                            : getIndicatorColor(calcStats.NetDebtToEbitda, [6, 4, 3, 2], true)}
                                    />
                                    <DataRow
                                        label="Долг / Капитал"
                                        value={formatRatio(calcStats.TotalDebtToEquity)}
                                    />
                                    <DataRow
                                        label="Долг / Активы"
                                        value={formatRatio(calcStats.TotalDebtToAssets)}
                                        textColor={getIndicatorColor(calcStats.TotalDebtToAssets, [0.8, 0.6, 0.5, 0.4], true)}
                                    />

                                    <DataRow
                                        label="Покрытие процентов"
                                        value={isEbitdaNegative ? 'EBITDA < 0' : formatRatio(calcStats.EbitdaToInterestExpense)}
                                        textColor={isEbitdaNegative
                                            ? 'text-red-500'
                                            : getIndicatorColor(calcStats.EbitdaToInterestExpense, [1, 2, 3, 5])}
                                    />
                                    <DataRow
                                        label="OCF / Долг"
                                        value={formatRatio(calcStats.OperatingCashFlowToTotalDebt)}
                                        textColor={getIndicatorColor(calcStats.OperatingCashFlowToTotalDebt, [0.05, 0.1, 0.2, 0.3])}
                                    />

                                    <DataRow
                                        label="Рентабельность по EBITDA"
                                        value={isEbitdaNegative ? 'EBITDA < 0' : formatPercent(calcStats.EbitdaMargin)}
                                        textColor={isEbitdaNegative
                                            ? 'text-red-500'
                                            : getIndicatorColor(calcStats.EbitdaMargin, [5, 10, 15, 20])}
                                    />
                                    <DataRow
                                        label="Рентабельность по чистой прибыли"
                                        value={formatPercent(calcStats.NetProfitMargin)}
                                        textColor={getIndicatorColor(calcStats.NetProfitMargin, [0, 5, 10, 15])}
                                    />

                                    <DataRow
                                        label="ROA"
                                        value={formatPercent(calcStats.ReturnOnAssets)}
                                        textColor={getIndicatorColor(calcStats.ReturnOnAssets, [0, 2, 5, 10])}
                                    />
                                    <DataRow
                                        label="ROI"
                                        value={formatPercent(calcStats.ReturnOnInvestment)}
                                        textColor={getIndicatorColor(calcStats.ReturnOnInvestment, [0, 5, 10, 15])}
                                    />
                                    <DataRow
                                        label="Текущая ликвидность"
                                        value={formatRatio(calcStats.CurrentRatio)}
                                        textColor={getIndicatorColor(calcStats.CurrentRatio, [0.5, 1, 1.5, 2])}
                                    />
                                    <DataRow
                                        label="Быстрая ликвидность"
                                        value={formatRatio(calcStats.QuickRatio)}
                                        textColor={getIndicatorColor(calcStats.QuickRatio, [0.5, 1, 1.5, 2])}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    
                    {isAdmin && (
                        <div className="bg-zinc-900/30 p-4 md:p-5 rounded-xl border border-zinc-800">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                                <label className="text-sm font-bold text-white flex items-center gap-2">
                                    <Search size={18} className="text-primary" /> Выбор эмитента
                                </label>
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Поиск..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-700 rounded-full py-2 pl-9 pr-4 text-xs text-white focus:border-primary outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            {isLoadingBrands ? (
                                <div className="h-40 flex flex-col items-center justify-center text-zinc-500 text-sm gap-2">
                                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    Загрузка...
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3 max-h-56 md:max-h-64 overflow-y-auto custom-scrollbar p-1">
                                    {filteredBrands.length > 0 ? (
                                        filteredBrands.map((b) => {
                                            const isSelected = brandId === b.id;
                                            return (
                                                <div
                                                    key={b.id}
                                                    onClick={() => handleBrandSelect(b)}
                                                    className={`
                                                        relative p-2 md:p-3 rounded-lg border cursor-pointer transition-all group flex items-center gap-3 text-left
                                                        ${isSelected
                                                        ? 'bg-primary/10 border-primary shadow-[0_0_10px_rgba(234,179,8,0.15)]'
                                                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900'}
                                                    `}
                                                >
                                                    <div className="w-10 h-10 flex-shrink-0">
                                                        <Logo
                                                            title={b.name!}
                                                            logoSrc={getLogoUrl(b.logoName)}
                                                        />
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className={`text-xs font-bold truncate ${isSelected ? 'text-primary' : 'text-zinc-300'}`}>
                                                            {b.name}
                                                        </div>
                                                        <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                                                            {b.bondName || '-'}
                                                        </div>
                                                    </div>

                                                    {isSelected && (
                                                        <div className="absolute top-2 right-2 text-primary">
                                                            <CheckCircle size={14} />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="col-span-full py-8 text-center text-zinc-500 text-sm">
                                            Пусто
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedBrand && (
                                <div className="mt-4 pt-4 border-t border-zinc-800/50 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
                                    <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
                                        <div className="text-zinc-400 text-xs hidden sm:block">Выбран:</div>
                                        <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                                            <div className="w-5 h-5 rounded-full overflow-hidden">
                                                <Logo
                                                    title={selectedBrand.name!}
                                                    logoSrc={getLogoUrl(selectedBrand.logoName)}
                                                />
                                            </div>
                                            <span className="text-sm font-bold text-white truncate max-w-[150px]">{selectedBrand.name}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { setBrandId(''); setSelectedBrand(null); }}
                                        className="text-xs text-zinc-500 hover:text-red-400 transition-colors w-full sm:w-auto py-2 sm:py-0 border border-zinc-800 sm:border-none rounded sm:rounded-none"
                                    >
                                        Сбросить
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                
                <div className="p-4 md:p-6 border-t border-card-border flex flex-col sm:flex-row justify-end gap-3 bg-zinc-900/30 shrink-0">
                    {isAdmin ? (
                        <>
                            <Button
                                variant="danger"
                                onClick={() => handleAction(false)}
                                disabled={isSubmitting}
                                className="w-full sm:w-auto order-2 sm:order-1"
                            >
                                <AlertTriangle size={16} className="mr-2" />
                                Отклонить
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => handleAction(true)}
                                disabled={isSubmitting || !brandId}
                                isLoading={isSubmitting}
                                className="w-full sm:w-auto order-1 sm:order-2"
                            >
                                <Check size={16} className="mr-2" />
                                Применить {selectedBrand && <span className="hidden sm:inline ml-1">к {selectedBrand.name}</span>}
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            className="w-full sm:w-auto"
                        >
                            Закрыть
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

const DataRow = ({ label, value, highlight, textColor }: { label: string, value: string, highlight?: boolean, textColor?: string }) => (
    <div className={`flex justify-between items-center p-2 rounded ${highlight ? 'bg-primary/10' : 'hover:bg-zinc-800/50'}`}>
        <span className="text-xs text-zinc-400 truncate mr-2">{label}</span>
        <span className={`font-mono text-sm font-medium whitespace-nowrap ${textColor ? textColor : highlight ? 'text-primary' : 'text-zinc-200'}`}>{value}</span>
    </div>
);