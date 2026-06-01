'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, Mail, Lock, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {Suspense, useEffect, useState} from 'react';

import { AuthApi } from '@/lib/api';
import { getClientApi } from '@/lib/client-api';

function SignInContent() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
    const refCode = searchParams.get('ref');

    const [authMode, setAuthMode] = useState<'login' | 'forgot' | 'reset'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    useEffect(() => {
        if (refCode) {
            document.cookie = `refCode=${refCode}; path=/; max-age=${60 * 60 * 24 * 7}`;
        }
    }, [refCode]);

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        setIsLoading(true);

        try {
            const res = await signIn('credentials', {
                email,
                password,
                redirect: false,
                callbackUrl
            });

            if (res?.error) {
                setError('Неверный email или пароль');
            } else if (res?.url) {
                window.location.href = res.url;
            }
        } catch (e) {
            setError('Произошла ошибка при входе');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        setIsLoading(true);
        try {
            const api = getClientApi(AuthApi);
            await api.apiV1AuthForgotPasswordPost({
                forgotPasswordRequest: { email }
            });
            setSuccessMsg('Если аккаунт с таким email существует, мы отправили на него код восстановления.');
            setAuthMode('reset');
        } catch (e: any) {
            let errorMsg = 'Произошла ошибка при отправке запроса';
            try {
                const res = e.response || e;
                if (res && typeof res.json === 'function') {
                    const data = await res.json();
                    if (data && data.message) errorMsg = data.message;
                }
            } catch (_) {}
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        setIsLoading(true);
        try {
            const api = getClientApi(AuthApi);
            await api.apiV1AuthResetPasswordPost({
                resetPasswordRequest: { email, code: resetCode, newPassword }
            });
            setSuccessMsg('Пароль успешно изменён! Вы можете войти с новым паролем.');
            setAuthMode('login');
            setPassword('');
        } catch (e: any) {
            let errorMsg = 'Произошла ошибка при сбросе пароля';
            try {
                const res = e.response || e;
                if (res && typeof res.json === 'function') {
                    const data = await res.json();
                    if (data && data.message) errorMsg = data.message;
                }
            } catch (_) {}
            
            if (errorMsg === 'Произошла ошибка при сбросе пароля' && (e.status === 400 || e.response?.status === 400)) {
                errorMsg = 'Неверный код или формат пароля';
            }
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        if (authMode === 'login') handleEmailSignIn(e);
        else if (authMode === 'forgot') handleForgotPassword(e);
        else if (authMode === 'reset') handleResetPassword(e);
    };

    return (
        <div className="w-full max-w-md bg-card p-10 rounded-3xl shadow-xl relative z-10 animate-fade-in">
            <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-5 shadow-sm borderless">
                    {authMode === 'login' ? <ShieldCheck size={32} /> : <KeyRound size={32} />}
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                    {authMode === 'login' ? 'Вход в систему' : (authMode === 'forgot' ? 'Восстановление пароля' : 'Новый пароль')}
                </h1>
                <p className="text-muted-foreground text-sm">
                    {authMode === 'login' 
                        ? 'Авторизуйтесь, чтобы получить доступ к аналитике и личному кабинету.' 
                        : 'Следуйте инструкциям для восстановления доступа к вашему аккаунту.'}
                </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
                {error && (
                    <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium borderless">
                        {error}
                    </div>
                )}
                {successMsg && (
                    <div className="p-3 mb-4 rounded-xl bg-emerald-50 text-emerald-600 text-sm font-medium borderless">
                        {successMsg}
                    </div>
                )}
                
                <div className="space-y-1 block">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Email</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground opacity-60">
                            <Mail size={18} />
                        </div>
                        <input
                            type="email"
                            required
                            className="w-full pl-10 pr-4 py-3 bg-background border-none rounded-xl text-foreground focus:ring-2 focus:ring-primary/50 transition-all text-sm font-medium outline-none placeholder-muted-foreground/50 shadow-sm"
                            placeholder="ваша@почта.ру"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={authMode === 'reset'}
                        />
                    </div>
                </div>

                {authMode === 'login' && (
                    <div className="space-y-1 block">
                        <div className="flex justify-between items-end">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Пароль</label>
                            <button type="button" onClick={() => { setAuthMode('forgot'); setError(null); setSuccessMsg(null); }} className="text-xs font-bold text-primary hover:underline transition-all mb-0.5">
                                Забыли пароль?
                            </button>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground opacity-60">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                required
                                className="w-full pl-10 pr-4 py-3 bg-background border-none rounded-xl text-foreground focus:ring-2 focus:ring-primary/50 transition-all text-sm font-medium outline-none placeholder-muted-foreground/50 shadow-sm"
                                placeholder="Пароль"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {authMode === 'reset' && (
                    <>
                        <div className="space-y-1 block">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Код из письма</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 bg-background border-none rounded-xl text-foreground focus:ring-2 focus:ring-primary/50 transition-all text-sm font-medium outline-none shadow-sm"
                                placeholder="123456"
                                value={resetCode}
                                onChange={(e) => setResetCode(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1 block">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Новый пароль</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground opacity-60">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-background border-none rounded-xl text-foreground focus:ring-2 focus:ring-primary/50 transition-all text-sm font-medium outline-none placeholder-muted-foreground/50 shadow-sm"
                                    placeholder="Новый пароль"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    </>
                )}

                <Button
                    size="lg"
                    type="submit"
                    isLoading={isLoading}
                    variant="primary"
                    className="w-full text-base h-12 shadow-sm font-bold mt-2"
                >
                    {authMode === 'login' ? 'Войти' : (authMode === 'forgot' ? 'Отправить код' : 'Сохранить пароль')}
                </Button>
            </form>

            {authMode !== 'login' && (
                <div className="mt-4 text-center">
                    <button type="button" onClick={() => { setAuthMode('login'); setError(null); setSuccessMsg(null); }} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all">
                        Вернуться ко входу
                    </button>
                </div>
            )}

            {authMode === 'login' && (
                <>
                    <div className="relative my-6 flex items-center py-2">
                        <div className="flex-grow border-t border-muted" />
                        <span className="flex-shrink-0 mx-4 text-xs font-medium text-muted-foreground uppercase tracking-widest">
                            Или
                        </span>
                        <div className="flex-grow border-t border-muted" />
                    </div>

                    <div className="space-y-4">
                        <Button
                            size="lg"
                            type="button"
                            className="w-full text-base bg-white dark:bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-50 dark:hover:bg-white shadow-sm font-semibold h-12"
                            onClick={() => signIn('google', { callbackUrl })}
                        >
                            <svg className="mr-2 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                            </svg>
                            Продолжить с Google
                        </Button>
                    </div>
                    
                    <div className="mt-8 text-center text-sm font-medium text-muted-foreground">
                        Нет аккаунта? <Link href={`/auth/register${refCode ? `?ref=${refCode}` : ''}`} className="text-primary hover:underline transition-all">Создать</Link>
                    </div>

                    <div className="mt-8 text-center text-xs text-slate-400">
                        Продолжая, вы соглашаетесь с <Link href="/offer" className="underline hover:text-slate-600 transition-colors">офертой</Link> и политикой сервиса.
                    </div>
                </>
            )}
        </div>
    );
}

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <Suspense fallback={<div className="text-muted-foreground">Загрузка...</div>}>
                <SignInContent />
            </Suspense>
        </div>
    );
}