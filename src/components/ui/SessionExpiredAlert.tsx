'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, LogIn, X } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Button } from './Button';

export const triggerSessionExpired = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('session-expired'));
    }
};

export function SessionExpiredTrigger() {
    useEffect(() => {
        triggerSessionExpired();
    }, []);
    return null;
}

export function SessionExpiredAlert() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleExpired = () => setIsVisible(true);
        window.addEventListener('session-expired', handleExpired);
        return () => window.removeEventListener('session-expired', handleExpired);
    }, []);

    if (!isVisible) return null;

    const handleReLogin = async () => {
        await signOut({ callbackUrl: '/auth/signin' });
    };

    return (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-[380px] z-[9999] animate-in slide-in-from-bottom-8 fade-in duration-500">
            <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] ring-1 ring-slate-200/50 dark:ring-zinc-700/50 dark:ring-white/10 p-5 relative overflow-hidden transition-colors">

                
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-orange-400"></div>

                <div className="flex items-start gap-4 mb-4 mt-1">
                    <div className="bg-rose-50 dark:bg-rose-500/10 p-2.5 rounded-full text-rose-500 shrink-0 shadow-inner transition-colors">
                        <AlertTriangle size={22} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 pr-6">
                        <h4 className="text-slate-900 dark:text-white font-bold text-base mb-1 tracking-tight transition-colors">
                            Сессия устарела
                        </h4>
                        <p className="text-slate-500 dark:text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed font-medium transition-colors">
                            В целях безопасности мы завершили ваш сеанс. Войдите снова, чтобы пользоваться PRO-фильтрами.
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleReLogin}
                        className="flex-1 h-10 text-sm shadow-glow-primary hover:shadow-glow-primary-hover"
                    >
                        <LogIn size={16} className="mr-2" />
                        Войти
                    </Button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="px-4 h-10 text-sm font-bold bg-slate-100 dark:bg-zinc-800 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-400 dark:text-zinc-300 rounded-xl transition-colors"
                    >
                        Позже
                    </button>
                </div>

                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-4 right-4 p-1 text-slate-400 dark:text-zinc-600 hover:text-slate-600 dark:hover:text-zinc-400 dark:text-zinc-400 dark:hover:text-white transition-colors bg-transparent rounded-full"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}