'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';

function RegisterRedirect() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const ref = searchParams.get('ref');

        if (ref) {
            const isDev = process.env.NEXT_PUBLIC_API_URL !== process.env.NEXT_PUBLIC_SERVER_URL;
            const cookieOptions: Cookies.CookieAttributes = {
                path: '/',
                expires: 30
            };

            if (isDev) {
                cookieOptions.secure = false;
                cookieOptions.sameSite = 'lax';
            } else {
                cookieOptions.domain = '.bonds-lab.ru';
                cookieOptions.secure = true;
                cookieOptions.sameSite = 'none';
            }

            Cookies.set('referralCode', ref, cookieOptions);
        }

        router.replace('/');
    }, [router, searchParams]);

    return (
        <div className="min-h-screen bg-background" />
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <RegisterRedirect />
        </Suspense>
    );
}