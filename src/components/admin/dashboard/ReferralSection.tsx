'use client';

import { useState, useEffect } from 'react';
import { ReferralApi, ReferralInfoResponse } from '@/lib/api';
import { getClientApi } from '@/lib/client-api';
import { Button } from '@/components/ui/Button';
import { Copy, CheckCircle, Wallet, ArrowRightLeft, AlertCircle, TrendingUp, CreditCard } from 'lucide-react';

export const ReferralSection = ({ hasActiveSub, refreshTrigger = 0 }: { hasActiveSub: boolean, refreshTrigger?: number }) => {
    const [info, setInfo] = useState<ReferralInfoResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    const [convertAmount, setConvertAmount] = useState<number | ''>('');
    const [withdrawCard, setWithdrawCard] = useState('');
    const [isConverting, setIsConverting] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    const [convertMessage, setConvertMessage] = useState<{type: 'error' | 'success', text: string} | null>(null);
    const [withdrawMessage, setWithdrawMessage] = useState<{type: 'error' | 'success', text: string} | null>(null);

    const fetchInfo = async () => {
        try {
            const api = getClientApi(ReferralApi);
            const data = await api.apiV1ReferralInfoGet();
            setInfo(data);
        } catch (e) {
            console.error("Failed to fetch referral info", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInfo();
    }, [refreshTrigger]);

    const getLocalReferralLink = () => {
        if (!info?.referralLink) return '';
        try {
            const url = new URL(info.referralLink);
            return `${window.location.origin}${url.pathname}${url.search}`;
        } catch {
            return info.referralLink;
        }
    };

    const handleCopy = () => {
        const link = getLocalReferralLink();
        if (link) {
            navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleConvert = async () => {
        setConvertMessage(null);
        if (!convertAmount || convertAmount <= 0 || Number(convertAmount) % 2 !== 0) {
            setConvertMessage({ type: 'error', text: 'Сумма должна быть четной и больше нуля.' });
            return;
        }
        if (Number(convertAmount) > (info?.woodenBalance || 0)) {
            setConvertMessage({ type: 'error', text: 'Недостаточно деревянных рублей.' });
            return;
        }

        setIsConverting(true);
        try {
            const api = getClientApi(ReferralApi);
            await api.apiV1ReferralConvertPost({ convertRequest: { amountWooden: Number(convertAmount) } });
            setConvertMessage({ type: 'success', text: 'Успешно конвертировано!' });
            setConvertAmount('');
            fetchInfo();
            setTimeout(() => setConvertMessage(null), 3000);
        } catch (e) {
            alert('Ошибка при конвертации. Повторите попытку позже.');
            console.error(e);
        } finally {
            setIsConverting(false);
        }
    };

    const handleWithdraw = async () => {
        setWithdrawMessage(null);
        if ((info?.realBalance || 0) < 1500) {
            setWithdrawMessage({ type: 'error', text: 'Минимум для вывода: 1500 ₽' });
            return;
        }
        if (!withdrawCard.trim()) {
            setWithdrawMessage({ type: 'error', text: 'Введите номер карты.' });
            return;
        }

        setIsWithdrawing(true);
        try {
            const api = getClientApi(ReferralApi);
            await api.apiV1ReferralWithdrawPost({ withdrawRequest: { amount: info?.realBalance, requisites: withdrawCard } });
            setWithdrawMessage({ type: 'success', text: 'Заявка создана!' });
            setWithdrawCard('');
            fetchInfo();
            setTimeout(() => setWithdrawMessage(null), 5000);
        } catch (e) {
            alert('Ошибка сервера. Повторите попытку позже.');
            console.error(e);
        } finally {
            setIsWithdrawing(false);
        }
    };

    if (loading) return (
        <div className="sm:bg-[var(--color-card)] sm:p-12 sm:rounded-[2rem] sm:shadow-sm flex items-center justify-center py-12">
            <div className="animate-pulse text-[var(--color-muted-foreground)] font-medium">Загрузка данных...</div>
        </div>
    );

    return (
        <div className="sm:bg-[var(--color-card)] sm:p-8 sm:rounded-[2rem] sm:shadow-card relative sm:overflow-hidden">
            
            <div className="hidden sm:block absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/5 dark:bg-[var(--color-primary)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"/>

            <h2 className="text-2xl font-black text-[var(--color-foreground)] mb-6 flex items-center gap-3 relative z-10 tracking-tight">
                <Wallet className="text-[var(--color-primary)]" size={28} /> Партнерская программа
            </h2>

            
            <div className="bg-[var(--color-muted)] p-5 sm:p-6 rounded-2xl mb-8 relative z-10 shadow-sm">
                <p className="text-sm text-[var(--color-muted-foreground)] font-bold mb-3 uppercase tracking-wider">Ваша реферальная ссылка (скидка до 20%)</p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        readOnly
                        value={getLocalReferralLink()}
                        className="w-full bg-[var(--color-card)] rounded-xl px-4 py-3 text-[var(--color-foreground)] font-medium outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 transition-all shadow-sm"
                    />
                    <Button onClick={handleCopy} variant="primary" className="shrink-0 h-auto shadow-glow-primary">
                        {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                        <span className="ml-2 font-bold">{copied ? "Скопировано" : "Копировать"}</span>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                
                <div className="bg-[var(--color-card-s)] rounded-3xl p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300 flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-500 rounded-lg">
                            <TrendingUp size={20} />
                        </div>
                        <h3 className="text-slate-500 dark:text-[var(--color-muted-foreground)] text-sm font-bold uppercase tracking-wide">
                            Бонусный баланс
                        </h3>
                    </div>
                    <p className="text-4xl font-black text-[var(--color-foreground)] mb-6">
                        {info?.woodenBalance || 0} <span className="text-2xl text-slate-400 dark:text-[var(--color-muted-foreground)] font-bold">Д₽</span>
                    </p>

                    {!hasActiveSub ? (
                        <div className="mt-auto bg-orange-50 dark:bg-orange-900/30 p-4 rounded-2xl text-sm text-orange-800 dark:text-orange-300 font-medium leading-relaxed">
                            <p className="mb-1 font-bold">Подписка неактивна</p>
                            Вы получаете бонусы за покупки друзей. Используйте их для оплаты подписки на Bonds-Lab.
                        </div>
                    ) : (
                        <div className="mt-auto space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                Обмен на рубли (Курс 2 к 1). Только четные суммы.
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Сумма"
                                    value={convertAmount}
                                    onChange={(e) => setConvertAmount(Number(e.target.value))}
                                    className={`w-full bg-[var(--color-muted)] rounded-xl px-4 py-3 text-sm text-[var(--color-foreground)] font-bold outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-[var(--color-card)] focus:shadow-md ${
                                        convertMessage?.type === 'error'
                                            ? 'border-red-300 focus:border-red-500'
                                            : 'border-slate-200 focus:border-[var(--color-primary)]'
                                    }`}
                                />
                                <Button onClick={handleConvert} isLoading={isConverting} variant="secondary" className="bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted-foreground)]/10">
                                    <ArrowRightLeft size={18} />
                                </Button>
                            </div>
                            {convertMessage && (
                                <p className={`text-xs font-bold ${convertMessage.type === 'error' ? 'text-red-500' : 'text-emerald-600'}`}>
                                    {convertMessage.text}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                
                <div className="bg-[var(--color-card-s)] rounded-3xl p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300 flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-lg">
                            <CreditCard size={20} />
                        </div>
                        <h3 className="text-slate-500 dark:text-[var(--color-muted-foreground)] text-sm font-bold uppercase tracking-wide">
                            Реальный баланс
                        </h3>
                    </div>
                    <p className="text-4xl font-black text-[var(--color-foreground)] mb-6">
                        {info?.realBalance || 0} <span className="text-2xl text-slate-400 dark:text-[var(--color-muted-foreground)] font-bold">₽</span>
                    </p>

                    {!hasActiveSub ? (
                        <div className="mt-auto bg-[var(--color-muted)] p-4 rounded-2xl text-sm text-slate-500 dark:text-slate-400 flex gap-3 items-start shadow-sm">
                            <AlertCircle size={20} className="shrink-0 text-slate-400 dark:text-slate-500 mt-0.5"/>
                            <span>Активируйте <b>PRO подписку</b>, чтобы получать до 35% реальными деньгами с оплат рефералов.</span>
                        </div>
                    ) : (
                        <div className="mt-auto space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                Вывод на карту РФ (от 1500 ₽)
                            </p>
                            <div className="flex flex-col gap-3">
                                <input
                                    type="text"
                                    placeholder="Номер карты"
                                    value={withdrawCard}
                                    onChange={(e) => setWithdrawCard(e.target.value)}
                                    className={`w-full bg-[var(--color-muted)] rounded-xl px-4 py-3 text-sm text-[var(--color-foreground)] font-bold outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-[var(--color-card)] focus:shadow-md ${
                                        withdrawMessage?.type === 'error'
                                            ? 'border-red-300 focus:border-red-500'
                                            : 'border-slate-200 focus:border-[var(--color-primary)]'
                                    }`}
                                />
                                <Button
                                    onClick={handleWithdraw}
                                    isLoading={isWithdrawing}
                                    disabled={(info?.realBalance || 0) < 1500}
                                    className="w-full font-bold shadow-sm"
                                    variant="primary"
                                >
                                    Запросить вывод
                                </Button>
                            </div>
                            {withdrawMessage && (
                                <p className={`text-xs font-bold ${withdrawMessage.type === 'error' ? 'text-red-500' : 'text-emerald-600'}`}>
                                    {withdrawMessage.text}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};