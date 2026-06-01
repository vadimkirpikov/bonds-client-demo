'use client';

import React, {useEffect, useState} from 'react';
import {AlertCircle, Check, Coins, Crown, Loader2, Timer, X, Zap} from 'lucide-react';
import {Button} from '@/components/ui/Button';
import {format} from 'date-fns';
import {ru} from 'date-fns/locale';
import {ReferralApi, ReferralPriceResponse, TariffType, AuthApi, PaymentApi, PaymentMethodResponse} from '@/lib/api';
import {getClientApi} from '@/lib/client-api';
import {useRouter} from 'next/navigation';
import {getPaymentMaintenanceState} from '@/actions/settings-actions';

export interface SubscriptionData {
    hasActiveSubscription?: boolean;
    subscriptionExpiresAt?: Date | null;
    isForeverSubscriber?: boolean;
    isTrialPeriod?: boolean;
    trialUsed?: boolean;
    isAutoRenewalActive?: boolean;
}

export interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    data?: SubscriptionData;
    isLoggedIn: boolean;
    onPayment?: (tariff: TariffType) => Promise<void>;
    onPayWooden?: (tariff: TariffType) => Promise<void>;
    onPaySavedCard?: (tariff: TariffType, methodId: string) => Promise<void>;
}

export function SubscriptionModal({isOpen, onClose, data, isLoggedIn, onPayment, onPayWooden, onPaySavedCard}: SubscriptionModalProps) {
    const router = useRouter();
    const [selectedTariff, setSelectedTariff] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [isWoodenLoading, setIsWoodenLoading] = useState(false);
    const [prices, setPrices] = useState<ReferralPriceResponse[]>([]);
    const [isLoadingPrices, setIsLoadingPrices] = useState(true);
    const [isMaintenance, setIsMaintenance] = useState(false);
    const [methods, setMethods] = useState<PaymentMethodResponse[]>([]);
    const [selectedMethodId, setSelectedMethodId] = useState<string>('');
    const [isSavedLoading, setIsSavedLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            if (isLoggedIn) {
                fetchPricesAndMethods();
                getPaymentMaintenanceState().then(res => {
                    setIsMaintenance(res.isMaintenance && !res.isWhitelisted);
                });
            } else {
                setIsLoadingPrices(false);
            }
        } else document.body.style.overflow = '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen, isLoggedIn]);

    const fetchPricesAndMethods = async () => {
        setIsLoadingPrices(true);
        try {
            const api = getClientApi(ReferralApi);
            const data = await api.apiV1ReferralPricesGet();
            setPrices(data);

            const yearTariff = data.find(p => p.tier === 'Year1' || p.tier === 'Months12');
            if (yearTariff) setSelectedTariff(yearTariff.tier!);
            else if (data.length > 0) setSelectedTariff(data[0].tier!);

            const payApi = getClientApi(PaymentApi);
            const methodsData = await payApi.apiV1PaymentsMethodsGet();
            setMethods(methodsData || []);
            const mainMethod = methodsData?.find(m => m.isMain) || methodsData?.[0];
            if (mainMethod) {
                setSelectedMethodId(mainMethod.id!);
            }
        } catch (e) {
            console.error("Failed to fetch prices and methods:", e);
        } finally {
            setIsLoadingPrices(false);
        }
    };

    if (!isOpen) return null;

    const handlePay = async () => {
        if (!isLoggedIn) {
            setIsLoading(true);
            router.push('/auth/signin');
            return;
        }
        if (!onPayment || !selectedTariff) return;
        setIsLoading(true);
        try {
            await onPayment(selectedTariff as TariffType);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleWoodenPay = async () => {
        if (!onPayWooden || !selectedTariff) return;
        setIsWoodenLoading(true);
        try {
            await onPayWooden(selectedTariff as TariffType);
        } catch (e) {
            console.error(e);
        } finally {
            setIsWoodenLoading(false);
        }
    };

    const handleSavedPay = async () => {
        if (!onPaySavedCard || !selectedTariff || !selectedMethodId) return;
        setIsSavedLoading(true);
        try {
            await onPaySavedCard(selectedTariff as TariffType, selectedMethodId);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSavedLoading(false);
        }
    };

    const isSubscribed = data?.hasActiveSubscription;
    const isForever = data?.isForeverSubscriber;
    const hasAnyDiscount = prices.some(p => p.hasDiscount);
    const canPayWithWooden = ['Month1', 'Months1', 'Month3', 'Months3'].includes(selectedTariff);

    return (
        <div className="fixed inset-0 z-[100] flex sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-[var(--color-muted)]/40 backdrop-blur-sm transition-opacity"
                 onClick={onClose}/>

            <div
                className="relative w-full h-full sm:h-auto sm:max-h-[95vh] sm:max-w-4xl bg-[var(--color-card)] sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-fade-in border-none">

                <div
                    className="flex items-center justify-between px-6 py-4 sm:px-8 sm:py-6 bg-[var(--color-card)] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] shrink-0 z-20">
                    <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2 text-[var(--color-foreground)] tracking-tight">
                        <Crown className="text-[var(--color-primary)]"/> PRO Доступ
                    </h2>
                    <button onClick={onClose}
                            className="p-2 bg-[var(--color-muted)] hover:bg-[var(--color-muted-foreground)]/10 rounded-full transition-colors text-[var(--color-muted-foreground)]">
                        <X size={20}/>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6 md:p-8 flex flex-col relative z-10">
                    {!isLoggedIn ? (
                        <div className="flex flex-col items-center justify-center py-6 sm:py-10 flex-1 shrink-0">
                            <div
                                className="w-16 h-16 sm:w-20 sm:h-20 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                <Zap className="text-[var(--color-primary)] w-8 h-8 sm:w-10 sm:h-10"/>
                            </div>
                            <div className="text-center mb-8 shrink-0">
                                <h3 className="text-2xl sm:text-3xl font-black text-[var(--color-foreground)] mb-3 tracking-tight">
                                    Инвестируйте без ограничений
                                </h3>
                                <p className="text-[var(--color-muted-foreground)] text-sm sm:text-base max-w-md mx-auto">
                                    Снимите лимиты на поиск, откройте умный экспорт и полную финансовую аналитику
                                    компаний. Войдите в аккаунт, чтобы просмотреть тарифы.
                                </p>
                            </div>
                            <div className="w-full max-w-sm mt-auto">
                                <Button variant="primary" onClick={handlePay} isLoading={isLoading} size="lg"
                                        className="w-full text-lg h-14 shadow-md">
                                    Войти в аккаунт
                                </Button>
                                <p className="text-center text-xs text-[var(--color-muted-foreground)] mt-3 font-medium">
                                    Откроет доступ к оформлению подписки
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>

                            {isSubscribed && (
                                <div
                                    className="mb-4 sm:mb-6 bg-[var(--color-card)] shadow-sm borderless rounded-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 shrink-0">
                                    <div className="bg-emerald-500/10 p-2 sm:p-3 rounded-full text-emerald-500 shrink-0">
                                        <Check size={18} className="sm:hidden"/>
                                        <Check size={20} className="hidden sm:block"/>
                                    </div>
                                    <div>
                                        <p className="text-[var(--color-foreground)] font-bold text-sm sm:text-base leading-tight mb-0.5">У
                                            вас активная подписка</p>
                                        <p className="text-[11px] sm:text-sm text-[var(--color-muted-foreground)]">
                                            {isForever ? 'Тариф: Вечный доступ' : data?.subscriptionExpiresAt ? `Действует до ${format(new Date(data.subscriptionExpiresAt), 'd MMMM yyyy', {locale: ru})}` : ''}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="text-center mb-4 sm:mb-6 shrink-0">
                                <h3 className="text-xl sm:text-2xl font-black text-[var(--color-foreground)] mb-1 sm:mb-2 tracking-tight">
                                    Инвестируйте без ограничений
                                </h3>
                                <p className="text-[var(--color-muted-foreground)] text-xs sm:text-sm px-2">
                                    Снимите лимиты на поиск, откройте умный экспорт и полную финансовую аналитику
                                    компаний.
                                </p>
                            </div>

                            {hasAnyDiscount && !isForever && (
                                <div
                                    className="mb-4 sm:mb-5 bg-[var(--color-card)] p-3 sm:p-4 rounded-xl flex items-center gap-3 sm:gap-4 shadow-sm border-l-4 border-[var(--color-primary)]">
                                    <div className="bg-[var(--color-primary)]/10 p-1.5 sm:p-2 rounded-full shrink-0"><Timer
                                        className="text-[var(--color-primary)] w-5 h-5 sm:w-6 sm:h-6"/></div>
                                    <div>
                                        <p className="text-[var(--color-foreground)] font-bold text-sm sm:text-base leading-tight mb-0.5">У
                                            вас активна скидка!</p>
                                        <p className="text-[11px] sm:text-sm text-[var(--color-muted-foreground)] leading-tight">Специальные
                                            цены сгорят через 7 дней после регистрации.</p>
                                    </div>
                                </div>
                            )}

                            {isLoadingPrices ? (
                                <div
                                    className="py-12 sm:py-20 flex flex-col items-center justify-center text-[var(--color-muted-foreground)] gap-4">
                                    <Loader2 className="animate-spin text-[var(--color-primary)]" size={32}/>
                                    <p className="font-medium text-sm sm:text-base">Загрузка тарифов...</p>
                                </div>
                            ) : (
                                <div className="flex flex-col pb-4 shrink-0">
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 shrink-0 mb-3 sm:mb-4">
                                        {prices.filter(p => p.tier !== 'Forever').map((p) => {
                                            const isSelected = selectedTariff === p.tier;
                                            const hasValidOldPrice = Boolean(p.basePrice && p.price && p.basePrice > p.price);

                                            let name = p.tier;
                                            let isHit = false;

                                            if (p.tier === 'Month1' || p.tier === 'Months1') name = '1 месяц';
                                            if (p.tier === 'Month3' || p.tier === 'Months3') name = '3 месяца';
                                            if (p.tier === 'Month6' || p.tier === 'Months6') name = '6 месяцев';
                                            if (p.tier === 'Year1' || p.tier === 'Months12') {
                                                name = '1 год';
                                                isHit = true;
                                            }

                                            return (
                                                <button
                                                    key={p.tier}
                                                    disabled={isForever}
                                                    onClick={() => setSelectedTariff(p.tier!)}
                                                    className={`relative p-5 sm:p-6 rounded-2xl sm:rounded-3xl text-left transition-all duration-300 flex flex-col h-full min-h-[140px] sm:min-h-[160px] border-none select-none
                                                        ${isForever ? 'bg-[var(--color-card)]/50 opacity-60 cursor-not-allowed grayscale' :
                                                        isSelected ? 'bg-[var(--color-card)] shadow-xl ring-2 ring-[var(--color-primary)] sm:scale-105 z-10' :
                                                            'bg-[var(--color-card)] shadow-sm hover:shadow-md'
                                                    }`}
                                                >
                                                    {isHit && !isForever && (
                                                        <div
                                                            className="absolute top-0 right-0 bg-[var(--color-primary)] text-white text-[9px] sm:text-[10px] font-black px-3 sm:px-4 py-1 sm:py-1.5 rounded-bl-xl sm:rounded-bl-2xl rounded-tr-xl sm:rounded-tr-2xl uppercase tracking-widest shadow-md">
                                                            <Zap size={12} className="inline mr-1 pb-0.5"/> ХИТ
                                                        </div>
                                                    )}

                                                    <span
                                                        className={`font-black text-base sm:text-lg mb-2 ${isHit ? 'pr-10 sm:pr-12' : ''} leading-tight ${isSelected && !isForever ? 'text-[var(--color-primary)]' : 'text-[var(--color-foreground)]'}`}>
                                                        {name}
                                                    </span>

                                                    
                                                    <div className="flex-1"></div>

                                                    <div className="mt-auto flex flex-col gap-0.5 sm:gap-1 relative z-10 pt-4">
                                                        {hasValidOldPrice ? (
                                                            <span
                                                                className="text-xs sm:text-sm text-red-500 line-through font-bold">{p.basePrice} ₽</span>
                                                        ) : <span className="text-xs sm:text-sm invisible">0 ₽</span>}
                                                        <span
                                                            className="text-3xl sm:text-4xl font-black text-[var(--color-foreground)] flex items-baseline gap-1">
                                                            {p.price} <span
                                                            className="text-lg sm:text-xl text-[var(--color-muted-foreground)] font-bold">₽</span>
                                                        </span>
                                                    </div>

                                                    {p.hasDiscount && !isForever && hasValidOldPrice && (
                                                        <div
                                                            className="mt-3 text-[9px] sm:text-[10px] text-white bg-red-500/90 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg font-bold uppercase tracking-wider w-fit shadow-glow-danger borderless">
                                                            Скидка
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    
                                    {prices.find(p => p.tier === 'Forever') && (() => {
                                        const p = prices.find(p => p.tier === 'Forever')!;
                                        const isSelected = selectedTariff === 'Forever';
                                        const hasValidOldPrice = Boolean(p.basePrice && p.price && p.basePrice > p.price);
                                        
                                        const FOREVER_TOTAL_SPOTS = 10;
                                        const FOREVER_SPOTS_LEFT = 7;
                                        const NEXT_PRICE = 5990;

                                        return (
                                            <div className="shrink-0 mt-3 sm:mt-4">
                                                <button
                                                    disabled={isForever}
                                                    onClick={() => setSelectedTariff('Forever')}
                                                    className={`relative p-5 sm:p-6 rounded-2xl sm:rounded-3xl text-left transition-all duration-300 w-full border-none select-none flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6
                                                        ${isForever ? 'bg-[var(--color-card)]/50 opacity-60 cursor-not-allowed grayscale' :
                                                        isSelected ? 'bg-[var(--color-card)] shadow-xl ring-2 ring-emerald-500 z-10' :
                                                            'bg-gradient-to-r from-emerald-500/10 to-emerald-400/5 shadow-sm hover:shadow-md border border-emerald-500/20'
                                                    }`}
                                                >
                                                    <div className="flex flex-col flex-1 w-full">
                                                        <span className="font-black text-xl sm:text-2xl text-[var(--color-foreground)] mb-1">
                                                            Вечный доступ
                                                        </span>
                                                        <span className="text-sm text-[var(--color-muted-foreground)]">
                                                            Платите один раз, пользуйтесь навсегда
                                                        </span>
                                                        
                                                        {!isForever && (
                                                            <div className="mt-4 sm:mt-5 w-full max-w-sm">
                                                                <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1.5">
                                                                    <span>Осталось: {FOREVER_SPOTS_LEFT}</span>
                                                                    <span>Следующая цена: {NEXT_PRICE} ₽</span>
                                                                </div>
                                                                <div className="h-2.5 w-full bg-emerald-500/20 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${((FOREVER_TOTAL_SPOTS - FOREVER_SPOTS_LEFT) / FOREVER_TOTAL_SPOTS) * 100}%` }}></div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-col items-start sm:items-end shrink-0 relative z-10 mt-2 sm:mt-0">
                                                        {hasValidOldPrice ? (
                                                            <span className="text-xs sm:text-sm text-red-500 line-through font-bold">{p.basePrice} ₽</span>
                                                        ) : <span className="text-xs sm:text-sm invisible">0 ₽</span>}
                                                        
                                                        <span className="text-4xl sm:text-5xl font-black text-[var(--color-foreground)] flex items-baseline gap-1 mt-0.5">
                                                            {p.price} <span className="text-xl sm:text-2xl text-[var(--color-muted-foreground)] font-bold">₽</span>
                                                        </span>
                                                        
                                                        {p.hasDiscount && !isForever && hasValidOldPrice && (
                                                            <div className="mt-2 text-[10px] text-white bg-red-500/90 px-3 py-1.5 rounded-md sm:rounded-lg font-bold uppercase tracking-wider shadow-glow-danger borderless">
                                                                Скидка
                                                            </div>
                                                        )}
                                                    </div>
                                                </button>
                                            </div>
                                        );
                                    })()}


                                </div>
                            )}
                        </>
                    )}
                </div>

                
                {isLoggedIn && (
                    <div className="bg-[var(--color-card)]/90 backdrop-blur-md border-t border-[var(--color-muted)]/50 p-4 sm:p-6 shrink-0 z-20 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
                        {!isForever ? (
                            <div className="max-w-sm mx-auto flex flex-col">
                                {isMaintenance ? (
                                    <div className="bg-amber-50 dark:bg-amber-500/10 p-4 rounded-xl flex items-center justify-center gap-3 text-amber-600 dark:text-amber-500 font-medium text-sm sm:text-base border border-amber-100 dark:border-amber-500/20 mb-3 shadow-sm">
                                        <AlertCircle className="w-6 h-6 shrink-0" />
                                        <span>Ведутся технические работы. Оплата временно недоступна.</span>
                                    </div>
                                ) : (
                                    <>
                                        {methods.length > 0 ? (
                                            <div className="flex flex-col gap-2 w-full">
                                                <Button
                                                    variant="primary"
                                                    onClick={handleSavedPay}
                                                    isLoading={isSavedLoading}
                                                    disabled={isLoading || isLoadingPrices || isWoodenLoading || !selectedMethodId}
                                                    size="lg"
                                                    className="w-full text-base sm:text-lg h-12 sm:h-14 font-bold shadow-md borderless"
                                                >
                                                    Оплатить картой **** {methods.find(m => m.id === selectedMethodId)?.last4}
                                                </Button>
                                                
                                                {methods.length > 1 && (
                                                    <div className="flex flex-col gap-2 mb-2 w-full mt-2">
                                                        {methods.map(m => (
                                                            <div 
                                                                key={m.id} 
                                                                onClick={() => setSelectedMethodId(m.id!)}
                                                                className={`flex items-center p-3 sm:p-4 rounded-xl cursor-pointer transition-all borderless ${
                                                                    selectedMethodId === m.id 
                                                                        ? 'bg-[var(--color-primary)]/10 ring-2 ring-[var(--color-primary)]/50' 
                                                                        : 'bg-slate-50 dark:bg-zinc-900/50 hover:bg-[var(--color-muted)]/30'
                                                                }`}
                                                            >
                                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-3 ${selectedMethodId === m.id ? 'border-[var(--color-primary)]' : 'border-[var(--color-muted-foreground)]'}`}>
                                                                    {selectedMethodId === m.id && <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />}
                                                                </div>
                                                                <span className="font-bold text-sm sm:text-base text-[var(--color-foreground)]">
                                                                    **** {m.last4} {m.isMain && <span className="text-[var(--color-muted-foreground)] text-xs ml-1 font-medium">(Основная)</span>}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <Button
                                                    variant="secondary"
                                                    onClick={handlePay}
                                                    isLoading={isLoading}
                                                    disabled={isLoadingPrices || prices.length === 0 || isWoodenLoading || isSavedLoading}
                                                    className="w-full h-[40px] sm:h-[48px] text-sm sm:text-base font-bold borderless bg-[var(--color-muted)] hover:bg-[var(--color-muted-foreground)]/20 text-[var(--color-foreground)]"
                                                >
                                                    Оплатить другой картой
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                variant="primary"
                                                onClick={handlePay}
                                                isLoading={isLoading}
                                                disabled={isLoadingPrices || prices.length === 0 || isWoodenLoading || isSavedLoading}
                                                size="lg"
                                                className="w-full text-base sm:text-lg h-12 sm:h-14 font-bold shadow-md borderless"
                                            >
                                                {isSubscribed ? 'Продлить подписку' : 'Оплатить картой'}
                                            </Button>
                                        )}

                                        {onPayWooden && (
                                            <div className={`w-full transition-all duration-300 overflow-hidden ${canPayWithWooden ? 'max-h-[60px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                                <div className="pt-2 sm:pt-3">
                                                    <Button
                                                        variant="secondary"
                                                        onClick={handleWoodenPay}
                                                        isLoading={isWoodenLoading}
                                                        disabled={isLoading || isLoadingPrices || isSavedLoading}
                                                        className="w-full h-[40px] sm:h-[48px] text-sm sm:text-base bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700 font-bold borderless"
                                                    >
                                                        <Coins className="mr-2 w-4 h-4 sm:w-5 sm:h-5"/> Оплатить баллами (Д₽)
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ) : (
                            <div
                                className="text-center p-3 sm:p-4 bg-[var(--color-background)] shadow-sm borderless rounded-xl sm:rounded-2xl text-emerald-500 text-xs sm:text-sm font-bold">
                                У вас подключен максимальный тариф. Приятного использования!
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}