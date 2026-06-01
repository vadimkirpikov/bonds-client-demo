import * as React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

type ButtonVariant = 'primary' | 'secondary' | 'soft' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseButtonProps {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    className?: string;
    children?: React.ReactNode;
}

type ButtonAsButton = BaseButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement> & { as?: 'button'; href?: never; };
type ButtonAsLink = BaseButtonProps & React.AnchorHTMLAttributes<HTMLAnchorElement> & { as: 'a'; href: string; disabled?: boolean; };
type ButtonProps = ButtonAsButton | ButtonAsLink;

export const Button = (props: ButtonProps) => {
    const { className, variant = 'primary', size = 'md', isLoading = false, children, disabled, as = 'button', ...rest } = props;

    const variants: Record<ButtonVariant, string> = {
        primary: 'bg-primary text-white shadow-glow-primary hover:shadow-glow-primary-hover hover:-translate-y-0.5 border-none',
        secondary: 'bg-white text-slate-700 shadow-sm hover:shadow-md border-none',
        soft: 'bg-primary/10 text-primary hover:bg-primary/20 border-none',
        ghost: 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800 border-none',
        danger: 'bg-danger/10 text-danger hover:bg-danger/20 border-none',
    };

    const sizes = {
        sm: 'px-4 py-2 text-xs',
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-8 py-3.5 text-base',
    };

    const combinedClassName = cn(
        'rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:active:scale-100 select-none tracking-wide',
        (disabled || isLoading) && 'opacity-50 cursor-not-allowed pointer-events-none grayscale',
        variants[variant],
        sizes[size],
        className
    );

    if (as === 'a') {
        const { href, ...linkProps } = rest as React.AnchorHTMLAttributes<HTMLAnchorElement>;
        if (href && href.startsWith('/')) {
            return (
                <Link href={href} className={combinedClassName} aria-disabled={disabled || isLoading} {...(linkProps as any)}>
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {children}
                </Link>
            );
        }
        return (
            <a href={href} className={combinedClassName} aria-disabled={disabled || isLoading} {...linkProps}>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {children}
            </a>
        );
    }

    return (
        <button disabled={disabled || isLoading} className={combinedClassName} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
};