'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BrandApi, BrandBusinessResponse, ReportQuality } from '@/lib/api';
import { getClientApi } from '@/lib/client-api';
import { Button } from '@/components/ui/Button';
import AdminGuard from '@/components/admin/AdminGuard';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

export function EditBrandClient({ id }: { id: string }) {
    const router = useRouter();

    const [brand, setBrand] = useState<BrandBusinessResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchBrand = async () => {
            try {
                const api = getClientApi(BrandApi);
                const data = await api.apiV1BrandsIdGet({ id });
                setBrand(data);
            } catch (e) {
                console.error(e);
                alert('Ошибка загрузки данных эмитента или нет прав');
                router.push('/bonds');
            } finally {
                setIsLoading(false);
            }
        };
        fetchBrand();
    }, [id, router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!brand) return;
        setIsSaving(true);

        const formData = new FormData(e.currentTarget);
        const getNum = (key: string) => {
            const val = formData.get(key);
            return val && val !== '' ? Number(val) : null;
        };
        const getStr = (key: string) => formData.get(key)?.toString() || null;

        try {
            const api = getClientApi(BrandApi);
            await api.apiV1BrandsIdPut({
                id: brand.id!,
                brandUpdateRequest: {
                    name: getStr('name'),
                    logoName: getStr('logoName'),
                    creditRating: getStr('creditRating'),
                    docType: getStr('docType'),

                    netDebtToEbitda: getNum('netDebtToEbitda'),
                    totalDebtToEquity: getNum('totalDebtToEquity'),
                    totalDebtToAssets: getNum('totalDebtToAssets'),
                    ebitdaToInterestExpense: getNum('ebitdaToInterestExpense'),
                    operatingCashFlowToTotalDebt: getNum('operatingCashFlowToTotalDebt'),

                    ebitdaMargin: getNum('ebitdaMargin'),
                    netProfitMargin: getNum('netProfitMargin'),
                    returnOnAssets: getNum('returnOnAssets'),
                    returnOnInvestment: getNum('returnOnInvestment'),

                    currentRatio: getNum('currentRatio'),
                    quickRatio: getNum('quickRatio'),

                    reportQuality: Number(formData.get('reportQuality')) as ReportQuality
                }
            });
            alert('Сохранено успешно');
            router.refresh(); // Обновляет серверные компоненты, если нужно
        } catch (e) {
            console.error(e);
            alert('Ошибка при сохранении');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <AdminGuard>
                <div className="flex h-[50vh] items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={48}/>
                </div>
            </AdminGuard>
        );
    }

    if (!brand) return null;

    return (
        <AdminGuard>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href={`/bonds/${brand.id}`} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                        <ArrowLeft />
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Редактирование: {brand.name}</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-card border border-card-border p-8 rounded-2xl space-y-8 animate-fade-in">

                <Section title="Основная информация">
                    <Input label="Название" name="name" defaultValue={brand.name} required />
                    <Input label="Логотип (имя файла)" name="logoName" defaultValue={brand.logoName} />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Кредитный рейтинг" name="creditRating" defaultValue={brand.creditRating} />
                        <Input label="Тип документа (отчет)" name="docType" defaultValue={brand.docType} />
                    </div>
                </Section>

                <Section title="Долговая нагрузка">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <Input label="Net Debt / EBITDA" name="netDebtToEbitda" type="number" step="0.01" defaultValue={brand.netDebtToEbitda} />
                        <Input label="Debt / Equity" name="totalDebtToEquity" type="number" step="0.01" defaultValue={brand.totalDebtToEquity} />
                        <Input label="Debt / Assets" name="totalDebtToAssets" type="number" step="0.01" defaultValue={brand.totalDebtToAssets} />
                        <Input label="Interest Coverage" name="ebitdaToInterestExpense" type="number" step="0.01" defaultValue={brand.ebitdaToInterestExpense} />
                        <Input label="OCF / Debt" name="operatingCashFlowToTotalDebt" type="number" step="0.01" defaultValue={brand.operatingCashFlowToTotalDebt} />
                    </div>
                </Section>

                <Section title="Рентабельность и Эффективность">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <Input label="EBITDA Margin %" name="ebitdaMargin" type="number" step="0.01" defaultValue={brand.ebitdaMargin} />
                        <Input label="Net Profit Margin %" name="netProfitMargin" type="number" step="0.01" defaultValue={brand.netProfitMargin} />
                        <Input label="ROA %" name="returnOnAssets" type="number" step="0.01" defaultValue={brand.returnOnAssets} />
                        <Input label="ROI %" name="returnOnInvestment" type="number" step="0.01" defaultValue={brand.returnOnInvestment} />
                    </div>
                </Section>

                <Section title="Ликвидность и Качество">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <Input label="Current Ratio" name="currentRatio" type="number" step="0.01" defaultValue={brand.currentRatio} />
                        <Input label="Quick Ratio" name="quickRatio" type="number" step="0.01" defaultValue={brand.quickRatio} />
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Качество отчета</label>
                            <select
                                name="reportQuality"
                                defaultValue={brand.reportQuality}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:border-primary outline-none"
                            >
                                <option value="0">Нормальное</option>
                                <option value="1">Хорошее</option>
                                <option value="2">Плохое</option>
                            </select>
                        </div>
                    </div>
                </Section>

                <div className="flex justify-end pt-4 border-t border-zinc-800">
                    <Button size="lg" isLoading={isSaving} className="w-full sm:w-auto">
                        <Save className="mr-2" size={18} />
                        Сохранить изменения
                    </Button>
                </div>
            </form>
        </AdminGuard>
    );
}

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const Input = ({ label, name, type = "text", defaultValue, step, required }: any) => (
    <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1.5">{label}</label>
        <input
            type={type}
            name={name}
            step={step}
            defaultValue={defaultValue ?? ''}
            required={required}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:border-primary outline-none transition-all placeholder:text-zinc-600 focus:bg-zinc-800"
        />
    </div>
);