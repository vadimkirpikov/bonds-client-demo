import { MetadataRoute } from 'next';
import { BLOG_POSTS } from '@/utils/mock-data';
import { BondApi, Configuration } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bonds-lab.ru';

    const routes = [
        '',
        '/bonds',
        '/glossary',
        '/offer',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1.0 : route === '/bonds' ? 0.9 : 0.8,
    }));

    const posts = (BLOG_POSTS || []).map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    let bondsRoutes: MetadataRoute.Sitemap = [];

    try {
        const config = new Configuration({
            basePath: process.env.NEXT_PUBLIC_API_URL,
            headers: {
                Authorization: `Bearer ${process.env.GUEST_TOKEN}`,
            },
        });

        const api = new BondApi(config);

        const pageSize = 500;
        let page = 1;
        let hasMore = true;

        const allBondIds = new Set<string>();

        while (hasMore) {
            const response = await api.apiV1BondsGet({
                pageSize,
                page,
            });

            const bonds = response.bonds || [];

            for (const bondItem of bonds) {
                const id = bondItem.bondResponse?.id;
                if (id) {
                    allBondIds.add(String(id));
                }
            }

            if (bonds.length < pageSize) {
                hasMore = false;
            } else {
                page++;
            }
        }

        bondsRoutes = Array.from(allBondIds).map((id) => ({
            url: `${baseUrl}/bonds/${id}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));
    } catch (e) {
        console.error('Failed to fetch bonds for sitemap', e);
    }

    return [...routes, ...posts, ...bondsRoutes];
}