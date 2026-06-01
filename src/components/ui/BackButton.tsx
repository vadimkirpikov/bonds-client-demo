'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export const BackButton = ({ fallbackHref = '/bonds', text = 'К списку облигаций' }: { fallbackHref?: string, text?: string }) => {
    const router = useRouter();

    const handleBack = (e: React.MouseEvent) => {
        e.preventDefault();
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push(fallbackHref);
        }
    };

    return (
        <button
            onClick={handleBack}
            className="inline-flex items-center text-zinc-400 hover:text-primary mb-6 transition-colors group"
        >
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            {text}
        </button>
    );
};