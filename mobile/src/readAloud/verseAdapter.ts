/**
 * Narrows any reader's FlatList item into the one shape the read-aloud script
 * builder understands.
 *
 * There are seven verse-page components across the 20 readers and their verse
 * types differ (`lines`/`sanskrit` for Devanagari, `linesEn`/`transliteration` for
 * the romanization), so this is the single place that knows the field names. Every
 * branch uses an `in`-guard — RULEBOOK §3 forbids `as any` / `as unknown as` on
 * verse shapes, which is exactly the escape hatch that produced the PR #31 Balkand
 * crash.
 */

/** A verse (or prose section) reduced to the fields speech cares about. */
export type ReadableVerse =
  | {
      kind: 'verse';
      /** Devanagari recitation lines. */
      deva: readonly string[];
      /** Curated romanization. */
      latin: readonly string[];
      meaningHi: string;
      meaningEn: string;
      meaningGu?: string;
      meaningKn?: string;
      commentaryHi?: readonly string[];
      commentaryEn?: readonly string[];
      /** Sanskar `vidhiHi`/`vidhiEn` — ritual instructions, spoken with the meaning. */
      extraHi?: string;
      extraEn?: string;
    }
  | {
      kind: 'prose';
      /** Vrat-katha body paragraphs — the section *is* the text. */
      bodyHi: readonly string[];
      bodyEn: readonly string[];
    };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function stringArray(v: unknown): readonly string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function optionalStr(v: unknown): string | undefined {
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

/**
 * Returns `null` for anything with no speakable text — most importantly the
 * `__type: 'transition' | 'prev-transition'` chapter cards that chaptered readers
 * splice into their FlatList `data`. Callers treat `null` as "not a verse page".
 */
export function toReadableVerse(item: unknown): ReadableVerse | null {
  if (!isRecord(item)) return null;

  // Chapter-transition sentinels carry no verse text. Checked first, deliberately.
  if ('__type' in item) return null;

  // Vrat katha: prose sections rather than verses.
  if ('bodyHi' in item) {
    const bodyHi = stringArray(item.bodyHi);
    const bodyEn = stringArray(item.bodyEn);
    if (bodyHi.length === 0 && bodyEn.length === 0) return null;
    return { kind: 'prose', bodyHi, bodyEn };
  }

  // Devanagari lines live under `sanskrit` (Gita, stotrams) or `lines` (everything else).
  let deva: readonly string[] = [];
  let latin: readonly string[] = [];
  if ('sanskrit' in item) {
    deva = stringArray(item.sanskrit);
    // Gita uses `transliteration`; ShivaStrotamVerse pairs `sanskrit` with `linesEn`.
    latin = 'transliteration' in item ? stringArray(item.transliteration) : stringArray(item.linesEn);
  } else if ('lines' in item) {
    deva = stringArray(item.lines);
    latin = stringArray(item.linesEn);
  } else {
    return null;
  }

  return {
    kind: 'verse',
    deva,
    latin,
    meaningHi: str(item.meaningHi),
    meaningEn: str(item.meaningEn),
    meaningGu: optionalStr(item.meaningGu),
    meaningKn: optionalStr(item.meaningKn),
    commentaryHi: 'commentaryHi' in item ? stringArray(item.commentaryHi) : undefined,
    commentaryEn: 'commentaryEn' in item ? stringArray(item.commentaryEn) : undefined,
    extraHi: optionalStr(item.vidhiHi),
    extraEn: optionalStr(item.vidhiEn),
  };
}
