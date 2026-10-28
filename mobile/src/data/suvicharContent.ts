import catalogue from './suvichar-content/catalogue.json';
import type { SuvicharDeity } from './suvichar';
import type { Lang } from './gita/language';
import { contentByLang } from '@/utils/localize';

export type SuvicharThought = typeof catalogue.entries[number];
export type SuvicharSource = typeof catalogue.sources[number];
export const suvicharSourcedThoughts: readonly SuvicharThought[] = catalogue.entries;
const sources = new Map(catalogue.sources.map(s => [s.id, s]));
const families: Record<SuvicharDeity, string> = {
  krishna: 'krishna', rama: 'rama', hanuman: 'hanuman', shiva: 'shiva', ganesha: 'ganesha',
  durga: 'durga', lakshmi: 'lakshmi', saraswati: 'saraswati', vishnu: 'vishnu', 'ram-darbar': 'ram-darbar',
  'radha-krishna': 'krishna', 'salasar-balaji': 'hanuman', 'tirupati-balaji': 'vishnu',
  'sanwariya-seth': 'krishna', jagannath: 'krishna', mahakaal: 'shiva', 'khatu-shyam': 'krishna', annapurna: 'annapurna',
};
const byFamily = new Map<string, SuvicharThought[]>();
const localized = new Map<string, Map<string, SuvicharThought>>();
let allMessages: Set<string> | undefined;
for (const thought of catalogue.entries) {
  const group = byFamily.get(thought.family) ?? [];
  group.push(thought); byFamily.set(thought.family, group);
}
export function suvicharThoughtsFor(deity: SuvicharDeity): readonly SuvicharThought[] {
  return byFamily.get(families[deity])!;
}
export function suvicharThoughtForDay(deity: SuvicharDeity, day: number): SuvicharThought {
  const pool = suvicharThoughtsFor(deity);
  return pool[((Math.trunc(day) % pool.length) + pool.length) % pool.length];
}
/** Match only unedited text and only within the selected deity's collection. */
export function findSuvicharThought(deity: SuvicharDeity, message: string, id?: string): SuvicharThought | undefined {
  const pool = suvicharThoughtsFor(deity);
  const matches = (t: SuvicharThought) => (['hi', 'en', 'gu', 'kn'] as const).some(lang => contentByLang(lang, t.hi, t.en) === message);
  const selected = pool.find(t => t.id === id);
  if (selected && matches(selected)) return selected;
  const family = families[deity];
  if (!localized.has(family)) {
    const index = new Map<string, SuvicharThought>();
    for (const t of pool) for (const lang of ['hi', 'en', 'gu', 'kn'] as const) {
      const text = contentByLang(lang, t.hi, t.en);
      if (!index.has(text)) index.set(text, t);
    }
    localized.set(family, index);
  }
  return localized.get(family)!.get(message);
}
export function isSourcedSuvicharMessage(message: string): boolean {
  if (!message) return false;
  allMessages ??= new Set(catalogue.entries.flatMap(t => (['hi', 'en', 'gu', 'kn'] as const).map(lang => contentByLang(lang, t.hi, t.en))));
  return allMessages.has(message);
}
export function nextSuvicharThought(deity: SuvicharDeity, message: string, id?: string): SuvicharThought {
  const pool = suvicharThoughtsFor(deity), current = findSuvicharThought(deity, message, id);
  return pool[(pool.findIndex(t => t.id === current?.id) + 1) % pool.length];
}
export function sourceForSuvichar(thought: SuvicharThought): SuvicharSource { return sources.get(thought.sourceId)!; }
export function suvicharSourceLabel(thought: SuvicharThought, lang: Lang): string {
  const s = sourceForSuvichar(thought);
  return contentByLang(lang, `${s.referenceHi} · ${s.modeHi}`, `${s.referenceEn} · ${s.modeEn}`);
}
