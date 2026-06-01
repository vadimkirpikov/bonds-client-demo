'use client';

import { Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function PendingPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4">
            <div className="bg-[var(--color-card)] rounded-[2rem] p-8 sm:p-12 max-w-md w-full text-center shadow-2xl flex flex-col items-center animate-fade-in borderless">
                <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mb-8 relative">
                    <Clock className="text-amber-500 w-12 h-12" />
                    <Loader2 className="absolute top-0 left-0 w-24 h-24 text-amber-500/30 animate-spin" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-foreground)] mb-4 tracking-tight">Платёж обрабатывается</h1>
                <p className="text-[var(--color-muted-foreground)] mb-10 text-lg">
                    Мы ожидаем подтверждения от банка. Как только платеж пройдет, ваша подписка будет активирована автоматически.
                </p>
                <Button 
                    variant="primary" 
                    size="lg" 
                    className="w-full h-14 text-lg font-bold shadow-md rounded-2xl bg-amber-500 hover:bg-amber-600 text-white borderless"
                    onClick={() => router.push('/dashboard')}
                >
                    Вернуться в панель управления
                </Button>
            </div>
        </div>
    );
}
