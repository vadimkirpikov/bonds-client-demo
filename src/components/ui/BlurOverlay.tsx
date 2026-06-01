'use client';

import { Button } from '@/components/ui/Button';
import { Lock } from 'lucide-react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

interface BlurOverlayProps {
    isLoggedIn: boolean;
}

export const BlurOverlay = ({ isLoggedIn }: BlurOverlayProps) => {
    return (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center
                        backdrop-blur-[8px] bg-white/50 dark:bg-black/50 rounded-[2rem] p-4 select-none">
            <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-2xl border-none flex flex-col items-center text-center max-w-sm">

                <div className="bg-primary/10 dark:bg-primary/20 p-5 rounded-full mb-5 shadow-inner">
                    <Lock className="text-primary dark:text-primary/80" size={32} />
                </div>

                <h3 className="text-slate-900 dark:text-slate-100 font-black text-2xl mb-3 tracking-tight">
                    {isLoggedIn ? 'Требуется подписка' : 'Войдите в систему'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-300 mb-8 font-medium leading-relaxed">
                    {isLoggedIn
                        ? 'Полные финансовые показатели эмитента доступны только подписчикам PRO.'
                        : 'Авторизуйтесь, чтобы получить доступ к глубокой финансовой аналитике.'}
                </p>

                {isLoggedIn ? (
                    <Link href="/dashboard" className="w-full">
                        <Button variant="primary" className="w-full h-12 text-base">
                            Открыть доступ
                        </Button>
                    </Link>
                ) : (
                    <Button variant="primary" className="w-full h-12 text-base" onClick={() => signIn('google')}>
                        Продолжить с Google
                    </Button>
                )}
            </div>
        </div>
    );
};