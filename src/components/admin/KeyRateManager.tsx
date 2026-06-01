'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { getKeyRate, updateKeyRate } from '@/actions/settings-actions';
import { Percent, Save, Loader2 } from 'lucide-react';

export const KeyRateManager = () => {
    const [rate, setRate] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        getKeyRate().then(val => {
            setRate(val.toString());
            setIsLoading(false);
        });
    }, []);

    const handleSave = async () => {
        const numRate = parseFloat(rate);
        if (isNaN(numRate)) {
            alert('Введите корректное число');
            return;
        }

        setIsSaving(true);
        try {
            await updateKeyRate(numRate); // Токен больше передавать не нужно!
            alert('Ключевая ставка обновлена');
        } catch (e) {
            console.error(e);
            alert('Ошибка при сохранении (Нет прав или сессия истекла)');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="h-full flex items-center justify-center bg-card rounded-2xl"><Loader2 className="animate-spin text-zinc-500"/></div>;
    }

    return (
        <div className="bg-card p-6 rounded-2xl h-full flex flex-col justify-between">
            <div>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                    <Percent className="text-primary"/> Ключевая ставка ЦБ
                </h2>
                <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
                    Используется для расчета доходности флоатеров.
                </p>
            </div>

            <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                    <label className="text-xs text-zinc-500">Ставка %</label>
                    <input
                        type="number"
                        step="0.1"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-lg font-mono text-white focus:border-primary outline-none transition-all"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                    />
                </div>
                <Button onClick={handleSave} isLoading={isSaving} className="h-[50px] w-[50px] p-0 flex-shrink-0">
                    <Save size={20} />
                </Button>
            </div>
        </div>
    );
};