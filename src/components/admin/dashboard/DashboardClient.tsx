'use client';

import {Session} from 'next-auth';
import {Button} from '@/components/ui/Button';
import {ReviewModal} from '@/components/admin/ReviewModal';
import {SubscriptionData, SubscriptionModal} from '@/components/modals/SubscriptionModal';
import {KeyRateManager} from '@/components/admin/KeyRateManager';
import {CheckCircle, CheckCircle2, Crown, Database, Link2, LogOut, Plus, User as UserIcon, XCircle} from 'lucide-react';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {AuthApi, Job, JobApi, LinksApi, PaymentApi, TariffType} from '@/lib/api';
import {getClientApi} from '@/lib/client-api';
import {useRouter} from 'next/navigation';
import {signOut} from 'next-auth/react';
import {BrandSelect} from '@/components/ui/BrandSelect';

import {AdminReportModal} from '@/components/admin/AdminReportModal';
import {AdminReportsTable} from '@/components/admin/AdminReportsTable';
import {ReferralSection} from "@/components/admin/dashboard/ReferralSection";
import {TinkoffApiKeySection} from "@/components/admin/dashboard/TinkoffApiKeySection";
import { SessionExpiredWall } from '@/components/ui/SessionExpiredWall';

import {MaintenanceManager} from "@/components/admin/MaintenanceManager";
import {PaymentMaintenanceManager} from "@/components/admin/PaymentMaintenanceManager";
import {PaymentMethodsSection} from "@/components/admin/dashboard/PaymentMethodsSection";

interface DashboardClientProps {
    session: Session;
    initialJobs: Job[];
}

