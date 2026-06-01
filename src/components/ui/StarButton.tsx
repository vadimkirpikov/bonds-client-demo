'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';
import { toggleFavorite } from '@/actions/bond-actions';
import { cn } from '@/components/ui/Button';
import { useSession } from 'next-auth/react';
import { SubscriptionModal } from './SubscriptionModal';

interface StarButtonProps {
    bondId: string;
    isFavoriteInitial: boolean;
}

export const StarButton = ({ bondId, isFavoriteInitial }: StarButtonProps) => {
    const { data: session } = useSession();
    const [isFav, setIsFav] = useState(isFavoriteInitial);
    const [isLoading, setIsLoading] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session) {
            setShowAuthModal(true);
            return;
        }

        setIsLoading(true);
        const newState = !isFav;
        setIsFav(newState); // Optimistic update

        try {
            await toggleFavorite(bondId);
        } catch (error) {
            console.error(error);
            setIsFav(!newState); // Rollback
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={handleToggle}
                disabled={isLoading}
                className="p-2 hover:bg-zinc-800 rounded-full transition-colors group relative z-10"
                title={isFav ? "Убрать из избранного" : "В избранное"}
            >
                <Star
                    size={20}
                    className={cn(
                        "transition-all",
                        isFav ? "fill-yellow-500 text-yellow-500" : "text-zinc-500 group-hover:text-yellow-500"
                    )}
                />
            </button>
            <SubscriptionModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                isLoggedIn={false}
            />
        </>
    );
};