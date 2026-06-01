'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Check, Loader2 } from 'lucide-react';
import { BrandApi, SimplifiedBrandResponse } from '@/lib/api';
import { getClientApi } from '@/lib/client-api';

interface MultiBrandSelectProps {
    selectedBrandIds: string[];
    onSelect: (brandIds: string[]) => void;
    placeholder?: string;
    className?: string;
}

export function MultiBrandSelect({ selectedBrandIds, onSelect, placeholder = "Выберите эмитентов", className }: MultiBrandSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [brands, setBrands] = useState<SimplifiedBrandResponse[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchBrands = async () => {
            setIsLoading(true);
            try {
                const api = getClientApi(BrandApi);
                const response = await api.apiV1BrandsGet();
                if (response && response.brands) {
                    setBrands(response.brands);
                }
            } catch (e) {
                console.error("Failed to fetch brands", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBrands();
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredBrands = brands.filter(b =>
        b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.bondName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleBrand = (id: string) => {
        if (selectedBrandIds.includes(id)) {
            onSelect(selectedBrandIds.filter(bId => bId !== id));
        } else {
            onSelect([...selectedBrandIds, id]);
        }
    };

    const removeBrand = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        onSelect(selectedBrandIds.filter(bId => bId !== id));
    };

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full min-h-[46px] flex items-center justify-between bg-zinc-950 border rounded-lg p-2 text-sm cursor-pointer transition-colors ${isOpen ? 'border-primary' : 'border-zinc-700 hover:border-zinc-600'}`}
            >
                <div className="flex flex-wrap gap-2 flex-1 items-center">
                    {selectedBrandIds.length > 0 ? (
                        selectedBrandIds.map(id => {
                            const brand = brands.find(b => b.id === id);
                            if (!brand) return null;
                            return (
                                <div key={id} className="flex items-center gap-1 bg-zinc-800 text-white px-2 py-1 rounded text-xs border border-zinc-700">
                                    <span className="truncate max-w-[100px]">{brand.name}</span>
                                    <X size={12} className="text-zinc-400 hover:text-red-400 cursor-pointer" onClick={(e) => removeBrand(e, id)} />
                                </div>
                            );
                        })
                    ) : (
                        <span className="text-zinc-500 pl-1">{placeholder}</span>
                    )}
                </div>
                <Search size={16} className="text-zinc-500 shrink-0 ml-2" />
            </div>

            {isOpen && (
                <div className="absolute z-50 top-full mt-2 left-0 w-full bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-zinc-800">
                        <input
                            autoFocus
                            type="text"
                            placeholder="Поиск эмитента..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                        />
                    </div>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                        {isLoading ? (
                            <div className="py-4 text-center text-zinc-500 flex justify-center gap-2">
                                <Loader2 className="animate-spin" size={16} /> Загрузка...
                            </div>
                        ) : filteredBrands.length === 0 ? (
                            <div className="py-4 text-center text-zinc-500 text-xs">Ничего не найдено</div>
                        ) : (
                            filteredBrands.map(brand => {
                                const isSelected = selectedBrandIds.includes(brand.id!);
                                return (
                                    <div
                                        key={brand.id}
                                        onClick={() => toggleBrand(brand.id!)}
                                        className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-primary/10' : 'hover:bg-zinc-800'}`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-sm font-medium truncate ${isSelected ? 'text-primary' : 'text-zinc-200'}`}>
                                                {brand.name}
                                            </div>
                                        </div>
                                        {isSelected && <Check size={16} className="text-primary shrink-0" />}
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}