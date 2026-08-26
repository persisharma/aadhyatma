/**
 * Turns one verse page into the ordered list of utterances that speak it.
 *
 * Verse lines are one chunk per line, deliberately. The gap between utterances then
 * lands on the visual line break — which for a chaupai or doha half-line is exactly
 * where a reciter breathes. It also keeps every chunk far under Android's
 * `maxSpeechInputLength`, makes `stop()` land within one line (the pause granularity,
 * since Android has no native pause), and leaves per-line granularity available for
 * future line highlighting.
 *
 * The spoken text is derived through the same `utils/localize` helpers the page renders
 * with, so **what is heard is exactly what is seen** — including gu/kn, which speak
 * their own transliterated script and their authored `meaningGu`/`meaningKn` where it
 * exists. Read-aloud never substitutes another language: a device with no voice for the
 * active reading language reports unavailable instead (see `voices.ts`).
 */

import type { Lang } from '@/data/gita/language';
import { commentaryByLang, meaningByLang, verseLinesByLang } from '@/utils/localize';
import { prepareForSpeech } from './pronounce';
import type { ReadableVerse } from './verseAdapter';

export type SpokenPart = 'verse' | 'meaning' | 'commentary';

export type ReadAloudChunk = {
  /** Stable within a page: `${part}-${n}`. Used as the utterance id. */
  id: string;
  text: string;
  part: SpokenPart;
};

export type BuildScriptOptions = {
  readMeaning: boolean;
  readCommentary: boolean;
  /** Hard ceiling per utterance. Android's `speak()` throws above ~4000 chars. */
  maxChars: number;
};

/** Sentence-ish boundaries: Devanagari dandas plus Latin terminal punctuation. */
const SENTENCE_SPLIT = /(?<=[।॥.!?])\s+/;

/**
 * Splits prose into chunks of at most `maxChars`, preferring sentence boundaries, then
 * whitespace. Never splits mid-token — a Devanagari cluster broken across utterances
 * loses its matra and is mispronounced on both platforms.
 */
function packProse(text: string, maxChars: number): string[] {
  const trimmed = text.trim();
  if (trimmed.length === 0) return [];
  if (trimmed.length <= maxChars) return [trimmed];

  const out: string[] = [];
  let current = '';

  const flush = () => {
    if (current.trim().length > 0) out.push(current.trim());
    current = '';
  };

  for (const sentence of trimmed.split(SENTENCE_SPLIT)) {
    if (sentence.length === 0) continue;

    if (current.length > 0 && current.length + 1 + sentence.length > maxChars) flush();

    if (sentence.length <= maxChars) {
      current = current.length > 0 ? `${current} ${sentence}` : sentence;
      continue;
    }

    // A single sentence longer than the cap: fall back to whitespace packing.
    flush();
    let word = '';
    for (const token of sentence.split(/\s+/)) {
      if (token.length > maxChars) {
        // No whitespace to split on (a pathological unbroken run). Hard-truncate in
        // maxChars slices rather than letting Android's speak() throw.
        if (word.length > 0) {
          out.push(word);
          word = '';
        }
        for (let i = 0; i < token.length; i += maxChars) out.push(token.slice(i, i + maxChars));
        continue;
      }
      if (word.length > 0 && word.length + 1 + token.length > maxChars) {
        out.push(word);
        word = token;
      } else {
        word = word.length > 0 ? `${word} ${token}` : token;
      }
    }
    if (word.length > 0) out.push(word);
  }

  flush();
  return out;
}

/**
 * Builds the utterance list for a page. An empty array is legal and means "nothing to
 * speak here" — e.g. a stotram intro page (`number === 0`) with no verse lines. Callers
 * must treat that as "advance to the next page", not as a stall.
 */
export function buildVerseScript(
  verse: ReadableVerse | null,
  lang: Lang,
  opts: BuildScriptOptions
): ReadAloudChunk[] {
  if (!verse) return [];

  const chunks: ReadAloudChunk[] = [];
  const push = (part: SpokenPart, text: string) => {
    const prepared = prepareForSpeech(text, lang);
    if (prepared.length === 0) return;
    for (const piece of packProse(prepared, opts.maxChars)) {
      chunks.push({ id: `${part}-${chunks.length}`, text: piece, part });
    }
  };

  if (verse.kind === 'prose') {
    // The katha body IS the text, so it is 'verse' and must not sit behind readMeaning —
    // gating it there would make every katha page silent.
    const body = commentaryByLang(lang, verse.bodyHi, verse.bodyEn);
    for (const paragraph of body) push('verse', paragraph);
    return chunks;
  }

  for (const line of verseLinesByLang(lang, verse.deva, verse.latin)) {
    push('verse', line);
  }

  if (opts.readMeaning) {
    // Authored native meanings are passed through, so gu/kn speak the verified
    // Gujarati/Kannada prose the page shows rather than a re-scripted fallback.
    push(
      'meaning',
      meaningByLang(lang, verse.meaningHi, verse.meaningEn, {
        gu: verse.meaningGu,
        kn: verse.meaningKn,
      })
    );
    if (verse.extraHi || verse.extraEn) {
      push('meaning', meaningByLang(lang, verse.extraHi ?? '', verse.extraEn ?? ''));
    }
  }

  if (opts.readCommentary && verse.commentaryHi && verse.commentaryEn) {
    for (const paragraph of commentaryByLang(lang, verse.commentaryHi, verse.commentaryEn)) {
      push('commentary', paragraph);
    }
  }

  return chunks;
}
