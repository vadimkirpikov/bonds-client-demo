import React, {useEffect, useRef, useState} from 'react';
import { FLAG_OPTIONS } from './constants';
import {cn} from "@/lib/utils";
import {ChevronDown} from "lucide-react";

export const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="space-y-4">
        <h3 className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-widest pb-1">{title}</h3>
        {children}
    </div>
);

export const InputGroup = ({
                               label,
                               type = "text",
                               value,
                               onChange,
                               placeholder,
                               step
                           }: {
    label: string;
    type?: string;
    value?: string;
    onChange: (val: string) => void;
    placeholder?: string;
    step?: string;
}) => (
    <div>
        <label className="text-xs text-[var(--color-muted-foreground)] font-medium mb-1.5 block">{label}</label>
        <input
            type={type}
            step={step}
            className="w-full bg-[var(--color-muted)] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)]"
            placeholder={placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);

export const DateInputGroup = ({
                                   label,
                                   value,
                                   onChange,
                                   max
                               }: {
    label: string;
    value?: string;
    onChange: (val: string) => void;
    max?: string;
}) => (
    <div>
        <label className="text-xs text-[var(--color-muted-foreground)] font-medium mb-1.5 block">{label}</label>
        <input
            type="date"
            max={max}
            className="w-full bg-[var(--color-muted)] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-[var(--color-foreground)] cursor-pointer"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);

export const DaysInput = ({
                              label,
                              paramDateValue,
                              onChange
                          }: {
    label: string;
    paramDateValue?: string;
    onChange: (val: string) => void;
}) => {
    const [inputValue, setInputValue] = useState('');
    const[isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (isFocused) return;

        if (!paramDateValue) {
            setInputValue('');
            return;
        }

        const parts = paramDateValue.split('T')[0].split('-');
        if (parts.length === 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);

            const date = new Date(year, month, day);
            date.setHours(0, 0, 0, 0);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const diffTime = Math.abs(date.getTime() - today.getTime());
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            setInputValue(diffDays.toString());
        }
    }, [paramDateValue, isFocused]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        onChange(val);
    };

    return (
        <div>
            <label className="text-xs text-[var(--color-muted-foreground)] font-medium mb-1.5 block">{label}</label>
            <input
                type="number"
                min="0"
                placeholder="Дней"
                value={inputValue}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={handleInputChange}
                className="w-full bg-[var(--color-muted)] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)]"
            />
        </div>
    );
};

export const FilterButton = ({
                                 label,
                                 active,
                                 onClick
                             }: {
    label: string,
    active: boolean,
    onClick: () => void
}) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm rounded-xl font-medium transition-all duration-300 ${
            active
                ? 'bg-primary text-white shadow-glow-primary scale-[1.02]'
                : 'bg-[var(--color-card)] text-[var(--color-muted-foreground)] shadow-card hover:shadow-card-hover'
        }`}
    >
        {label}
    </button>
);

export const SelectGroup = ({
                                label,
                                value,
                                onChange
                            }: {
    label: string | React.ReactNode;
    value?: string;
    onChange: (val: string) => void;
}) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-[var(--color-card)] shadow-card hover:shadow-card-hover transition-shadow gap-3">
        <span className="text-sm text-[var(--color-foreground)] font-medium">{label}</span>
        <div className="grid grid-cols-3 gap-1 bg-[var(--color-muted)] rounded-xl p-1 w-full sm:w-[240px]">
            {FLAG_OPTIONS.map((opt) => {
                const isActive = value === opt.value || (!value && opt.value === '0');
                return (
                    <button
                        key={opt.value}
                        onClick={() => onChange(opt.value)}
                        className={`px-2 py-2 text-xs rounded-lg transition-all text-center ${
                            isActive
                                ? 'bg-[var(--color-background)] text-[var(--color-foreground)] font-bold shadow-card'
                                : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] font-medium'
                        }`}
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    </div>
);


const getCreditRatingColor = (rating: string) => {
    if (!rating || rating === 'Любой') return "text-[var(--color-foreground)]";
    if (rating.includes('AAA')) return "text-emerald-500 bg-emerald-500/10";
    if (rating.includes('AA')) return "text-green-500 bg-green-500/10";
    if (rating.includes('A') && !rating.includes('B') && !rating.includes('C')) return "text-lime-500 bg-lime-500/10";
    if (rating.includes('BBB')) return "text-yellow-500 bg-yellow-500/10";
    if (rating.includes('BB')) return "text-amber-500 bg-amber-500/10";
    if (rating.includes('B')) return "text-orange-500 bg-orange-500/10";
    if (rating.includes('C')) return "text-red-500 bg-red-500/10";
    if (rating.includes('D')) return "text-red-700 bg-red-700/10";
    return "text-[var(--color-foreground)] bg-[var(--color-muted)]/50";
};

interface RatingSelectProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
    options: string[];
}

export const RatingSelect = ({ label, value, onChange, options }: RatingSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const displayValue = value || 'Любой';

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="text-xs text-[var(--color-muted-foreground)] font-medium mb-1.5 block ml-1">
                {label}
            </label>

            
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-[var(--color-muted)] rounded-xl p-3 text-sm flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all borderless"
            >
                <span className={cn(
                    "font-bold px-2 py-0.5 rounded-md text-xs",
                    getCreditRatingColor(displayValue)
                )}>
                    {displayValue}
                </span>
                <ChevronDown size={16} className="text-[var(--color-muted-foreground)]" />
            </button>

            
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-[var(--color-card)] rounded-xl shadow-xl border border-[var(--color-border)]/50 py-2 max-h-60 overflow-y-auto custom-scrollbar">
                    <button
                        type="button"
                        onClick={() => { onChange(''); setIsOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-muted)] transition-colors flex items-center"
                    >
                        <span className="font-bold px-2 py-0.5 rounded-md text-xs text-[var(--color-foreground)]">
                            Любой
                        </span>
                    </button>
                    {options.map((r) => (
                        <button
                            key={r}
                            type="button"
                            onClick={() => { onChange(r); setIsOpen(false); }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-muted)] transition-colors flex items-center"
                        >
                            <span className={cn(
                                "font-bold px-2 py-0.5 rounded-md text-xs",
                                getCreditRatingColor(r)
                            )}>
                                {r}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};