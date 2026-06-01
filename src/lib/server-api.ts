import { Configuration } from '@/lib/api';
import { cookies } from 'next/headers';

export async function getServerApi<T>(ApiCtor: new (cfg: Configuration) => T): Promise<T> {
    const cookieStore = await cookies();
    const cookieString = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');

    const config = new Configuration({
        basePath: process.env.NEXT_PUBLIC_SERVER_URL,
        headers: {
            "Cookie": cookieString
        }
    });
    return new ApiCtor(config);
}