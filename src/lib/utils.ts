import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const getCreditRatingColor = (rating: string | undefined | null) => {
    if (!rating || rating === '-') return "text-[var(--color-foreground)]";
    if (rating.includes('AAA')) return "text-emerald-500 bg-emerald-500/10";
    if (rating.includes('AA')) return "text-green-500 bg-green-500/10";
    if (rating.includes('A') && !rating.includes('B') && !rating.includes('C')) return "text-lime-500 bg-lime-500/10";
    if (rating.includes('BBB')) return "text-yellow-500 bg-yellow-500/10";
    if (rating.includes('BB')) return "text-amber-500 bg-amber-500/10";
    if (rating.includes('B')) return "text-orange-500 bg-orange-500/10";
    if (rating.includes('C')) return "text-red-500 bg-red-500/10";
    if (rating.includes('D')) return "text-red-700 bg-red-700/10";
    return "text-[var(--color-foreground)] bg-[var(--color-muted)]/50";
};

export const getRateTypeName = (type: number | undefined | null) => {
    if (type === 1) return 'КС';
    if (type === 2) return 'RUONIA';
    if (type === 0) return 'Другое';
    return 'КС';
};