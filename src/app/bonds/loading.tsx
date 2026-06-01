export default function BondsLoading() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col gap-6">

                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        
                        <div className="h-9 w-48 bg-zinc-800 rounded-lg animate-pulse mb-2" />
                        
                        <div className="h-5 w-32 bg-zinc-900 rounded animate-pulse" />
                    </div>

                    
                    <div className="flex gap-2">
                        <div className="h-10 w-28 bg-zinc-800 rounded-lg animate-pulse" />
                        <div className="h-10 w-28 bg-zinc-800 rounded-lg animate-pulse" />
                    </div>
                </div>

                
                <div className="space-y-2">
                    <div className="h-3 w-32 bg-zinc-900 rounded animate-pulse mb-2" />
                    <div className="flex gap-3 overflow-hidden">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-9 w-24 bg-zinc-900 border border-zinc-800 rounded-lg animate-pulse shrink-0" />
                        ))}
                    </div>
                </div>

                
                <div className="flex flex-col gap-3 min-h-[500px]">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-card border border-card-border rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

                            
                            <div className="flex items-center gap-4 w-full md:w-1/3">
                                <div className="w-12 h-12 rounded-full bg-zinc-800 animate-pulse shrink-0" />
                                <div className="space-y-2 w-full max-w-[200px]">
                                    <div className="h-5 w-3/4 bg-zinc-800 rounded animate-pulse" />
                                    <div className="flex gap-2">
                                        <div className="h-4 w-20 bg-zinc-900 rounded animate-pulse" />
                                        <div className="h-4 w-12 bg-zinc-900 rounded animate-pulse" />
                                    </div>
                                </div>
                            </div>

                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 w-full md:w-auto shrink-0">
                                {[1, 2, 3, 4].map((j) => (
                                    <div key={j} className="min-w-[80px] space-y-1.5">
                                        <div className="h-3 w-12 bg-zinc-900 rounded animate-pulse" />
                                        <div className="h-4 w-16 bg-zinc-800 rounded animate-pulse" />
                                    </div>
                                ))}
                            </div>

                            
                            <div className="flex items-center gap-4 w-full md:w-auto justify-end mt-2 md:mt-0 border-t md:border-none border-zinc-800 pt-2 md:pt-0">
                                <div className="h-8 w-24 bg-zinc-900 rounded-full animate-pulse" />
                                <div className="h-8 w-8 bg-zinc-900 rounded-full animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>

                
                <div className="flex justify-center items-center gap-4 mt-8">
                    <div className="h-9 w-24 bg-zinc-800 rounded-lg animate-pulse" />
                    <div className="h-9 w-32 bg-zinc-900 rounded-lg animate-pulse" />
                    <div className="h-9 w-24 bg-zinc-800 rounded-lg animate-pulse" />
                </div>
            </div>
        </div>
    );
}