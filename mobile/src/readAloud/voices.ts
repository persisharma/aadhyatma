/**
 * Locale and voice resolution for read-aloud.
 *
 * Two decisions live here, and both are load-bearing.
 *
 * 1. **Each reading language is spoken in its own voice, or not at all.** There is no
 *    substitution: a Gujarati reader hears a Gujarati voice reading the Gujarati on
 *    screen, and a device with no Gujarati voice reports read-aloud *unavailable* for
 *    Gujarati rather than quietly speaking something else. Substituting Hindi for gu/kn
 *    would mean the user reads one script and hears another language — and for the
 *    meaning it would silently discard authored `meaningGu`/`meaningKn`. An honest
 *    "not available on this device" is better than a confusing approximation.
 *
 *    Consequence to accept: gu/kn coverage depends on the device having that voice
 *    installed, which is less common than Hindi. That is a real limitation, surfaced
 *    plainly in the UI (with an Android hop to TTS settings to install it) rather than
 *    hidden behind a fallback.
 *
 * 2. **Both platforms fail SILENTLY for an unavailable language**, so the caller must
 *    probe `getAvailableVoicesAsync()` and gate the UI on the result. `onError` never
 *    fires for this case on either platform:
 *      - iOS: `AVSpeechSynthesisVoice(language:)` returns nil, `utterance.voice` stays
 *        nil, and the system default voice speaks instead.
 *      - Android: `isLanguageAvailable` returns LANG_MISSING_DATA/LANG_NOT_SUPPORTED and
 *        `speakOut` falls back to `Locale.getDefault()`.
 *    Without the probe, "no Gujarati voice" would present as Gujarati text read aloud
 *    in an American accent — which is exactly what decision 1 exists to prevent.
 */

import type { SpeechOptions } from 'expo-speech';
import type { Lang } from '@/data/gita/language';
import type { SpeechTarget } from './prefs';

/** Whether a voice for a target is known-good, known-missing, or not yet probed. */
export type VoiceAvailability = 'ready' | 'unavailable' | 'unknown';

/** The subset of expo-speech's `Voice` this module needs (keeps tests free of the native type). */
export type ProbedVoice = {
  identifier: string;
  name: string;
  quality: string;
  language: string;
};

/**
 * BCP-47 tag for iOS, bare primary subtag for Android.
 *
 * Android MUST get the bare code: `SpeechModule.kt` does `Locale(options.language)`, and
 * Java's single-arg `Locale` constructor treats the whole string as the language — so
 * 'hi-IN' becomes the language "hi-in", which resolves to LANG_NOT_SUPPORTED and silently
 * falls back to the device default. That is how Devanagari ends up read by an en-US voice.
 */
export const SPEECH_LOCALE: Record<SpeechTarget, { ios: string; android: string }> = {
  hi: { ios: 'hi-IN', android: 'hi' },
  en: { ios: 'en-IN', android: 'en' },
  gu: { ios: 'gu-IN', android: 'gu' },
  kn: { ios: 'kn-IN', android: 'kn' },
};

/**
 * Which voice speaks a given reading language — identity. Kept as a named function
 * because call sites read better for it, and because it used to collapse gu/kn onto
 * Hindi; the identity mapping is the deliberate decision, not an oversight.
 */
export function speechLangFor(lang: Lang): SpeechTarget {
  return lang;
}

/**
 * The one accent the app will fall back to when the Indian voice is not installed —
 * English only. Every language is Indian-first (`SPEECH_LOCALE`), but a device without
 * an `en-IN` voice is common, so English keeps coverage by falling back to `en-US` (the
 * near-universal default English voice) and to *nothing else*: never British, Australian,
 * Irish, etc. The result is that the app only ever *offers* Indian voices (see
 * `voicesForTarget`), yet English is never silent on a plain en-US device. Hindi/Gujarati/
 * Kannada have no non-Indian accent, so they have no fallback — their `-IN` voice or
 * unavailable. English is still English either way, so "heard === seen" holds; this is an
 * accent fallback within one language, not the cross-language substitution the module forbids.
 */
const FALLBACK_LOCALE: Partial<Record<SpeechTarget, string>> = { en: 'en-US' };

