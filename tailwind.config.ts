// tailwind.config.ts
import type { Config } from "tailwindcss";
import generated from "@tailwindcss/typography";

const config: Config = {
    content: [
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#f8fafc", // slate-50 (Светло-серый фон)
                foreground: "#0f172a", // slate-900 (Черный текст)
                muted: {
                    DEFAULT: "#f1f5f9", // slate-100 (Фон для плашек)
                    foreground: "#64748b", // slate-500 (Серый текст)
                },
                card: {
                    DEFAULT: "#ffffff", // Белые карточки
                    foreground: "#0f172a", // Текст в карточках
                },
                primary: {
                    DEFAULT: "#10b981", // Изумрудный
                    hover: "#059669",
                    foreground: "#ffffff"
                },
                danger: {
                    DEFAULT: "#f43f5e", // Красный
                    hover: "#e11d48",
                },
                accent: {
                    DEFAULT: "#f59e0b", // Желто-оранжевый
                },
            },
            boxShadow: {
                'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                'card': '0 4px 20px rgba(0, 0, 0, 0.05)',
                'card-hover': '0 10px 30px rgba(0, 0, 0, 0.1)',
                'glow-primary': '0 4px 14px rgba(16, 185, 129, 0.3)',
                'glow-primary-hover': '0 6px 20px rgba(16, 185, 129, 0.4)',
                'glow-danger': '0 4px 14px rgba(244, 63, 94, 0.3)',
            },
            animation: {
                'fade-in': 'fadeIn 0.4s ease-out forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        },
    },
    plugins: [generated],
};
export default config;