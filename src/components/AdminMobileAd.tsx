'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { useSession } from 'next-auth/react';
import { AuthApi } from '@/lib/api';
import { getClientApi } from '@/lib/client-api';

export function AdminFloorAd() { // Переименовали для логичности
    const { data: session } = useSession();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkRights = async () => {
            if (!session) return;

            try {
                const accessToken = (session as any)?.accessToken;
                const api = getClientApi(AuthApi, accessToken);
                const me = await api.apiV1AuthMeGet();

                if (me.role?.toLowerCase() === 'admin') {
                    setIsAdmin(true);
                }
            } catch (e) {
                console.error("Failed to check admin status for ad", e);
            }
        };

        checkRights();
    }, [session]);

    if (!isAdmin) return null;

    return (
        <>

            <Script id="yandex-rtb-admin-floor" strategy="lazyOnload">
                {`
                    window.yaContextCb = window.yaContextCb || [];
                    window.yaContextCb.push(() => {
                        if (window.Ya && window.Ya.Context && window.Ya.Context.AdvManager) {
                            
                            window.Ya.Context.AdvManager.render({
                                "blockId": "R-A-17423562-2",
                                "type": "floorAd",
                                "platform": "touch"
                            });

                            window.Ya.Context.AdvManager.render({
                                "blockId": "R-A-17423562-3",
                                "type": "floorAd",
                                "platform": "desktop"
                            });

                        }
                    });
                `}
            </Script>
        </>
    );
}