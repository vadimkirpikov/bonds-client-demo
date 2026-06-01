'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, ShieldCheck, Sparkles, CalendarClock, TrendingDown } from 'lucide-react';
import { SubscriptionModal } from '@/components/ui/SubscriptionModal';
import { MeResponse } from '@/lib/api';

const getDaysAgo = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
};

const getStartOfMonth = () => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
};

const FILTERS = [
    {
        name: "Высокодоходные",
        params: "?CouponPrcFrom=21&CreditRatingTo=BBB",
        icon: <Flame size={18} />,
        color: "text-orange-500"
    },
    {
        name: "Надежные",
        params: "?CreditRatingFrom=AA-&CouponPrcFrom=12",
        icon: <ShieldCheck size={18} />,
        color: "text-emerald-500"
    },
    {
        name: "Новинки (30 дн.)",
        params: `?PlacementDateFrom=${getDaysAgo(30)}`,
        icon: <Sparkles size={18} />,
        color: "text-blue-500"
    },
    {
        name: "Новинки месяца",
        params: `?PlacementDateFrom=${getStartOfMonth()}`,
        icon: <CalendarClock size={18} />,
        color: "text-pink-500"
    },
    {
        name: "Около номинала",
        params: "?PriceFrom=99&PriceTo=101&FloatingCouponFlag=1&CouponQuantityPerYear=12&CouponPrcFrom=17",
        icon: <TrendingDown size={18} />,
        color: "text-purple-500"
    },
];

interface QuickFiltersProps {
    userProfile: MeResponse | null;
}

export const QuickFilters = ({ userProfile }: QuickFiltersProps) => {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);

    const isSubscriber = userProfile?.hasActiveSubscription || false;
    const isTrial = userProfile?.isTrialPeriod || false;
    const freeRequests = userProfile?.freeFilteredRequestsBalance || 0;
    const canUseFilters = isSubscriber || isTrial || freeRequests > 0;
    const isLoggedIn = !!userProfile;

    const handleClick = (params: string) => {
        if (!canUseFilters) {
            setShowModal(true);
            return;
        }
        router.push(`/bonds${params}`);
    };

    return (
        <>
            <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {FILTERS.map((f) => (
                    <button
                        key={f.name}
                        onClick={() => handleClick(f.params)}
                        className="
                            h-[52px] px-3 flex items-center gap-3
                            rounded-2xl
                            bg-[var(--color-card)]
                            transition-all duration-300 hover:-translate-y-0.5
                            group w-full backdrop-blur-sm
                        "
                    >
                        <div className={`
                            p-2 rounded-xl shrink-0
                            bg-[var(--color-muted)]/50
                            ${f.color}
                            transition-all duration-300 group-hover:scale-110
                        `}>
                            {f.icon}
                        </div>

                        <span className="
                            text-sm font-semibold
                            text-[var(--color-muted-foreground)]
                            group-hover:text-[var(--color-foreground)]
                            transition-colors truncate
                        ">
                            {f.name}
                        </span>
                    </button>
                ))}
            </div>

            <SubscriptionModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                isLoggedIn={isLoggedIn}
            />
        </>
    );
};