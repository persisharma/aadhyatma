/**
 * Devanagari well-formedness validation.
 *
 * Every other script check in this repo (contentCorrectness §5, RULEBOOK §11.12,
 * build-valmiki-ramayan's "non-Sanskrit export artifact" guard) is a *character-set
 * membership* test: it asks whether a codepoint sits inside U+0900–U+097F. That can
 * never catch a combining mark attached to the wrong base, because the mark is a
 * perfectly legal Devanagari codepoint sitting in an illegal position.
 *
 * A shaper (HarfBuzz, on both iOS and Android) renders such a mark as U+25CC
 * DOTTED CIRCLE — the "◌" the reader sees. There is no U+25CC in the data to grep
 * for; the defect is the *sequence*. So this module validates cluster grammar:
 * every combining mark must sit on a base that can legally carry it.
 *
 * Because gu/kn reading languages are derived at runtime by transliterating this
 * same Devanagari (see utils/transliterate.ts), one malformed cluster mis-renders
 * in three of the four reading languages.
 *
 * Kept dependency-free and pure so generators, tests and scripts share one rule.
 */

/** Dependent vowel signs (matras). Deliberately excludes nukta U+093C and avagraha U+093D. */
function isMatra(cp: number): boolean {
  return (
    (cp >= 0x093a && cp <= 0x093b) ||
    (cp >= 0x093e && cp <= 0x094c) ||
    (cp >= 0x094e && cp <= 0x094f) ||
    (cp >= 0x0955 && cp <= 0x0957) ||
    (cp >= 0x0962 && cp <= 0x0963)
  );
}

/** Candrabindu, anusvara, visarga and the Vedic tone marks that share their slot. */
function isBindu(cp: number): boolean {
  return cp >= 0x0900 && cp <= 0x0903;
}

function isVirama(cp: number): boolean {
  return cp === 0x094d;
}

function isNukta(cp: number): boolean {
  return cp === 0x093c;
}

function isConsonant(cp: number): boolean {
  return (
    (cp >= 0x0915 && cp <= 0x0939) ||
    (cp >= 0x0958 && cp <= 0x095f) ||
    (cp >= 0x0978 && cp <= 0x097f)
  );
}

function isIndependentVowel(cp: number): boolean {
  return (
    (cp >= 0x0904 && cp <= 0x0914) ||
    cp === 0x0960 ||
    cp === 0x0961 ||
    (cp >= 0x0972 && cp <= 0x0977)
  );
}

function isDevanagari(cp: number): boolean {
  return (
    (cp >= 0x0900 && cp <= 0x097f) ||
    (cp >= 0x1cd0 && cp <= 0x1cff) ||
    (cp >= 0xa8e0 && cp <= 0xa8ff)
  );
}

function isCombiningMark(cp: number): boolean {
  return isMatra(cp) || isBindu(cp) || isVirama(cp) || isNukta(cp);
}

const ZWNJ = 0x200c;
const ZWJ = 0x200d;

/** Every way a mark can end up without a legal base. */
export type DevanagariDefectKind =
  | 'matra-after-virama'
  | 'nukta-after-matra'
  | 'matra-after-matra'
  | 'mark-after-bindu'
  | 'double-nukta'
  | 'matra-on-independent-vowel'
  | 'mark-on-non-base'
  | 'mark-after-zero-width-joiner'
  | 'mark-after-non-devanagari'
  | 'mark-at-start';

export interface DevanagariDefect {
  /** Index of the offending combining mark within the input string. */
  index: number;
  kind: DevanagariDefectKind;
  /** The offending mark itself. */
  mark: string;
  /** Codepoint of the mark, as `U+094D`, for messages that must survive a terminal. */
  codepoint: string;
  /** The whole Devanagari word the mark sits in — what a reviewer needs to see. */
  word: string;
}

const DEVANAGARI_ANYWHERE = /[ऀ-ॿ᳐-᳿꣠-ꣿ]/;

/** Expands from `index` to the surrounding run of Devanagari + joiner characters. */
function wordAt(text: string, index: number): string {
  const inWord = (cp: number) => isDevanagari(cp) || cp === ZWJ || cp === ZWNJ;
  let start = index;
  while (start > 0 && inWord(text.charCodeAt(start - 1))) start -= 1;
  let end = index + 1;
  while (end < text.length && inWord(text.charCodeAt(end))) end += 1;
  return text.slice(start, end);
}

/**
 * Returns every combining mark in `text` that a shaper will render as a dotted
 * circle. An empty array means the Devanagari is well-formed.
 */
export function findDevanagariDefects(text: string): DevanagariDefect[] {
  if (!DEVANAGARI_ANYWHERE.test(text)) return [];

  const defects: DevanagariDefect[] = [];
  const push = (index: number, kind: DevanagariDefectKind) => {
    const mark = text[index];
    defects.push({
      index,
      kind,
      mark,
      codepoint: `U+${text.charCodeAt(index).toString(16).toUpperCase().padStart(4, '0')}`,
      word: wordAt(text, index),
    });
  };

  for (let i = 0; i < text.length; i += 1) {
    const cp = text.charCodeAt(i);
    if (!isCombiningMark(cp)) continue;

    if (i === 0) {
      push(i, 'mark-at-start');
      continue;
    }

    let prev = text.charCodeAt(i - 1);

    // ZWJ/ZWNJ break a cluster: they legitimately follow a virama to force an
    // explicit halant or a joined form, but they never provide a base for a matra.
    if (prev === ZWJ || prev === ZWNJ) {
      if (isMatra(cp) || isBindu(cp) || isNukta(cp)) {
        push(i, 'mark-after-zero-width-joiner');
        continue;
      }
      if (i - 2 < 0) {
        push(i, 'mark-at-start');
        continue;
      }
      prev = text.charCodeAt(i - 2);
    }

    if (!isDevanagari(prev)) {
      push(i, 'mark-after-non-devanagari');
      continue;
    }

    if (isVirama(prev)) {
      // After a virama only a consonant (or a joiner) may follow. A matra here is
      // the classic legacy-encoding reordering bug: भक्ितयोगेन for भक्तियोगेन.
      if (isMatra(cp) || isBindu(cp)) push(i, 'matra-after-virama');
      continue;
    }

    if (isMatra(prev)) {
      if (isMatra(cp)) push(i, 'matra-after-matra');
      // ृ + ़ is how legacy fonts faked ॄ; it has no valid Unicode reading.
      else if (isNukta(cp)) push(i, 'nukta-after-matra');
      continue;
    }

    if (isBindu(prev)) {
      // Anusvara/visarga close a cluster; nothing may attach after them.
      if (isMatra(cp) || isNukta(cp) || isVirama(cp)) push(i, 'mark-after-bindu');
      continue;
    }

    if (isNukta(prev)) {
      if (isNukta(cp)) push(i, 'double-nukta');
      continue;
    }

    if (isIndependentVowel(prev)) {
      if (isMatra(cp) || isVirama(cp)) push(i, 'matra-on-independent-vowel');
      continue;
    }

    // Digits, dandas, avagraha, ॐ and the like are Devanagari but carry no marks.
    if (!isConsonant(prev)) push(i, 'mark-on-non-base');
  }

  return defects;
}

/** Convenience predicate for call sites that only need a yes/no. */
export function isDevanagariWellFormed(text: string): boolean {
  return findDevanagariDefects(text).length === 0;
}

/** One-line human summary of a defect, for assertion messages. */
export function describeDevanagariDefect(defect: DevanagariDefect): string {
  return `${defect.kind} (${defect.codepoint} ${defect.mark}) in "${defect.word}" at index ${defect.index}`;
}
