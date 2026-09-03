/**
 * The जिज्ञासा lexicon — every surface form the resolver can tag, DERIVED from
 * the registries that already ship (PRD-41 §4.3). Nothing here is hand-listed
 * except `aliases.ts`; a new deity, festival, occasion, room, mantra or vidhi
 * becomes askable the moment it lands in its registry, and `lexicon.test.ts`
 * fails if a registry entry produces no usable key.
 *
 * Built lazily on first ask and cached — never on the launch path. This module
 * imports the registries (small: ids + names), so it is reachable only through
 * the dynamic `import()` in `useAsk.ts` / `engine.ts`; `launchPath.test.ts`
 * pins that.
 */
import { deities } from '@/data/deities';
import { EVENT_RULES, DISHA_LABELS, DISHA_ORDER } from '@/panchang/eventMuhurat';
import { OBSERVANCE_RULES } from '@/panchang/festivals';
import { VASTU_ROOM_ENTRIES } from '@/data/vastu/roomGuidance';
import { japamMantras } from '@/data/japam';
import { VIDHI_ENTRIES } from '@/data/vidhi';
import { ALIASES } from './aliases';
import { fold } from './fold';
import type { EntityType, LexEntry } from './types';

/**
 * Recurring observance FAMILIES. "एकादशी कब है" means the next Ekadashi of any
 * name, not a specific one — PRD-41 §13.3. Members are selected from
 * `OBSERVANCE_RULES` by id pattern so a new Ekadashi rule joins automatically.
 */
const OBSERVANCE_CLASSES: readonly {
  id: string;
  label: string;
  forms: readonly string[];
  member: (ruleId: string) => boolean;
}[] = [
  { id: 'class:ekadashi', label: 'एकादशी', forms: ['एकादशी', 'ekadashi', 'ekadasi', 'gyaras', 'gyaaras'], member: (id) => id.endsWith('-ekadashi') || id === 'mahadwadashi' },
  { id: 'class:pradosh', label: 'प्रदोष', forms: ['प्रदोष', 'pradosh', 'pradosha'], member: (id) => id.includes('pradosh') },
  { id: 'class:purnima', label: 'पूर्णिमा', forms: ['पूर्णिमा', 'purnima', 'poonam', 'punam'], member: (id) => id.includes('purnima') },
  { id: 'class:amavasya', label: 'अमावस्या', forms: ['अमावस्या', 'amavasya', 'amavas', 'amaavas'], member: (id) => id.includes('amavasya') },
  { id: 'class:chaturthi', label: 'चतुर्थी', forms: ['चतुर्थी', 'chaturthi', 'sankashti', 'संकष्टी', 'chauth'], member: (id) => id.includes('chaturthi') || id.includes('chauth') },
  { id: 'class:shivaratri', label: 'शिवरात्रि', forms: ['शिवरात्रि', 'shivratri', 'shivaratri'], member: (id) => id.includes('shivaratri') },
  { id: 'class:navratri', label: 'नवरात्रि', forms: ['नवरात्रि', 'navratri', 'navratra', 'navaratri'], member: (id) => id.includes('navratri') },
];

export type Lexicon = {
  entries: readonly LexEntry[];
  byTypeAndId: ReadonlyMap<string, LexEntry>;
};

function build(): Lexicon {
  const out: LexEntry[] = [];
  // One entry per (type, id, key): a registry name and a hand alias may agree.
  const seen = new Set<string>();
  const push = (type: EntityType, id: string, label: string, forms: readonly (string | undefined)[], extra?: Partial<LexEntry>) => {
    for (const f of forms) {
      if (!f) continue;
      const key = fold(f);
      const k = `${type}:${id}:${key}`;
      if (key.length < 3 || seen.has(k)) continue;
      seen.add(k);
      out.push({ type, id, label, key, ...extra });
    }
  };

  for (const d of deities) {
    push('deity', d.id, d.nameHi, [d.nameHi, d.nameEn, d.id, d.nameHi.replace(/^श्री\s+/, ''), d.nameEn.replace(/^Shri\s+/i, '')]);
  }

  // A rule can be listed twice (Dev Uthani is both a festival and an Ekadashi).
  const seenRule = new Set<string>();
  for (const rule of OBSERVANCE_RULES) {
    if (seenRule.has(rule.id)) continue;
    seenRule.add(rule.id);
    push('observance', rule.id, rule.nameHi, [rule.nameHi, rule.nameEn, rule.id.replace(/-/g, ' '), rule.nameHi.replace(/^श्री\s+/, ''), rule.nameEn.replace(/^Shr(i|ee)\s+/i, '')]);
  }
  for (const cls of OBSERVANCE_CLASSES) {
    const members = OBSERVANCE_RULES.filter((r) => cls.member(r.id)).map((r) => r.id);
    push('observance', cls.id, cls.label, cls.forms, { isClass: true, members });
  }

  for (const rule of EVENT_RULES) {
    push('occasion', rule.id, rule.nameHi, [rule.nameHi, rule.nameEn, rule.id.replace(/-/g, ' ')]);
  }

  for (const dik of DISHA_ORDER) {
    const l = DISHA_LABELS[dik];
    push('disha', dik, l.hi, [l.hi, l.en, l.en.replace('-', ' '), dik]);
  }

  for (const room of VASTU_ROOM_ENTRIES) {
    push('room', room.id, room.titleHi, [room.titleHi, room.titleEn, room.id.replace(/-/g, ' ')]);
  }

  for (const m of japamMantras) {
    push('mantra', m.id, m.nameHi, [m.nameHi, m.nameEn, m.id.replace(/-/g, ' ')]);
  }

  for (const v of VIDHI_ENTRIES) {
    push('vidhi', v.id, v.titleHi, [v.titleHi, v.titleEn, v.id.replace(/-/g, ' ')]);
  }

  const labelFor = (type: EntityType, id: string) => out.find((e) => e.type === type && e.id === id)?.label ?? id;
  for (const [form, type, id] of ALIASES) {
    push(type, id, labelFor(type, id), [form]);
  }

  const byTypeAndId = new Map<string, LexEntry>();
  for (const e of out) {
    const k = `${e.type}:${e.id}`;
    if (!byTypeAndId.has(k)) byTypeAndId.set(k, e);
  }
  return { entries: out, byTypeAndId };
}

let cached: Lexicon | null = null;

/** The lexicon, built on first call. ~1 ms on V8 for ~1000 forms. */
export function getAskLexicon(): Lexicon {
  if (!cached) cached = build();
  return cached;
}

export function _resetAskLexiconForTest(): void {
  cached = null;
}

/** Class members for a class entry, or the single id for an instance. */
export function observanceIdsFor(entry: LexEntry): readonly string[] {
  return entry.isClass && entry.members ? entry.members : [entry.id];
}
