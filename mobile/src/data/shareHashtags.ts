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
 * ## Order is the reach strategy
 *
 * Tags are emitted **specific → broad**:
 *
 *   1. section / chapter   — the long tail ("#GitaChapter2"). Tiny feeds, but the
 *                            post can actually rank in them, and ranking is what
 *                            gets it in front of anyone at all.
 *   2. text                — "#HanumanChalisa", plus the native-script form of the
 *                            title for the reading language (Devanagari hashtags are
 *                            first-class on Instagram and carry the Hindi audience).
 *   3. deity               — mid-volume devotional feeds ("#JaiHanuman").
 *   4. category            — the form of the text ("#Chalisa", "#Stotram").
 *   5. broad devotional    — the volume ceiling ("#Bhakti", "#SanatanDharma"). Alone
 *                            these bury a post in seconds; behind the specific tags
 *                            they add reach without costing the ranking above.
 *   6. language + brand    — discovery for the reading language, then "#Vedansh".
 *
 * The blend (a handful of niche, a handful of mid, a handful of broad) is the part
 * that matters for reach; the exact word list below is editorial and safe to tune.
 */

import { library, type ContentCategory, type Deity } from './texts';
import { normalize } from './searchNormalize';
import type { Lang } from './gita/language';
import { transliterateDevanagari } from '@/utils/transliterate';

/** Instagram's hard per-post cap. A caption past this drops the whole tag block. */
export const MAX_HASHTAGS = 30;

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
};

/**
 * The ordered tag list for one verse, without the leading `#`.
 *
 * Deterministic: the same verse + language always produces the same block, so a
 * re-share reuses the tags Instagram has already indexed the account under.
 * Deduped case-insensitively and capped at {@link MAX_HASHTAGS}; because the list
 * is built specific-first, the cap only ever trims from the broad end.
 */
export function buildVerseHashtags(p: VerseHashtagParams): string[] {
  const entry = library.find((e) => e.id === p.sourceId);
  const textName = entry?.nameEn ?? p.sectionNameEn;
  const textTag = latinTag(textName);
  const sectionTag = latinTag(p.sectionNameEn);
  const alias = SHORT_ALIAS[p.sourceId] ?? textTag;

  const ordered: string[] = [];

  // 1. Long tail — the section (when it names something narrower than the text)
  //    and the chapter.
  if (sectionTag && sectionTag !== textTag) ordered.push(sectionTag);
  const chapter = chapterFromVerseLabel(p.verseLabelEn);
  if (chapter !== null && alias) ordered.push(`${alias}Chapter${chapter}`);

  // 2. The text itself, in Latin and in the reading language's own script. The
  //    native form comes from the Devanagari title — re-scripted for gu/kn the
  //    same way every other content string is (`contentByLang`).
  if (textTag) ordered.push(textTag);
  const nativeTitle =
    p.lang === 'hi'
      ? nativeScriptTag(p.sectionNameHi)
      : p.lang === 'gu' || p.lang === 'kn'
        ? nativeScriptTag(transliterateDevanagari(p.sectionNameHi, p.lang))
        : '';
  if (nativeTitle) ordered.push(nativeTitle);

  // 3. Deities, capped at the first two the registry lists — a text filed under
  //    four deities would otherwise spend the whole budget on them.
  for (const deity of (entry?.deities ?? []).slice(0, 2)) {
    ordered.push(...DEITY_TAGS[deity]);
  }

  // 4. Form of the text, 5. the broad ceiling, 6. language + brand.
  if (entry) ordered.push(...CATEGORY_TAGS[entry.category]);
  ordered.push(...BROAD_TAGS);
  ordered.push(...LANGUAGE_TAGS[p.lang]);
  ordered.push(...BRAND_TAGS);

  const seen = new Set<string>();
  const out: string[] = [];
  for (const tag of ordered) {
    if (!tag || tag.length > MAX_TAG_LENGTH) continue;
    // A purely numeric hashtag is not a hashtag on Instagram.
    if (!/[\p{L}]/u.test(tag)) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
    if (out.length === MAX_HASHTAGS) break;
  }
  return out;
}

/** Render a tag list as the caption's hashtag line: `#A #B #C`. */
export function formatHashtags(tags: readonly string[]): string {
  return tags.map((t) => `#${t}`).join(' ');
}
