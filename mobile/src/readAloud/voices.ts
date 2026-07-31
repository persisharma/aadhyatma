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

/** Normalizes 'hi_IN' / 'hi-in' / 'hi-IN' to a comparable 'hi-in'. */
function normalizeTag(tag: string): string {
  return tag.toLowerCase().replace(/_/g, '-');
}

function primarySubtag(tag: string): string {
  return normalizeTag(tag).split('-')[0];
}

/**
 * Picks the best available voice for a target, or `null` when the device has none.
 *
 * Ranking: the user's saved choice (if still installed) → exact locale match → same
 * primary subtag. Within a tier, `Enhanced` quality first, then alphabetically by name
 * so the pick is deterministic across runs (voice lists are not stably ordered).
 */
export function resolveVoice(
  target: SpeechTarget,
  voices: readonly ProbedVoice[],
  preferredIdentifier?: string
): ProbedVoice | null {
  const wanted = normalizeTag(SPEECH_LOCALE[target].ios);

  if (preferredIdentifier) {
    const saved = voices.find((v) => v.identifier === preferredIdentifier);
    // Honour the saved choice only if it actually speaks the requested language. A
    // stored identifier can outlive its target (prefs carried over, a voice
    // uninstalled and its id reused), and using it anyway would read one language's
    // text in another's voice — the exact failure this module exists to prevent.
    if (saved && primarySubtag(saved.language) === target) return saved;
  }
  const rank = (a: ProbedVoice, b: ProbedVoice) => {
    const aEnhanced = a.quality === 'Enhanced' ? 0 : 1;
    const bEnhanced = b.quality === 'Enhanced' ? 0 : 1;
    if (aEnhanced !== bEnhanced) return aEnhanced - bEnhanced;
    return a.name.localeCompare(b.name);
  };

  const exact = voices.filter((v) => normalizeTag(v.language) === wanted).sort(rank);
  if (exact.length > 0) return exact[0];

  const sameLanguage = voices.filter((v) => primarySubtag(v.language) === target).sort(rank);
  if (sameLanguage.length > 0) return sameLanguage[0];

  return null;
}

/** Every voice installed for a target, best-first — the settings sheet's candidate list. */
export function voicesForTarget(
  target: SpeechTarget,
  voices: readonly ProbedVoice[]
): ProbedVoice[] {
  return voices
    .filter((v) => primarySubtag(v.language) === target)
    .sort((a, b) => {
      const aEnhanced = a.quality === 'Enhanced' ? 0 : 1;
      const bEnhanced = b.quality === 'Enhanced' ? 0 : 1;
      if (aEnhanced !== bEnhanced) return aEnhanced - bEnhanced;
      return a.name.localeCompare(b.name);
    });
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
