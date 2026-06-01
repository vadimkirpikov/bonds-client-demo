'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return;

        if (status === 'unauthenticated') {
            router.replace('/auth/signin');
        }
        else if (session?.user?.role?.toLowerCase() !== 'admin') {
            router.replace('/');
        }
    }, [status, session, router]);

    if (status === 'loading' || status === 'unauthenticated' || session?.user?.role?.toLowerCase() !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-primary" size={48} />
                    <p className="text-zinc-500 text-sm">Проверка прав доступа...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}