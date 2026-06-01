'use client';

import { useEffect, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import {ArrowDown, ArrowUp, Filter, Plus, RotateCcw, X, Sparkles, AlertTriangle, Save, RefreshCw, FolderOpen, Trash2, Star, Settings, ToggleLeft, ToggleRight, Gift} from 'lucide-react';
import { SubscriptionModal } from '@/components/ui/SubscriptionModal';
import { MeResponse } from '@/lib/api';
import Link from 'next/link';

import { CURRENCIES, RATINGS, COUPON_QUANTITY_OPTIONS, SORT_OPTIONS, FINANCIAL_METRICS, FILTER_SECTIONS } from './constants';
import {Section, InputGroup, DaysInput, FilterButton, SelectGroup, DateInputGroup, RatingSelect} from './FilterUI';
import { RiskLevelSelector } from './RiskLevelSelector';
import { getUserCollections, createCollection, updateCollection, deleteCollection, updateCustomFilters } from '@/actions/collection-actions';
import type { UserCollectionResponse } from '@/lib/api';

interface FiltersSheetProps {
    userProfile: MeResponse | null;
    isMaintenance?: boolean;
    currentCollectionId?: string | null;
    currentCollectionName?: string | null;
}

export const TBankIcon = () => (
    <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block shrink-0">
        <path d="M4 8C4 8 16 2 28 8C28 8 30 22 16 30C2 22 4 8 4 8Z" fill="#FFDD2D"/>
        <path d="M11 12H21V15H17.5V23H14.5V15H11V12Z" fill="#1C1C1E"/>
    </svg>
);

export const FiltersSheet = ({ userProfile, isMaintenance = false, currentCollectionId, currentCollectionName }: FiltersSheetProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showSubModal, setShowSubModal] = useState(false);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const isSubscriber = userProfile?.hasActiveSubscription || false;
    const isTrial = userProfile?.isTrialPeriod || false;
    const freeRequests = userProfile?.freeFilteredRequestsBalance || 0;
    const canUseFilters = isSubscriber || isTrial || freeRequests > 0;
    const isLoggedIn = !!userProfile;

    const [filters, setFilters] = useState<Record<string, string>>({});
    const [activeSorts, setActiveSorts] = useState<{ field: string, dir: 'asc' | 'desc' }[]>([]);

    const [collections, setCollections] = useState<UserCollectionResponse[]>([]);
    const [collectionNameInput, setCollectionNameInput] = useState('');
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [isPending, startTransition] = useTransition();

    const [customFiltersOn, setCustomFiltersOn] = useState<boolean>(userProfile?.customFiltersOn || false);
    const customFilterIndices: number[] = userProfile?.customFilters || [];
    
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const isFilterVisible = (index: number): boolean => {
        if (!customFiltersOn || !isSubscriber) return true; // show all if toggle off or not subscriber
        if (customFilterIndices.length === 0) return true; // show all if no custom filters configured
        return customFilterIndices.includes(index);
    };

    useEffect(() => {
        const currentParams: Record<string, string> = {};
        searchParams.forEach((value, key) => {
            if (key !== 'sorts') currentParams[key] = value;
        });
        setFilters(currentParams);

        const sortsParam = searchParams.get('sorts');
        if (sortsParam) {
            const parsedSorts = sortsParam.split(',').map(s => {
                const [field, dir] = s.split('_');
                return { field, dir: (dir === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc' };
            });
            setActiveSorts(parsedSorts);
        } else {
            setActiveSorts([]);
        }
    }, [searchParams, isOpen]);

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && isLoggedIn) {
            startTransition(async () => {
                const cols = await getUserCollections();
                setCollections(cols);
            });
        }
    }, [isOpen, isLoggedIn]);

    const handleChange = (key: string, value: string) => setFilters((prev) => ({ ...prev, [key]: value }));

    const clearRange = (baseKey: string) => {
        setFilters((prev) => {
            const next = { ...prev };
            delete next[`${baseKey}From`];
            delete next[`${baseKey}To`];
            return next;
        });
    };

    const handleDaysChange = (days: string, type: 'future' | 'past', field: 'from' | 'to', paramBaseName: string) => {
        const numDays = parseInt(days, 10);
        const targetParam = type === 'past'
            ? (field === 'from' ? `${paramBaseName}To` : `${paramBaseName}From`)
            : (field === 'from' ? `${paramBaseName}From` : `${paramBaseName}To`);

        if (isNaN(numDays)) {
            handleChange(targetParam, '');
            return;
        }

        const today = new Date();
        const targetDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        if (type === 'future') {
            targetDate.setDate(targetDate.getDate() + numDays);
        } else {
            targetDate.setDate(targetDate.getDate() - numDays);
        }

        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, '0');
        const day = String(targetDate.getDate()).padStart(2, '0');
        handleChange(targetParam, `${year}-${month}-${day}`);
    };

    const addSort = (field: string) => {
        if (!activeSorts.find(s => s.field === field)) setActiveSorts([...activeSorts, { field, dir: 'desc' }]);
    };
    const removeSort = (field: string) => setActiveSorts(activeSorts.filter(s => s.field !== field));
    const toggleSortDir = (field: string) => setActiveSorts(activeSorts.map(s => s.field === field ? { ...s, dir: s.dir === 'asc' ? 'desc' : 'asc' } : s));

    const buildQueryUrl = () => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== '' && value !== '0' && key !== 'page' && key !== 'CollectionId') params.set(key, value);
        });
        if (activeSorts.length > 0) params.set('sorts', activeSorts.map(s => `${s.field}_${s.dir}`).join(','));
        return `/bonds?${params.toString()}`;
    };

    const handleApply = () => {
        if (isMaintenance) return;
        if (!canUseFilters) { setShowSubModal(true); return; }
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== '' && value !== '0') params.set(key, value);
        });
        if (activeSorts.length > 0) params.set('sorts', activeSorts.map(s => `${s.field}_${s.dir}`).join(','));
        params.set('page', '1');
        router.replace(`${pathname}?${params.toString()}`);
        setIsOpen(false);
    };

    const handleReset = () => {
        setFilters({});
        setActiveSorts([]);
        router.replace(pathname);
        setIsOpen(false);
    };

    const handleToggleCustomFilters = () => {
        const newVal = !customFiltersOn;
        setCustomFiltersOn(newVal);
        startTransition(async () => {
            await updateCustomFilters(newVal, customFilterIndices);
        });
    };

    const handleSaveCollection = () => {
        if (!collectionNameInput.trim()) return;
        startTransition(async () => {
            const queryUrl = buildQueryUrl();
            const result = await createCollection(collectionNameInput.trim(), queryUrl);
            if (result.success) {
                setShowSaveDialog(false);
                setCollectionNameInput('');
                const cols = await getUserCollections();
                setCollections(cols);
                handleApply();
            }
        });
    };

    const handleUpdateCollection = () => {
        if (!currentCollectionId) return;
        startTransition(async () => {
            const queryUrl = buildQueryUrl();
            const result = await updateCollection(currentCollectionId, queryUrl);
            if (result.success) { handleApply(); }
        });
    };

    const handleDeleteCollection = (id: string) => {
        startTransition(async () => {
            const result = await deleteCollection(id);
            if (result.success) {
                const cols = await getUserCollections();
                setCollections(cols);
                if (id === currentCollectionId) handleReset();
            }
        });
    };

    const handleApplyCollection = (col: UserCollectionResponse) => {
        if (!col.queryUrl || !col.id) return;
        router.push(col.queryUrl + (col.queryUrl.includes('?') ? '&' : '?') + `CollectionId=${col.id}`);
        setIsOpen(false);
    };

    const hasAmortizationChildren = filters['AmortizationFlag'] === '2';
    const hasFloaterChildren = filters['FloatingCouponFlag'] === '2';
    const hasFixedChildren = filters['FloatingCouponFlag'] === '1';

    const today = new Date();
    const max7MonthsDate = new Date(today.getFullYear(), today.getMonth() + 7, today.getDate()).toISOString().split('T')[0];

    return (
        <>
            <button onClick={() => setIsOpen(true)} className="flex items-center justify-center gap-1.5 px-4 h-[38px] rounded-xl text-xs font-bold bg-[var(--color-muted)] text-[var(--color-foreground)] hover:bg-[var(--color-muted)]/80 transition-all duration-200">
                <Filter size={14} /> Фильтры
            </button>

            {mounted && createPortal(
                <>
                    <SubscriptionModal isOpen={showSubModal} onClose={() => setShowSubModal(false)} isLoggedIn={!!userProfile} />

                    {isOpen && <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm z-[60]" onClick={() => setIsOpen(false)} />}

                    <div className={`fixed top-0 right-0 h-[100dvh] w-full sm:w-[500px] bg-[var(--color-background)] z-[70] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0 shadow-[-10px_0_40px_rgba(0,0,0,0.15)]' : 'translate-x-full'} flex flex-col`}>

                
                <div className="px-6 py-5 bg-[var(--color-background)] z-10 shrink-0 shadow-[0_1px_0_rgba(0,0,0,0.06)] dark:shadow-[0_1px_0_rgba(255,255,255,0.04)]">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--color-foreground)]">
                            <Filter className="text-primary" size={20} /> Настройка поиска
                        </h2>
                        <button onClick={() => setIsOpen(false)} className="p-2 bg-[var(--color-muted)] hover:bg-[var(--color-card-s)] rounded-full transition-colors text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
                            <X size={20} />
                        </button>
                    </div>

                    
                    {isSubscriber && !isMaintenance && (
                        <div className="flex items-center justify-between mt-4 p-3 rounded-xl bg-[var(--color-muted)]">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleToggleCustomFilters}
                                    className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
                                >
                                    {customFiltersOn ? <ToggleRight size={28} className="text-primary" /> : <ToggleLeft size={28} />}
                                </button>
                                <span className="text-sm font-semibold text-[var(--color-foreground)]">
                                    {customFiltersOn ? 'Мои фильтры' : 'Все фильтры'}
                                </span>
                            </div>
                            {customFiltersOn && (
                                <Link
                                    href="/bonds/custom-filters"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                                >
                                    <Settings size={14} /> Настроить
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 bg-[var(--color-background)]">

                    {isMaintenance && (
                        <div className="bg-amber-500/10 p-5 rounded-2xl flex items-start gap-3 relative overflow-hidden">
                            <AlertTriangle size={24} className="text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <span className="text-amber-600 dark:text-amber-500 font-bold block mb-1 text-sm">Поиск временно недоступен</span>
                                <span className="text-sm text-amber-600/80 dark:text-amber-500/80 leading-relaxed">Ведутся технические работы.</span>
                            </div>
                        </div>
                    )}

                    {!isSubscriber && !isTrial && !isMaintenance && (
                        freeRequests > 0 ? (
                            <div className="bg-primary/5 dark:bg-primary/10 p-5 rounded-2xl flex items-center justify-between relative overflow-hidden shrink-0">
                                <div>
                                    <span className="text-primary font-bold mb-1 flex items-center gap-1.5">Ваш стартовый пакет <Gift size={16} /></span>
                                    <span className="text-sm text-primary/80">Осталось бесплатных поисков:</span>
                                </div>
                                <span className="text-3xl font-black text-primary">{freeRequests}</span>
                            </div>
                        ) : (
                            <div className="bg-[var(--color-muted)] p-6 rounded-2xl flex flex-col relative overflow-hidden group hover:shadow-card transition-all shrink-0">
                                <div className="flex items-start justify-between mb-5">
                                    <div>
                                        <span className="text-[var(--color-foreground)] font-bold text-lg block mb-2 flex items-center gap-2">
                                            <Sparkles size={18} className="text-primary" /> Снимите ограничения
                                        </span>
                                        <span className="text-sm text-[var(--color-muted-foreground)] leading-relaxed block pr-2">Перейдите на PRO, чтобы применять глубокие фильтры безлимитно.</span>
                                    </div>
                                </div>
                                <Button className="w-full text-sm font-medium" onClick={() => setShowSubModal(true)}>Открыть PRO-доступ</Button>
                            </div>
                        )
                    )}

                    {isTrial && !isSubscriber && !isMaintenance && (
                         <div className="bg-emerald-500/10 p-4 rounded-2xl flex items-center gap-3 relative overflow-hidden shrink-0">
                               <div className="bg-emerald-500/20 p-2 rounded-full text-emerald-600">
                                   <Sparkles size={20} />
                               </div>
                               <div>
                                   <span className="text-emerald-700 dark:text-emerald-400 font-bold block mb-0.5">У вас активен PRO-режим</span>
                                   <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80">Фильтры доступны без ограничений</span>
                               </div>
                         </div>
                    )}

                    
                    {customFiltersOn && isSubscriber && customFilterIndices.length === 0 && !isMaintenance && (
                        <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-2xl text-center space-y-3">
                            <Settings size={32} className="text-primary mx-auto" />
                            <p className="text-sm text-[var(--color-foreground)] font-semibold">Вы ещё не настроили свои фильтры</p>
                            <p className="text-xs text-[var(--color-muted-foreground)]">Перейдите в конструктор, чтобы выбрать и упорядочить нужные фильтры</p>
                            <Link
                                href="/bonds/custom-filters"
                                onClick={() => setIsOpen(false)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm shadow-glow-primary hover:-translate-y-0.5 transition-all"
                            >
                                <Settings size={16} /> Настроить фильтры
                            </Link>
                        </div>
                    )}

                    
                    {isLoggedIn && !isMaintenance && (
                        <Section title="Мои коллекции">
                            {collections.length > 0 ? (
                                <div className="space-y-2">
                                    {collections.map(col => (
                                        <div key={col.id} className="flex items-center gap-2 group">
                                            <button
                                                onClick={() => handleApplyCollection(col)}
                                                className={`flex-1 text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                                                    currentCollectionId === col.id
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-card-s)]'
                                                }`}
                                            >
                                                <FolderOpen size={14} className="inline mr-2" />
                                                {col.name}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCollection(col.id!)}
                                                className="p-2 rounded-lg text-[var(--color-muted-foreground)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Удалить коллекцию"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-[var(--color-muted-foreground)]">У вас пока нет сохранённых коллекций</p>
                            )}
                        </Section>
                    )}

                    
                    {isFilterVisible(0) && (
                    <Section title="Сортировка">
                        <div className="space-y-4">
                            {activeSorts.length > 0 && (
                                <div className="space-y-2">
                                    <label className="text-xs text-[var(--color-muted-foreground)] font-medium ml-1">Порядок применения:</label>
                                    <div className="space-y-2">
                                        {activeSorts.map((sort, idx) => {
                                            const label = SORT_OPTIONS.find(o => o.value === sort.field)?.label;
                                            return (
                                                <div key={sort.field} className="flex items-center justify-between bg-[var(--color-muted)] p-3 rounded-xl pl-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-mono px-1.5 py-0.5 rounded text-primary font-bold">{idx + 1}</span>
                                                        <span className="sm:text-sm text-xs text-[var(--color-foreground)] font-bold">{label}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button onClick={() => toggleSortDir(sort.field)} className="flex items-center gap-1.5 bg-[var(--color-card)] hover:bg-[var(--color-card-s)] text-[var(--color-muted-foreground)] px-3 py-1.5 rounded-lg text-xs transition-colors font-medium shadow-card">
                                                            {sort.dir === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                                                            {sort.dir === 'desc' ? 'Убывание' : 'Возрастание'}
                                                        </button>
                                                        <button onClick={() => removeSort(sort.field)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 text-[var(--color-muted-foreground)] hover:text-red-500 rounded-lg transition-colors"><X size={16} /></button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="text-xs text-[var(--color-muted-foreground)] font-medium mb-2 block ml-1">Добавить параметр:</label>
                                <div className="flex flex-wrap gap-2">
                                    {SORT_OPTIONS.filter(o => !activeSorts.find(s => s.field === o.value)).map(opt => (
                                        <button key={opt.value} onClick={() => addSort(opt.value)} className="px-3 py-2 text-xs rounded-xl bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:text-primary transition-all flex items-center gap-1.5 font-medium">
                                            <Plus size={14} /> {opt.label}
                                        </button>
                                    ))}
                                    {activeSorts.length === SORT_OPTIONS.length && <span className="text-xs text-[var(--color-muted-foreground)] mt-2 font-medium">Все параметры выбраны</span>}
                                </div>
                            </div>
                        </div>
                    </Section>
                    )}

                    
                    {(isFilterVisible(1) || isFilterVisible(2) || isFilterVisible(3) || isFilterVisible(4) || isFilterVisible(5)) && (
                    <Section title="Рыночные параметры">
                        {isFilterVisible(1) && (
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="Цена (%) от" type="number" value={filters['PriceFrom']} onChange={(v) => handleChange('PriceFrom', v)} placeholder="90" />
                            <InputGroup label="Цена (%) до" type="number" value={filters['PriceTo']} onChange={(v) => handleChange('PriceTo', v)} placeholder="105" />
                        </div>
                        )}
                        {isFilterVisible(2) && (
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="Ставка купона (%) от" type="number" value={filters['CouponPrcFrom']} onChange={(v) => handleChange('CouponPrcFrom', v)} placeholder="15" />
                            <InputGroup label="Ставка купона (%) до" type="number" value={filters['CouponPrcTo']} onChange={(v) => handleChange('CouponPrcTo', v)} placeholder="30" />
                        </div>
                        )}
                        {isFilterVisible(3) && (
                        <>
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="Номинал от" type="number" value={filters['NominalFrom']} onChange={(v) => handleChange('NominalFrom', v)} />
                            <InputGroup label="Номинал до" type="number" value={filters['NominalTo']} onChange={(v) => handleChange('NominalTo', v)} />
                        </div>
                        <InputGroup label="Строгий номинал" type="number" value={filters['NominalStrict']} onChange={(v) => handleChange('NominalStrict', v)} placeholder="1000" />
                        </>
                        )}
                        {isFilterVisible(4) && (
                        <div className="pt-2">
                            <label className="text-xs text-[var(--color-muted-foreground)] font-medium mb-2 block ml-1">Валюта цены</label>
                            <div className="flex flex-wrap gap-2">
                                <FilterButton label="Все" active={!filters['Currency']} onClick={() => handleChange('Currency', '')} />
                                {CURRENCIES.map(c => <FilterButton key={c.value} label={c.label} active={filters['Currency'] === c.value} onClick={() => handleChange('Currency', c.value)} />)}
                            </div>
                        </div>
                        )}
                        {isFilterVisible(5) && (
                        <div>
                            <label className="text-xs text-[var(--color-muted-foreground)] font-medium mb-2 block ml-1">Валюта номинала</label>
                            <div className="flex flex-wrap gap-2">
                                <FilterButton label="Все" active={!filters['NominalCurrency']} onClick={() => handleChange('NominalCurrency', '')} />
                                {CURRENCIES.map(c => <FilterButton key={c.value} label={c.label} active={filters['NominalCurrency'] === c.value} onClick={() => handleChange('NominalCurrency', c.value)} />)}
                            </div>
                        </div>
                        )}
                    </Section>
                    )}

                    
                    {isFilterVisible(6) && (
                    <Section title="Дата купона">
                        <p className="text-xs text-[var(--color-muted-foreground)] mb-2 ml-1 leading-relaxed">
                            Укажите диапазон дат для выплаты купона.<br/>
                            <span className="font-medium text-amber-600">Важно: поиск возможен не позднее чем на 7 месяцев вперед.</span>
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <DateInputGroup label="От" value={filters['NextCouponDateFrom']} onChange={(v) => handleChange('NextCouponDateFrom', v)} max={max7MonthsDate} />
                            <DateInputGroup label="До" value={filters['NextCouponDateTo']} onChange={(v) => handleChange('NextCouponDateTo', v)} max={max7MonthsDate} />
                        </div>
                    </Section>
                    )}

                    
                    {(isFilterVisible(7) || isFilterVisible(8) || isFilterVisible(9) || isFilterVisible(10) || isFilterVisible(11) || isFilterVisible(12) || isFilterVisible(13) || isFilterVisible(14) || isFilterVisible(15) || isFilterVisible(16)) && (
                    <Section title="Параметры инструмента">
                        {isFilterVisible(7) && (
                        <div>
                            <label className="text-xs text-[var(--color-muted-foreground)] font-medium mb-2 block ml-1">Купонов в год</label>
                            <div className="flex flex-wrap gap-2">
                                <FilterButton label="Все" active={!filters['CouponQuantityPerYear']} onClick={() => handleChange('CouponQuantityPerYear', '')} />
                                {COUPON_QUANTITY_OPTIONS.map(val => <FilterButton key={val} label={val.toString()} active={filters['CouponQuantityPerYear'] === val.toString()} onClick={() => handleChange('CouponQuantityPerYear', val.toString())} />)}
                            </div>
                        </div>
                        )}

                        <div className="grid grid-cols-1 gap-3 mt-4">
                            {isFilterVisible(8) && <SelectGroup label="Для квалов" value={filters['ForQualInvestorFlag']} onChange={(v) => handleChange('ForQualInvestorFlag', v)} />}

                            
                            {isFilterVisible(9) && (
                            <>
                            <SelectGroup label="Амортизация" value={filters['AmortizationFlag']} onChange={(v) => handleChange('AmortizationFlag', v)} />
                            {hasAmortizationChildren && (
                                <div className="bg-[var(--color-card-s)] p-4 rounded-xl ml-4 mb-2 animate-fade-in-up">
                                    <div className="grid grid-cols-2 gap-4">
                                        <DaysInput label="Дней до амортизации от" paramDateValue={filters['FirstMtyDateFrom']} onChange={(v) => handleDaysChange(v, 'future', 'from', 'FirstMtyDate')} />
                                        <DaysInput label="Дней до амортизации до" paramDateValue={filters['FirstMtyDateTo']} onChange={(v) => handleDaysChange(v, 'future', 'to', 'FirstMtyDate')} />
                                    </div>
                                </div>
                            )}
                            </>
                            )}

                            
                            {isFilterVisible(10) && (
                            <>
                            <SelectGroup label="Плавающий купон" value={filters['FloatingCouponFlag']} onChange={(v) => handleChange('FloatingCouponFlag', v)} />

                            {hasFloaterChildren && (
                                <div className="bg-[var(--color-card-s)] p-4 rounded-xl ml-4 mb-2 space-y-4 animate-fade-in-up">
                                    <div>
                                        <label className="text-xs text-[var(--color-muted-foreground)] mb-2 block ml-1">Тип базовой ставки</label>
                                        <div className="flex flex-wrap gap-2">
                                            <FilterButton label="Любая" active={!filters['RateType'] || filters['RateType'] === ''} onClick={() => handleChange('RateType', '')} />
                                            <FilterButton label="КС ЦБ" active={filters['RateType'] === '1'} onClick={() => handleChange('RateType', '1')} />
                                            <FilterButton label="RUONIA" active={filters['RateType'] === '2'} onClick={() => handleChange('RateType', '2')} />
                                            {userProfile?.role === 'Admin' && (
                                                <FilterButton label="Не указана (0)" active={filters['RateType'] === '0'} onClick={() => handleChange('RateType', '3')} />
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputGroup label="Премия от" type="number" step="0.1" value={filters['SpreadFrom']} onChange={(v) => handleChange('SpreadFrom', v)} />
                                        <InputGroup label="Премия до" type="number" step="0.1" value={filters['SpreadTo']} onChange={(v) => handleChange('SpreadTo', v)} />
                                    </div>
                                </div>
                            )}

                            {hasFixedChildren && (
                                <div className="bg-[var(--color-muted)] p-4 rounded-xl ml-4 mb-2 space-y-4 animate-fade-in-up">
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputGroup label="Доходность (%) от" type="number" step="0.1" value={filters['YieldFrom']} onChange={(v) => handleChange('YieldFrom', v)} />
                                        <InputGroup label="Доходность (%) до" type="number" step="0.1" value={filters['YieldTo']} onChange={(v) => handleChange('YieldTo', v)} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputGroup label="Дюрация (дни) от" type="number" value={filters['DurationFrom']} onChange={(v) => handleChange('DurationFrom', v)} />
                                        <InputGroup label="Дюрация (дни) до" type="number" value={filters['DurationTo']} onChange={(v) => handleChange('DurationTo', v)} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputGroup label="G-Спред (бп) от" type="number" step="1" value={filters['GSpreadFrom']} onChange={(v) => handleChange('GSpreadFrom', v)} placeholder="0" />
                                        <InputGroup label="G-Спред (бп) до" type="number" step="1" value={filters['GSpreadTo']} onChange={(v) => handleChange('GSpreadTo', v)} placeholder="500" />
                                    </div>
                                </div>
                            )}
                            </>
                            )}

                            {isFilterVisible(11) && <SelectGroup label="Доступно с плечом" value={filters['MarginAbleFlag']} onChange={(v) => handleChange('MarginAbleFlag', v)} />}
                            {isFilterVisible(12) && <SelectGroup label="Оферта / Опцион" value={filters['HasEventsFlag']} onChange={(v) => handleChange('HasEventsFlag', v)} />}
                            {isFilterVisible(13) && <SelectGroup label={<span className="flex items-center gap-1.5"><TBankIcon /> Доступно в Т</span>} value={filters['AvailableInTFlag']} onChange={v => handleChange('AvailableInTFlag', v)} />}
                            {isFilterVisible(14) && <SelectGroup label="Был тех. дефолт" value={filters['TechnicalDefaultFlag']} onChange={v => handleChange('TechnicalDefaultFlag', v)} />}
                            {isFilterVisible(15) && <SelectGroup label="В дефолте" value={filters['DefaultFlag']} onChange={v => handleChange('DefaultFlag', v)} />}
                            {isFilterVisible(16) && (
                                <SelectGroup
                                    label={<span className="flex items-center gap-1.5"><Star size={14} className="text-amber-500" /> Из особого списка</span>}
                                    value={filters['MarkedEmitentsFlag']}
                                    onChange={v => handleChange('MarkedEmitentsFlag', v)}
                                />
                            )}
                            {isFilterVisible(32) && (
                                <SelectGroup
                                    label={<span className="flex items-center gap-1.5"><TBankIcon /> Есть в портфеле</span>}
                                    value={filters['InPortfolioFlag']}
                                    onChange={v => handleChange('InPortfolioFlag', v)}
                                />
                            )}
                            {userProfile?.role?.toLowerCase() === 'admin' && (
                                <SelectGroup
                                    label="В автоследовании"
                                    value={filters['AvailableInAutofollowFlag']}
                                    onChange={v => handleChange('AvailableInAutofollowFlag', v)}
                                />
                            )}
                        </div>
                    </Section>
                    )}

                    
                    {(isFilterVisible(17) || isFilterVisible(18) || isFilterVisible(19)) && (
                    <Section title="Даты (дней)">
                        {isFilterVisible(17) && (
                        <div className="grid grid-cols-2 gap-4">
                            <DaysInput label="Дней после размещения от" paramDateValue={filters['PlacementDateTo']} onChange={(v) => handleDaysChange(v, 'past', 'from', 'PlacementDate')} />
                            <DaysInput label="Дней после размещения до" paramDateValue={filters['PlacementDateFrom']} onChange={(v) => handleDaysChange(v, 'past', 'to', 'PlacementDate')} />
                        </div>
                        )}
                        {isFilterVisible(18) && (
                        <div className="grid grid-cols-2 gap-4">
                            <DaysInput label="Дней до погашения от" paramDateValue={filters['MatureDateFrom']} onChange={(v) => handleDaysChange(v, 'future', 'from', 'MatureDate')} />
                            <DaysInput label="Дней до погашения до" paramDateValue={filters['MatureDateTo']} onChange={(v) => handleDaysChange(v, 'future', 'to', 'MatureDate')} />
                        </div>
                        )}
                        {isFilterVisible(19) && (
                        <div className="grid grid-cols-2 gap-4">
                            <DaysInput label="Дней до след. события от" paramDateValue={filters['FirstCallDateFrom']} onChange={(v) => handleDaysChange(v, 'future', 'from', 'FirstCallDate')} />
                            <DaysInput label="Дней до след. события до" paramDateValue={filters['FirstCallDateTo']} onChange={(v) => handleDaysChange(v, 'future', 'to', 'FirstCallDate')} />
                        </div>
                        )}
                    </Section>
                    )}

                    
                    {isFilterVisible(20) && (
                    <Section title="Рейтинг">
                        <div className="grid grid-cols-2 gap-4">
                            <RatingSelect
                                label="Рейтинг от"
                                value={filters['CreditRatingFrom'] || ''}
                                onChange={(val) => handleChange('CreditRatingFrom', val)}
                                options={RATINGS}
                            />
                            <RatingSelect
                                label="Рейтинг до"
                                value={filters['CreditRatingTo'] || ''}
                                onChange={(val) => handleChange('CreditRatingTo', val)}
                                options={RATINGS}
                            />
                        </div>
                    </Section>
                    )}

                    
                    {FINANCIAL_METRICS.some((_, i) => isFilterVisible(21 + i)) && (
                    <Section title="Финансовые показатели">
                        <div className="space-y-6">
                            {FINANCIAL_METRICS.map((metric, i) => (
                                isFilterVisible(21 + i) && (
                                <RiskLevelSelector
                                    key={metric.key}
                                    label={metric.label}
                                    baseKey={metric.key}
                                    ranges={metric.ranges}
                                    reverse={metric.reverse}
                                    filters={filters}
                                    onChange={handleChange}
                                    onClear={clearRange}
                                    suffix={metric.suffix}
                                />
                                )
                            ))}
                        </div>
                    </Section>
                    )}

                    <div className="h-4" />

                </div>

                
                <div className="p-5 bg-[var(--color-background)] z-20 shrink-0 flex flex-col gap-3 pb-8 sm:pb-5 shadow-[0_-1px_0_rgba(0,0,0,0.06)] dark:shadow-[0_-1px_0_rgba(255,255,255,0.04)]">
                    {showSaveDialog && (
                        <div className="flex gap-2 animate-fade-in-up">
                            <input
                                type="text"
                                value={collectionNameInput}
                                onChange={e => setCollectionNameInput(e.target.value)}
                                placeholder="Название коллекции..."
                                className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--color-muted)] text-sm text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-primary/30"
                                onKeyDown={e => e.key === 'Enter' && handleSaveCollection()}
                                autoFocus
                            />
                            <Button onClick={handleSaveCollection} disabled={isPending || !collectionNameInput.trim()} className="px-4">
                                <Save size={16} />
                            </Button>

                            <button onClick={() => setShowSaveDialog(false)} className="p-2.5 rounded-xl bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={handleReset} className="px-5 shadow-card" title="Сбросить все" disabled={isMaintenance}>
                            <RotateCcw size={18} />
                        </Button>

                        {isLoggedIn && !isMaintenance && (
                            <>
                                <button
                                    onClick={() => setShowSaveDialog(true)}
                                    className="p-3 rounded-xl bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:text-primary hover:bg-primary/10 transition-colors"
                                    title="Сохранить коллекцию"
                                    disabled={isPending}
                                >
                                    <Save size={18} />
                                </button>

                                {currentCollectionId && (
                                    <button
                                        onClick={handleUpdateCollection}
                                        className="p-3 rounded-xl bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:text-primary hover:bg-primary/10 transition-colors"
                                        title="Обновить текущую коллекцию"
                                        disabled={isPending}
                                    >
                                        <RefreshCw size={18} />
                                    </button>
                                )}
                            </>
                        )}

                        <Button
                            className="flex-1 shadow-glow-primary"
                            onClick={handleApply}
                            disabled={isMaintenance}
                        >
                            {isMaintenance ? 'Ведутся тех. работы' : canUseFilters ? 'Применить фильтры' : 'Снять ограничения'}
                        </Button>
                    </div>
                </div>
            </div>
            </>, document.body)}
        </>
    );
};

export default FiltersSheet;