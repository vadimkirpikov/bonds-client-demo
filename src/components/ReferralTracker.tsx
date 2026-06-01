'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';

export default function ReferralTracker() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const ref = searchParams.get('ref');

        if (ref) {
            const isDev = process.env.NEXT_PUBLIC_API_URL !== process.env.NEXT_PUBLIC_SERVER_URL;
            const cookieOptions: Cookies.CookieAttributes = {
                path: '/',
                expires: 3
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
            console.log("Реферальный код сохранен:", ref, isDev ? "(dev)" : "(prod)");
        }
    }, [searchParams]);

    return null; // Компонент невидимый, ничего не рендерит
}