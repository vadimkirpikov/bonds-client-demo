'use client';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MarketMapBondDto, OfzYieldPointDto } from '@/lib/api';
import { getMarketMapData } from '@/actions/market-map-actions';
import { Loader2, TrendingUp, AlertCircle, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { MARGIN, RATING_LEGEND, getRatingColor, getRatingGroup, computeBounds, generateTicks, buildOfzPath, Bounds } from './market-map-utils';
import { cn } from '@/components/ui/Button';

interface MarketMapViewProps { searchParams: Record<string, string>; keyRate: number; showOfzCurve?: boolean; }

export const MarketMapView = ({ searchParams, keyRate, showOfzCurve = true }: MarketMapViewProps) => {
    const router = useRouter();
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [bonds, setBonds] = useState<MarketMapBondDto[]>([]);
    const [ofzCurve, setOfzCurve] = useState<OfzYieldPointDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hovered, setHovered] = useState<MarketMapBondDto | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const [dims, setDims] = useState({ width: 900, height: 520 });

    const [viewBounds, setViewBounds] = useState<Bounds | null>(null);
    const [baseBounds, setBaseBounds] = useState<Bounds | null>(null);
    const [initialBounds, setInitialBounds] = useState<Bounds | null>(null);
    const [isPanning, setIsPanning] = useState(false);
    const panStart = useRef({ x: 0, y: 0 });
    const panBoundsStart = useRef<Bounds | null>(null);

    const pinchStart = useRef<number | null>(null);

    const [activeRatings, setActiveRatings] = useState<Set<string>>(new Set());

    const toggleRating = (r: string) => {
        setActiveRatings(prev => {
            const next = new Set(prev);
            if (next.has(r)) next.delete(r);
            else next.add(r);
            return next;
        });
    };

    const clampBounds = useCallback((b: Bounds, base: Bounds) => {
        const MIN_X = -0.5;
        const MIN_Y = -30;
        const MAX_X = Math.max(30, base.xMax * 1.5);
        const MAX_Y = Math.max(50, base.yMax * 1.5);
        const MIN_RANGE_X = 0.5;
        const MIN_RANGE_Y = 1;

        let { xMin, xMax, yMin, yMax } = b;

        const MAX_RANGE_X = Math.max(10, (base.xMax - base.xMin) * 2);
        const MAX_RANGE_Y = Math.max(30, (base.yMax - base.yMin) * 2);

        if (xMax - xMin > MAX_RANGE_X) {
            const c = (xMax + xMin)/2;
            xMin = c - MAX_RANGE_X/2; xMax = c + MAX_RANGE_X/2;
        }
        if (yMax - yMin > MAX_RANGE_Y) {
            const c = (yMax + yMin)/2;
            yMin = c - MAX_RANGE_Y/2; yMax = c + MAX_RANGE_Y/2;
        }

        if (xMax - xMin < MIN_RANGE_X) {
            const c = (xMax + xMin)/2;
            xMin = c - MIN_RANGE_X/2; xMax = c + MIN_RANGE_X/2;
        }
        if (yMax - yMin < MIN_RANGE_Y) {
            const c = (yMax + yMin)/2;
            yMin = c - MIN_RANGE_Y/2; yMax = c + MIN_RANGE_Y/2;
        }

        if (xMin < MIN_X) { const d = MIN_X - xMin; xMin += d; xMax += d; }
        if (yMin < MIN_Y) { const d = MIN_Y - yMin; yMin += d; yMax += d; }
        if (xMax > MAX_X && xMin > MIN_X) { const d = xMax - MAX_X; xMin -= d; xMax -= d; }
        if (yMax > MAX_Y && yMin > MIN_Y) { const d = yMax - MAX_Y; yMin -= d; yMax -= d; }

        return { xMin: Math.max(MIN_X, xMin), xMax, yMin: Math.max(MIN_Y, yMin), yMax };
    }, []);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const obs = new ResizeObserver(entries => {
            const w = entries[0].contentRect.width;
            const isMobile = window.innerWidth < 640;
            const calcHeight = isMobile ? Math.max(w * 1.15, 300) : Math.min(Math.max(w * 0.55, 400), 850);

            setDims({ width: Math.max(w, 250), height: calcHeight });
        });
        obs.observe(el);
        return () => obs.disconnect();
    }, [loading]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true); setError(null);
        const f = { ...searchParams }; delete f['page']; delete f['pageSize'];
        getMarketMapData(f).then(data => {
            if (cancelled) return;
            const b = data.bonds || [];
            const c = (data.ofzYieldCurve || []).filter(p => p.durationYears != null && p._yield != null).sort((a, b) => a.durationYears! - b.durationYears!);
            setBonds(b); setOfzCurve(c);

            const bounds = computeBounds(b, c, keyRate);
            setBaseBounds(bounds);

            const valid = b.filter(x => x.durationYears != null && x._yield != null && x._yield > -50 && x._yield < 200);
            const dSort = valid.map(x => x.durationYears!).sort((x, y) => x - y);
            const ySort = valid.map(x => x._yield!).sort((x, y) => x - y);

            const p95Dur = dSort.length > 0 ? dSort[Math.floor(dSort.length * 0.95)] : bounds.xMax;
            const p98Yld = ySort.length > 0 ? ySort[Math.floor(ySort.length * 0.98)] : bounds.yMax;

            const initB = {
                xMin: bounds.xMin,
                xMax: Math.max(3, Math.min(bounds.xMax, p95Dur * 1.15)),
                yMin: Math.max(bounds.yMin, -2),
                yMax: Math.max(15, Math.min(bounds.yMax, p98Yld * 1.15))
            };

            setInitialBounds(initB);
            setViewBounds(initB);

            setLoading(false);
        }).catch(() => { if (!cancelled) { setError('Не удалось загрузить данные'); setLoading(false); } });
        return () => { cancelled = true; };
    }, [searchParams, keyRate]);

    const cw = dims.width - MARGIN.left - MARGIN.right;
    const ch = dims.height - MARGIN.top - MARGIN.bottom;
    const vb = viewBounds || { xMin: 0, xMax: 10, yMin: 0, yMax: 30 };

    const sx = useCallback((v: number) => ((v - vb.xMin) / (vb.xMax - vb.xMin)) * cw, [vb, cw]);
    const sy = useCallback((v: number) => ch - ((v - vb.yMin) / (vb.yMax - vb.yMin)) * ch, [vb, ch]);
    const invX = useCallback((px: number) => (px / cw) * (vb.xMax - vb.xMin) + vb.xMin, [vb, cw]);
    const invY = useCallback((px: number) => vb.yMax - (px / ch) * (vb.yMax - vb.yMin), [vb, ch]);

    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();
        if (!viewBounds || !baseBounds) return;
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;
        const mx = e.clientX - rect.left - MARGIN.left;
        const my = e.clientY - rect.top - MARGIN.top;
        const factor = e.deltaY > 0 ? 1.15 : 0.87;
        const cx = invX(mx), cy = invY(my);
        setViewBounds(clampBounds({
            xMin: cx - (cx - viewBounds.xMin) * factor,
            xMax: cx + (viewBounds.xMax - cx) * factor,
            yMin: cy - (cy - viewBounds.yMin) * factor,
            yMax: cy + (viewBounds.yMax - cy) * factor,
        }, baseBounds));
    }, [viewBounds, baseBounds, invX, invY, clampBounds]);

    useEffect(() => {
        const el = svgRef.current;
        if (!el) return;
        el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleWheel);
    }, [handleWheel, loading]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            const t1 = e.touches[0]; const t2 = e.touches[1];
            pinchStart.current = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
            panBoundsStart.current = viewBounds ? { ...viewBounds } : null;
        } else if (e.touches.length === 1) {
            setIsPanning(true);
            panStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            panBoundsStart.current = viewBounds ? { ...viewBounds } : null;
        }
    }, [viewBounds]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2 && pinchStart.current && panBoundsStart.current && baseBounds) {
            const t1 = e.touches[0]; const t2 = e.touches[1];
            const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
            const factor = pinchStart.current / dist;
            const pb = panBoundsStart.current;
            const cx = (pb.xMin + pb.xMax)/2; const cy = (pb.yMin + pb.yMax)/2;
            setViewBounds(clampBounds({
                xMin: cx - (cx - pb.xMin) * factor,
                xMax: cx + (pb.xMax - cx) * factor,
                yMin: cy - (cy - pb.yMin) * factor,
                yMax: cy + (pb.yMax - cy) * factor,
            }, baseBounds));
        } else if (e.touches.length === 1 && isPanning && panBoundsStart.current && baseBounds) {
            const dx = e.touches[0].clientX - panStart.current.x;
            const dy = e.touches[0].clientY - panStart.current.y;
            const pb = panBoundsStart.current;
            const shiftX = -(dx / cw) * (pb.xMax - pb.xMin);
            const shiftY = (dy / ch) * (pb.yMax - pb.yMin);
            setViewBounds(clampBounds({ xMin: pb.xMin + shiftX, xMax: pb.xMax + shiftX, yMin: pb.yMin + shiftY, yMax: pb.yMax + shiftY }, baseBounds));
        }
    }, [isPanning, cw, ch, clampBounds, baseBounds]);

    const handleTouchEnd = useCallback(() => { setIsPanning(false); pinchStart.current = null; }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.button !== 0) return;
        setIsPanning(true);
        panStart.current = { x: e.clientX, y: e.clientY };
        panBoundsStart.current = viewBounds ? { ...viewBounds } : null;
    }, [viewBounds]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (rect && hovered) setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });

        if (!isPanning || !panBoundsStart.current || !baseBounds) return;
        const dx = e.clientX - panStart.current.x;
        const dy = e.clientY - panStart.current.y;
        const pb = panBoundsStart.current;
        const shiftX = -(dx / cw) * (pb.xMax - pb.xMin);
        const shiftY = (dy / ch) * (pb.yMax - pb.yMin);
        setViewBounds(clampBounds({ xMin: pb.xMin + shiftX, xMax: pb.xMax + shiftX, yMin: pb.yMin + shiftY, yMax: pb.yMax + shiftY }, baseBounds));
    }, [isPanning, cw, ch, hovered, clampBounds, baseBounds]);

    const handleMouseUp = useCallback(() => { setIsPanning(false); }, []);

    const zoomBy = useCallback((factor: number) => {
        if (!viewBounds || !baseBounds) return;
        const cx = (viewBounds.xMin + viewBounds.xMax) / 2;
        const cy = (viewBounds.yMin + viewBounds.yMax) / 2;
        setViewBounds(clampBounds({
            xMin: cx - (cx - viewBounds.xMin) * factor,
            xMax: cx + (viewBounds.xMax - cx) * factor,
            yMin: cy - (cy - viewBounds.yMin) * factor,
            yMax: cy + (viewBounds.yMax - cy) * factor,
        }, baseBounds));
    }, [viewBounds, baseBounds, clampBounds]);

    const resetView = useCallback(() => {
        if (initialBounds) setViewBounds({ ...initialBounds });
        setActiveRatings(new Set());
    }, [initialBounds]);

    const zoomLevel = useMemo(() => {
        if (!baseBounds || !viewBounds) return 1;
        const baseRange = (baseBounds.xMax - baseBounds.xMin) * (baseBounds.yMax - baseBounds.yMin);
        const curRange = (viewBounds.xMax - viewBounds.xMin) * (viewBounds.yMax - viewBounds.yMin);
        return baseRange / curRange;
    }, [baseBounds, viewBounds]);

    const xTicks = useMemo(() => generateTicks(vb.xMin, vb.xMax, Math.floor(cw / 90)), [vb, cw]);
    const yTicks = useMemo(() => generateTicks(vb.yMin, vb.yMax, Math.floor(ch / 55)), [vb, ch]);
    const ofzPath = useMemo(() => buildOfzPath(ofzCurve, sx, sy), [ofzCurve, sx, sy]);
    const ofzFill = useMemo(() => {
        if (!ofzPath || ofzCurve.length < 2) return '';
        return `${ofzPath} L ${sx(ofzCurve[ofzCurve.length-1].durationYears!)} ${ch} L ${sx(ofzCurve[0].durationYears!)} ${ch} Z`;
    }, [ofzPath, ofzCurve, sx, ch]);

    const visibleBonds = useMemo(() => bonds.filter(b => {
        if (b.durationYears == null || b._yield == null) return false;
        if (b._yield <= -50 || b._yield >= 200 || b.durationYears <= 0) return false;
        if (b.durationYears < vb.xMin || b.durationYears > vb.xMax) return false;
        if (b._yield < vb.yMin || b._yield > vb.yMax) return false;
        if (activeRatings.size > 0 && !activeRatings.has(getRatingGroup(b.creditRating))) return false;
        return true;
    }), [bonds, vb, activeRatings]);

    if (loading) return (
        <div className="bg-[var(--color-card)] rounded-3xl shadow-card p-8 flex flex-col items-center justify-center min-h-[500px] animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-glow">
                <Loader2 size={28} className="text-primary animate-spin" />
            </div>
            <p className="text-[var(--color-muted-foreground)] text-sm mt-4 font-medium">Загрузка карты рынка…</p>
        </div>
    );
    if (error) return (
        <div className="bg-[var(--color-card)] rounded-3xl shadow-card p-8 flex flex-col items-center justify-center min-h-[400px]">
            <AlertCircle size={32} className="text-danger mb-3" /><p className="text-danger font-bold">{error}</p>
        </div>
    );

    const RATING_ORDER = ['AAA','AA','A','BBB','BB','B','C','D','Без рейтинга'];
    const groups: Record<string, number> = {};
    RATING_ORDER.forEach(r => groups[r] = 0);
    bonds.forEach(b => {
        if (b._yield != null && b._yield > -50 && b._yield < 200 && b.durationYears != null && b.durationYears > 0) {
            const k = getRatingGroup(b.creditRating);
            if (groups[k] !== undefined) groups[k]++;
        }
    });

    return (
        <div className="bg-[var(--color-background)] sm:bg-[var(--color-card)] sm:rounded-3xl sm:shadow-card py-2 px-4 sm:p-6 animate-fade-in-up relative flex flex-col h-full" ref={containerRef}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                    <h3 className="text-base font-bold text-[var(--color-foreground)] flex items-center gap-2">
                        <TrendingUp size={18} className="text-primary" />Карта рынка
                    </h3>
                    <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">{visibleBonds.length} облигаций · Дюрация × Доходность</p>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-medium text-[var(--color-muted-foreground)]">
                    {RATING_LEGEND.map(r => (
                        <div key={r.label} className="flex items-center gap-1 shrink-0">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: r.color }} /><span>{r.label}</span>
                        </div>
                    ))}
                    <div className="flex items-center gap-1 ml-1 shrink-0"><div className="w-2.5 h-2.5 rounded-full border-2 border-amber-500 bg-transparent shrink-0" /><span>Событие</span></div>
                    {showOfzCurve && (
                        <div className="flex items-center gap-1 shrink-0"><div className="w-5 h-0.5 bg-primary rounded-full shrink-0" /><span>ОФЗ</span></div>
                    )}
                    <div className="flex items-center gap-1 shrink-0">
                        <div className="w-5 h-0.5 shrink-0 rounded-full" style={{ background: 'repeating-linear-gradient(90deg, #f59e0b 0, #f59e0b 3px, transparent 3px, transparent 6px)' }} />
                        <span>КС {keyRate}%</span>
                    </div>
                </div>
            </div>

            <div className="absolute top-16 right-6 sm:right-8 z-20 flex flex-col gap-1 hidden sm:flex">
                <button onClick={() => zoomBy(0.7)} className="p-2 rounded-xl bg-[var(--color-card)] shadow-sm border border-[var(--color-card-border)] hover:bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-all" title="Приблизить"><ZoomIn size={16} /></button>
                <button onClick={() => zoomBy(1.4)} className="p-2 rounded-xl bg-[var(--color-card)] shadow-sm border border-[var(--color-card-border)] hover:bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-all" title="Отдалить"><ZoomOut size={16} /></button>
                <button onClick={resetView} className="p-2 rounded-xl bg-[var(--color-card)] shadow-sm border border-[var(--color-card-border)] hover:bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-all" title="Сбросить"><Maximize2 size={16} /></button>
            </div>

            
            <div className="relative overflow-hidden sm:rounded-2xl bg-[var(--color-card)] sm:bg-[var(--color-background)] select-none touch-none" style={{ cursor: isPanning ? 'grabbing' : 'grab' }}>
                <svg ref={svgRef} viewBox={`0 0 ${dims.width} ${dims.height}`} className="w-full block" style={{ height: `${dims.height}px` }}
                     onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
                     onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={() => { handleMouseUp(); setHovered(null); }}>
                    <defs>
                        <linearGradient id="ofzG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.08" /><stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.00" /></linearGradient>
                        <clipPath id="chartClip"><rect x={0} y={0} width={cw} height={ch} /></clipPath>
                    </defs>
                    <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
                        
                        {yTicks.map((t, i) => <g key={`y${i}`}><line x1={-MARGIN.left} y1={sy(t)} x2={cw + MARGIN.right} y2={sy(t)} stroke="var(--color-card-border)" strokeWidth={1} strokeDasharray="2 4" opacity={0.6} /><text x={-8} y={sy(t)+4} textAnchor="end" fill="var(--color-muted-foreground)" fontSize={10} fontFamily="monospace">{t.toFixed(1)}%</text></g>)}
                        {xTicks.map((t, i) => <g key={`x${i}`}><line x1={sx(t)} y1={-MARGIN.top} x2={sx(t)} y2={ch + MARGIN.bottom} stroke="var(--color-card-border)" strokeWidth={1} strokeDasharray="2 4" opacity={0.6} /><text x={sx(t)} y={ch+16} textAnchor="middle" fill="var(--color-muted-foreground)" fontSize={10} fontFamily="monospace">{t.toFixed(1)}</text></g>)}
                        <text x={cw/2} y={ch+36} textAnchor="middle" fill="var(--color-muted-foreground)" fontSize={11} fontWeight={700} letterSpacing="0.05em">ДЮРАЦИЯ, ЛЕТ</text>
                        <text x={-ch/2} y={-45} textAnchor="middle" fill="var(--color-muted-foreground)" fontSize={11} fontWeight={700} letterSpacing="0.05em" transform="rotate(-90)">ДОХОДНОСТЬ, %</text>

                        <g clipPath="url(#chartClip)">
                            {showOfzCurve && ofzFill && <path d={ofzFill} fill="url(#ofzG)" />}
                            {showOfzCurve && ofzPath && <path d={ofzPath} fill="none" stroke="var(--color-primary)" strokeWidth={2} strokeLinecap="round" opacity={0.8} />}
                            {keyRate > 0 && <g>
                                <line x1={0} y1={sy(keyRate)} x2={cw} y2={sy(keyRate)} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="6 4" opacity={0.7} />
                                <rect x={cw-52} y={sy(keyRate)-10} width={52} height={18} rx={6} fill="#f59e0b" opacity={0.15} />
                                <text x={cw-26} y={sy(keyRate)+3} textAnchor="middle" fill="#f59e0b" fontSize={9} fontWeight={700} fontFamily="monospace">КС {keyRate}%</text>
                            </g>}
                            {showOfzCurve && ofzCurve.map((p, i) => <circle key={`o${i}`} cx={sx(p.durationYears!)} cy={sy(p._yield!)} r={2.5} fill="var(--color-primary)" opacity={0.5} />)}

                            {visibleBonds.map((b, i) => {
                                const cx = sx(b.durationYears!), cy = sy(b._yield!);
                                const col = getRatingColor(b.creditRating);
                                const isEv = b.isToEvent === true;
                                const isH = hovered?.id === b.id;
                                const r = isH ? 6 : 4;
                                return (
                                    <g key={b.id||`b${i}`} style={{ cursor: 'pointer' }}
                                       onMouseEnter={(e) => { e.stopPropagation(); setHovered(b); const rect = svgRef.current?.getBoundingClientRect(); if (rect) setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top }); }}
                                       onMouseLeave={() => setHovered(null)}
                                       onClick={(e) => { e.stopPropagation(); if (b.id) router.push(`/bonds/${b.id}`); }}>
                                        {isH && <circle cx={cx} cy={cy} r={12} fill={col} opacity={0.15} />}
                                        {isEv ? (<>
                                            <circle cx={cx} cy={cy} r={r} fill={col} opacity={isH ? 1 : 0.9} />
                                            <polygon points={`${cx+r+2},${cy} ${cx+r+5},${cy-2.5} ${cx+r+8},${cy} ${cx+r+5},${cy+2.5}`} fill="#f59e0b" opacity={0.9} />
                                        </>) : (
                                            <circle cx={cx} cy={cy} r={r} fill={col} opacity={isH ? 1 : 0.9} />
                                        )}
                                        {(isH || zoomLevel > 40 || visibleBonds.length < 35) && (
                                            <text x={cx} y={cy - r - 4} textAnchor="middle" fill="var(--color-foreground)" fontSize={9} fontWeight={600} opacity={isH ? 1 : 0.7} style={{ pointerEvents: 'none' }}>{b.issuerName || b.ticker}</text>
                                        )}
                                    </g>
                                );
                            })}
                        </g>
                    </g>
                </svg>

                {hovered && !isPanning && (
                    <div className="market-map-tooltip" style={{ left: `${Math.min(Math.max(tooltipPos.x + 14, 10), dims.width - 230)}px`, top: `${Math.max(tooltipPos.y - 10, 10)}px` }}>
                        <div className="font-bold text-[var(--color-foreground)] truncate text-sm">{hovered.ticker}</div>
                        <div className="text-[11px] text-[var(--color-muted-foreground)] truncate mb-2">{hovered.issuerName}</div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                            <span className="text-[var(--color-muted-foreground)]">Доходность</span>
                            <span className="font-mono font-bold text-primary text-right">{hovered._yield?.toFixed(2)}%</span>
                            <span className="text-[var(--color-muted-foreground)]">Дюрация</span>
                            <span className="font-mono font-bold text-[var(--color-foreground)] text-right">{hovered.durationYears?.toFixed(2)} лет</span>
                            {hovered.gSpread != null && <><span className="text-[var(--color-muted-foreground)]">G-Спред</span><span className="font-mono font-bold text-amber-500 text-right">{hovered.gSpread.toFixed(0)} бп</span></>}
                            {hovered.creditRating && <><span className="text-[var(--color-muted-foreground)]">Рейтинг</span><span className="font-bold text-right" style={{ color: getRatingColor(hovered.creditRating) }}>{hovered.creditRating}</span></>}
                        </div>
                        {hovered.isToEvent && (
                            <div className="mt-2 pt-1.5 border-t border-[var(--color-card-border)] flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-sm bg-amber-500 shrink-0" />
                                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">{hovered.eventType === 'Put' ? 'Пут-оферта' : hovered.eventType === 'Call' ? 'Колл-опцион' : hovered.eventType || 'Событие'}</span>
                            </div>
                        )}
                        <div className="text-[9px] text-[var(--color-muted-foreground)] mt-1.5 opacity-60">Нажмите для перехода →</div>
                    </div>
                )}

                {zoomLevel <= 1.05 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-[var(--color-muted-foreground)] bg-[var(--color-card)]/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm font-medium animate-fade-in pointer-events-none text-center">
                        <span className="hidden sm:inline">Колёсико мыши для масштаба · Зажатие для перемещения</span>
                        <span className="inline sm:hidden">Два пальца для масштаба · Смахивание для перемещения</span>
                    </div>
                )}
            </div>

            <div className="mt-4 flex flex-col gap-2">
                <span className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-widest pl-1">Фильтр по рейтингу</span>
                <div className="flex flex-wrap gap-2">
                    {RATING_ORDER.map(k => {
                        const count = groups[k];
                        const isActive = activeRatings.has(k);
                        return (
                            <button
                                key={k}
                                onClick={() => toggleRating(k)}
                                className={cn(
                                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                                    isActive
                                        ? "bg-[var(--color-foreground)] text-[var(--color-background)] shadow-md scale-105"
                                        : "bg-[var(--color-muted)]/50 text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                                )}
                            >
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getRatingColor(k === 'Без рейтинга' ? null : k) }} />
                                {k} <span className="opacity-60 font-mono text-[10px] ml-0.5">{count}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};