'use client';

import { Rocket, Sparkles, Wrench } from 'lucide-react';

export function MaintenanceView() {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in zoom-in-95 duration-700 min-h-[50vh]">
            <div className="relative mb-10">
                <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full w-40 h-40 mx-auto -z-10 animate-pulse"></div>
                <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto shadow-inner relative overflow-hidden">
                    <Rocket size={48} className="text-primary relative z-10 animate-bounce-slow" />
                    <Sparkles size={20} className="text-amber-400 absolute top-2 right-2 animate-pulse" />
                </div>
            </div>

            <h2 className="text-3xl md:text-5xl font-black text-foreground mb-6 tracking-tight [text-wrap:balance]">
                Мы готовим нечто <span className="text-primary">грандиозное</span>
            </h2>

            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
                Прямо сейчас ведутся технические работы.<br/>
                Мы делаем сервис еще быстрее, точнее и удобнее!
            </p>

            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-slate-50 dark:bg-zinc-900 shadow-sm text-sm font-medium text-slate-600 dark:text-zinc-400">
                <Wrench size={16} className="text-primary animate-spin-slow" />
                Скоро вернемся с новыми фичами
            </div>
        </div>
    );
}