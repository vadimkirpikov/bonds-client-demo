'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AdminReportApi } from '@/lib/api';
import { getClientApi } from '@/lib/client-api';
import { MultiBrandSelect } from './MultiBrandSelect';

const FINANCIAL_FIELDS = [
    { key: 'Revenue', label: 'Выручка' },
    { key: 'OperatingProfit', label: 'Операционная прибыль' },
    { key: 'Ebitda', label: 'EBITDA' },
    { key: 'NetProfit', label: 'Чистая прибыль' },
    { key: 'Amortization', label: 'Амортизация' },
    { key: 'InterestExpense', label: 'Процентные расходы' },
    { key: 'OperationCashFlow', label: 'OCF (Опер. ден. поток)' },
    { key: 'CashAndEquivalents', label: 'Денежные средства' },
    { key: 'LongTermDebt', label: 'Долгосрочный долг' },
    { key: 'ShortTermDebt', label: 'Краткосрочный долг' },
    { key: 'TotalEquity', label: 'Собственный капитал' },
    { key: 'TotalAssets', label: 'Итого активы' },
    { key: 'TotalCurrentLiabilities', label: 'Краткосрочные обяз-ва' },
    { key: 'CurrentAssets', label: 'Оборотные активы' },
    { key: 'Inventory', label: 'Запасы' },
];

interface AdminReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AdminReportModal({ isOpen, onClose, onSuccess }: AdminReportModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);

        try {
            const api = getClientApi(AdminReportApi);

            const requestData: any = {
                title: formData.get('Title')?.toString() || '',
                docType: formData.get('DocType')?.toString() || '',
                brandIds: selectedBrands
            };

            if (file) requestData.file = file as any; // Type casting для Blob

            const getNum = (key: string) => {
                const val = formData.get(key)?.toString();
                return val && val !== '' ? Number(val) : undefined;
            };

            FINANCIAL_FIELDS.forEach(field => {
                const cur = getNum(field.key);
                const prev = getNum(`${field.key}Prev`);
                if (cur !== undefined) requestData[field.key.charAt(0).toLowerCase() + field.key.slice(1)] = cur;
                if (prev !== undefined) requestData[`${field.key.charAt(0).toLowerCase() + field.key.slice(1)}Prev`] = prev;
            });

            alert('Отчет успешно загружен');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Ошибка при загрузке отчета');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative w-full h-full sm:h-[90vh] sm:max-h-[900px] sm:max-w-4xl bg-zinc-950 sm:rounded-2xl border border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in sm:zoom-in-95">
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 shrink-0">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <FileText className="text-primary" /> Ручной ввод отчета
                    </h2>
                    <button onClick={onClose} className="p-2 -mr-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-8">

                    
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-zinc-800 pb-2">Основные данные</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1.5">Название отчета (Title) <span className="text-red-500">*</span></label>
                                <input required name="Title" placeholder="МСФО 2024..." className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:border-primary outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1.5">Тип документа (DocType) <span className="text-red-500">*</span></label>
                                <select required name="DocType" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:border-primary outline-none cursor-pointer">
                                    <option value="МСФО2024">МСФО 2024</option>
                                    <option value="МСФО6мес2024">МСФО 6 мес 2024</option>
                                    <option value="МСФО9мес2024">МСФО 9 мес 2024</option>
                                    <option value="РСБУ2024">РСБУ 2024</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs text-zinc-400 mb-1.5">Привязка к эмитентам</label>
                                <MultiBrandSelect selectedBrandIds={selectedBrands} onSelect={setSelectedBrands} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs text-zinc-400 mb-1.5">Файл (Опционально)</label>
                                <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-400 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:bg-zinc-800 file:text-white cursor-pointer" />
                            </div>
                        </div>
                    </div>

                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Финансовые показатели</h3>
                            <div className="flex text-xs text-zinc-500 font-bold w-48 text-center hidden md:flex">
                                <span className="flex-1">Текущий</span>
                                <span className="flex-1">Прошлый (Prev)</span>
                            </div>
                        </div>

                        <div className="bg-red-900/10 border border-red-900/30 p-3 rounded-lg flex items-start gap-3 mb-4 text-xs text-zinc-300">
                            <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                            <p>Вводите абсолютные значения. Если поле пустое — оставьте его пустым, оно не будет отправлено на сервер.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-y-3">
                            {FINANCIAL_FIELDS.map((field) => (
                                <div key={field.key} className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-zinc-900/30 border border-zinc-800/50 rounded-lg gap-3 hover:bg-zinc-900/80 transition-colors">
                                    <span className="text-sm text-zinc-300 font-medium md:w-1/3 truncate">{field.label}</span>
                                    <div className="flex flex-row gap-2 md:w-2/3">
                                        <div className="flex-1 relative">
                                            <span className="absolute left-2.5 top-2.5 text-[10px] text-zinc-600 font-bold md:hidden">ТЕК</span>
                                            <input type="number" step="0.01" name={field.key} placeholder="Значение" className="w-full bg-zinc-950 border border-zinc-700 rounded-lg py-2 px-3 pl-10 md:pl-3 text-sm text-white focus:border-primary outline-none placeholder:text-zinc-600 transition-colors" />
                                        </div>
                                        <div className="flex-1 relative">
                                            <span className="absolute left-2.5 top-2.5 text-[10px] text-zinc-600 font-bold md:hidden">ПРЕД</span>
                                            <input type="number" step="0.01" name={`${field.key}Prev`} placeholder="Prev значение" className="w-full bg-zinc-950 border border-zinc-700 rounded-lg py-2 px-3 pl-12 md:pl-3 text-sm text-white focus:border-primary outline-none placeholder:text-zinc-600 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 shrink-0 pb-6 md:pb-0">
                        <Button type="submit" isLoading={isSubmitting} size="lg" className="w-full shadow-lg">
                            <Save className="mr-2" size={20} />
                            Сохранить отчет
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}