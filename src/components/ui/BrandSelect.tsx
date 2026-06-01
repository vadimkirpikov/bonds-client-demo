import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Check, Loader2 } from 'lucide-react';
import { BrandApi, SimplifiedBrandResponse } from '@/lib/api';
import { getClientApi } from '@/lib/client-api';
import { Logo } from '@/components/ui/Logo'; // Используем существующий компонент Logo если есть, или простой img

interface BrandSelectProps {
    selectedBrandId?: string | null;
    onSelect: (brandId: string | undefined) => void;
    placeholder?: string;
    className?: string;
}

export function BrandSelect({ selectedBrandId, onSelect, placeholder = "Выберите эмитента", className }: BrandSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [brands, setBrands] = useState<SimplifiedBrandResponse[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState<SimplifiedBrandResponse | null>(null);

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
        if (selectedBrandId && brands.length > 0) {
            const found = brands.find(b => b.id === selectedBrandId);
            if (found) setSelectedBrand(found);
        } else if (!selectedBrandId) {
            setSelectedBrand(null);
        }
    }, [selectedBrandId, brands]);

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

    const getLogoUrl = (logoName?: string | null) => {
        if (!logoName) return undefined;
        const parts = logoName.split('.');
        const finalLogoName = parts.length > 1 ? parts[0] + 'x640' + '.' + parts[1] : '';
        return finalLogoName ? `https://invest-brands.cdn-tinkoff.ru/${finalLogoName}` : undefined;
    };

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full flex items-center justify-between bg-zinc-950 border rounded-lg p-3 text-sm cursor-pointer transition-colors
                    ${isOpen ? 'border-primary' : 'border-zinc-700 hover:border-zinc-600'}
                `}
            >
                {selectedBrand ? (
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-5 h-5 flex-shrink-0 rounded-full bg-white overflow-hidden">
                            <img
                                src={getLogoUrl(selectedBrand.logoName) || '/placeholder.png'}
                                alt={selectedBrand.name || ''}
                                className="w-full h-full object-contain"
                                onError={(e) => e.currentTarget.style.display = 'none'}
                            />
                        </div>
                        <span className="text-white truncate font-medium">{selectedBrand.name}</span>
                    </div>
                ) : (
                    <span className="text-zinc-400 truncate">{placeholder}</span>
                )}

                <div className="flex items-center gap-2">
                    {selectedBrand && (
                        <div
                            onClick={(e) => { e.stopPropagation(); onSelect(undefined); setSearchQuery(''); }}
                            className="p-1 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-colors"
                        >
                            <X size={14} />
                        </div>
                    )}
                    {!selectedBrand && <Search size={16} className="text-zinc-500" />}
                </div>
            </div>

            
            {isOpen && (
                <div className="absolute z-50 top-full mt-2 left-0 w-full bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-zinc-800">
                        <input
                            autoFocus
                            type="text"
                            placeholder="Поиск..."
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
                            <div className="py-4 text-center text-zinc-500 text-xs">
                                Ничего не найдено
                            </div>
                        ) : (
                            filteredBrands.map(brand => (
                                <div
                                    key={brand.id}
                                    onClick={() => {
                                        onSelect(brand.id);
                                        setIsOpen(false);
                                        setSearchQuery('');
                                    }}
                                    className={`
                                        flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors
                                        ${brand.id === selectedBrandId ? 'bg-primary/10' : 'hover:bg-zinc-800'}
                                    `}
                                >
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0 border border-zinc-700">
                                        <img
                                            src={getLogoUrl(brand.logoName) || '/placeholder.png'}
                                            alt={brand.name || ''}
                                            className="w-full h-full object-contain"
                                            onError={(e) => e.currentTarget.style.display = 'none'}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-sm font-medium truncate ${brand.id === selectedBrandId ? 'text-primary' : 'text-zinc-200'}`}>
                                            {brand.name}
                                        </div>
                                        {brand.bondName && (
                                            <div className="text-[10px] text-zinc-500 truncate">{brand.bondName}</div>
                                        )}
                                    </div>
                                    {brand.id === selectedBrandId && <Check size={14} className="text-primary" />}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}