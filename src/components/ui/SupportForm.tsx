'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { MessageSquare, X } from 'lucide-react';
import { SupportApi } from '@/lib/api';
import { getClientApi } from '@/lib/client-api';

export const SupportForm = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [topic, setTopic] = useState('Вопрос');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const formRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (formRef.current && !formRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const api = getClientApi(SupportApi);
            await api.apiV1SupportPost({
                supportRequest: { subject: topic, message: message }
            });
            setSent(true);
            setTimeout(() => {
                setSent(false);
                setIsOpen(false);
                setMessage('');
            }, 3000);
        } catch (e) {
            alert('Ошибка отправки. Попробуйте позже.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-40">
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="rounded-full w-14 h-14 shadow-2xl shadow-primary/20 bg-primary hover:bg-primary-hover animate-bounce-slow flex items-center justify-center p-0"
                >
                    <MessageSquare size={24} />
                </Button>
            )}

            {isOpen && (
                <div ref={formRef} className="bg-zinc-900 border border-card-border rounded-2xl shadow-2xl p-6 w-80 sm:w-96 animate-fade-in mb-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-white">Техподдержка</h3>
                        <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white"><X size={18}/></button>
                    </div>

                    {sent ? (
                        <div className="text-center py-8 text-green-400">
                            <p>Сообщение отправлено!</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="text-xs text-zinc-500 block mb-1">Тема</label>
                                <select
                                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-white outline-none"
                                    value={topic}
                                    onChange={e => setTopic(e.target.value)}
                                >
                                    <option>Вопрос</option>
                                    <option>Ошибка</option>
                                    <option>Предложение</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 block mb-1">Сообщение</label>
                                <textarea
                                    required
                                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-white outline-none min-h-[100px]"
                                    placeholder="Ваш вопрос..."
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                />
                            </div>
                            <Button className="w-full" isLoading={loading} disabled={loading}>
                                Отправить
                            </Button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
};