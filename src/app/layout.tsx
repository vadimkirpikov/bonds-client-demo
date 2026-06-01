import type {Metadata} from "next";
import Script from "next/script";
import "./globals.css";
import Link from 'next/link';
import {
    Activity,
    ArrowRight,
    Book,
    Briefcase,
    CreditCard,
    GraduationCap,
    TrendingUp,
    User,
    Wallet,
    Zap,
    Rocket
} from 'lucide-react';
import YandexMetrika from '@/components/YandexMetrika';
import AuthProvider from '@/components/AuthProvider';
import {SupportForm} from '@/components/ui/SupportForm';
import {Suspense} from 'react';
import CookieSync from "@/components/CookieSync";
import ReferralTracker from "@/components/ReferralTracker";
import {ThemeProvider} from "@/components/ThemeProvider";
import {SessionExpiredAlert} from "@/components/ui/SessionExpiredAlert";
import {ThemeToggle} from "@/components/ui/ThemeToggle";
import localFont from "next/font/local";
import {AdminFloorAd} from "@/components/AdminMobileAd";

export const metadata: Metadata = {
    metadataBase: new URL('https://bonds-lab.ru'),
    title: {
        default: "Bonds-Lab | Скринер облигаций и анализ ВДО",
        template: "%s | Bonds-Lab"
    },
    description: "Профессиональный поиск облигаций на Московской Бирже по 25+ фильтрам. Анализ отчетночти эмитентов",
    openGraph: {
        title: "Bonds-Lab | Скринер облигаций и анализ ВДО",
        description: "Профессиональный поиск облигаций на Московской Бирже по 25+ фильтрам. Анализ отчетночти эмитентов",
        url: 'https://bonds-lab.ru',
        siteName: 'Bonds-Lab',
        locale: 'ru_RU',
        type: 'website',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    icons: {
        icon: '/favicon.ico',
        apple: '/favicon.ico',
    }
};

const offers =[
    {
        id: 1,
        title: "Свой бизнес за 0 ₽",
        subtitle: "Регистрация ИП/ООО без визита в налоговую. Счет бесплатно.",
        link: "https://t-cpa.ru/39d4KZ",
        icon: <Briefcase className="text-white" size={24}/>,
        gradient: "from-blue-500 to-indigo-600",
        shadow: "shadow-blue-500/20",
        badge: "БЕСПЛАТНО"
    },
    {
        id: 2,
        title: "Карьера в Топ-Финтехе",
        subtitle: "Вакансии для амбициозных. ДМС, спорт и обучение.",
        link: "https://t-cpa.ru/vpccW",
        icon: <TrendingUp className="text-white" size={24}/>,
        gradient: "from-amber-400 to-orange-500",
        shadow: "shadow-orange-500/20",
        badge: "ГОРЯЧЕЕ"
    },
    {
        id: 3,
        title: "Платежи на сайте без боли",
        subtitle: "Начни принимать оплаты онлайн за 2 дня. Деньги завтра, чеки по 54-ФЗ — автоматом!",
        link: "https://t-cpa.ru/3efI2D",
        icon: <CreditCard className="text-white" size={24}/>,
        gradient: "from-emerald-400 to-teal-500",
        shadow: "shadow-emerald-500/20",
        badge: "ПРОДАЖИ"
    },
    {
        id: 4,
        title: "Пассивный доход",
        subtitle: "Зарабатывай до 10 000 ₽ за простые рекомендации друзьям.",
        link: "https://t-cpa.ru/3H7dwX",
        icon: <Wallet className="text-white" size={24}/>,
        gradient: "from-purple-500 to-fuchsia-600",
        shadow: "shadow-purple-500/20",
        badge: "MONEY"
    }
];
const gteesti = localFont({
    src: [
        { path: '../../public/fonts/gteestiprodisplay_thin.otf', weight: '100', style: 'normal' },
        { path: '../../public/fonts/gteestiprodisplay_light.otf', weight: '300', style: 'normal' },
        { path: '../../public/fonts/gteestiprodisplay_medium.otf', weight: '500', style: 'normal' },
        { path: '../../public/fonts/gteestiprodisplay_bold.otf', weight: '700', style: 'normal' },
        { path: '../../public/fonts/gteestiprodisplay_ultrabold.otf', weight: '900', style: 'normal' },
    ],
    variable: '--font-gteesti',
    display: 'swap',
});
const PartnerBlock = () => (
<section className="w-full max-w-6xl mx-auto px-4 py-8 mt-4 mb-4">
    <div className="flex items-center gap-2 mb-6 px-1">
        <Zap size={20} className="text-amber-500 fill-amber-500"/>
        <h2 className="text-xl font-bold text-[var(--color-foreground)] tracking-tight">
            Полезные возможности
        </h2>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {offers.map((offer) => (
            <a
                key={offer.id}
                href={offer.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-3xl bg-[var(--color-card)] shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 p-6 flex flex-col h-full borderless"
            >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500 bg-gradient-to-br ${offer.gradient}`}/>

                <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${offer.gradient} shadow-md transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}>
                        {offer.icon}
                    </div>
                    {offer.badge && (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-[var(--color-muted)] text-[var(--color-muted-foreground)] group-hover:text-[var(--color-foreground)] transition-colors">
                                {offer.badge}
                            </span>
                    )}
                </div>

                <div className="relative z-10 flex-grow">
                    <h3 className="font-bold text-lg text-[var(--color-foreground)] mb-2 leading-tight">
                        {offer.title}
                    </h3>
                    <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
                        {offer.subtitle}
                    </p>
                </div>

                <div className="mt-6 flex justify-end relative z-10">
                    <div className="p-2 rounded-xl bg-[var(--color-muted)] text-[var(--color-muted-foreground)] group-hover:text-[var(--color-foreground)] transition-all duration-300">
                        <ArrowRight size={16}/>
                    </div>
                </div>
            </a>
        ))}
    </div>
    <div className="text-center mt-6">
        <span className="text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-widest font-medium">Реклама. Информация о рекламодателе по ссылкам</span>
    </div>
</section>
);

export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="ru" suppressHydrationWarning>
        <head>
            <Script src="https://yandex.ru/ads/system/context.js" strategy="lazyOnload" />
            <title>Bonds-Lab | Скринер облигаций и анализ ВДО</title>
        </head>
        <body className={`bg-[var(--color-background)] text-[var(--color-foreground)] flex flex-col min-h-screen selection:bg-primary/20 ${gteesti.className} transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AuthProvider>
                <CookieSync/>
                <Suspense fallback={null}>
                    <ReferralTracker/>
                </Suspense>
                <Suspense fallback={null}>
                    <YandexMetrika/>
                </Suspense>

                
                <header className="sticky top-2 sm:top-4 mt-2 sm:mt-4 z-50 w-full container mx-auto px-4 mb-2 sm:mb-4">
                    <div className="h-14 sm:h-16 flex items-center justify-between bg-[var(--color-card)]/90 backdrop-blur-xl shadow-card dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] rounded-full px-3 sm:px-6">
                        <Link href="/" className="text-xl font-black text-[var(--color-foreground)] tracking-tight shrink-0 hidden sm:block"
                              aria-label="На главную">
                            Bonds<span className="text-primary">-Lab</span>
                        </Link>
                        <Link href="/" className="text-xl font-black text-[var(--color-foreground)] tracking-tight shrink-0 sm:hidden"
                              aria-label="На главную">
                            B<span className="text-primary">-L</span>
                        </Link>

                        <nav className="flex gap-3 sm:gap-6 items-center flex-1 justify-center mx-2 overflow-x-auto no-scrollbar mask-edges-sm">
                            <Link href="/bonds"
                                  className="text-[var(--color-muted-foreground)] hover:text-primary transition-colors flex gap-1.5 items-center text-sm font-semibold whitespace-nowrap" title="Облигации">
                                <Activity size={20} className="shrink-0"/>
                                <span className="hidden lg:inline">Облигации</span>
                            </Link>
                            <Link href="/alternatives"
                                  className="text-[var(--color-muted-foreground)] hover:text-primary transition-colors flex gap-1.5 items-center text-sm font-semibold whitespace-nowrap" title="Альтернативы">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M16 3h5v5"/><path d="M21 3 9 15"/><path d="M21 16v5h-5"/><path d="M21 21 3 3"/><path d="M8 8 3 13"/></svg>
                                <span className="hidden lg:inline">Альтернативы</span>
                            </Link>
                            <Link href="/portfolio"
                                  className="text-[var(--color-muted-foreground)] hover:text-primary transition-colors flex gap-1.5 items-center text-sm font-semibold whitespace-nowrap" title="Портфель">
                                <Briefcase size={20} className="shrink-0"/>
                                <span className="hidden lg:inline">Портфель</span>
                            </Link>
                            <Link href="/placements"
                                  className="text-[var(--color-muted-foreground)] hover:text-primary transition-colors flex gap-1.5 items-center text-sm font-semibold whitespace-nowrap" title="Первичные размещения">
                                <Rocket size={20} className="shrink-0"/>
                                <span className="hidden lg:inline">Размещения</span>
                            </Link>
                        </nav>

                        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                            <ThemeToggle />
                            <Link href="/dashboard"
                                  className="p-2 bg-[var(--color-muted)] hover:bg-primary/10 rounded-full transition-colors text-[var(--color-muted-foreground)] hover:text-primary borderless shrink-0"
                                  title="Личный кабинет">
                                <User size={20}/>
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="flex-grow">
                    {children}
                </main>

                <SupportForm/>
                <PartnerBlock/>

                <footer className="mt-8 py-12 bg-[var(--color-card)] shadow-[0_-1px_0_rgba(0,0,0,0.04)] dark:shadow-[0_-1px_0_rgba(255,255,255,0.04)] transition-colors borderless">
                    <div className="w-full max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="md:col-span-1">
                            <h3 className="font-black text-xl mb-4 text-[var(--color-foreground)] tracking-tight">Bonds<span
                                className="text-primary">-Lab</span></h3>
                            <p className="text-[var(--color-muted-foreground)] text-sm leading-relaxed mb-4">
                                Инновационная платформа для анализа долгового рынка РФ.
                            </p>
                        </div>
                        <div className="md:col-span-1">
                            <h3 className="font-bold text-lg mb-4 text-[var(--color-foreground)]">Документы</h3>
                            <div className="flex flex-col gap-3">
                                <Link href="/offer"
                                      className="text-[var(--color-muted-foreground)] hover:text-primary transition-colors text-sm font-medium">
                                    Оферта
                                </Link>
                            </div>
                        </div>
                    </div>
                </footer>

                
                <SessionExpiredAlert />
                <AdminFloorAd/>
            </AuthProvider>
        </ThemeProvider>

        </body>
        </html>
    );
}
