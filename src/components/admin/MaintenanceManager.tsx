'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { getMaintenanceConfig, updateMaintenanceConfig, MaintenanceConfig } from '@/actions/settings-actions';
import { Hammer, Loader2, Sparkles, AlertTriangle, Save } from 'lucide-react';
import { cn } from '@/components/ui/Button';

export const MaintenanceManager = () => {
    const [config, setConfig] = useState<MaintenanceConfig>({ isActive: false, whitelist: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        getMaintenanceConfig().then(val => {
            setConfig(val);
            setIsLoading(false);
        });
    }, []);

    const handleToggle = () => {
        setConfig(prev => ({ ...prev, isActive: !prev.isActive }));
    };

    const handleSave = async () => {
        const confirmMsg = config.isActive
            ? "Включить режим тех. работ? Платформа будет скрыта от пользователей, кроме списка исключений."
            : "Выключить режим тех. работ? Пользователи снова увидят платформу.";

        if (!confirm(confirmMsg)) return;

        setIsSaving(true);
        try {
            await updateMaintenanceConfig(config.isActive, config.whitelist);
            alert('Настройки успешно сохранены');
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
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                        {config.isActive ? <AlertTriangle className="text-amber-500 animate-pulse"/> : <Hammer className="text-primary"/>}
                        Технические работы
                    </h2>
                    
                    <button 
                        onClick={handleToggle}
                        className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                            config.isActive ? "bg-amber-500" : "bg-zinc-700"
                        )}
                    >
                        <span className={cn(
                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                            config.isActive ? "translate-x-6" : "translate-x-1"
                        )}/>
                    </button>
                </div>
                
                <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
                    Скрывает списки облигаций и детальные страницы. Пользователи увидят заглушку о глобальном обновлении платформы.
                </p>

                <div className="mb-6">
                    <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wide">
                        Белый список (Email через запятую)
                    </label>
                    <textarea
                        value={config.whitelist}
                        onChange={(e) => setConfig(prev => ({ ...prev, whitelist: e.target.value }))}
                        placeholder="admin@bonds-lab.ru, user@test.com"
                        className="w-full h-24 bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none custom-scrollbar"
                    />
                </div>
            </div>

            <Button
                onClick={handleSave}
                isLoading={isSaving}
                variant="primary"
                className="w-full h-[54px]"
            >
                <Save size={18} className="mr-2"/> Сохранить настройки
            </Button>
        </div>
    );
};