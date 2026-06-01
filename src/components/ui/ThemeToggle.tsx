'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = (event: React.MouseEvent<HTMLButtonElement>) => {
        const isDark = resolvedTheme === 'dark';
        const newTheme = isDark ? 'light' : 'dark';

        if (!document.startViewTransition) {
            setTheme(newTheme);
            return;
        }

        const x = event.clientX;
        const y = event.clientY;
        const endRadius = Math.hypot(
            Math.max(x, innerWidth - x),
            Math.max(y, innerHeight - y)
        );

        const transition = document.startViewTransition(() => {
            setTheme(newTheme);
        });

        transition.ready.then(() => {
            const clipPath = [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${endRadius}px at ${x}px ${y}px)`
            ];

            document.documentElement.animate(
                {
                    clipPath: isDark ? [...clipPath].reverse() : clipPath,
                },
                {
                    duration: 500,
                    easing: 'ease-in-out',
                    pseudoElement: isDark ? '::view-transition-old(root)' : '::view-transition-new(root)',
                }
            );
        });
    };

    if (!mounted) return <div className="w-10 h-10" />; // Заглушка до гидратации

    return (
        <button
            onClick={toggleTheme}
            className="p-2 bg-slate-100 dark:bg-zinc-800 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 dark:text-zinc-400 hover:text-primary dark:hover:text-primary rounded-full transition-colors relative overflow-hidden group outline-none"
            aria-label="Переключить тему"
        >
            {resolvedTheme === 'dark' ? (
                <Sun size={20} className="group-hover:rotate-90 transition-transform duration-500" />
            ) : (
                <Moon size={20} className="group-hover:-rotate-12 transition-transform duration-500" />
            )}
        </button>
    );
}