import { Metadata } from "next";
import { BadgeCheck, TrendingUp, Users, Briefcase, Award, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export const metadata: Metadata = {
    title: "О сервисе InvestSnap | Bonds-Lab",
    description: "Сервис создан автором блога InvestSnap (Пульс). Более 13 тыс. подписчиков, квалифицированный инвестор. Удобный анализ облигаций.",
};

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="text-center mb-12 animate-fade-in">
                <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-white">
                    О проекте Bonds-Lab
                </h1>
                <p className="text-zinc-400 text-lg">
                    Инструмент, созданный инвестором для инвесторов.
                </p>
            </div>

            
            <div className="bg-card border border-card-border rounded-2xl p-6 md:p-8 mb-12 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
                
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

                
                <div className="flex-shrink-0 relative z-10">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-zinc-800 overflow-hidden shadow-2xl bg-zinc-900 flex items-center justify-center">
                        
                        <span className="text-4xl font-bold text-zinc-600">IS</span>
                        
                    </div>
                </div>

                
                <div className="flex-1 text-center md:text-left z-10 w-full">
                    <div className="flex flex-col md:flex-row items-center gap-3 mb-2 justify-center md:justify-start">
                        <h2 className="text-3xl font-bold text-white">InvestSnap</h2>
                        <span className="bg-blue-900/30 text-blue-400 border border-blue-900/50 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <BadgeCheck size={14} /> Квал. инвестор
                        </span>
                    </div>

                    <p className="text-zinc-400 mb-6 max-w-lg mx-auto md:mx-0 leading-relaxed">
                        Автор блога в Тинькофф Пульс. На рынке с 2023 года.
                        Разрабатываю лучшие подборки облигаций и анализирую эмитентов, чтобы сэкономить ваше время и снизить риски.
                    </p>

                    <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-6">
                        <StatsBadge icon={<Users size={16}/>} value="13.3K" label="Подписчиков" />
                        <StatsBadge icon={<TrendingUp size={16}/>} value="+19.44%" label="Доходность" color="text-green-400" />
                        <StatsBadge icon={<Briefcase size={16}/>} value="2+" label="Года опыта" />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                        <Link href="https://www.tbank.ru/invest/social/profile/InvestSnap/" target="_blank" className="w-full sm:w-auto">
                            <Button className="w-full">Подписаться в Пульсе</Button>
                        </Link>
                        <Link href="mailto:vkirpikov82@gmail.com" className="w-full sm:w-auto">
                            <Button variant="secondary" className="w-full">
                                <Mail size={16} className="mr-2"/> Написать автору
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-xl">
                    <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                        <Award className="text-primary" /> Зачем этот сервис?
                    </h3>
                    <p className="text-zinc-400 leading-relaxed text-sm md:text-base">
                        Анализ облигаций через Excel-таблицы и разрозненные сайты отнимает часы.
                        Я создал <strong>Bonds-Lab</strong>, чтобы объединить данные Мосбиржи,
                        отчетности эмитентов и удобные фильтры в одном месте. То, чем пользуюсь сам.
                    </p>
                </div>

                <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-xl">
                    <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                        <Users className="text-primary" /> Для кого?
                    </h3>
                    <ul className="space-y-3 text-zinc-400 text-sm md:text-base">
                        <li className="flex gap-3 items-start"><span className="text-primary mt-1">✔</span> <span>Для тех, кто ищет пассивный доход выше депозита.</span></li>
                        <li className="flex gap-3 items-start"><span className="text-primary mt-1">✔</span> <span>Для охотников за высокой доходностью (ВДО).</span></li>
                        <li className="flex gap-3 items-start"><span className="text-primary mt-1">✔</span> <span>Для разумных инвесторов, проверяющих риски.</span></li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

const StatsBadge = ({ icon, value, label, color = "text-white" }: any) => (
    <div className="flex items-center gap-2 bg-zinc-900 px-3 py-2 rounded-lg border border-zinc-800 shadow-sm min-w-[120px]">
        <span className="text-zinc-500">{icon}</span>
        <div className="flex flex-col leading-none">
            <span className={`font-bold ${color} text-sm`}>{value}</span>
            <span className="text-[10px] text-zinc-500 uppercase font-bold mt-0.5">{label}</span>
        </div>
    </div>
);