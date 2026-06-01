'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { ClipboardList, FileSpreadsheet, Check } from 'lucide-react';
import { convertBondToText, convertBusinessToText, convertFiltersToText } from '@/lib/text-converters';
import { BondDtoResponse, BrandBusinessResponse } from '@/lib/api';
import { getKeyRate } from '@/actions/settings-actions';
import { useSearchParams } from 'next/navigation';
import { SubscriptionModal } from '@/components/ui/SubscriptionModal';

interface ExportItem {
    bondResponse?: BondDtoResponse;
    brandBusinessDtoResponse?: BrandBusinessResponse;
}

interface ExportWrapperProps {
    bonds: ExportItem[];
    isSubscriber?: boolean;
    isAdmin?: boolean;
}

export function ExportWrapper({ bonds, isSubscriber = false, isAdmin = false }: ExportWrapperProps) {
    const [status, setStatus] = useState<'idle' | 'copied_simple' | 'copied_pro'>('idle');
    const [keyRate, setKeyRate] = useState(20);
    const [showModal, setShowModal] = useState(false);
    const searchParams = useSearchParams();

    useEffect(() => {
        getKeyRate().then(setKeyRate);
    }, []);

    const getFiltersText = () => {
        const params: any = {};
        searchParams.forEach((val, key) => {
            if (key.includes('Date')) params[key] = new Date(val);
            else if (['page', 'pageSize', 'sortField', 'sortDir'].includes(key)) return;
            else if (!isNaN(Number(val)) && key !== 'Currency' && key !== 'NominalCurrency' && !key.includes('Rating')) params[key] = Number(val);
            else params[key] = val;
        });
        return convertFiltersToText(params);
    };

    const handleExport = async (isPro: boolean) => {
        if (!isSubscriber && !isAdmin) {
            setShowModal(true);
            return;
        }

        let text = "";
        text += '➖➖➖➖➖➖➖➖➖➖\n';

        for (const item of bonds) {
            if (!item.bondResponse || !item.brandBusinessDtoResponse) continue;

            text += convertBondToText(item.bondResponse, item.brandBusinessDtoResponse, keyRate);

            if (isPro && item.brandBusinessDtoResponse.docType && item.brandBusinessDtoResponse.docType !== '-') {
                text += '\n📊 Показатели бизнеса:\n' + convertBusinessToText(item.brandBusinessDtoResponse);
            }
            text += '\n➖➖➖➖➖➖➖➖➖➖\n';
        }

        if (!isAdmin) {
            const emojis = ['🚀', '📈', '🔥', '💰', '💸'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            text += `\nСпасибо @BondsLab за лучший сервис по подборке облигаций ${randomEmoji}`;
        }

        text += `На этом пока всё, буду рад любой вашей поддержке! Всем удачи на рынке💸\n\n🔔Подписывайтесь❤️\n\n#новичок\n#облигации\n#рынок\n#обучение\n#помощь`;

        try {
            await navigator.clipboard.writeText(text);
            setStatus(isPro ? 'copied_pro' : 'copied_simple');
            setTimeout(() => setStatus('idle'), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    return (
        <>{(isSubscriber || isAdmin) && <div className="flex gap-2 w-full sm:w-auto">
            <button
                onClick={() => handleExport(false)}
                disabled={bonds.length === 0}
                className="flex items-center gap-1.5 h-[38px] px-4 rounded-xl text-xs font-bold bg-[#18181b] dark:bg-white text-white dark:text-[#18181b] hover:opacity-80 transition-all duration-200"
            >
                {status === 'copied_simple' ? <Check size={16} className="text-green-500" /> : <ClipboardList size={16} />}
                {status === 'copied_simple' ? 'Скопировано!' : 'Экспорт'}
            </button>

            <button
                onClick={() => handleExport(true)}
                disabled={bonds.length === 0}
                className="flex items-center gap-1.5 h-[38px] px-4 rounded-xl text-xs font-bold bg-white dark:bg-[#18181b] text-[#18181b] dark:text-white border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200"
                title="Экспорт с финансовыми показателями"
            >
                {status === 'copied_pro' ? <Check size={16} className="text-green-500" /> : <ClipboardList size={16} />}
                {status === 'copied_pro' ? 'Скопировано!' : 'Pro экспорт'}
            </button>
        </div>}


            <SubscriptionModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                isLoggedIn={true}
            />
        </>
    );
}