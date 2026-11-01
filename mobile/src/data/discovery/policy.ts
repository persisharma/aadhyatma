import { EXPLORE_SECTIONS, type ExploreSection } from './sections';
export const EXPLORE_KEY = '@vedansh/explore-sheet-v1';
export const HOUR = 3600000;
const DAY = 24 * HOUR;
export type ExploreState = {
    version: 1;
    enabled: boolean;
    createdAt: number;
    visited: string[];
    shown: number[];
    declined: Record<string, number>;
    streak: number;
    sleepUntil: number;
    last?: string;
};
export function initialExploreState(now: number): ExploreState { return { version: 1, enabled: true, createdAt: now, visited: [], shown: [], declined: {}, streak: 0, sleepUntil: 0 }; }
export function parseExploreState(raw: string | null, now: number): ExploreState {
    if (!raw)
        return initialExploreState(now);
    const s: ExploreState = JSON.parse(raw);
    if (s.version !== 1 || typeof s.enabled !== 'boolean' || !Number.isFinite(s.createdAt) || !Array.isArray(s.visited) || !s.visited.every(x => typeof x === 'string') || !Array.isArray(s.shown) || !s.shown.every(Number.isFinite) || !s.declined || typeof s.declined !== 'object' || !Object.values(s.declined).every(Number.isFinite) || !Number.isFinite(s.sleepUntil) || !Number.isInteger(s.streak) || s.streak < 0 || (s.last !== undefined && typeof s.last !== 'string'))
        throw new Error('Invalid explore ledger');
    return s;
}
function day(t: number) { const d = new Date(t); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; }
export function pickExplore(s: ExploreState, now: number, unavailable: readonly string[] = []): ExploreSection | undefined {
    if (!s.enabled || now - s.createdAt < DAY || s.sleepUntil > now)
        return;
    const last = s.shown.at(-1);
    if (last !== undefined && (now < last || now - last < 6 * HOUR))
        return;
    if (s.shown.filter(t => day(t) === day(now)).length >= 2)
        return;
    let pool = EXPLORE_SECTIONS.filter(x => !s.visited.includes(x.id) && !unavailable.includes(x.id) && (s.declined[x.id] === undefined || now - s.declined[x.id] >= 14 * DAY));
    if (pool.length > 1)
        pool = pool.filter(x => x.id !== s.last);
    return pool.slice().sort((a, b) => b.priority - a.priority)[0];
}
export function recordShown(s: ExploreState, id: string, now: number): ExploreState { return { ...s, last: id, shown: [...s.shown.filter(t => now - t < 2 * DAY), now] }; }
export function recordDecline(s: ExploreState, id: string, now: number): ExploreState { const streak = s.streak + 1; return { ...s, streak, declined: { ...s.declined, [id]: now }, sleepUntil: streak >= 2 ? now + 7 * DAY : s.sleepUntil }; }
export function recordVisit(s: ExploreState, id: string): ExploreState { return s.visited.includes(id) ? s : { ...s, visited: [...s.visited, id] }; }