/** Normalizes 'hi_IN' / 'hi-in' / 'hi-IN' to a comparable 'hi-in'. */
function normalizeTag(tag: string): string {
  return tag.toLowerCase().replace(/_/g, '-');
}

/** Locales acceptable for a target, most-preferred first: the Indian voice, then the (English-only) fallback. */
function acceptedLocales(target: SpeechTarget): string[] {
  const wanted = normalizeTag(SPEECH_LOCALE[target].ios);
  const fallback = FALLBACK_LOCALE[target];
  return fallback ? [wanted, normalizeTag(fallback)] : [wanted];
}

function rankVoices(a: ProbedVoice, b: ProbedVoice): number {
  const aEnhanced = a.quality === 'Enhanced' ? 0 : 1;
  const bEnhanced = b.quality === 'Enhanced' ? 0 : 1;
  if (aEnhanced !== bEnhanced) return aEnhanced - bEnhanced;
  return a.name.localeCompare(b.name);
}

/**
 * Picks the best available voice for a target, or `null` when the device has none.
 *
 * Ranking: the user's saved choice (if still installed and still an accepted locale) →
 * the Indian voice → the English-only `en-US` fallback. Within a tier, `Enhanced` quality
 * first, then alphabetically by name so the pick is deterministic across runs (voice lists
 * are not stably ordered).
 */
export function resolveVoice(
  target: SpeechTarget,
  voices: readonly ProbedVoice[],
  preferredIdentifier?: string
): ProbedVoice | null {
  const accepted = acceptedLocales(target);

  if (preferredIdentifier) {
    const saved = voices.find((v) => v.identifier === preferredIdentifier);
    // Honour the saved choice only if it speaks a locale the app still accepts for this
    // target (the Indian voice, or English's en-US fallback). A stored identifier can
    // outlive its target — prefs carried over, a voice uninstalled and its id reused, or
    // an accent the app used to offer but no longer does — and using it anyway would read
    // one language in another's voice, or in an accent we deliberately dropped.
    if (saved && accepted.includes(normalizeTag(saved.language))) return saved;
  }

  // Indian first, then the single permitted fallback — never any other accent.
  for (const locale of accepted) {
    const matches = voices.filter((v) => normalizeTag(v.language) === locale).sort(rankVoices);
    if (matches.length > 0) return matches[0];
  }

  return null;
}

/**
 * The settings sheet's candidate list: Indian voices only, best-first. The app offers
 * exactly one accent per language — the Indian one — so the picker never lists en-US (or
 * any other accent). en-US is reachable only as the invisible `resolveVoice` fallback when
 * no en-IN voice exists, so English stays audible on a plain device without the app ever
 * *presenting* a non-Indian voice as a choice.
 */
export function voicesForTarget(
  target: SpeechTarget,
  voices: readonly ProbedVoice[]
): ProbedVoice[] {
  const wanted = normalizeTag(SPEECH_LOCALE[target].ios);
  return voices.filter((v) => normalizeTag(v.language) === wanted).sort(rankVoices);
}

/**
 * Builds the `SpeechOptions` for one utterance. The two platform hazards are handled
 * here so no caller has to remember them.
 *
 * Android: when a probed voice identifier exists, pass `voice` and OMIT `language`
 * entirely — `setVoice` runs after `language` in `speakOut`, so the language field is
 * redundant, and omitting it removes the `Locale('hi-IN')` silent-fallback trap. With
 * no identifier we fall back to the bare 'hi'/'en' code, which `Locale(String)` accepts.
 *
 * iOS: pass both, plus `useApplicationAudioSession: true`. Without that,
 * AVSpeechSynthesizer builds its own audio session and the hardware mute switch
 * silences speech — the app already sets `playsInSilentMode: true`, so adopting the
 * app session fixes it and keeps both audio sources under one session.
 */
export function speakOptionsFor(
  target: SpeechTarget,
  voice: ProbedVoice | null,
  rate: number,
  platform: 'ios' | 'android'
): SpeechOptions {
  if (platform === 'android') {
    return voice
      ? { voice: voice.identifier, rate }
      : { language: SPEECH_LOCALE[target].android, rate };
  }

  return {
    ...(voice ? { voice: voice.identifier } : {}),
    language: SPEECH_LOCALE[target].ios,
    rate,
    useApplicationAudioSession: true,
  };
}
