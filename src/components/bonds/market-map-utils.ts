import { MarketMapBondDto, OfzYieldPointDto } from '@/lib/api';

export const MARGIN = { top: 15, right: 15, bottom: 40, left: 65 };

export const RATING_LEGEND = [
    { label: 'AAA', color: '#10b981' },
    { label: 'AA', color: '#22c55e' },
    { label: 'A', color: '#84cc16' },
    { label: 'BBB', color: '#eab308' },
    { label: 'BB', color: '#f59e0b' },
    { label: 'B', color: '#f97316' },
    { label: 'C/D', color: '#ef4444' },
    { label: 'Н/Д', color: '#a1a1aa' },
];

export function getRatingColor(rating: string | null | undefined): string {
    if (!rating || rating === '-' || rating === '?') return '#a1a1aa';
    if (rating.includes('AAA')) return '#10b981';
    if (rating.includes('AA')) return '#22c55e';
    if (rating.startsWith('A') && !rating.startsWith('AA')) return '#84cc16';
    if (rating.includes('BBB')) return '#eab308';
    if (rating.includes('BB') && !rating.includes('BBB')) return '#f59e0b';
    if (rating.startsWith('B') && !rating.startsWith('BB') && !rating.startsWith('BBB')) return '#f97316';
    if (rating.includes('C')) return '#ef4444';
    if (rating.includes('D')) return '#b91c1c';
    return '#a1a1aa';
}

export function getRatingGroup(rating: string | null | undefined): string {
    if (!rating || rating === '-' || rating === '?') return 'Без рейтинга';
    if (rating.includes('AAA')) return 'AAA';
    if (rating.includes('AA')) return 'AA';
    if (rating.startsWith('A') && !rating.startsWith('AA')) return 'A';
    if (rating.includes('BBB')) return 'BBB';
    if (rating.includes('BB') && !rating.includes('BBB')) return 'BB';
    if (rating.startsWith('B') && !rating.startsWith('BB') && !rating.startsWith('BBB')) return 'B';
    if (rating.includes('C')) return 'C';
    if (rating.includes('D')) return 'D';
    return 'Без рейтинга';
}

export interface Bounds {
    xMin: number; xMax: number; yMin: number; yMax: number;
}

export function computeBounds(bonds: MarketMapBondDto[], ofz: OfzYieldPointDto[], keyRate: number): Bounds {
    if (bonds.length === 0) return { xMin: 0, xMax: 10, yMin: 0, yMax: 30 };
    const reasonable = bonds.filter(b => 
        b.durationYears != null && b.durationYears > 0 &&
        b._yield != null && b._yield > -50 && b._yield < 200
    );
    if (reasonable.length === 0) return { xMin: 0, xMax: 10, yMin: 0, yMax: 30 };
    const ds = reasonable.map(b => b.durationYears!);
    const ys = reasonable.map(b => b._yield!);
    ofz.forEach(p => { if (p.durationYears != null) ds.push(p.durationYears); if (p._yield != null) ys.push(p._yield); });
    if (keyRate > 0) ys.push(keyRate);
    let dMin = Math.min(...ds), dMax = Math.max(...ds);
    let yMin = Math.min(...ys), yMax = Math.max(...ys);
    const dp = Math.max((dMax - dMin) * 0.01, 0.05);
    const yp = Math.max((yMax - yMin) * 0.02, 0.1);
    return { xMin: Math.max(-0.5, dMin - dp), xMax: dMax + dp, yMin: Math.max(-10, yMin - yp), yMax: Math.min(200, yMax + yp) };
}

export function generateTicks(min: number, max: number, maxCount: number): number[] {
    const count = Math.min(Math.max(Math.floor(maxCount), 2), 12);
    const step = (max - min) / count;
    return Array.from({ length: count + 1 }, (_, i) => min + step * i);
}

export function buildOfzPath(ofz: OfzYieldPointDto[], sx: (v:number)=>number, sy: (v:number)=>number): string {
    if (ofz.length < 2) return '';
    const pts = ofz.map(p => ({ x: sx(p.durationYears!), y: sy(p._yield!) }));
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
        const p = pts[i-1], c = pts[i];
        d += ` Q ${p.x} ${p.y} ${(p.x+c.x)/2} ${(p.y+c.y)/2}`;
    }
    d += ` L ${pts[pts.length-1].x} ${pts[pts.length-1].y}`;
    return d;
}
