import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: '50mb',
        },
    },
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'invest-brands.cdn-tinkoff.ru',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'v3.material-tailwind.com',
                pathname: '/**',
            },
        ],
    },
    typescript: {
        ignoreBuildErrors: true,
    },

    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin'
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval'
            https://yandex.ru
            https://mc.yandex.ru
            https://mc.yandex.com
            https://sdk.adlook.tech
            https://*.adlook.tech
            https://challenges.cloudflare.com
            https://yastatic.net;
        style-src 'self' 'unsafe-inline';
        img-src * blob: data:;
        font-src 'self' https://yastatic.net;
        media-src 'self' data: blob: https://strm.yandex.ru https://*.yandex.ru https://*.yandex.net;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        connect-src 'self'
            https://owa.bonds-lab.ru
            https://backup-glacier-equation.ngrok-free.dev
            https://yandex.ru
            https://*.yandex.ru
            https://yandex.com
            https://mc.yandex.ru wss://mc.yandex.ru
            https://mc.yandex.com wss://mc.yandex.com
            https://*.adlook.tech https://sdk.adlook.tech
            http://localhost:8080
            https://challenges.cloudflare.com
            https://log.strm.yandex.ru
            https://strm.yandex.ru;
        frame-src 'self' https: http: https://*.adlook.tech https://challenges.cloudflare.com;
        child-src 'self' https: http: https://*.adlook.tech https://challenges.cloudflare.com;
    `.replace(/\s{2,}/g, ' ').trim()
                    }
                ]
            }
        ];
    }
};

export default nextConfig;