/**
 * Instagram hashtag builder for the verse share card (design.md §39).
 *
 * Bundle-only and pure: no I/O, no React, no native deps — so the unit tests can
 * import it without bootstrapping React Native, and so the tag set ships (and
 * changes) over OTA like the rest of `shareLinks.ts`.
 *
 * ## Why the tags are derived, not hard-coded
 *
 * A single canned tag block on every share teaches Instagram nothing about the
 * post: a Hanuman Chalisa chaupai and a Gita shloka land in the same undifferentiated
 * bucket and compete with each other. So every tag here is derived from the verse
 * actually being shared — its text, its section title, its chapter, and the deities
 * the registry files that text under (`library` in `data/texts.ts`). Change the
 * verse and the tag block changes with it.
 *
 * ## Five slots, and what goes in them
 *
 * Instagram takes five hashtags ({@link MAX_HASHTAGS}), which is a different problem
 * from filling thirty. With thirty you can lead with the long tail and let the broad
 * tags ride behind; with five, a tag that only a handful of people ever search is a
 * fifth of the budget spent. So the order is a deliberate blend, not "most specific
 * first":
 *
 *   1. occasion   — the festival or vrat falling on the share date, when it belongs
 *                   to one of the text's own deities ("#HanumanJayanti"). The single
 *                   best tag available: exactly on-topic AND spiking in volume on the
 *                   one day it is used. Supplied by the caller (`timely`).
 *   2. name       — the work itself, section first when narrower than the text
 *                   ("#ShivaTandavaStotram" before "#ShivaStotram"). What someone
 *                   looking for this verse actually types.
 *   3. native name— the same title in the reading language's script ("#हनुमानचालीसा").
 *                   Devanagari hashtags are first-class on Instagram and this is
 *                   where the Hindi audience searches.
 *   4. deity      — two tags from the text's PRIMARY deity ("#Hanuman #JaiHanuman").
 *                   Mid-volume devotional feeds, still squarely on-topic.
 *   5. anchor     — exactly one broad tag ("#Bhakti"). Five pure-niche tags give the
 *                   post nowhere big to rank; six broad ones would drown it. One.
 *
 * Chapter, vaar, category, second deity, language and brand tags are still built,
 * in priority order, but fall outside the cap — they exist so raising
 * {@link MAX_HASHTAGS} is a one-constant edit rather than a redesign.
 *
 * The blend is the part that matters for reach; the exact word list is editorial
 * and safe to tune.
 *
 * ## What is deliberately NOT here
 *
 * No `#viral`, `#trending`, `#explorepage`, `#fyp`. Tags with no topical relation to
 * the post are what integrity systems look for, several in that family have been
 * restricted outright, and they dilute the classification the specific tags exist to
 * provide. Every tag in this module earns its place by describing the verse; the
 * timely tier below is gated on relevance for exactly the same reason.
 */

import { library, type ContentCategory, type Deity } from './texts';
import { normalize } from './searchNormalize';
import type { Lang } from './gita/language';
import { transliterateDevanagari } from '@/utils/transliterate';

/**
 * Hashtags per share. Five, because that is what Instagram accepts — and five is
 * also what Instagram's own guidance has long recommended, so this is the right
 * number on reach grounds regardless of the ceiling.
 *
 * Five changes the strategy, not just the length. A thirty-tag block could afford
 * to lead with the long tail and let the broad tags ride along behind; five cannot.
 * Every slot has to earn itself, which is why the ordering below is a deliberate
 * blend — name, deity, one volume anchor — rather than "most specific first".
 */
export const MAX_HASHTAGS = 5;

/** Deity → curated tags, most canonical first. Keys mirror `Deity` in `texts.ts`. */
const DEITY_TAGS: Record<Deity, readonly string[]> = {
  rama: ['JaiShriRam', 'Ram', 'Ramayan'],
  krishna: ['Krishna', 'JaiShreeKrishna', 'RadheRadhe'],
  vishnu: ['Vishnu', 'Narayan', 'JaiShriHari'],
  shiva: ['Mahadev', 'HarHarMahadev', 'Shiva'],
  hanuman: ['Hanuman', 'JaiHanuman', 'BajrangBali'],
  durga: ['MaaDurga', 'JaiMataDi', 'Durga'],
  ganesha: ['Ganesha', 'GanpatiBappaMorya', 'JaiGanesh'],
  savitr: ['Gayatri', 'GayatriMantra'],
  saraswati: ['MaaSaraswati', 'Saraswati'],
  lakshmi: ['MaaLakshmi', 'Lakshmi'],
  surya: ['SuryaDev', 'Surya'],
  radha: ['RadhaKrishna', 'RadheRadhe', 'Radha'],
  kartikeya: ['Kartikeya', 'Murugan'],
  kubera: ['Kubera', 'KuberMantra'],
  ganga: ['MaaGanga', 'Ganga'],
  parvati: ['MaaParvati', 'Parvati'],
  narasimha: ['Narasimha', 'JaiNarasimha'],
  dattatreya: ['Dattatreya', 'ShriDatta'],
  shani: ['ShaniDev', 'Shani'],
  kali: ['MaaKali', 'Kali'],
  navagraha: ['Navagraha', 'Jyotish'],
};

