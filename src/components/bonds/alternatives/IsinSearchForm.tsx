'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export const IsinSearchForm = ({ initialIsin }: { initialIsin: string }) => {
    const [val, setVal] = useState(initialIsin);
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = val.trim().toUpperCase();
        if (trimmed) {
            router.push(`?isin=${trimmed}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-md sm:flex-row flex-col">
            <input
                type="text"
                maxLength={12}
                placeholder="Введите ISIN (12 символов)"
                value={val}
                onChange={(e) => setVal(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-3 rounded-2xl bg-[var(--color-card-s)] focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm shadow-sm text-[var(--color-foreground)]"
            />
            <button
                type="submit"
                disabled={!val.trim()}
                className="bg-primary text-white px-6 py-3 rounded-2xl font-bold shadow-glow-primary hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none borderless"
            >
                <Search size={18} /> Искать
            </button>
        </form>
    );
};