'use client';
import { useInView } from 'react-intersection-observer';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FadeInProps {
    children: ReactNode;
    delay?: number;
    className?: string;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    threshold?: number;
}

export const FadeIn = ({ children, delay = 0, className = '', direction = 'up', threshold = 0.1 }: FadeInProps) => {
    const { ref, inView } = useInView({ 
        triggerOnce: true, 
        threshold,
        rootMargin: '50px 0px 0px 0px' // slightly trigger before it fully enters
    });
    
    let baseTranslate = '';
    if (direction === 'up') baseTranslate = 'translate-y-12';
    if (direction === 'down') baseTranslate = '-translate-y-12';
    if (direction === 'left') baseTranslate = 'translate-x-12';
    if (direction === 'right') baseTranslate = '-translate-x-12';

    return (
        <div 
            ref={ref} 
            className={cn(
                "transition-all duration-1000 ease-out", 
                inView ? "opacity-100 translate-x-0 translate-y-0" : `opacity-0 ${baseTranslate}`,
                className
            )}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};
