'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Lock, Sparkles } from 'lucide-react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    isLoggedIn: boolean;
}

export const SubscriptionModal = ({ isOpen, onClose, isLoggedIn }: SubscriptionModalProps) => {

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-100 p-4 animate-fade-in">
            <div className="bg-card w-full max-w-md rounded-3xl shadow-2xl relative overflow-hidden">
                
                <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-primary/10 to-transparent pointer-events-none" />

                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors z-10 text-muted-foreground">
                    <X size={20} />
                </button>

                <div className="p-8 text-center pt-12">
                    <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                        {isLoggedIn ? <Sparkles size={32} className="text-primary" /> : <Lock size={32} className="text-primary" />}
                    </div>

                    {!isLoggedIn ? (
                        <>
                            <h2 className="text-2xl font-bold text-foreground mb-3">
                                Раскройте потенциал рынка
                            </h2>
                            <p className="text-muted-foreground mb-8 leading-relaxed text-sm">
                                Находите самые доходные и недооцененные облигации с помощью профессиональных фильтров. Авторизуйтесь за пару секунд, чтобы получить <b>бесплатный стартовый доступ</b> к глубокой аналитике.
                            </p>
                            <Button
                                size="lg"
                                className="w-full shadow-glow-primary hover:shadow-glow-primary-hover"
                                onClick={() => signIn('google')}
                            >
                                Продолжить с Google
                            </Button>
                        </>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold text-foreground mb-3">
                                Время перейти на PRO 🚀
                            </h2>
                            <p className="text-muted-foreground mb-8 leading-relaxed text-sm">
                                Вы использовали стартовый пакет поисков. Снимите ограничения, чтобы получить <b>безлимитный доступ</b> к продвинутым фильтрам, метрикам риска и выгрузке данных. Инвестируйте на основе точных цифр!
                            </p>
                            <Link href="/dashboard" onClick={onClose} className="block w-full">
                                <Button size="lg" className="w-full shadow-glow-primary hover:shadow-glow-primary-hover">
                                    Открыть все возможности
                                </Button>
                            </Link>
                        </>
                    )}

                    <div className="mt-6 text-xs text-slate-400">
                        Продолжая, вы соглашаетесь с <Link href="/offer" className="underline hover:text-slate-600 transition-colors" onClick={onClose}>офертой</Link>.
                    </div>
                </div>
            </div>
        </div>
    );
};