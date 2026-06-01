'use client';

import { useState, useEffect } from 'react';
import { FinancialReport, AdminReportApi } from '@/lib/api';
import { getClientApi } from '@/lib/client-api';
import { Loader2, Calendar } from 'lucide-react';

interface AdminReportsTableProps {
    refreshTrigger: number;
}

export function AdminReportsTable({ refreshTrigger }: AdminReportsTableProps) {
    const [reports, setReports] = useState<FinancialReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            setIsLoading(true);
            try {
                const api = getClientApi(AdminReportApi);
                const response = await api.apiV1AdminReportsGet();

                if (response && response.financialReports) {
                    setReports(response.financialReports);
                } else {
                    setReports([]);
                }
            } catch (e) {
                console.error("Failed to fetch admin reports", e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReports();
    }, [refreshTrigger]);

    if (isLoading) {
        return <div className="flex py-10 justify-center text-zinc-500"><Loader2 className="animate-spin" /></div>;
    }

    if (reports.length === 0) {
        return <div className="text-center py-10 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800 text-zinc-500 text-sm">Готовых отчетов пока нет.</div>;
    }

    return (
        <div className="bg-card rounded-xl border border-card-border overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-zinc-900 text-zinc-400">
                <tr>
                    <th className="p-4 font-medium">Название / Документ</th>
                    <th className="p-4 font-medium">Эмитенты</th>
                    <th className="p-4 font-medium">Метрики (Текущий / Прошлый)</th>
                    <th className="p-4 font-medium">Дата создания</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-zinc-800/50 transition-colors">
                        <td className="p-4">
                            <div className="flex flex-col gap-1">
                                <div className="font-bold text-white flex items-center gap-2">
                                    {report.fileUrl ? (
                                        <a href={"https://s3.bonds-lab.ru" + report.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                            {report.title || 'Без названия'}
                                        </a>
                                    ) : (
                                        <span>{report.title || 'Без названия'}</span>
                                    )}
                                </div>
                                <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded w-fit border border-zinc-800">
                                        {report.docType || 'Не указан'}
                                    </span>
                            </div>
                        </td>
                        <td className="p-4">
                            <div className="flex flex-col gap-1 max-w-[200px]">
                                {report.brands && report.brands.length > 0 ? (
                                    report.brands.map(b => (
                                        <span key={b.id} className="text-xs text-zinc-300 truncate" title={b.name || ''}>• {b.name}</span>
                                    ))
                                ) : (
                                    <span className="text-xs text-zinc-600">Нет привязки</span>
                                )}
                            </div>
                        </td>
                        <td className="p-4 font-mono text-xs">
                            <div className="flex flex-col gap-1">
                                <span className="text-zinc-400">Выручка: <span className="text-zinc-200">{report.revenue || '-'}</span> / <span className="text-zinc-500">{report.revenuePrev || '-'}</span></span>
                                <span className="text-zinc-400">Ч.Прибыль: <span className="text-zinc-200">{report.netProfit || '-'}</span> / <span className="text-zinc-500">{report.netProfitPrev || '-'}</span></span>
                                <span className="text-zinc-400">EBITDA: <span className="text-zinc-200">{report.ebitda || '-'}</span> / <span className="text-zinc-500">{report.ebitdaPrev || '-'}</span></span>
                            </div>
                        </td>
                        <td className="p-4 text-xs text-zinc-500">
                            <div className="flex items-center gap-1.5">
                                <Calendar size={14} />
                                {report.createdAt ? new Date(report.createdAt).toLocaleDateString('ru-RU') : '-'}
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
