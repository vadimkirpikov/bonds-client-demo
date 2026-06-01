'use client';

import { useEffect, useState } from 'react';
import { PaymentApi, PaymentMethodResponse } from '@/lib/api';
import { getClientApi } from '@/lib/client-api';
import { Button } from '@/components/ui/Button';
import { CreditCard, Loader2, Trash2, ShieldCheck, AlertCircle, Crown, CheckCircle2 } from 'lucide-react';
import { SubscriptionData } from '@/components/modals/SubscriptionModal';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface PaymentMethodsSectionProps {
    accessToken?: string;
    subData?: SubscriptionData;
    onUpdate?: () => Promise<void> | void;
    onShowToast?: (msg: string, type: 'success' | 'error') => void;
}

export const PaymentMethodsSection = ({ accessToken, subData, onUpdate, onShowToast }: PaymentMethodsSectionProps) => {
    const [methods, setMethods] = useState<PaymentMethodResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [isSettingMainId, setIsSettingMainId] = useState<string | null>(null);
    const [isTogglingRenewal, setIsTogglingRenewal] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMethods = async () => {
        try {
            setError(null);
            const api = getClientApi(PaymentApi, accessToken);
            const response = await api.apiV1PaymentsMethodsGet();
            setMethods(response || []);
        } catch (e: any) {
            console.error('Failed to fetch payment methods:', e);
            setError('Не удалось загрузить способы оплаты');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMethods();
    }, [accessToken]);

    const handleDelete = async (id: string) => {
        try {
            setIsDeletingId(id);
            setError(null);
            const api = getClientApi(PaymentApi, accessToken);
            await api.apiV1PaymentsMethodsIdDelete({ id });
            
            const deletedMethod = methods.find((m) => m.id === id);
            const remainingMethods = methods.filter((m) => m.id !== id);
            if (deletedMethod?.isMain && remainingMethods.length > 0) {
                const nextMainId = remainingMethods[0].id!;
                try {
                    await api.apiV1PaymentsMethodsIdMainPut({ id: nextMainId });
                    setMethods(remainingMethods.map((m, idx) => idx === 0 ? { ...m, isMain: true } : m));
                } catch (e) {
                    console.error('Failed to auto-set next main method:', e);
                    setMethods(remainingMethods);
                }
            } else {
                setMethods(remainingMethods);
                if (remainingMethods.length === 0 && onUpdate) {
                    await onUpdate();
                }
            }
            if (onShowToast) onShowToast('Способ оплаты успешно удален.', 'success');
        } catch (e: any) {
            console.error('Failed to delete payment method:', e);
            if (e.status === 400) {
                if (onShowToast) onShowToast('Пожалуйста, добавьте способ оплаты в настройках подписки или свяжитесь с поддержкой.', 'error');
            } else {
                if (onShowToast) onShowToast('Произошла ошибка при удалении.', 'error');
            }
        } finally {
            setIsDeletingId(null);
        }
    };

    const handleSetMain = async (id: string) => {
        try {
            setIsSettingMainId(id);
            setError(null);
            const api = getClientApi(PaymentApi, accessToken);
            await api.apiV1PaymentsMethodsIdMainPut({ id });
            setMethods((prev) => prev.map((m) => ({ ...m, isMain: m.id === id })));
            if (onShowToast) onShowToast('Основная карта изменена.', 'success');
        } catch (e: any) {
            console.error('Failed to set main payment method:', e);
            if (onShowToast) onShowToast('Произошла ошибка. Пожалуйста, попробуйте позже.', 'error');
        } finally {
            setIsSettingMainId(null);
        }
    };

    const handleToggleAutoRenewal = async () => {
        try {
            setIsTogglingRenewal(true);
            setError(null);
            const api = getClientApi(PaymentApi, accessToken);
            if (subData?.isAutoRenewalActive) {
                await api.apiV1PaymentsCancelAutoRenewalPost();
            } else {
                await api.apiV1PaymentsResumeAutoRenewalPost();
            }
            if (onUpdate) {
                await onUpdate();
            }
            if (onShowToast) onShowToast('Настройки автопродления обновлены.', 'success');
        } catch (e: any) {
            console.error('Failed to toggle auto renewal:', e);
            if (onShowToast) onShowToast('Произошла ошибка при изменении настроек автопродления.', 'error');
        } finally {
            setIsTogglingRenewal(false);
        }
    };

    if (isLoading) {
        return (
            <div className="sm:bg-[var(--color-card)] sm:p-12 sm:rounded-[2rem] sm:shadow-sm flex items-center justify-center py-12 w-full min-h-[200px]">
                <Loader2 className="animate-spin text-[var(--color-primary)] w-8 h-8" />
            </div>
        );
    }

    const hasSubscriptionInfo = subData && (subData.hasActiveSubscription || subData.isForeverSubscriber);
    if (methods.length === 0 && !hasSubscriptionInfo) {
        return null;
    }

    return (
        <section className="sm:bg-[var(--color-card)] sm:p-8 sm:rounded-[2rem] relative sm:overflow-hidden w-full">
            {methods.length > 0 && (
                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <h2 className="text-2xl font-black text-[var(--color-foreground)] flex items-center gap-3 tracking-tight">
                        <CreditCard className="text-blue-500" size={28} /> Привязанные карты
                    </h2>
                </div>
            )}

            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-start gap-3 text-red-600 dark:text-red-400 relative z-10">
                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {hasSubscriptionInfo && (
                <div className="mb-8 relative z-10">
                    <div className="p-6 bg-gradient-to-r from-[var(--color-primary)]/10 to-transparent rounded-[2rem] flex flex-col sm:flex-row sm:items-center justify-between gap-4 borderless relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="text-sm text-[var(--color-primary)] font-black uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                <Crown size={16} /> Активная подписка
                            </div>
                            <div className="text-2xl font-black text-[var(--color-foreground)] tracking-tight">
                                {subData.isForeverSubscriber ? 'PRO Навсегда' : 'PRO Доступ'}
                            </div>
                        </div>
                        {subData.subscriptionExpiresAt && !subData.isForeverSubscriber && (
                            <div className="relative z-10 sm:text-right mt-2 sm:mt-0">
                                <div className="text-xs text-[var(--color-muted-foreground)] font-bold uppercase tracking-widest mb-1.5">
                                    {subData.isAutoRenewalActive ? 'Следующее списание' : 'Автопродление выключено'}
                                </div>
                                <div className="text-lg font-black text-[var(--color-foreground)] tracking-tight">
                                    {subData.isAutoRenewalActive 
                                        ? format(new Date(subData.subscriptionExpiresAt), 'd MMMM yyyy', { locale: ru })
                                        : `Остановится ${format(new Date(subData.subscriptionExpiresAt), 'd MMMM yyyy', { locale: ru })}`
                                    }
                                </div>
                            </div>
                        )}
                        <Crown className="absolute -right-6 -bottom-6 w-40 h-40 text-[var(--color-primary)]/5 rotate-12 pointer-events-none" />
                    </div>
                    
                    {subData.subscriptionExpiresAt && !subData.isForeverSubscriber && (
                        <div className="flex justify-end mt-3 pr-2">
                            <Button 
                                variant="secondary" 
                                size="sm"
                                onClick={handleToggleAutoRenewal}
                                disabled={isTogglingRenewal || (!subData.isAutoRenewalActive && methods.length === 0)}
                                className="text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] bg-transparent border-none shadow-none font-medium p-0 h-auto disabled:opacity-30 disabled:cursor-not-allowed"
                                title={!subData.isAutoRenewalActive && methods.length === 0 ? "Для возобновления привяжите карту" : undefined}
                            >
                                {isTogglingRenewal && <Loader2 size={12} className="animate-spin mr-1.5" />}
                                {subData.isAutoRenewalActive ? 'Отключить автопродление' : 'Возобновить автопродление'}
                            </Button>
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                {methods.map((method) => (
                    <div 
                        key={method.id} 
                        className="bg-slate-50/50 dark:bg-zinc-900/40 hover:bg-slate-100/50 dark:hover:bg-zinc-900/60 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 borderless"
                    >
                        <div className="flex items-center justify-between mb-6">
                            {method.isMain && (
                                <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 ml-auto">
                                    <ShieldCheck size={14} /> Основная
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-12 rounded-xl bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center shrink-0 borderless">
                                <CreditCard size={24} className="text-[var(--color-primary)]" />
                            </div>
                            <div>
                                <p className="text-sm text-[var(--color-muted-foreground)] font-bold uppercase tracking-wide mb-1">
                                    {method.cardType || 'Банковская карта'}
                                </p>
                                <p className="text-2xl font-black text-[var(--color-foreground)] tracking-widest flex items-center gap-2">
                                    <span className="opacity-40 text-xl">••••</span> 
                                    {method.last4 || '****'}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 mt-auto pt-5">
                            <div className="text-xs text-[var(--color-muted-foreground)] font-bold uppercase tracking-wider mb-2">
                                Действует до: {method.expiryMonth}/{method.expiryYear}
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {confirmDeleteId === method.id ? (
                                    <div className="flex flex-col gap-3 w-full -mt-2">
                                        <div className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 p-3 rounded-xl borderless">
                                            <span className="font-bold block mb-1">Вы уверены?</span>
                                        </div>
                                        <div className="flex items-center gap-2 w-full">
                                            <Button 
                                                variant="secondary" 
                                                size="sm" 
                                                className="flex-1 h-10 px-4 bg-red-500 text-white hover:bg-red-600 transition-colors shadow-none rounded-xl font-bold borderless"
                                                onClick={() => {
                                                    setConfirmDeleteId(null);
                                                    handleDelete(method.id!);
                                                }}
                                                disabled={isDeletingId === method.id}
                                            >
                                                {isDeletingId === method.id ? <Loader2 size={16} className="animate-spin" /> : "Удалить"}
                                            </Button>
                                            <Button 
                                                variant="secondary" 
                                                size="sm" 
                                                className="flex-1 h-10 px-4 bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 transition-colors shadow-none rounded-xl font-bold borderless"
                                                onClick={() => setConfirmDeleteId(null)}
                                                disabled={isDeletingId === method.id}
                                            >
                                                Отмена
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {!method.isMain && (
                                            <Button 
                                                variant="secondary" 
                                                size="sm" 
                                                className="flex-1 h-10 px-4 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors shadow-none rounded-xl font-bold borderless"
                                                onClick={() => handleSetMain(method.id!)}
                                                disabled={isSettingMainId === method.id || isDeletingId === method.id}
                                            >
                                                {isSettingMainId === method.id ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <CheckCircle2 size={16} className="mr-2" />
                                                )}
                                                Сделать основной
                                            </Button>
                                        )}
                                        
                                        <Button 
                                            variant="secondary" 
                                            size="sm" 
                                            className={`h-10 px-4 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 dark:hover:text-red-300 transition-colors shadow-none rounded-xl font-bold borderless ${method.isMain ? 'w-full flex-1' : ''}`}
                                            onClick={() => setConfirmDeleteId(method.id!)}
                                            disabled={isDeletingId === method.id || isSettingMainId === method.id}
                                        >
                                            {isDeletingId === method.id ? (
                                                <Loader2 size={16} className="animate-spin mr-2" />
                                            ) : (
                                                <Trash2 size={16} className="mr-2" />
                                            )}
                                            Отвязать
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};
