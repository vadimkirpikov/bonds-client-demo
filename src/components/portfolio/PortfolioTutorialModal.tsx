'use client';

import { useEffect } from 'react';
import { X, Info, TrendingUp, AlertCircle, BarChart3 } from 'lucide-react';

interface PortfolioTutorialModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PortfolioTutorialModal = ({ isOpen, onClose }: PortfolioTutorialModalProps) => {

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[var(--color-background)] sm:bg-black/50 sm:backdrop-blur-sm flex flex-col sm:items-center sm:justify-center z-[100] sm:p-4 animate-fade-in">
            <div className="bg-[var(--color-card)] w-full h-[100dvh] sm:h-auto sm:max-h-[90dvh] sm:max-w-2xl sm:rounded-3xl shadow-2xl relative flex flex-col overflow-hidden">
                
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[var(--color-primary)]/10 to-transparent pointer-events-none" />

                <div className="sticky top-0 bg-[var(--color-card)]/80 backdrop-blur-md z-10 px-6 py-4 border-b border-[var(--color-muted)] flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--color-foreground)]">
                        <Info className="text-[var(--color-primary)]" size={24} /> 
                        Как понимать метрики
                    </h2>
                    <button onClick={onClose} className="p-2 bg-[var(--color-muted)] hover:bg-[var(--color-muted)]/80 rounded-full transition-colors text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 relative z-0 space-y-8">
                    
                    <div>
                        <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-3 flex items-center gap-2">
                            <TrendingUp className="text-emerald-500" size={20} /> 
                            XIRR (Годовая доходность)
                        </h3>
                        <div className="text-sm text-[var(--color-muted-foreground)] leading-relaxed space-y-3">
                            <p>
                                <b>XIRR</b> — внутренняя норма доходности с учётом дат всех денежных потоков. Проще говоря, она показывает, сколько реально заработал ваш портфель <span className="text-[var(--color-foreground)] font-semibold">в пересчёте на год</span>, с учётом того, когда именно вы вносили и выводили деньги.
                            </p>
                            <div className="bg-[var(--color-muted)] p-4 rounded-xl">
                                В расчёт идут <b>все операции с момента первой покупки</b>: купоны, сделки, амортизации, комиссии. Чем дольше работает портфель — тем точнее показатель.
                            </div>
                            <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl">
                                <b>Ориентиры:</b> для облигационного портфеля хороший XIRR обычно в диапазоне <span className="text-[var(--color-foreground)] font-semibold">12–22%</span> годовых (при текущем уровне ставок). Ниже 10% — стоит пересмотреть состав. Выше 25% — скорее всего, портфель молодой или были удачные спекулятивные сделки.
                            </div>
                            <p>
                                Сравнивайте свой XIRR со ставками по депозитам и с индексом гособлигаций RGBITR. Если портфель стабильно обгоняет депозит на 2–4 п.п. — значит, облигации отрабатывают свою задачу.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-3 flex items-center gap-2">
                            <BarChart3 className="text-blue-500" size={20} /> 
                            Средневзвешенная доходность
                        </h3>
                        <div className="text-sm text-[var(--color-muted-foreground)] leading-relaxed space-y-3">
                            <p>
                                Если XIRR — это то, что <i>уже было</i>, то средневзвешенная доходность — это <span className="text-[var(--color-foreground)] font-semibold">прогноз</span>. Она считается из текущих рыночных цен и будущих выплат по каждой бумаге, пропорционально их весу в портфеле.
                            </p>
                            <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl">
                                <b>Ориентиры:</b> средневзвешенная доходность портфеля <span className="text-[var(--color-foreground)] font-semibold">14–20%</span> — нормальный уровень для сбалансированного портфеля. «Фикс. купоны» показывает доходность только бумаг с фиксированным купоном, а «корп. фикс» — только корпоративных (без ОФЗ). Разница между ними — та самая премия за кредитный риск, обычно <span className="text-[var(--color-foreground)] font-semibold">1,5–5 п.п.</span>
                            </div>
                            <p>
                                Если разрыв между доходностью ОФЗ и корпоратов меньше 1,5 п.п. — возможно, проще переложиться в гособлигации. Если больше 5 п.п. — проверьте, нет ли в портфеле бумаг с повышенным риском дефолта.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-3 flex items-center gap-2">
                            <AlertCircle className="text-amber-500" size={20} /> 
                            На что обратить внимание
                        </h3>
                        <div className="text-sm text-[var(--color-muted-foreground)] leading-relaxed space-y-3">
                            <ul className="list-disc pl-5 space-y-2">
                                <li><b>Общая прибыль vs Прогноз на год</b> — это разные вещи. Прибыль — сколько вы уже заработали за всё время. Прогноз — расчёт на следующие 12 месяцев исходя из того, что сейчас лежит в портфеле.</li>
                                <li><b>XIRR vs YTM</b> — XIRR зависит от ваших конкретных дат покупок. YTM конкретной бумаги — математическая модель при условии, что купоны реинвестируются по той же ставке. На практике так не бывает, поэтому YTM всегда немного «приукрашивает».</li>
                                <li><b>Бумажные убытки по цене</b> — если вы держите облигации до погашения, просадка по рыночной цене не влияет на итоговый результат. Номинал вы получите полностью. Волноваться стоит, только если планируете продавать досрочно.</li>
                                <li><b>Доля эмитента выше 15–20%</b> — сигнал к диверсификации. Даже если бумага надёжная, концентрация в одном имени повышает риск.</li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
