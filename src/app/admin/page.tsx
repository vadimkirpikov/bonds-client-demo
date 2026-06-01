import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getServerApi } from '@/lib/server-api'; // Используем серверную фабрику
import { JobApi, Job } from '@/lib/api';
import DashboardClient from "@/components/admin/dashboard/DashboardClient";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/auth/signin');
    }

    const isAdmin = session.user?.role === 'admin';

    let initialJobs: Job[] = [];
    try {
        const api = await getServerApi(JobApi);
        const data = isAdmin
            ? await api.apiV1JobsGet({ page: 1, pageSize: 20 })
            : await api.apiV1JobsMyGet({ page: 1, pageSize: 20 });

        if (Array.isArray(data)) {
            initialJobs = data;
        }
    } catch (e) {
        console.error("Server jobs fetch error:", e);
    }

    return (
        <DashboardClient
            session={session}
            initialJobs={initialJobs}
        />
    );
}