'use client';

import { ShieldAlert, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { signOut } from 'next-auth/react';

export function SessionExpiredWall() {
    const handleReLogin = async () => {
        await signOut({ callbackUrl: '/auth/signin' });
    };

    return (
        <div className="relative w-full h-full min-h-[500px] flex items-center justify-center rounded-[2.5rem] overflow-hidden">
            
            <div className="absolute inset-0 bg-slate-50/80 dark:bg-zinc-900/50/80 dark:bg-zinc-950/80 backdrop-blur-md z-0"></div>

            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-rose-500/10 blur-[80px] rounded-full z-0 pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-md mx-auto p-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-white dark:bg-zinc-950 dark:bg-zinc-900 rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-rose-900/5 ring-1 ring-slate-900/5 dark:ring-white/5 text-center flex flex-col items-center">

                    <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-rose-100 dark:ring-rose-500/20">
                        <ShieldAlert size={36} strokeWidth={2.5} />
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                        Сессия истекла
                    </h3>

                    <p className="text-slate-500 dark:text-zinc-500 dark:text-zinc-400 mb-8 text-sm leading-relaxed font-medium">
                        В целях безопасности время вашей сессии подошло к концу. Авторизуйтесь заново, чтобы восстановить доступ к личному кабинету и PRO-функциям.
                    </p>

                    <Button
                        variant="primary"
                        onClick={handleReLogin}
                        className="w-full h-14 text-base shadow-glow-primary hover:shadow-glow-primary-hover"
                    >
                        <LogIn className="mr-2" size={20} />
                        Войти повторно
                    </Button>
                </div>
            </div>
        </div>
    );
}