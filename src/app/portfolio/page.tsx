import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PortfolioClient from '@/components/portfolio/PortfolioClient';
import { Metadata } from 'next';
import { getMaintenanceMode } from '@/actions/settings-actions';
import { MaintenanceView } from '@/components/ui/MaintenanceView';

export const metadata: Metadata = {
    title: 'Мой портфель | Bonds-Lab',
    description: 'Просмотр облигационного портфеля из Т-Инвестиций',
};

export default async function PortfolioPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/auth/signin');
    }

    const isMaintenance = await getMaintenanceMode();

    if (isMaintenance) {
        return (
            <div className="w-full max-w-6xl mx-auto px-4 py-10">
                <MaintenanceView />
            </div>
        );
    }

    return <PortfolioClient />;
}
