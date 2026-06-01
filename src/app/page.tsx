import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight, BarChart2, ShieldCheck, Zap, Handshake, Coins, Gift, CreditCard, Settings2, Search, FolderOpen, Briefcase, Lock, PieChart, Filter, Rocket, Info, Star } from "lucide-react";
import { FadeIn } from "@/components/ui/FadeIn";

const TBankIcon = ({ size = 32 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block shrink-0">
      <path d="M4 8C4 8 16 2 28 8C28 8 30 22 16 30C2 22 4 8 4 8Z" fill="#FFDD2D"/>
      <path d="M11 12H21V15H17.5V23H14.5V15H11V12Z" fill="#1C1C1E"/>
    </svg>
);

const FEATURES = [
  { icon: <Zap className="text-amber-500" size={32} />, bg: "bg-amber-50 dark:bg-amber-500/10", title: "Мгновенные результаты", desc: "Фильтрация тысяч выпусков по сложным критериям за миллисекунды." },
  { icon: <ShieldCheck className="text-primary" size={32} />, bg: "bg-emerald-50 dark:bg-emerald-500/10", title: "Кредитное качество", desc: "Оценка надежности эмитентов по финансовым показателям из реальных отчетностей." },
  { icon: <BarChart2 className="text-blue-500" size={32} />, bg: "bg-blue-50 dark:bg-blue-500/10", title: "AI-анализ отчетностей", desc: "Нейросети разбирают финансовые отчеты и рассчитывают ключевые метрики за вас." },
  { icon: <Settings2 className="text-purple-500" size={32} />, bg: "bg-purple-50 dark:bg-purple-500/10", title: "Гибкие фильтры", desc: "25+ параметров поиска. Настройте интерфейс под себя и видьте только важное." },
  { icon: <Search className="text-pink-500" size={32} />, bg: "bg-pink-50 dark:bg-pink-500/10", title: "Умные альтернативы", desc: "Находите бумаги для замены — с большей доходностью или меньшим риском." },
  { icon: <FolderOpen className="text-indigo-500" size={32} />, bg: "bg-indigo-50 dark:bg-indigo-500/10", title: "Ваши коллекции", desc: "Сохраняйте удачные комбинации фильтров для быстрого мониторинга рынка." },
];

export default function Home() {
  return (
      <div className="relative overflow-hidden text-[var(--color-foreground)]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-[200px] -left-[200px] w-[500px] h-[500px] bg-amber-500/5 blur-[100px] rounded-full pointer-events-none animate-float-slow" />
        <div className="absolute top-[400px] -right-[200px] w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none animate-float-delayed" />

        <div className="container mx-auto px-4 py-12 sm:py-24 flex flex-col items-center text-center relative z-10">

          <FadeIn delay={100}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Интеграция с Т-Инвестициями
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-[var(--color-foreground)] [text-wrap:balance]">
              Ваш портфель облигаций. <br/>
              <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">Под полным контролем.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={300}>
            <p className="text-lg md:text-xl text-[var(--color-muted-foreground)] max-w-2xl mb-10 leading-relaxed">
              Скринер с 25+ фильтрами, AI-анализ отчетностей, синхронизация портфеля
              из Т-Инвестиций и мгновенный поиск лучших бумаг на рынке.
            </p>
          </FadeIn>

          <FadeIn delay={400}>
            <div className="flex flex-col sm:flex-row gap-4 mb-24">
              <Link href="/bonds">
                <Button size="lg" className="group shadow-glow-primary hover:shadow-glow-primary-hover animate-pulse-glow">
                  Подобрать облигации
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/portfolio">
                <Button variant="secondary" size="lg" className="bg-[var(--color-card)] shadow-card text-[var(--color-foreground)] group">
                  Мой портфель
                  <Briefcase size={18} className="group-hover:scale-110 transition-transform" />
                </Button>
              </Link>
            </div>
          </FadeIn>

          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mb-14">
            {FEATURES.map((f, i) => (
                <FadeIn key={i} delay={100 + i * 100}>
                  <div className="p-8 rounded-3xl bg-[var(--color-card)] shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 text-left group h-full">
                    <div className={`mb-6 w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 ${f.bg}`}>
                      {f.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-[var(--color-foreground)]">{f.title}</h3>
                    <p className="text-[var(--color-muted-foreground)] leading-relaxed">{f.desc}</p>
                  </div>
                </FadeIn>
            ))}
          </div>

          
          <div className="w-full max-w-6xl mx-auto relative text-left mb-14">
            <FadeIn delay={200}>
              <div className="relative sm:bg-[var(--color-card)] sm:rounded-[2.5rem] sm:p-8 md:p-12 sm:shadow-card sm:overflow-hidden">
                <div className="hidden sm:block absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-amber-400/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="hidden sm:block absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-primary/5 rounded-full blur-[60px] pointer-events-none" />

                <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 relative z-10">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
                      <TBankIcon size={16} /> Новая интеграция
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-foreground)] mb-5 leading-tight tracking-tight">
                      Портфель из Т-Инвестиций <br/>
                      <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">прямо в скринере</span>
                    </h2>
                    <p className="text-[var(--color-muted-foreground)] mb-8 text-base md:text-lg leading-relaxed">
                      Подключите API-ключ Т-Инвестиций и видьте свой портфель облигаций
                      в едином интерфейсе. Фильтруйте бумаги по наличию в портфеле,
                      отслеживайте долю каждого эмитента и личную доходность.
                    </p>
                    <Link href="/portfolio" className="inline-block w-full sm:w-auto">
                      <Button size="lg" className="w-full shadow-glow-primary hover:shadow-glow-primary-hover group">
                        Открыть портфель <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    <div className="bg-[var(--color-muted)] p-6 rounded-2xl shadow-sm hover:shadow-card transition-all duration-300 hover:-translate-y-0.5">
                      <div className="bg-[var(--color-card)] shadow-sm w-12 h-12 rounded-xl flex items-center justify-center mb-4"><PieChart className="text-amber-500" size={24} /></div>
                      <h4 className="text-lg text-[var(--color-foreground)] font-bold mb-2">Все позиции</h4>
                      <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">Полный обзор портфеля с актуальными ценами и доходностью.</p>
                    </div>
                    <div className="bg-[var(--color-muted)] p-6 rounded-2xl shadow-sm hover:shadow-card transition-all duration-300 hover:-translate-y-0.5">
                      <div className="bg-[var(--color-card)] shadow-sm w-12 h-12 rounded-xl flex items-center justify-center mb-4"><Filter className="text-primary" size={24} /></div>
                      <h4 className="text-lg text-[var(--color-foreground)] font-bold mb-2">Фильтр портфеля</h4>
                      <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">Фильтруйте скринер по наличию бумаги в портфеле.</p>
                    </div>
                    <div className="bg-[var(--color-muted)] p-6 rounded-2xl shadow-sm hover:shadow-card transition-all duration-300 hover:-translate-y-0.5 sm:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                      <div className="bg-[var(--color-card)] shadow-sm p-3.5 rounded-xl shrink-0"><Lock className="text-primary" size={28} /></div>
                      <div>
                        <h4 className="text-lg text-[var(--color-foreground)] font-bold mb-1">Полная безопасность</h4>
                        <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">Токен хранится в зашифрованном виде. Права «только для чтения» — сделки невозможны.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          
          <div className="w-full max-w-6xl mx-auto relative text-left mb-14">
            <FadeIn delay={200}>
              <div className="relative sm:bg-[var(--color-card)] sm:rounded-[2.5rem] sm:p-8 md:p-12 sm:shadow-card sm:overflow-hidden">
                <div className="hidden sm:block absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="hidden sm:block absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-indigo-500/5 rounded-full blur-[60px] pointer-events-none" />

                <div className="flex flex-col lg:flex-row-reverse items-center gap-10 lg:gap-16 relative z-10">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
                      <Rocket size={16} /> Новый раздел
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-foreground)] mb-5 leading-tight tracking-tight">
                      Первичные размещения <br/>
                      <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">в один клик</span>
                    </h2>
                    <p className="text-[var(--color-muted-foreground)] mb-8 text-base md:text-lg leading-relaxed">
                      Участвуйте в новых выпусках корпоративных облигаций до их выхода на вторичный рынок. 
                      Получите доступ ко всем параметрам, анализу эмитента и экспертным комментариям.
                    </p>
                    <Link href="/placements" className="inline-block w-full sm:w-auto">
                      <Button size="lg" className="w-full shadow-glow-primary hover:shadow-glow-primary-hover group bg-blue-600 hover:bg-blue-700 text-white border-transparent">
                        Смотреть размещения <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    <div className="bg-[var(--color-muted)] p-6 rounded-2xl shadow-sm hover:shadow-card transition-all duration-300 hover:-translate-y-0.5 sm:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                      <div className="bg-[var(--color-card)] shadow-sm p-3.5 rounded-xl shrink-0"><Star className="text-amber-500 fill-amber-500" size={28} /></div>
                      <div>
                        <h4 className="text-lg text-[var(--color-foreground)] font-bold mb-1">Все параметры как на ладони</h4>
                        <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">Полная информация о купонах, объемах, сроках и рейтингах собрана на одной странице.</p>
                      </div>
                    </div>
                    <div className="bg-[var(--color-muted)] p-6 rounded-2xl shadow-sm hover:shadow-card transition-all duration-300 hover:-translate-y-0.5">
                      <div className="bg-[var(--color-card)] shadow-sm w-12 h-12 rounded-xl flex items-center justify-center mb-4"><Info className="text-blue-500" size={24} /></div>
                      <h4 className="text-lg text-[var(--color-foreground)] font-bold mb-2">Комментарии экспертов</h4>
                      <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">Важные заметки и ограничения по каждому выпуску от аналитиков.</p>
                    </div>
                    <div className="bg-[var(--color-muted)] p-6 rounded-2xl shadow-sm hover:shadow-card transition-all duration-300 hover:-translate-y-0.5">
                      <div className="bg-[var(--color-card)] shadow-sm w-12 h-12 rounded-xl flex items-center justify-center mb-4"><ShieldCheck className="text-emerald-500" size={24} /></div>
                      <h4 className="text-lg text-[var(--color-foreground)] font-bold mb-2">Анализ эмитента</h4>
                      <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">Финансовые результаты и отчетность компании прямо на странице размещения.</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          
          <div className="w-full max-w-6xl mx-auto relative text-left">
            <FadeIn delay={200}>
              <div className="relative sm:bg-[var(--color-card)] sm:rounded-[2.5rem] sm:p-8 md:p-12 sm:shadow-card sm:overflow-hidden">
                <div className="hidden sm:block absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
                <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 relative z-10">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
                      <Handshake size={14} /> Партнерская программа
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-foreground)] mb-5 leading-tight tracking-tight">
                      Создайте пассивный доход <br/><span className="text-primary">без вложений</span>
                    </h2>
                    <p className="text-[var(--color-muted-foreground)] mb-8 text-base md:text-lg leading-relaxed">
                      Рекомендуйте <b>Bonds-Lab</b> друзьям, подписчикам или коллегам.
                      Вы получаете процент с каждой их оплаты, а они — скидку на тариф.
                    </p>
                    <Link href="/dashboard" className="inline-block w-full sm:w-auto">
                      <Button size="lg" className="w-full shadow-glow-primary hover:shadow-glow-primary-hover">Получить свою ссылку</Button>
                    </Link>
                  </div>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    <div className="bg-[var(--color-muted)] p-6 rounded-2xl shadow-sm hover:shadow-card transition-shadow">
                      <div className="bg-[var(--color-card)] shadow-sm w-12 h-12 rounded-xl flex items-center justify-center mb-4"><Coins className="text-amber-500" size={24} /></div>
                      <h4 className="text-lg text-[var(--color-foreground)] font-bold mb-2">Щедрые выплаты</h4>
                      <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">Стабильный процент с каждой успешной подписки.</p>
                    </div>
                    <div className="bg-[var(--color-muted)] p-6 rounded-2xl shadow-sm hover:shadow-card transition-shadow">
                      <div className="bg-[var(--color-card)] shadow-sm w-12 h-12 rounded-xl flex items-center justify-center mb-4"><Gift className="text-pink-500" size={24} /></div>
                      <h4 className="text-lg text-[var(--color-foreground)] font-bold mb-2">Выгода друзьям</h4>
                      <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">Эксклюзивная скидка на PRO-доступ по вашей ссылке.</p>
                    </div>
                    <div className="bg-[var(--color-muted)] p-6 rounded-2xl shadow-sm hover:shadow-card transition-shadow sm:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                      <div className="bg-[var(--color-card)] shadow-sm p-3.5 rounded-xl shrink-0"><CreditCard className="text-primary" size={28} /></div>
                      <div>
                        <h4 className="text-lg text-[var(--color-foreground)] font-bold mb-1">Вывод реальных денег</h4>
                        <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">Выводите заработок напрямую на банковскую карту.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

        </div>
      </div>
  );
}