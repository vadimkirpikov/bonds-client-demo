'use client';

import { useEffect, useState, useRef } from 'react';
import { ShieldAlert } from 'lucide-react';

declare global {
    interface Window {
        UTInventoryCore: any;
    }
}

interface AdLookBannerProps {
    idSuffix?: string;
}

export default function AdLookBanner({ idSuffix = 'main' }: AdLookBannerProps) {
    const[isMobile, setIsMobile] = useState<boolean | null>(null);
    const [adBlocked, setAdBlocked] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkScreen = () => setIsMobile(window.innerWidth < 768);
        checkScreen();
        window.addEventListener('resize', checkScreen);
        return () => window.removeEventListener('resize', checkScreen);
    },[]);

    useEffect(() => {
        if (isMobile === null) return;

        const host = isMobile ? 5901 : 5900;
        const width = isMobile ? 320 : 1000;
        const height = isMobile ? 100 : 120;
        const containerId = `adlk-banner-${isMobile ? 'mobile' : 'desktop'}-${idSuffix}`;

        let initAttempts = 0;

        const initBanner = () => {
            if (window.UTInventoryCore) {
                new window.UTInventoryCore({
                    type: "banner",
                    host: host,
                    infinityBannerTimer: 10,
                    playMode: "autoplay",
                    container: containerId,
                    transparentSkeleton: false,
                    width: width,
                    height: height,
                    collapse: "open-creativeView",
                    mobile: { width: 300, height: 250 }
                });
            } else if (initAttempts < 30) {
                initAttempts++;
                setTimeout(initBanner, 100);
            }
        };

        initBanner();

        const checkAdblock = setInterval(() => {
            const scriptBlocked = typeof window.UTInventoryCore === 'undefined' && initAttempts >= 30;
            const el = document.getElementById(containerId);
            const isHidden = el ? window.getComputedStyle(el).display === 'none' : false;

            if (scriptBlocked || isHidden) {
                setAdBlocked(true);
                clearInterval(checkAdblock);
                window.dispatchEvent(new Event('adblock-detected'));
            }
        }, 1000);

        setTimeout(() => clearInterval(checkAdblock), 5000);

        return () => clearInterval(checkAdblock);
    },[isMobile, idSuffix]);

    if (isMobile === null) return <div className="min-h-[120px] w-full animate-pulse bg-slate-50 rounded-[2rem] my-4" />;

    if (adBlocked) {
        return (
            <div className="w-full flex justify-center relative z-10 my-4">
                <div className="bg-rose-50 border border-rose-100 rounded-[2rem] p-6 text-center w-full max-w-[1040px] flex flex-col items-center justify-center min-h-[120px]">
                    <ShieldAlert size={24} className="text-rose-400 mb-2" />
                    <p className="text-sm font-bold text-slate-700">Реклама заблокирована</p>
                    <p className="text-xs text-slate-500 mt-1">Пожалуйста, добавьте сайт в исключения блокировщика.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex justify-center relative z-10 group my-4">
            <div
                ref={containerRef}
                className="relative overflow-hidden rounded-[2rem] bg-white border border-slate-200/60 shadow-sm p-2 transition-all hover:shadow-md flex items-center justify-center min-h-[120px] w-full max-w-[1040px]"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-50 pointer-events-none" />
                <div className="relative z-10 flex items-center justify-center w-full min-h-[100px]">
          <span className="absolute text-[10px] text-slate-400 font-bold uppercase tracking-widest -top-1 md:-top-3 bg-white px-3 py-0.5 rounded-full border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-sm pointer-events-none">
            Реклама
          </span>
                    <div id={`adlk-banner-${isMobile ? 'mobile' : 'desktop'}-${idSuffix}`} className="flex justify-center w-full" />
                </div>
            </div>
        </div>
    );
}
