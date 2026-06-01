'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, Lock, Eye, EyeOff, CheckCircle, XCircle, KeyRound, AlertTriangle } from 'lucide-react';
import { TinkoffPortfolioApi } from '@/lib/api';
import { getClientApi } from '@/lib/client-api';

const TBankIcon = () => (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block shrink-0">
        <path d="M4 8C4 8 16 2 28 8C28 8 30 22 16 30C2 22 4 8 4 8Z" fill="#FFDD2D"/>
        <path d="M11 12H21V15H17.5V23H14.5V15H11V12Z" fill="#1C1C1E"/>
    </svg>
);

interface TinkoffApiKeySectionProps {
    hasValidToken: boolean;
    onTokenUpdated: () => void;
}

export const TinkoffApiKeySection = ({ hasValidToken, onTokenUpdated }: TinkoffApiKeySectionProps) => {
    const [apiKey, setApiKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleSave = async () => {
        if (!apiKey.trim()) {
            setMessage({ type: 'error', text: 'Введите API-ключ' });
            return;
        }
        setIsSaving(true);
        setMessage(null);
        try {
            const api = getClientApi(TinkoffPortfolioApi);
            await api.apiV1PortfolioTinkoffApiKeyPut({
                saveTinkoffApiKeyRequest: { apiKey: apiKey.trim() }
            });
            setMessage({ type: 'success', text: 'API-ключ успешно сохранен' });
            setApiKey('');
            onTokenUpdated();
            setTimeout(() => setMessage(null), 4000);
        } catch (e) {
            console.error('Failed to save API key', e);
            setMessage({ type: 'error', text: 'Ошибка сохранения. Проверьте ключ и попробуйте снова.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        setMessage(null);
        try {
            const api = getClientApi(TinkoffPortfolioApi);
            await api.apiV1PortfolioTinkoffApiKeyPut({
                saveTinkoffApiKeyRequest: { apiKey: '' }
            });
            setMessage({ type: 'success', text: 'API-ключ удален' });
            onTokenUpdated();
            setTimeout(() => setMessage(null), 4000);
        } catch (e) {
            console.error('Failed to delete API key', e);
            setMessage({ type: 'error', text: 'Ошибка удаления ключа' });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="sm:bg-[var(--color-card)] sm:p-8 sm:rounded-[2rem] sm:shadow-card relative sm:overflow-hidden">
            
            <div className="hidden sm:block absolute top-0 right-0 w-48 h-48 bg-amber-400/5 dark:bg-amber-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            
            <div className="flex items-center justify-between mb-6 relative z-10">
                <h2 className="text-xl font-bold flex items-center gap-3 text-[var(--color-foreground)] tracking-tight">
                    <TBankIcon /> Т-Инвестиции
                </h2>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                    hasValidToken
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)]'
                }`}>
                    {hasValidToken ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    {hasValidToken ? 'Подключено' : 'Не подключено'}
                </div>
            </div>

            
            <div className="bg-[var(--color-muted)] p-5 sm:p-6 rounded-2xl mb-6 relative z-10">
                <label className="text-sm font-bold text-[var(--color-foreground)] mb-3 flex items-center gap-2">
                    <KeyRound size={16} className="text-primary" />
                    API-ключ Т-Инвестиций
                </label>
                <div className="flex flex-col sm:flex-row gap-2 mb-3">
                    <div className="relative flex-1">
                        <input
                            type={showKey ? 'text' : 'password'}
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Вставьте токен..."
                            className="w-full bg-[var(--color-card)] rounded-xl px-4 py-3 pr-12 text-sm text-[var(--color-foreground)] font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm placeholder:text-[var(--color-muted-foreground)]"
                        />
                        <button
                            type="button"
                            onClick={() => setShowKey(!showKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
                        >
                            {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <Button onClick={handleSave} isLoading={isSaving} className="shrink-0 shadow-glow-primary">
                        Сохранить
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
                    <a
                        href="https://developer.tbank.ru/invest/intro/intro/token"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-amber-500 transition-colors font-medium"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                        Как выпустить API-ключ?
                    </a>

                    {hasValidToken && (
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="text-xs text-red-500 hover:text-red-600 font-bold transition-colors disabled:opacity-50 text-left sm:text-right"
                        >
                            {isDeleting ? 'Удаление...' : 'Удалить текущий ключ'}
                        </button>
                    )}
                </div>

                {message && (
                    <p className={`text-xs font-bold mt-3 ${message.type === 'error' ? 'text-red-500' : 'text-emerald-600'}`}>
                        {message.text}
                    </p>
                )}
            </div>

            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-500/5">
                    <Lock size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-[var(--color-foreground)] mb-0.5">Шифрование AES-256</p>
                        <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">Токен хранится в зашифрованном виде на сервере</p>
                    </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-500/5">
                    <Eye size={18} className="text-blue-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-[var(--color-foreground)] mb-0.5">Только для чтения</p>
                        <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">Используйте токен с правами read-only</p>
                    </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50/50 dark:bg-amber-500/5">
                    <ShieldCheck size={18} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-[var(--color-foreground)] mb-0.5">Сделки невозможны</p>
                        <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">С read-only токеном нельзя совершить сделку</p>
                    </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-50/50 dark:bg-purple-500/5">
                    <AlertTriangle size={18} className="text-purple-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-[var(--color-foreground)] mb-0.5">Конфиденциальность</p>
                        <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">Данные не передаются третьим лицам</p>
                    </div>
                </div>
            </div>
        </div>
    );
};