'use client';

import { List, ScatterChart, Table } from 'lucide-react';

interface ViewToggleProps {
    viewMode: 'list' | 'map' | 'table';
    onViewChange: (mode: 'list' | 'map' | 'table') => void;
}

export const ViewToggle = ({ viewMode, onViewChange }: ViewToggleProps) => {
    return (
        <div className="flex items-center bg-[var(--color-muted)] rounded-xl p-1 gap-0.5" id="bonds-view-toggle">
            <button
                onClick={() => onViewChange('list')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                    viewMode === 'list'
                        ? 'bg-[var(--color-background)] text-[var(--color-foreground)] shadow-sm'
                        : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                }`}
                title="Список облигаций"
            >
                <List size={14} />
                <span className="hidden sm:inline">Список</span>
            </button>
            <button
                onClick={() => onViewChange('table')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                    viewMode === 'table'
                        ? 'bg-[var(--color-background)] text-[var(--color-foreground)] shadow-sm'
                        : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                }`}
                title="Таблица облигаций"
            >
                <Table size={14} />
                <span className="hidden sm:inline">Таблица</span>
            </button>
            <button
                onClick={() => onViewChange('map')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                    viewMode === 'map'
                        ? 'bg-[var(--color-background)] text-[var(--color-foreground)] shadow-sm'
                        : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                }`}
                title="Карта рынка"
            >
                <ScatterChart size={14} />
                <span className="hidden sm:inline">Карта</span>
            </button>
        </div>
    );
};
