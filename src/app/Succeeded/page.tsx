'use client';

import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function SucceededPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4">
            <div className="bg-[var(--color-card)] rounded-[2rem] p-8 sm:p-12 max-w-md w-full text-center shadow-2xl flex flex-col items-center animate-fade-in borderless">
                <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-8">
                    <CheckCircle className="text-emerald-500 w-12 h-12" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-foreground)] mb-4 tracking-tight">Оплата успешна!</h1>
                <p className="text-[var(--color-muted-foreground)] mb-10 text-lg">
                    Средства зачислены, подписка активирована. Спасибо, что остаетесь с нами!
                </p>
                <Button 
                    variant="primary" 
                    size="lg" 
                    className="w-full h-14 text-lg font-bold shadow-md rounded-2xl"
                    onClick={() => router.push('/dashboard')}
                >
                    Вернуться в панель управления
                </Button>
            </div>
        </div>
    );
}
