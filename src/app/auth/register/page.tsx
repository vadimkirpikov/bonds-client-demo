'use client';

import { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, Mail, Lock, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { Configuration, AuthApi } from '@/lib/api';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';

function RegisterContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const refCode = searchParams.get('ref') || undefined;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const turnstileRef = useRef<TurnstileInstance>(null);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!turnstileToken) {
            setError('Пожалуйста, пройдите проверку (Turnstile)');
            return;
        }

        setIsLoading(true);
        try {
            const config = new Configuration({ basePath: process.env.NEXT_PUBLIC_API_URL });
            const authApi = new AuthApi(config);

            await authApi.apiV1AuthRegisterPost({
                emailRegisterRequest: {
                    email,
                    password,
                    referralCode: refCode,
                    turnstileToken
                }
            });

            setSuccessMessage('Регистрация успешна! Проверьте вашу почту для подтверждения (возможно, в спаме).');
        } catch (e: any) {
            console.error('Registration failed:', e);
            if (e.status === 409 || e.response?.status === 409) {
                setError('Пользователь с таким email уже существует');
            } else {
                setError('Произошла ошибка при регистрации. Пожалуйста, попробуйте еще раз.');
            }
            turnstileRef.current?.reset();
            setTurnstileToken(null);
        } finally {
            setIsLoading(false);
        }
    };

    const [code, setCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsVerifying(true);

        try {
            const config = new Configuration({ basePath: process.env.NEXT_PUBLIC_API_URL });
            const authApi = new AuthApi(config);

            const res = await authApi.apiV1AuthVerifyEmailPost({
                emailVerifyRequest: {
                    email,
                    code,
                    password,
                    referralCode: refCode,
                }
            });

            if (res.accessToken) {
                const signInRes = await signIn('credentials', {
                    email,
                    password,
                    redirect: false
                });
                if (!signInRes?.error) {
                    router.push('/dashboard');
                    return;
                }
            }
            router.push('/auth/signin');
        } catch (e: any) {
            console.error('Verification failed:', e);
            setError('Неверный код или срок его действия истек.');
        } finally {
            setIsVerifying(false);
        }
    };

    if (successMessage) {
        return (
            <div className="w-full max-w-md bg-[var(--color-card)] p-10 rounded-3xl shadow-card relative z-10 animate-fade-in borderless">
                <div className="text-center mb-6">
                    <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-5 shadow-sm border border-emerald-500/20">
                        <Mail size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-[var(--color-foreground)] mb-2">Письмо отправлено!</h1>
                    <p className="text-[var(--color-muted-foreground)] text-sm leading-relaxed">
                        Введите код из письма, чтобы активировать аккаунт:
                    </p>
                </div>
                
                <form onSubmit={handleVerify} className="space-y-4">
                    {error && (
                        <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium borderless text-center">
                            {error}
                        </div>
                    )}
                    
                    <div className="relative">
                        <input
                            type="text"
                            required
                            maxLength={6}
                            className="w-full px-4 py-3 bg-[var(--color-background)] border-none rounded-xl text-[var(--color-foreground)] text-center text-xl tracking-[0.5em] focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all font-black outline-none placeholder-[var(--color-muted-foreground)]/40 shadow-sm"
                            placeholder="000000"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                        />
                    </div>
                    
                    <Button variant="primary" size="lg" type="submit" isLoading={isVerifying} className="w-full h-12 text-base font-bold shadow-md mt-4">
                        Подтвердить
                    </Button>
                </form>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md bg-[var(--color-card)] p-10 rounded-3xl shadow-card relative z-10 animate-fade-in borderless">
            <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center text-[var(--color-primary)] mb-5 shadow-sm">
                    <KeyRound size={32} />
                </div>
                <h1 className="text-3xl font-black text-[var(--color-foreground)] mb-2 tracking-tight">Создать аккаунт</h1>
                <p className="text-[var(--color-muted-foreground)] text-sm">
                    Присоединяйтесь к платформе для продвинутой аналитики облигаций.
                </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
                {error && (
                    <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium borderless">
                        {error}
                    </div>
                )}
                
                <div className="space-y-1 block">
                    <label className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider ml-1">Email</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--color-muted-foreground)] opacity-60">
                            <Mail size={18} />
                        </div>
                        <input
                            type="email"
                            required
                            className="w-full pl-10 pr-4 py-3 bg-[var(--color-background)] border-none rounded-xl text-[var(--color-foreground)] focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all text-sm font-medium outline-none placeholder-[var(--color-muted-foreground)]/50 shadow-sm"
                            placeholder="ваша@почта.ру"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-1 block">
                    <label className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider ml-1">Пароль</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--color-muted-foreground)] opacity-60">
                            <Lock size={18} />
                        </div>
                        <input
                            type="password"
                            required
                            minLength={6}
                            className="w-full pl-10 pr-4 py-3 bg-[var(--color-background)] border-none rounded-xl text-[var(--color-foreground)] focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all text-sm font-medium outline-none placeholder-[var(--color-muted-foreground)]/50 shadow-sm"
                            placeholder="Минимум 6 символов"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-center pt-2">
                    {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? (
                        <Turnstile
                            ref={turnstileRef}
                            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                            onSuccess={(token) => setTurnstileToken(token)}
                            options={{ theme: 'auto', size: 'normal' }}
                            scriptOptions={{ appendTo: "head", async: true, defer: true }}
                        />
                    ) : (
                        <div className="text-xs text-orange-500 font-bold bg-orange-50 p-2 rounded-lg">
                            Предупреждение: Ключ Turnstile не настроен
                        </div>
                    )}
                </div>

                <Button
                    variant="primary"
                    size="lg"
                    type="submit"
                    isLoading={isLoading}
                    className="w-full text-base h-12 shadow-md mt-4"
                >
                    Зарегистрироваться
                </Button>
            </form>

            <div className="mt-8 text-center text-sm font-medium text-[var(--color-muted-foreground)]">
                Уже есть аккаунт? <Link href="/auth/signin" className="text-[var(--color-primary)] hover:underline transition-all">Войти</Link>
            </div>
            
            <div className="mt-6 text-center text-xs text-[var(--color-muted-foreground)] opacity-70">
                Зарегистрируясь, вы соглашаетесь с <Link href="/offer" className="underline hover:text-[var(--color-foreground)] transition-colors">офертой</Link> и политикой сервиса.
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-primary)]/5 blur-[120px] rounded-full pointer-events-none" />

            <Suspense fallback={<div className="text-[var(--color-muted-foreground)] font-bold animate-pulse">Загрузка...</div>}>
                <RegisterContent />
            </Suspense>
        </div>
    );
}
