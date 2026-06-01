import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bonds-lab.ru';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/manage/', '/api/'], // Закрываем админку от индексации
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}