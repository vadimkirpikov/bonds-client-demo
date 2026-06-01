'use client';

import { Job, ProcessingState } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { RefreshCw, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';

interface JobTableProps {
    jobs: Job[];
    onReview: (job: Job) => void;
}

export const JobTable = ({ jobs, onReview }: JobTableProps) => {
    const getStatusBadge = (state?: ProcessingState) => {
        switch (state) {
            case ProcessingState.NUMBER_0:
                return <span className="flex items-center gap-2 text-zinc-500"><Clock size={16}/> В очереди</span>;
            case ProcessingState.NUMBER_1:
                return <span className="flex items-center gap-2 text-yellow-500"><RefreshCw size={16} className="animate-spin"/> В процессе</span>;
            case ProcessingState.NUMBER_2:
                return <span className="flex items-center gap-2 text-green-500"><CheckCircle size={16}/> Готово</span>;
            case ProcessingState.NUMBER_3:
                return <span className="flex items-center gap-2 text-red-500"><XCircle size={16}/> Ошибка</span>;
            default:
                return <span className="text-zinc-500">Неизвестно</span>;
        }
    };

    return (
        <div className="bg-card rounded-xl border border-card-border overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-zinc-900 text-zinc-400">
                <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Файл</th>
                    <th className="p-4">Статус</th>
                    <th className="p-4">Действия</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                {jobs.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="p-8 text-center text-zinc-500">
                            Задач пока нет
                        </td>
                    </tr>
                ) : (
                    jobs.map((job) => (
                        <tr key={job.id} className="hover:bg-zinc-800/50 transition-colors">
                            <td className="p-4 font-mono text-xs text-zinc-500 truncate max-w-[100px]" title={job.id}>
                                {job.id?.substring(0, 8)}...
                            </td>
                            <td className="p-4">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-zinc-200">{job.jobName || 'Без названия'}</span>
                                    {job.fileUrl && (
                                        <a
                                            href={job.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:text-white transition-colors"
                                            title="Открыть отчет"
                                        >
                                            <FileText size={16} />
                                        </a>
                                    )}
                                </div>
                                <div className="text-xs text-zinc-500 mt-0.5">{job.fileName}</div>
                            </td>
                            <td className="p-4">
                                {getStatusBadge(job.processingState)}
                                {job.errorMessage && (
                                    <div className="text-xs text-red-400 mt-1 max-w-xs truncate" title={job.errorMessage}>
                                        {job.errorMessage}
                                    </div>
                                )}
                            </td>
                            <td className="p-4">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    disabled={job.processingState !== ProcessingState.NUMBER_2}
                                    onClick={() => onReview(job)}
                                >
                                    Просмотр
                                </Button>
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>
        </div>
    );
};