/** Category → the form of the text. Keys mirror `ContentCategory` in `texts.ts`. */
const CATEGORY_TAGS: Record<ContentCategory, readonly string[]> = {
  granth: ['SacredTexts', 'Scripture'],
  stotram: ['Stotram', 'Shlok'],
  chalisa: ['Chalisa'],
  japam: ['Mantra', 'Japa'],
  aarti: ['Aarti', 'Bhajan'],
  theerth: ['Teerth', 'Yatra'],
  sanskar: ['Sanskar'],
  kavacham: ['Kavacham'],
  ashtakam: ['Ashtakam'],
  suktam: ['Suktam', 'VedicChants'],
};

/** The volume ceiling — always present, always behind the derived tags. */
const BROAD_TAGS = [
  'Bhakti',
  'SanatanDharma',
  'Hinduism',
  'Devotional',
  'Spirituality',
  'DailyPrayer',
] as const;

/**
 * Per-reading-language discovery tags. `hi` also gets the native-script title
 * (built separately, below) — these are the language's own evergreen tags.
 */
const LANGUAGE_TAGS: Record<Lang, readonly string[]> = {
  hi: ['भक्ति', 'सनातनधर्म'],
  en: ['VerseOfTheDay', 'DailyVerse'],
  gu: ['ગુજરાતી', 'GujaratiBhakti'],
  kn: ['ಕನ್ನಡ', 'KannadaBhakti'],
};

const BRAND_TAGS = ['Vedansh', 'VedanshApp'] as const;

/**
 * Weekday (vaar) tags, keyed by `Date#getDay()`. Emitted **only** when the day's
 * presiding deity (`deityForWeekday`, `data/routine/vaar.ts`) is one the text is
 * actually tagged with — a Tuesday `#Mangalwar` on a Saraswati stotra is the same
 * irrelevance the module refuses everywhere else.
 */
const WEEKDAY_TAGS: Readonly<Record<number, { latin: string; hi: string }>> = {
  0: { latin: 'Ravivar', hi: 'रविवार' },
  1: { latin: 'Somvar', hi: 'सोमवार' },
  2: { latin: 'Mangalwar', hi: 'मंगलवार' },
  3: { latin: 'Budhwar', hi: 'बुधवार' },
  4: { latin: 'Guruvar', hi: 'गुरुवार' },
  5: { latin: 'Shukrawar', hi: 'शुक्रवार' },
  6: { latin: 'Shanivar', hi: 'शनिवार' },
};

/**
 * Search tokens per deity, used to decide whether the day's observance belongs to
 * this text. Matched against the normalized `deityEn` + `nameEn` of the observance
 * rule, so `Hanuman Jayanti` (deityEn "Hanuman") attaches to a Hanuman-tagged text
 * and to nothing else. Lowercase and diacritic-free — compared post-`normalize`.
 */
const DEITY_MATCH_TOKENS: Record<Deity, readonly string[]> = {
  rama: ['ram', 'rama', 'raghu'],
  krishna: ['krishna', 'krsna', 'kanha', 'gopal'],
  vishnu: ['vishnu', 'visnu', 'narayan', 'hari'],
  shiva: ['shiv', 'siva', 'mahadev', 'shankar'],
  hanuman: ['hanuman', 'bajrang', 'maruti'],
  durga: ['durga', 'ambe', 'sherawali'],
  ganesha: ['ganesh', 'ganesa', 'ganpati', 'vinayak'],
  savitr: ['gayatri', 'savitr'],
  saraswati: ['saraswati', 'sarasvati'],
  lakshmi: ['lakshmi', 'laksmi'],
  surya: ['surya', 'sun'],
  radha: ['radha'],
  kartikeya: ['kartikeya', 'murugan', 'skanda'],
  kubera: ['kubera', 'kuber'],
  ganga: ['ganga'],
  parvati: ['parvati', 'gauri'],
  narasimha: ['narasimha', 'narsimha'],
  dattatreya: ['dattatreya', 'datta'],
  shani: ['shani', 'sani'],
  kali: ['kali'],
  navagraha: ['navagraha', 'graha'],
};

