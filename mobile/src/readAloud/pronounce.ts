/**
 * Normalizes a string for the speech synthesizer.
 *
 * This ONLY affects the text handed to `Speech.speak`. Displayed text, shared verse
 * cards, and the search index are never touched — RULEBOOK §11.15 requires that
 * synthetic recitation never alters the authored text, and keeping the mutation on
 * this side of the boundary is how that holds.
 *
 * The dandas are the reason this file exists: TTS engines read a bare `।` as either
 * nothing at all or literally as "vertical line", and neither is acceptable in a
 * recitation. Mapping them to sentence punctuation gives the engine the pause a
 * reciter would take.
 */

import type { Lang } from '@/data/gita/language';

/** Verse-numbering and separator marks that should read as a pause, not a word. */
const PAUSE_MARKS = /[।॥|]+/g;
/** Interpuncts used as visual separators in labels ("पाठ · 8:14"). */
const SEPARATORS = /[·•]+/g;
/** Devanagari abbreviation sign (॰) and the avagraha (ऽ) have no spoken form. */
const SILENT_MARKS = /[॰ऽ]+/g;

export function prepareForSpeech(text: string, lang: Lang): string {
  let out = text;

  out = out.replace(SILENT_MARKS, '');
  out = out.replace(SEPARATORS, ',');
  // A danda ends a line; a double danda ends a verse. Both become a full stop, which
  // every engine honours as a pause with falling intonation.
  out = out.replace(PAUSE_MARKS, '.');

  // Devanagari digits inside a Latin-language utterance confuse en voices; the
  // romanized fields already carry Latin numerals, so this only guards stray cases.
  if (lang === 'en') out = out.replace(/[०-९]/g, (d) => String('०१२३४५६७८९'.indexOf(d)));

  // Collapse the whitespace the substitutions leave behind, and the run of stops a
  // "।।" produces, so the engine does not pause three times in a row.
  out = out.replace(/\s+/g, ' ');
  out = out.replace(/\.\s*(?:\.\s*)+/g, '. ');
  out = out.replace(/\s+([.,])/g, '$1');

  return out.trim();
}
