import { PublicOfferingsApi, AuthApi, Configuration } from '@/lib/api';
import { getServerApi } from '@/lib/server-api';
import { notFound } from 'next/navigation';
import { BackButton } from '@/components/ui/BackButton';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

import { PlacementHeader } from '@/components/placements/details/PlacementHeader';
import { PlacementParameters } from '@/components/placements/details/PlacementParameters';
import { BondFinances } from '@/components/bonds/details/BondFinances';
import { SessionExpiredTrigger } from '@/components/ui/SessionExpiredAlert';
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    try {
        const session = await getServerSession(authOptions);
        let api;
        
        if (session) {
            api = await getServerApi(PublicOfferingsApi);
        } else {
            const config = new Configuration({
                basePath: process.env.NEXT_PUBLIC_SERVER_URL,
                headers: { 'Authorization': `Bearer ${process.env.GUEST_TOKEN}` }
            });
            api = new PublicOfferingsApi(config);
        }

        const placement = await api.apiPublicOfferingsIdGet({ id });
        const brand = placement.brand;

        if (!placement) return { title: 'Размещение не найдено' };

        const brandName = brand?.name || placement.name;
        const title = `Размещение ${placement.name} | Bonds-Lab`;
        const description = `Первичное размещение ${placement.name}. Эмитент ${brandName}.`;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                type: 'website',
            }
        };
    } catch {
        return { 
            title: `Размещение | Bonds-Lab`,
            description: 'Информация о первичном размещении.'
        };
    }
}

export default async function PlacementDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    let meData = null;
    let authExpired = false;
    let useGuest = !session;

    if (session) {
        try {
            const authApi = await getServerApi(AuthApi);
            meData = await authApi.apiV1AuthMeGet();
        } catch (e: any) {
            console.error("Error fetching me data in details", e);
            if (e.status === 401 || e.status === 403 || e.response?.status === 401 || e.response?.status === 403) {
                authExpired = true;
                useGuest = true;
            }
        }
    }

    const isSubscriber = meData?.hasActiveSubscription || false;
    const isAdmin = meData?.role === 'Admin';
    const isLoggedIn = !!session && !authExpired;

    let placement;
    try {
        let api;
        if (!useGuest) {
            api = await getServerApi(PublicOfferingsApi);
        } else {
            const config = new Configuration({
                basePath: process.env.NEXT_PUBLIC_SERVER_URL,
                headers: { 'Authorization': `Bearer ${process.env.GUEST_TOKEN}` }
            });
            api = new PublicOfferingsApi(config);
        }
        placement = await api.apiPublicOfferingsIdGet({ id });
    } catch (e) {
        console.error("Placement get failed:", e);
        notFound();
    }

    if (!placement) notFound();
    const brand = placement.brand;

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {authExpired && <SessionExpiredTrigger />}

            <div className="flex justify-between items-center mb-6">
                <BackButton fallbackHref="/placements" text="К списку размещений" />
            </div>

            <PlacementHeader placement={placement} />

            <div className="mt-4 space-y-10">
                <PlacementParameters placement={placement} />

                {brand && (
                    <BondFinances 
                        brand={brand} 
                        isSubscriber={isSubscriber} 
                        isLoggedIn={isLoggedIn} 
                        isAdmin={isAdmin} 
                        otherBonds={[]} 
                    />
                )}
            </div>
        </div>
    );
}