/** One observance falling on the share date, as much of it as the tags need. */
export type TimelyOccasion = {
  nameHi: string;
  nameEn: string;
  /** `ObservanceRule.deityEn` — the relevance test runs against this. */
  deityEn: string;
};

/**
 * Date-dependent inputs. Supplied by the **caller** rather than read here: this
 * module stays pure and deterministic, and resolving observances needs a location
 * and a warmed year cache that only a React tree can provide (`useObservancesForDate`).
 */
export type TimelyContext = {
  /** Observances on the share date, engine order. Only deity-relevant ones are used. */
  occasions?: readonly TimelyOccasion[];
  /** `Date#getDay()` of the share date, for the vaar tag. */
  weekday?: number;
  /** That weekday's presiding deity (`deityForWeekday`). */
  weekdayDeity?: Deity;
};

/**
 * At most this many observances contribute. One: a day can carry several, and at
 * five slots even a second festival tag crowds out the deity and the anchor.
 */
const MAX_OCCASIONS = 1;

/**
 * Short, higher-volume aliases for texts whose registry name is long. Used for
 * the chapter tag, where "#BhagavadGitaChapter2" is a dead tag and "#GitaChapter2"
 * is a live one. Keyed by `LibraryEntry.id`; absent = use the full slug.
 */
const SHORT_ALIAS: Record<string, string> = {
  'bhagavad-gita': 'Gita',
  'valmiki-ramayan': 'Ramayan',
  ramcharitmanas: 'Ramcharitmanas',
  'hanuman-chalisa': 'HanumanChalisa',
  sundarkand: 'Sundarkand',
};

/**
 * Longest tag we will emit. Instagram accepts more, but a 60-character tag is a
 * tag nobody else has typed — it costs a slot and returns nothing.
 */
const MAX_TAG_LENGTH = 40;

/**
 * Latin/romanized title → PascalCase tag. Runs the search normalizer first, so
 * IAST diacritics fold (`Bhagavad Gītā` → `BhagavadGita`) and punctuation, dandas
 * and the `·` separator drop out before the words are joined.
 */