export default function DashboardClient({session, initialJobs}: DashboardClientProps) {
    const accessToken = (session as any)?.accessToken;
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSessionExpired, setIsSessionExpired] = useState(false);
    
    const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    }, []);
    const [hasValidTinkoffToken, setHasValidTinkoffToken] = useState(false);


    const [subData, setSubData] = useState<SubscriptionData>({
        hasActiveSubscription: false,
        subscriptionExpiresAt: null,
        isForeverSubscriber: false,
    });

    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const[selectedJob, setSelectedJob] = useState<Job | null>(null);
    const[isSubModalOpen, setIsSubModalOpen] = useState(false);


    const [isManualReportOpen, setIsManualReportOpen] = useState(false);
    const[reportTableTrigger, setReportTableTrigger] = useState(0);
    const [referralTrigger, setReferralTrigger] = useState(0);

    const router = useRouter();

    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const startYear = 2024;
        const arr =[];
        for (let y = startYear; y <= currentYear; y++) {
            arr.push(y.toString());
        }
        if (arr.length === 0) return ['2024'];
        return arr;
    },[]);

    const checkRightsAndSub = useCallback(async () => {
        try {
            const api = getClientApi(AuthApi, accessToken);
            const me = await api.apiV1AuthMeGet();

            setIsAdmin(me.role?.toLowerCase() === 'admin');
            setHasValidTinkoffToken(me.hasValidTinkoffToken || false);
            setSubData({
                hasActiveSubscription: me.hasActiveSubscription || false,
                subscriptionExpiresAt: me.subscriptionExpiresAt ? new Date(me.subscriptionExpiresAt) : null,
                isForeverSubscriber: me.isForeverSubscriber || false,
                trialUsed: me.trialUsed || false,
                isAutoRenewalActive: me.isAutoRenewalActive || false,
            });
        } catch (e: any) {
            console.error("Failed to check rights via /me", e);
            if (e.status === 401 || e.response?.status === 401) {
                setIsSessionExpired(true);
            }
        } finally {
            setIsCheckingAuth(false);
        }
    }, [accessToken]);

    useEffect(() => {
        let isMounted = true;

        const initAuthCheck = async () => {
            await new Promise(resolve => setTimeout(resolve, 500));

            if (isMounted) {
                await checkRightsAndSub();
            }
        };

        initAuthCheck();

        return () => { isMounted = false; };
    }, [accessToken, checkRightsAndSub]);

    const handleCreatePayment = async (tariff: TariffType) => {
        try {
            const api = getClientApi(PaymentApi);
            const request = {
                createPaymentRequest: {tariffType: tariff as any}
            }
            const response = await api.apiV1PaymentsCreatePost(request);
            if (response.url && (response.url.includes('yoomoney.ru') || response.url.includes('yookassa.ru'))) {
                window.location.href = response.url;
            } else if (response.url && response.url.includes('Succeeded')) {
                window.location.href = '/dashboard';
            } else if (response.url) {
                window.location.href = response.url;
            }
        } catch (e) {
            console.error("Payment error", e);
            alert("Ошибка создания платежа");
        }
    };

    const handlePayWooden = async (tariff: TariffType) => {
        try {
            const api = getClientApi(PaymentApi);
            await api.apiV1PaymentsPayWithWoodenPost({
                payWoodenRequest: {tier: tariff as any}
            });

            showToast("Тариф успешно оплачен бонусами!", "success");
            setIsSubModalOpen(false);
            checkRightsAndSub(); // Обновляем состояние подписки
            setReferralTrigger(prev => prev + 1);
        } catch (e) {
            console.error("Wooden payment error", e);
            showToast("Ошибка оплаты бонусами. Возможно, недостаточно средств.", "error");
        }
    };

    const handlePaySavedCard = async (tariff: TariffType, methodId: string) => {
        try {
            const api = getClientApi(PaymentApi);
            const request = {
                paySavedCardRequest: { tariffType: tariff as any, paymentMethodId: methodId }
            }
            const response = await api.apiV1PaymentsPayWithSavedCardPost(request);
            if (response.url && (response.url.includes('yoomoney.ru') || response.url.includes('yookassa.ru'))) {
                window.location.href = response.url;
            } else {
                showToast("Оплата успешно произведена!", "success");
                setIsSubModalOpen(false);
                checkRightsAndSub();
            }
        } catch (e) {
            console.error("Payment error", e);
            showToast("Ошибка при оплате привязанной картой", "error");
        }
    };

    const handleLogout = async () => {
        await signOut({callbackUrl: '/'});
    };

    if (isSessionExpired) {
        return (
            <div className="w-full max-w-6xl mx-auto px-4 py-10 overflow-x-hidden">
                <SessionExpiredWall />
            </div>
        );
    }

    if (isCheckingAuth) return <div className="text-center py-20 text-muted-foreground"><Crown
        className="animate-spin mx-auto mb-2 text-primary"/>Загрузка профиля...</div>;

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-10 overflow-x-hidden relative">
            {toast && (
                <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in-up backdrop-blur-md borderless ${
                    toast.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
                }`}>
                    {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    <span className="font-bold text-sm">{toast.message}</span>
                </div>
            )}

            

            
            <div
                className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 sm:bg-white dark:sm:bg-zinc-950 sm:p-8 sm:rounded-[2rem] sm:shadow-card gap-6 sm:gap-0 borderless">
                <div className="flex items-center gap-6">
                    
                    <div
                        className="w-20 h-20 rounded-full bg-slate-50 dark:bg-zinc-900/50 flex items-center justify-center text-3xl font-black text-slate-300 shadow-inner shrink-0 borderless">
                        {session.user?.name?.[0] || <UserIcon size={32}/>}
                    </div>

                    
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{session.user?.name}</h1>
                        <div className="flex items-center gap-3 flex-wrap">
                            <p className="text-slate-400 dark:text-zinc-600 font-medium text-sm bg-slate-50 dark:bg-zinc-900/50 px-3 py-1 rounded-full">{session.user?.email}</p>

                            {subData.hasActiveSubscription ? (
                                <span
                                    className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs flex items-center gap-1.5 font-bold shadow-sm borderless">
                                    <Crown size={14}
                                           className="fill-current"/> PRO {subData.isForeverSubscriber && "(Навсегда)"}
                                </span>
                            ) : (
                                <span
                                    className="bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-500 px-3 py-1 rounded-full text-xs font-bold borderless">Free Account</span>
                            )}

                            {isAdmin && (
                                <span
                                    className="bg-red-50 text-red-500 px-3 py-1 rounded-full text-xs font-bold borderless">
                                    ADMIN
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto mt-2 sm:mt-0">
                    {!subData.hasActiveSubscription ? (
                        <Button
                            onClick={() => setIsSubModalOpen(true)}
                            className="flex-1 md:flex-none shadow-glow-primary hover:shadow-glow-primary-hover transition-all duration-300 h-12 px-8 text-base"
                            variant="primary"
                        >
                            <Crown className="mr-2" size={18}/> Оформить PRO
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            onClick={() => setIsSubModalOpen(true)}
                            className="flex-1 md:flex-none shadow-glow-primary hover:shadow-glow-primary-hover transition-all duration-300 h-12 px-8 text-base"
                        >
                            {subData.isForeverSubscriber ? "Мой тариф" : "Продлить PRO"}
                        </Button>
                    )}
                    <Button
                        variant="secondary"
                        onClick={handleLogout}
                        className="h-12 w-12 p-0 rounded-full bg-slate-50 dark:bg-zinc-900/50 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 dark:text-zinc-600 hover:text-red-500 transition-colors shrink-0"
                    >
                        <LogOut size={20}/>
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-10">
                
                <PaymentMethodsSection accessToken={accessToken} subData={subData} onUpdate={checkRightsAndSub} onShowToast={showToast} />

                
                <TinkoffApiKeySection
                    hasValidToken={hasValidTinkoffToken}
                    onTokenUpdated={checkRightsAndSub}
                />

                
                <ReferralSection hasActiveSub={subData.hasActiveSubscription!} refreshTrigger={referralTrigger}/>

                
                

                {isAdmin && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="h-full">
                                <KeyRateManager/>
                            </div>

                            <div className="h-full">
                                <MaintenanceManager/>
                            </div>

                            <div className="h-full">
                                <PaymentMaintenanceManager/>
                            </div>
                            </div>
                    </>
                )}
            </div>

            {selectedJob && <ReviewModal job={selectedJob} onClose={() => {
                setSelectedJob(null);
                setReportTableTrigger(prev => prev + 1);
            }}/>}

            <AdminReportModal
                isOpen={isManualReportOpen}
                onClose={() => setIsManualReportOpen(false)}
                onSuccess={() => setReportTableTrigger(prev => prev + 1)}
            />

            <SubscriptionModal
                isOpen={isSubModalOpen}
                onClose={() => setIsSubModalOpen(false)}
                data={subData}
                isLoggedIn={true}
                onPayment={handleCreatePayment}
                onPayWooden={handlePayWooden}
                onPaySavedCard={handlePaySavedCard}
            />
        </div>
    );
}