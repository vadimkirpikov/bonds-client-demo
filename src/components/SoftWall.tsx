'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { Button } from './ui/Button';

export default function SoftWall({ children }: { children: React.ReactNode }) {
    const [isBlocked, setIsBlocked] = useState(false);

    useEffect(() => {
        const handleAdBlock = () => setIsBlocked(true);

        window.addEventListener('adblock-detected', handleAdBlock);

        return () => window.removeEventListener('adblock-detected', handleAdBlock);
    },[]);

    if (!isBlocked) {
        return <>{children}</>;
    }

    return (
        <div className="relative group rounded-3xl overflow-hidden">
            
            <div className="blur-md select-none pointer-events-none opacity-40 transition-all duration-500">
                {children}
            </div>

            
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-white/40 backdrop-blur-sm">
                <div className="bg-white p-8 rounded-[2rem] shadow-2xl border border-slate-200 max-w-md w-full animate-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldAlert size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Доступ ограничен</h3>
                    <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                        Финансовые показатели скрыты. <br/>
                        Мы анализируем отчетности бесплатно, но сервера стоят денег. <b>Отключите AdBlock</b>, чтобы увидеть данные.
                    </p>
                    <Button
                        onClick={() => window.location.reload()}
                        className="w-full h-12 text-base font-bold shadow-glow-primary"
                    >
                        Я отключил(а), обновить
                    </Button>
                </div>
            </div>
        </div>
    );
}
