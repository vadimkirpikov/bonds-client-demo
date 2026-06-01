import { Configuration } from '@/lib/api';

export function getClientApi<T>(ApiCtor: new (cfg: Configuration) => T, token?: string): T {
    const config = new Configuration({
        basePath: process.env.NEXT_PUBLIC_API_URL,
        middleware: [],
        credentials: "include",
        accessToken: token,
    });
    return new ApiCtor(config);
}
