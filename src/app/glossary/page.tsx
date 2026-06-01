import { GLOSSARY_TERMS, GlossaryTerm } from '@/utils/mock-data';
import {Metadata} from "next";

export const metadata: Metadata = {
    title: "Глоссарий инвестора | Термины и формулы",
    description: "Что такое дюрация, оферта, EBITDA, НКД. Простые объяснения сложных терминов с примерами.",
    keywords: ["глоссарий инвестиций", "словарь трейдера", "формула дюрации", "что такое нкд"]
};

export default function Glossary() {
    const categories: Record<string, GlossaryTerm[]> = GLOSSARY_TERMS.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, GlossaryTerm[]>);

    const categoryOrder = ['База', 'Показатели', 'Риски', 'Торговля'];

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                    Глоссарий инвестора
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Разбираемся в терминологии долгового рынка: от купонов до дюрации и мультипликаторов.
                </p>
            </div>

            <div className="space-y-16">
                {categoryOrder.map((cat) => (
                    categories[cat] && (
                        <div key={cat} className="animate-fade-in">
                            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                                <span className="w-2 h-8 bg-primary rounded-full"/>
                                {cat}
                            </h2>
                            <div className="grid grid-cols-1 gap-6">
                                {categories[cat].sort((a,b) => a.term.localeCompare(b.term)).map((item, idx) => (
                                    <div key={idx} className="bg-card rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <div className="md:w-1/3">
                                                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                                                    {item.term}
                                                </h3>
                                            </div>
                                            <div className="md:w-2/3 space-y-4">
                                                <p className="text-slate-600 leading-relaxed text-base">
                                                    {item.def}
                                                </p>

                                                {item.formula && (
                                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Формула</span>
                                                        <code className="font-mono text-primary font-medium">
                                                            {item.formula}
                                                        </code>
                                                    </div>
                                                )}

                                                {item.example && (
                                                    <div className="flex gap-4 items-start bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                        <div className="mt-1.5 w-1.5 h-1.5 bg-accent rounded-full shrink-0" />
                                                        <div>
                                                            <span className="text-xs font-bold text-accent uppercase tracking-wider block mb-1">Пример</span>
                                                            <p className="text-sm text-slate-600">
                                                                {item.example}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
}