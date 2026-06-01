'use client';

import { useState, useTransition } from 'react';
import { ArrowLeft, GripVertical, Plus, Trash2, Save, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { FILTER_SECTIONS, ALL_FILTER_INDICES } from '@/components/bonds/filters/constants';
import { updateCustomFilters } from '@/actions/collection-actions';

interface DnDPageProps {
    initialSelected: number[];
}

function CustomFiltersDnD({ initialSelected }: DnDPageProps) {
    const [selected, setSelected] = useState<number[]>(initialSelected);
    const [isPending, startTransition] = useTransition();
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState(false);

    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [dragSource, setDragSource] = useState<'selected' | 'available' | null>(null);

    const available = ALL_FILTER_INDICES.filter(i => !selected.includes(i));

    const addItem = (index: number) => {
        setSelected(prev => [...prev, index]);
        setSaved(false);
    };

    const removeItem = (index: number) => {
        setSelected(prev => prev.filter(i => i !== index));
        setSaved(false);
    };

    const moveItem = (fromIdx: number, toIdx: number) => {
        setSelected(prev => {
            const next = [...prev];
            const [item] = next.splice(fromIdx, 1);
            next.splice(toIdx, 0, item);
            return next;
        });
        setSaved(false);
    };

    const handleSave = () => {
        startTransition(async () => {
            const result = await updateCustomFilters(true, selected);
            if (result.success) {
                setSaved(true);
                setError(false);
                setTimeout(() => setSaved(false), 3000);
            } else {
                setError(true);
                setTimeout(() => setError(false), 3000);
            }
        });
    };

    const handleDragStart = (e: React.DragEvent, idx: number, source: 'selected' | 'available') => {
        setDraggedIndex(idx);
        setDragSource(source);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', idx.toString());
    };

    const handleDragOver = (e: React.DragEvent, idx: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverIndex(idx);
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDropOnSelected = (e: React.DragEvent, targetIdx: number) => {
        e.preventDefault();
        setDragOverIndex(null);

        if (dragSource === 'selected' && draggedIndex !== null) {
            moveItem(draggedIndex, targetIdx);
        } else if (dragSource === 'available' && draggedIndex !== null) {
            const filterIndex = available[draggedIndex];
            setSelected(prev => {
                const next = prev.filter(i => i !== filterIndex);
                next.splice(targetIdx, 0, filterIndex);
                return next;
            });
            setSaved(false);
        }

        setDraggedIndex(null);
        setDragSource(null);
    };

    const handleDropOnAvailable = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOverIndex(null);

        if (dragSource === 'selected' && draggedIndex !== null) {
            const filterIndex = selected[draggedIndex];
            removeItem(filterIndex);
        }

        setDraggedIndex(null);
        setDragSource(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
        setDragSource(null);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/bonds" className="p-2.5 rounded-xl bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-foreground)]">Настройка фильтров</h1>
                        <p className="text-sm text-[var(--color-muted-foreground)] mt-1">Выберите и упорядочьте фильтры для быстрого поиска</p>
                    </div>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isPending}
                    className="shadow-glow-primary px-6"
                >
                    {isPending ? (
                        <span className="animate-pulse">Сохраняю...</span>
                    ) : saved ? (
                        <><CheckCircle size={18} /> Сохранено</>
                    ) : error ? (
                        <><AlertCircle size={18} /> Ошибка</>
                    ) : (
                        <><Save size={18} /> Сохранить</>
                    )}
                </Button>
            </div>

            
            <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-[var(--color-muted)]">
                <div className="flex-1">
                    <span className="text-sm font-semibold text-[var(--color-foreground)]">
                        Выбрано: <span className="text-primary">{selected.length}</span> из {ALL_FILTER_INDICES.length}
                    </span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => { setSelected([...ALL_FILTER_INDICES]); setSaved(false); }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--color-card)] text-[var(--color-muted-foreground)] hover:text-primary transition-colors shadow-card"
                    >
                        Выбрать все
                    </button>
                    <button
                        onClick={() => { setSelected([]); setSaved(false); }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--color-card)] text-[var(--color-muted-foreground)] hover:text-red-500 transition-colors shadow-card"
                    >
                        Очистить
                    </button>
                </div>
            </div>

            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <div>
                    <h2 className="text-sm font-bold text-[var(--color-foreground)] uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        Мои фильтры
                        <span className="text-[var(--color-muted-foreground)] font-normal normal-case tracking-normal text-xs ml-1">
                            (перетаскивайте для сортировки)
                        </span>
                    </h2>

                    <div
                        className="space-y-2 min-h-[200px] p-3 rounded-2xl bg-[var(--color-card)] shadow-card"
                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                        onDrop={(e) => {
                            if (dragSource === 'available' && draggedIndex !== null) {
                                e.preventDefault();
                                const filterIndex = available[draggedIndex];
                                addItem(filterIndex);
                                setDraggedIndex(null);
                                setDragSource(null);
                            }
                        }}
                    >
                        {selected.length === 0 ? (
                            <div className="flex items-center justify-center h-[200px] text-[var(--color-muted-foreground)] text-sm">
                                Перетащите фильтры сюда или нажмите ➕
                            </div>
                        ) : (
                            selected.map((filterIndex, idx) => {
                                const section = FILTER_SECTIONS.find(f => f.index === filterIndex);
                                return (
                                    <div
                                        key={filterIndex}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, idx, 'selected')}
                                        onDragOver={(e) => handleDragOver(e, idx)}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDropOnSelected(e, idx)}
                                        onDragEnd={handleDragEnd}
                                        className={`flex items-center gap-3 p-3.5 rounded-xl cursor-grab active:cursor-grabbing transition-all select-none ${
                                            dragOverIndex === idx && dragSource !== null
                                                ? 'bg-primary/10 shadow-glow-primary scale-[1.02]'
                                                : draggedIndex === idx && dragSource === 'selected'
                                                    ? 'opacity-40 scale-95'
                                                    : 'bg-[var(--color-muted)] hover:bg-[var(--color-card-s)]'
                                        }`}
                                    >
                                        <GripVertical size={16} className="text-[var(--color-muted-foreground)] flex-shrink-0" />
                                        <span className="text-xs font-mono text-primary font-bold w-6">{idx + 1}</span>
                                        <span className="text-sm font-semibold text-[var(--color-foreground)] flex-1">
                                            {section?.label}
                                        </span>
                                        {section?.hasChildren && (
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                                +доп.
                                            </span>
                                        )}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeItem(filterIndex); }}
                                            className="p-1.5 rounded-lg text-[var(--color-muted-foreground)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex-shrink-0"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                
                <div>
                    <h2 className="text-sm font-bold text-[var(--color-foreground)] uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-muted-foreground)]"></span>
                        Доступные фильтры
                    </h2>

                    <div
                        className="space-y-2 min-h-[200px] p-3 rounded-2xl bg-[var(--color-card)] shadow-card"
                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                        onDrop={handleDropOnAvailable}
                    >
                        {available.length === 0 ? (
                            <div className="flex items-center justify-center h-[200px] text-[var(--color-muted-foreground)] text-sm">
                                Все фильтры добавлены ✨
                            </div>
                        ) : (
                            available.map((filterIndex, idx) => {
                                const section = FILTER_SECTIONS.find(f => f.index === filterIndex);
                                return (
                                    <div
                                        key={filterIndex}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, idx, 'available')}
                                        onDragEnd={handleDragEnd}
                                        className={`flex items-center gap-3 p-3.5 rounded-xl cursor-grab active:cursor-grabbing transition-all select-none ${
                                            draggedIndex === idx && dragSource === 'available'
                                                ? 'opacity-40 scale-95'
                                                : 'bg-[var(--color-muted)] hover:bg-[var(--color-card-s)]'
                                        }`}
                                    >
                                        <span className="text-sm font-semibold text-[var(--color-muted-foreground)] flex-1">
                                            {section?.label}
                                        </span>
                                        {section?.hasChildren && (
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                                +доп.
                                            </span>
                                        )}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); addItem(filterIndex); }}
                                            className="p-1.5 rounded-lg text-[var(--color-muted-foreground)] hover:text-primary hover:bg-primary/10 transition-colors flex-shrink-0"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            
            <p className="text-xs text-[var(--color-muted-foreground)] text-center mt-8 lg:hidden">
                Используйте кнопки ➕/➖ для добавления и удаления фильтров. На десктопе доступно перетаскивание.
            </p>

            
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--color-background)] shadow-[0_-1px_0_rgba(0,0,0,0.06)] dark:shadow-[0_-1px_0_rgba(255,255,255,0.04)] lg:hidden z-50">
                <Button
                    onClick={handleSave}
                    disabled={isPending}
                    className="w-full shadow-glow-primary"
                >
                    {isPending ? 'Сохраняю...' : saved ? 'Сохранено!' : 'Сохранить настройки'}
                </Button>
            </div>
        </div>
    );
}

export default CustomFiltersDnD;
