import catalogue from './suvichar-content/catalogue.json';
import originals from './suvichar-content/originals.json';
import type { SuvicharDeity } from './suvichar';
import type { Lang } from './gita/language';
import { contentByLang } from '@/utils/localize';
import { suvicharDohaSources, suvicharDohaThoughts, suvicharDohasFor } from './doha/suvichar';
export { suvicharDohaThoughts } from './doha/suvichar';

export type SuvicharThought = typeof catalogue.entries[number];
export type SuvicharSource = typeof catalogue.sources[number];
export const suvicharSourcedThoughts: readonly SuvicharThought[] = catalogue.entries;
export const suvicharOriginalThoughts: readonly (SuvicharThought & { deities: readonly string[] })[] = originals.entries;
export const suvicharAllThoughts: readonly SuvicharThought[] = [...suvicharOriginalThoughts, ...suvicharSourcedThoughts, ...suvicharDohaThoughts];
const sources = new Map(catalogue.sources.map(s => [s.id, s]));
for (const source of suvicharDohaSources) sources.set(source.id, source);
// Original daily reflections have authorship, never a fabricated scripture reference or URL.
sources.set('vedansh-original', { id: 'vedansh-original', referenceHi: 'वेदांश', referenceEn: 'Vedansh',
  modeHi: 'मौलिक विचार', modeEn: 'Original reflection', url: '', contextHi: 'वेदांश के लिए लिखे गए मौलिक संदेश; शास्त्र या संत के उद्धरण नहीं।' });
const families: Record<SuvicharDeity, string> = {
  parshuram: 'parshuram', krishna: 'krishna', rama: 'rama', 'ram-lalla': 'rama', hanuman: 'hanuman', shiva: 'shiva', ganesha: 'ganesha',
  durga: 'durga', lakshmi: 'lakshmi', saraswati: 'saraswati', vishnu: 'vishnu', 'ram-darbar': 'ram-darbar',
  'radha-krishna': 'krishna', 'salasar-balaji': 'hanuman', 'tirupati-balaji': 'vishnu',
  'sanwariya-seth': 'krishna', jagannath: 'krishna', mahakaal: 'shiva', 'khatu-shyam': 'krishna', annapurna: 'annapurna',
};
const byFamily = new Map<string, SuvicharThought[]>();
const byDeity = new Map<SuvicharDeity, SuvicharThought[]>();
const dailyByDeity = new Map<SuvicharDeity, SuvicharThought[]>();
const localized = new Map<string, Map<string, SuvicharThought>>();
let allMessages: Set<string> | undefined;
for (const thought of catalogue.entries) {
  const group = byFamily.get(thought.family) ?? [];
  group.push(thought); byFamily.set(thought.family, group);
}
export function suvicharThoughtsFor(deity: SuvicharDeity): readonly SuvicharThought[] {
  if (!byDeity.has(deity)) {
    // Shrine-specific copy cannot follow the broader Krishna/Vishnu family mapping.
    const specific = suvicharOriginalThoughts.filter(t => t.deities.includes(deity));
    const general = suvicharOriginalThoughts.filter(t => !t.deities.length);
    const daily = [...specific, ...general, ...suvicharDohasFor(deity)];
    dailyByDeity.set(deity, daily);
    byDeity.set(deity, [...daily, ...(byFamily.get(families[deity]) ?? [])]);
  }
  return byDeity.get(deity)!;
}
export function suvicharThoughtForDay(deity: SuvicharDeity, day: number): SuvicharThought {
  suvicharThoughtsFor(deity);
  const pool = dailyByDeity.get(deity)!;
  return pool[((Math.trunc(day) % pool.length) + pool.length) % pool.length];
}
/** Match only unedited text and only within the selected deity's collection. */
export function findSuvicharThought(deity: SuvicharDeity, message: string, id?: string): SuvicharThought | undefined {
  const pool = suvicharThoughtsFor(deity);
  const matches = (t: SuvicharThought) => (['hi', 'en', 'gu', 'kn'] as const).some(lang => contentByLang(lang, t.hi, t.en) === message);
  const selected = pool.find(t => t.id === id);
  if (selected && matches(selected)) return selected;
  if (!localized.has(deity)) {
    const index = new Map<string, SuvicharThought>();
    for (const t of pool) for (const lang of ['hi', 'en', 'gu', 'kn'] as const) {
      const text = contentByLang(lang, t.hi, t.en);
      if (!index.has(text)) index.set(text, t);
    }
    localized.set(deity, index);
  }
  return localized.get(deity)!.get(message);
}
export function isSourcedSuvicharMessage(message: string): boolean {
  if (!message) return false;
  allMessages ??= new Set(suvicharAllThoughts.flatMap(t => (['hi', 'en', 'gu', 'kn'] as const).map(lang => contentByLang(lang, t.hi, t.en))));
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

