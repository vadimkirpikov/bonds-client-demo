'use client';

import { useState, useEffect } from 'react';
import { toggleInteraction, getBondStats, BondStats } from '@/actions/bond-actions';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/components/ui/Button';

interface VotingBlockProps {
    bondId: string;
    initialStats?: BondStats; // Сделали опциональным
}

export const VotingBlock = ({ bondId, initialStats }: VotingBlockProps) => {
    const [stats, setStats] = useState({
        likes: initialStats?.likes || 0,
        dislikes: initialStats?.dislikes || 0
    });

    const [userVote, setUserVote] = useState<'LIKE' | 'DISLIKE' | null>(
        initialStats?.userVote || null
    );

    useEffect(() => {
        if (!initialStats) {
            getBondStats(bondId).then(data => {
                setStats({ likes: data.likes, dislikes: data.dislikes });
                setUserVote(data.userVote);
            });
        }
    }, [bondId, initialStats]);

    const handleVote = async (type: 'LIKE' | 'DISLIKE') => {
        const isRemove = userVote === type;
        const isSwap = userVote && userVote !== type;

        setStats(prev => ({
            likes:
                prev.likes +
                (type === 'LIKE' ? (isRemove ? -1 : 1) : 0) -
                (isSwap && userVote === 'LIKE' ? 1 : 0),
            dislikes:
                prev.dislikes +
                (type === 'DISLIKE' ? (isRemove ? -1 : 1) : 0) -
                (isSwap && userVote === 'DISLIKE' ? 1 : 0)
        }));

        setUserVote(isRemove ? null : type);

        await toggleInteraction(bondId, type);
    };

    return (
        <div className="flex items-center gap-1.5">
            <button
                onClick={() => handleVote('LIKE')}
                className={cn(
                    "py-1.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1 text-sm font-bold",
                    userVote === 'LIKE'
                        ? "bg-primary text-white shadow-glow-primary hover:bg-primary/90"
                        : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:text-primary hover:bg-primary/10"
                )}
            >
                <ThumbsUp
                    size={16}
                    className={userVote === 'LIKE' ? 'fill-current' : ''}
                />
                <span className="min-w-[2ch] text-center leading-none mt-[2px]">{stats.likes}</span>
            </button>

            <button
                onClick={() => handleVote('DISLIKE')}
                className={cn(
                    "py-1.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1 text-sm font-bold",
                    userVote === 'DISLIKE'
                        ? "bg-danger text-white shadow-glow-danger hover:bg-danger/90"
                        : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:text-danger hover:bg-danger/10"
                )}
            >
                <ThumbsDown
                    size={16}
                    className={userVote === 'DISLIKE' ? 'fill-current' : ''}
                />
                <span className="min-w-[2ch] text-center leading-none mt-[2px]">{stats.dislikes}</span>
            </button>
        </div>
    );
};