export function latinTag(text: string): string {
  const words = normalize(text).split(' ').filter(Boolean);
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

/**
 * Indic title → tag in its own script. Keeps letters, digits and combining marks
 * (matras are `\p{M}`, not `\p{L}` — stripping them would shred the word) and drops
 * everything else, including the spaces Instagram would treat as a tag boundary.
 */
export function nativeScriptTag(text: string): string {
  return text.replace(/[^\p{L}\p{N}\p{M}]/gu, '');
}

/**
 * Chapter number out of a verse label, when the label carries one. Readers write
 * chaptered labels as `Verse 2.47` / `श्लोक 2.47`, so the chapter is the first of a
 * dotted pair. Linear texts (`Verse 12`, `पद 5`) have no chapter and return null.
 */
export function chapterFromVerseLabel(verseLabelEn: string): number | null {
  const m = /(\d+)\s*[.:]\s*\d+/.exec(verseLabelEn);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export type VerseHashtagParams = {
  /** `LibraryEntry.id` of the text being shared — drives deity + category tags. */
  sourceId: string;
  /** The verse's section title, exactly as the share card's header shows it. */
  sectionNameHi: string;
  sectionNameEn: string;
  /** The verse's label (`Verse 2.47`, `पद 5`) — the chapter tag comes from here. */
  verseLabelEn: string;
  /** Active reading language: selects the native-script title + language tags. */
  lang: Lang;
  /** Cap; defaults to (and is clamped to) {@link MAX_HASHTAGS}. */
  limit?: number;
  /** Date-dependent tags (festival / vrat / vaar). Absent → the block is date-free. */
  timely?: TimelyContext;
};

/**
 * The ordered tag list for one verse, without the leading `#`.
 *
 * Deterministic: the same verse + language always produces the same block, so a
 * re-share reuses the tags Instagram has already indexed the account under.
 * Deduped case-insensitively and capped at {@link MAX_HASHTAGS}; the list is built
 * in priority order, so the cap only ever trims from the least valuable end.
 */
export function buildVerseHashtags(p: VerseHashtagParams): string[] {
  const entry = library.find((e) => e.id === p.sourceId);
  const textName = entry?.nameEn ?? p.sectionNameEn;
  const textTag = latinTag(textName);
  const sectionTag = latinTag(p.sectionNameEn);
  const alias = SHORT_ALIAS[p.sourceId] ?? textTag;

  const deityTokens = (entry?.deities ?? []).flatMap((d) => DEITY_MATCH_TOKENS[d]);
  const ordered: string[] = [];

  // 0. Occasion — the festival or vrat falling today, but ONLY when it belongs to
  //    one of this text's deities. `#HanumanJayanti` on a Hanuman Chalisa verse is
  //    the best tag in the block; the same tag on a Saraswati stotra is spam.
  for (const occ of (p.timely?.occasions ?? []).slice(0, MAX_OCCASIONS)) {
    const haystack = normalize(`${occ.deityEn} ${occ.nameEn}`);
    const relevant = deityTokens.some((t) => haystack.includes(t));
    if (!relevant) continue;
    // No `#Janmashtami2026` variant: it duplicates the topic of `#Janmashtami`
    // at a fraction of the volume, and a five-slot block cannot pay for that.
    ordered.push(latinTag(occ.nameEn));
    if (p.lang === 'hi') ordered.push(nativeScriptTag(occ.nameHi));
  }

  // 1. The work's own name — the single most searched thing about this verse.
  //    Section first when it names something narrower than the text
  //    (`#ShivaTandavaStotram` before `#ShivaStotram`).
  if (sectionTag && sectionTag !== textTag) ordered.push(sectionTag);
  if (textTag) ordered.push(textTag);

  // 2. The same name in the reading language's own script — this is where the
  //    Hindi/Gujarati/Kannada audience actually searches. Derived from the
  //    Devanagari title, re-scripted for gu/kn like every other content string.
  const nativeTitle =
    p.lang === 'hi'
      ? nativeScriptTag(p.sectionNameHi)
      : p.lang === 'gu' || p.lang === 'kn'
        ? nativeScriptTag(transliterateDevanagari(p.sectionNameHi, p.lang))
        : '';
  if (nativeTitle) ordered.push(nativeTitle);

  // 3. The primary deity, two tags at most. The registry's FIRST deity only —
  //    at five slots a second deity's tags would push out the volume anchor.
  const primaryDeity = entry?.deities[0];
  if (primaryDeity) ordered.push(...DEITY_TAGS[primaryDeity].slice(0, 2));

  // 4. One broad anchor. A block of five pure-niche tags has no volume in it at
  //    all; exactly one large tag gives the post somewhere big to rank, without
  //    the dilution six of them would cause. `#Bhakti` is the widest devotional
  //    tag that is still true of every verse in the app.
  ordered.push(BROAD_TAGS[0]);

  // ── Everything below here only appears if the cap is raised. Kept in the list
  //    so the ordering stays a single readable statement of priority, and so a
  //    future platform change is a one-constant edit. ────────────────────────

  // Vaar — Tuesday on a Hanuman text, Saturday on a Shani one. Gated on the
  // day's deity actually being one of this text's, same rule as the occasion.
  const weekdayDeity = p.timely?.weekdayDeity;
  const weekday = p.timely?.weekday;
  if (
    weekdayDeity !== undefined &&
    weekday !== undefined &&
    (entry?.deities ?? []).includes(weekdayDeity) &&
    WEEKDAY_TAGS[weekday]
  ) {
    ordered.push(WEEKDAY_TAGS[weekday].latin);
    if (p.lang === 'hi') ordered.push(WEEKDAY_TAGS[weekday].hi);
  }

  const chapter = chapterFromVerseLabel(p.verseLabelEn);
  if (chapter !== null && alias) ordered.push(`${alias}Chapter${chapter}`);
  for (const deity of (entry?.deities ?? []).slice(1, 2)) {
    ordered.push(...DEITY_TAGS[deity]);
  }
  if (primaryDeity) ordered.push(...DEITY_TAGS[primaryDeity].slice(2));
  if (entry) ordered.push(...CATEGORY_TAGS[entry.category]);
  ordered.push(...BROAD_TAGS.slice(1));
  ordered.push(...LANGUAGE_TAGS[p.lang]);
  ordered.push(...BRAND_TAGS);

  const cap = Math.max(0, Math.min(p.limit ?? MAX_HASHTAGS, MAX_HASHTAGS));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const tag of ordered) {
    // Checked before the push, not after: a cap of 0 must yield nothing at all.
    if (out.length >= cap) break;
    if (!tag || tag.length > MAX_TAG_LENGTH) continue;
    // A purely numeric hashtag is not a hashtag on Instagram.
    if (!/[\p{L}]/u.test(tag)) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
  }
  return out;
}

/** Render a tag list as the caption's hashtag line: `#A #B #C`. */
export function formatHashtags(tags: readonly string[]): string {
  return tags.map((t) => `#${t}`).join(' ');
}
