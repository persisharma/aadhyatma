/**
 * The जिज्ञासा resolver — fold → tag entities → score intents → answer or
 * abstain (PRD-31 §4.4, §13). Pure: no React, no I/O, no model. Given the same
 * question, lexicon, intents and context it returns the same result forever.
 *
 * Answer-or-abstain is the hard rule (§3.2): an intent whose required slots are
 * not all filled is INELIGIBLE, not "low confidence". Below eligibility the
 * caller gets did-you-mean suggestions and falls back to content search.
 */
import { fold, stem, GENERIC_TOKENS, MIN_STEM_WORD } from './fold';
import type { Lexicon } from './lexicon';
import type {
  AskContext,
  AskIntent,
  AskResolution,
  AskSuggestion,
  AskTrace,
  EntityType,
  LexEntry,
  ResolvedSlots,
  ScoredIntent,
} from './types';

/* ------------------------------------------------------------------ */
/*  Stance guard (§3.4) — predictive / personal framing is declined.   */
/* ------------------------------------------------------------------ */

const DECLINE_LEXEMES = [
  'milega', 'milegi', 'milenge', 'hoga kya', 'hogi kya', 'honge kya', 'bhavishya', 'bhavishy',
  'kismat', 'kismet', 'future', 'will i', 'will my', 'should i marry', 'shadi hogi', 'shaadi hogi',
  'naukri milegi', 'job milegi', 'promotion', 'lottery', 'pass hounga', 'pass hoga',
  'kab hogi shadi', 'kab hoga shadi', 'shadi kab', 'shaadi kab', 'vivah kab', 'marriage kab', 'when will i marry', 'get married', 'love marriage', 'break up', 'breakup', 'divorce',
  'pregnant', 'baccha hoga', 'beta hoga', 'beti hogi', 'dosh hai kya', 'dosh lagega',
].map(fold);

function isDeclined(key: string): boolean {
  const padded = ` ${key} `;
  return DECLINE_LEXEMES.some((d) => padded.includes(` ${d}`));
}

/* ------------------------------------------------------------------ */
/*  Relative-day slot: आज / कल / परसों                                   */
/* ------------------------------------------------------------------ */

const DAY_OFFSET_FORMS: readonly (readonly [string, number])[] = [
  ['parso', 2], ['parson', 2], ['day after', 2],
  ['kal', 1], ['kaal ko', 1], ['tomorrow', 1], ['tmrw', 1],
  ['aj', 0], ['aaj', 0], ['today', 0], ['abhi', 0],
];
const DAY_OFFSETS: readonly (readonly [string, number])[] = DAY_OFFSET_FORMS.map(([f, n]) => [fold(f), n] as const);

function dayOffsetOf(key: string): number | undefined {
  const words = key.split(' ');
  // 'kal' is only a day when it stands alone — "rahu kal" is a Kaal, not tomorrow.
  for (const [form, n] of DAY_OFFSETS) {
    if (form.includes(' ')) {
      if (` ${key} `.includes(` ${form} `)) return n;
    } else if (words.includes(form)) {
      if (form === 'kal' && (words.includes('rahu') || words.includes('gulik') || words.includes('yam'))) continue;
      return n;
    }
  }
  return undefined;
}

/* ------------------------------------------------------------------ */
/*  Entity tagging                                                     */
/* ------------------------------------------------------------------ */

/**
 * Does `entry` occur in the folded question? Three routes, in order of trust:
 *  1. the whole key as a word sequence — "griha pravesh", "ekadashi";
 *  2. the whole key as a word PREFIX when it is long enough — "ganesh" in
 *     "ganeshji", "ekadashi" in "ekadashiyon";
 *  3. stem equality on the head word — deities only, and only for words ≥ 5
 *     chars that are not generic (§13.3 specificity floor). This is what lets
 *     श्री गणेश ≡ ganesha ≡ ganesh, and what must NOT let काल ≡ kali.
 */
function matches(entry: LexEntry, padded: string, words: readonly string[]): boolean {
  const k = entry.key;
  if (padded.includes(` ${k} `)) return true;
  if (k.length >= 5 && padded.includes(` ${k}`)) return true;
  if (entry.type !== 'deity') return false;
  const head = k.split(' ').pop() ?? k;
  if (head.length < MIN_STEM_WORD || GENERIC_TOKENS.has(head)) return false;
  const hs = stem(head);
  return words.some((w) => w.length >= MIN_STEM_WORD && !GENERIC_TOKENS.has(w) && stem(w) === hs);
}

export function tagEntities(key: string, lexicon: Lexicon, seed?: AskContext['seed']): ResolvedSlots {
  const padded = ` ${key} `;
  const words = key.split(' ');
  const found: ResolvedSlots = {};
  for (const e of lexicon.entries) {
    if (GENERIC_TOKENS.has(e.key)) continue;
    if (!matches(e, padded, words)) continue;
    const prev = found[e.type];
    // Longest key wins. A named instance ("nirjala ekadashi") beats its class
    // ("ekadashi") only by being longer; a bare class word resolves to the class.
    if (!prev || e.key.length > prev.key.length) found[e.type] = e;
  }
  if (seed && !found[seed.type]) {
    const seeded = lexicon.byTypeAndId.get(`${seed.type}:${seed.id}`);
    if (seeded) found[seed.type] = seeded;
  }
  const dayOffset = dayOffsetOf(key);
  if (dayOffset !== undefined) found.dayOffset = dayOffset;
  return found;
}

