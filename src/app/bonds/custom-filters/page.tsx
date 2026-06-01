import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AuthApi } from '@/lib/api';
import { getServerApi } from '@/lib/server-api';
import { redirect } from 'next/navigation';
import CustomFiltersDnD from '@/components/bonds/filters/CustomFiltersDnD';

export default async function CustomFiltersPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/bonds');
    }

    let meData = null;
    try {
        const authApi = await getServerApi(AuthApi);
        meData = await authApi.apiV1AuthMeGet();
    } catch (e) {
        console.error('Failed to fetch user data for custom filters page:', e);
        redirect('/bonds');
    }

    if (!meData?.hasActiveSubscription) {
        redirect('/bonds');
    }

    const initialSelected = meData.customFilters || [];

    return <CustomFiltersDnD initialSelected={initialSelected} />;
}
