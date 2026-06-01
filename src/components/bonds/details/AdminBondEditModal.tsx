'use client';

import { useState, useTransition } from 'react';
import {BondDtoResponse, BondRateType} from '@/lib/api';
import { X, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { updateBondAdmin } from '@/actions/bond-actions';
import { RatingSelect } from '@/components/bonds/filters/FilterUI';
import { RATINGS } from '@/components/bonds/filters/constants';

interface AdminBondEditModalProps {
    bond: BondDtoResponse;
    onClose: () => void;
}

export const AdminBondEditModal = ({ bond, onClose }: AdminBondEditModalProps) => {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: bond.name || '',
        shortName: bond.shortName || '',
        fullName: bond.fullName || '',
        ticker: bond.ticker || '',
        isin: bond.isin || '',
        currency: bond.currency || '',
        nominalCurrency: bond.nominalCurrency || '',
        creditRating: bond.creditRating || '',

        price: bond.price ?? '',
        yield: bond._yield ?? bond.currentYield ?? '',
        duration: bond.duration ?? '',
        spread: bond.spread ?? '',
        currentNominal: bond.currentNominal ?? '',
        aciValue: bond.aciValue ?? '',
        currentYield: bond.currentYield ?? '',
        rateType: bond.rateType ?? 0,
        nextCouponValuePrc: bond.nextCouponValuePrc ?? '',
        couponQuantityPerYear: bond.couponQuantityPerYear ?? '',

        marginAbleFlag: bond.marginAbleFlag || false,
        forQualInvestorFlag: bond.forQualInvestorFlag || false,
        amortizationFlag: bond.amortizationFlag || false,
        floatingCouponFlag: bond.floatingCouponFlag || false,
        availableInT: (bond as any).availableInT || false,
        defaultFlag: bond.defaultFlag || false,
        technicalDefaultFlag: bond.technicalDefaultFlag || false,
        availableInAutofollow: bond.availableInAutofollow || false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setForm(prev => ({ ...prev, [name]: checked } as any));
        } else if (type === 'number') {
            setForm(prev => ({ ...prev, [name]: value === '' ? '' : Number(value) } as any));
        } else if (name === 'rateType') {
            setForm(prev => ({ ...prev, rateType: Number(value) as BondRateType }));
        } else {
            setForm(prev => ({ ...prev, [name]: value } as any));
        }
    };

    const handleSave = () => {
        startTransition(async () => {
            setError(null);
            try {
                const payload: any = { ...form };

                const numericFields = [
                    'price', 'duration', 'spread', 'currentNominal',
                    'aciValue', 'currentYield', 'nextCouponValuePrc', 'couponQuantityPerYear'
                ];

                numericFields.forEach(field => {
                    if (payload[field] === '') {
                        payload[field] = null;
                    }
                });

                payload._yield = payload.yield === '' ? null : Number(payload.yield);
                delete payload.yield;

                const result = await updateBondAdmin(bond.id!, payload);

                if (result.success) {
                    window.location.reload();
                } else {
                    setError(`Ошибка: ${result.error}`);
                }
            } catch (err: any) {
                setError(err?.message || 'Что-то пошло не так');
            }
        });
    };

    const renderInput = (label: string, name: keyof typeof form, type = 'text', step?: string) => (
        <div>
            <label className="text-xs text-[var(--color-muted-foreground)] font-medium mb-1.5 block">{label}</label>
            <input
                type={type}
                name={name}
                step={step}
                value={form[name] as string | number}
                onChange={handleChange}
                className="w-full bg-[var(--color-muted)] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 border border-transparent focus:border-primary/20"
            />
        </div>
    );

    const renderCheckbox = (label: string, name: keyof typeof form) => (
        <label className="flex items-center justify-between gap-2 cursor-pointer bg-[var(--color-muted)] hover:bg-[var(--color-muted-foreground)]/10 p-3.5 rounded-xl transition-colors">
            <span className="text-sm font-medium">{label}</span>
            <input
                type="checkbox"
                name={name}
                checked={form[name] as boolean}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
            />
        </label>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-left">
            <div className="bg-[var(--color-card)] w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up flex flex-col max-h-[90dvh]">
                <div className="px-6 py-5 border-b border-[var(--color-border)]/50 flex items-center justify-between sticky top-0 bg-[var(--color-card)] z-10 shrink-0">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Edit3 className="text-primary" size={20} />
                        Расширенное редактирование облигации
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-[var(--color-muted)] hover:bg-[var(--color-muted-foreground)]/20 text-[var(--color-muted-foreground)] hover:text-foreground transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                    {error && (
                        <div className="p-3 bg-danger/10 text-danger rounded-xl text-sm font-semibold">{error}</div>
                    )}

                    <section>
                        <h3 className="text-lg font-bold mb-4">Основная информация</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {renderInput("Короткое название", "shortName")}
                            {renderInput("Название", "name")}
                            {renderInput("Полное название", "fullName")}
                            {renderInput("Тикер", "ticker")}
                            {renderInput("ISIN", "isin")}
                            {renderInput("Валюта расчетов", "currency")}
                            {renderInput("Валюта номинала", "nominalCurrency")}
                            <div className="lg:col-span-1 mt-auto">
                                <RatingSelect
                                    label="Кредитный рейтинг"
                                    value={form.creditRating as string}
                                    onChange={(val) => setForm(prev => ({ ...prev, creditRating: val }))}
                                    options={RATINGS}
                                />
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold mb-4">Финансовые параметры</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {renderInput("Цена (%)", "price", "number", "0.01")}
                            {renderInput("NCD (НКД)", "aciValue", "number", "any")}
                            {renderInput("Доходность (%)", "yield", "number", "0.01")}
                            {renderInput("Дюрация (сутки)", "duration", "number", "1")}
                            {renderInput("Текущий номинал", "currentNominal", "number", "any")}
                            {renderInput("Кол-во выплат в год", "couponQuantityPerYear", "number", "1")}

                            {form.floatingCouponFlag ? (
                                <>
                                    <div className="lg:col-span-1">
                                        <label className="text-xs text-[var(--color-muted-foreground)] font-medium mb-1.5 block">Привязка флоатера</label>
                                        <select
                                            name="rateType"
                                            value={form.rateType}
                                            onChange={handleChange}
                                            className="w-full bg-[var(--color-muted)] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                                        >
                                            <option value={0}>Не указана / Любая</option>
                                            <option value={1}>Ключевая ставка ЦБ</option>
                                            <option value={2}>RUONIA</option>
                                        </select>
                                    </div>
                                    {renderInput("Премия флоатера (%)", "spread", "number", "0.05")}
                                    {renderInput("След. купон (%)", "nextCouponValuePrc", "number", "0.01")}
                                </>
                            ) : null}
                        </div>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold mb-4">Флаги и статусы</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {renderCheckbox("Флоатер (плавающий купон)", "floatingCouponFlag")}
                            {renderCheckbox("Амортизация", "amortizationFlag")}
                            {renderCheckbox("Для квалов", "forQualInvestorFlag")}
                            {renderCheckbox("Доступна маржинальная торговля", "marginAbleFlag")}
                            {renderCheckbox("Доступна в Т-Банке", "availableInT")}
                            {renderCheckbox("Дефолт", "defaultFlag")}
                            {renderCheckbox("Технический дефолт", "technicalDefaultFlag")}
                            {renderCheckbox("В автоследовании", "availableInAutofollow")}
                        </div>
                    </section>
                </div>

                <div className="px-6 py-5 border-t border-[var(--color-border)]/50 shrink-0 bg-[var(--color-card)] flex justify-end gap-3 sticky bottom-0 z-10">
                    <Button variant="secondary" onClick={onClose} disabled={isPending}>
                        Отмена
                    </Button>
                    <Button onClick={handleSave} disabled={isPending}>
                        {isPending ? 'Сохранение...' : 'Сохранить изменения'}
                    </Button>
                </div>
            </div>
        </div>
    );
};