/* ------------------------------------------------------------------ */
/*  Intent scoring                                                     */
/* ------------------------------------------------------------------ */

type PreparedIntent = AskIntent & { folded: readonly string[]; foldedBlockers: readonly string[] };

export function prepareIntents(intents: readonly AskIntent[]): readonly PreparedIntent[] {
  return intents.map((it) => ({ ...it, folded: it.triggers.map(fold), foldedBlockers: (it.blockers ?? []).map(fold) }));
}

function triggerHit(it: PreparedIntent, padded: string): string | null {
  // Longest matching trigger wins; a trigger matches at a word start only.
  let best: string | null = null;
  for (const t of it.folded) {
    if (padded.includes(` ${t}`) && (!best || t.length > best.length)) best = t;
  }
  return best;
}

const TRIGGER_BASE = 10;
const SLOT_FILLED = 10;
const OPTIONAL_FILLED = 3;

export function scoreIntents(
  key: string,
  slots: ResolvedSlots,
  intents: readonly PreparedIntent[]
): ScoredIntent[] {
  const padded = ` ${key} `;
  const scored: ScoredIntent[] = [];
  for (const it of intents) {
    const trig = triggerHit(it, padded);
    if (!trig) continue;
    if (it.foldedBlockers.some((b) => padded.includes(` ${b}`))) continue;
    const required = it.slots.filter((s) => !(it.optional ?? []).includes(s));
    // Hard gate: every required slot must be filled (§3.2 — not a penalty, ineligible).
    if (!required.every((s) => slots[s])) continue;
    let score = TRIGGER_BASE + trig.split(' ').length;
    score += required.length * SLOT_FILLED;
    score += (it.optional ?? []).filter((s) => slots[s]).length * OPTIONAL_FILLED;
    scored.push({ intentId: it.id, score, trigger: trig });
  }
  scored.sort((a, b) => b.score - a.score || a.intentId.localeCompare(b.intentId));
  return scored;
}

/* ------------------------------------------------------------------ */
/*  Did-you-mean                                                       */
/* ------------------------------------------------------------------ */

function suggestionsFor(slots: ResolvedSlots, intents: readonly PreparedIntent[], max = 3): AskSuggestion[] {
  const out: AskSuggestion[] = [];
  const types = (Object.keys(slots) as (keyof ResolvedSlots)[]).filter((k) => k !== 'dayOffset') as EntityType[];
  for (const it of intents) {
    if (out.length >= max) break;
    const required = it.slots.filter((s) => !(it.optional ?? []).includes(s));
    if (required.length === 0) continue;
    if (!required.every((s) => types.includes(s))) continue;
    const ex = it.examples[0];
    if (ex) out.push({ question: ex });
  }
  if (out.length === 0) {
    for (const it of intents) {
      if (out.length >= max) break;
      if (it.slots.length === 0 && it.examples[0]) out.push({ question: it.examples[0] });
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/*  Resolve                                                            */
/* ------------------------------------------------------------------ */

export function resolveAsk(
  question: string,
  ctx: AskContext,
  lexicon: Lexicon,
  intents: readonly PreparedIntent[]
): AskResolution {
  const key = fold(question);
  const entities = tagEntities(key, lexicon, ctx.seed);
  const scored = scoreIntents(key, entities, intents);
  const trace: AskTrace = { key, entities, scored };

  if (isDeclined(key)) return { kind: 'declined', trace };
  if (key.length < 3) return { kind: 'none', trace, suggestions: [] };

  for (const s of scored) {
    const it = intents.find((i) => i.id === s.intentId);
    if (!it) continue;
    const answer = it.resolve(ctx, entities);
    if (answer) return { kind: 'answer', answer, trace };
  }
  return { kind: 'none', trace, suggestions: suggestionsFor(entities, intents) };
}

/**
 * Is the input shaped like a question at all? Used by the UI so a plain
 * library query ("hanuman chalisa") never shows an abstain state (§3.6).
 */
const QUESTION_LEXEMES = [
  'kya', 'kab', 'kaise', 'kaun', 'kon', 'kis', 'kidhar', 'kitna', 'kitni', 'kitne', 'kyu', 'kyun',
  'what', 'when', 'how', 'which', 'where', 'who', 'why', 'is it', 'can i', 'should', 'chahiye',
  'bataiye', 'batao', 'bata', 'muhurat', 'muhurt', 'bhog', 'naivedya', 'disha', 'tithi', 'nakshatra',
  'rahu', 'choghadiya', 'vidhi', 'katha',
].map(fold);

export function looksLikeQuestion(question: string): boolean {
  if (question.trim().endsWith('?')) return true;
  const padded = ` ${fold(question)} `;
  return QUESTION_LEXEMES.some((q) => padded.includes(` ${q}`));
}
