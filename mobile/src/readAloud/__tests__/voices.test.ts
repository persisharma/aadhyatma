/**
 * Guards the voice-resolution ranking and — more importantly — the two silent-failure
 * traps in expo-speech's native modules. Both are invisible at runtime (neither platform
 * fires `onError` for an unavailable language), so a regression here would ship as
 * "read-aloud speaks Devanagari in an American accent" with no crash and no log.
 */

import {
  SPEECH_LOCALE,
  resolveVoice,
  speakOptionsFor,
  speechLangFor,
  voicesForTarget,
  type ProbedVoice,
} from '../voices';

const v = (
  identifier: string,
  language: string,
  quality: 'Default' | 'Enhanced' = 'Default',
  name = identifier
): ProbedVoice => ({ identifier, name, quality, language });

const HI_DEFAULT = v('com.apple.voice.compact.hi-IN.Lekha', 'hi-IN', 'Default', 'Lekha');
const HI_ENHANCED = v('com.apple.voice.enhanced.hi-IN.Lekha', 'hi-IN', 'Enhanced', 'Lekha Premium');
const EN_IN = v('com.apple.voice.compact.en-IN.Rishi', 'en-IN', 'Default', 'Rishi');
const EN_US = v('com.apple.voice.compact.en-US.Samantha', 'en-US', 'Default', 'Samantha');
const EN_GB = v('com.apple.voice.compact.en-GB.Daniel', 'en-GB', 'Default', 'Daniel');

describe('speechLangFor', () => {
  it('speaks every reading language in its own voice — no substitution', () => {
    // A Gujarati reader hears Gujarati or nothing; read-aloud never quietly swaps in
    // another language, because the user would read one script and hear another.
    for (const lang of ['hi', 'en', 'gu', 'kn'] as const) {
      expect(speechLangFor(lang)).toBe(lang);
    }
  });

  it('has a locale for all four languages', () => {
    expect(SPEECH_LOCALE.gu).toEqual({ ios: 'gu-IN', android: 'gu' });
    expect(SPEECH_LOCALE.kn).toEqual({ ios: 'kn-IN', android: 'kn' });
  });
});

describe('resolveVoice', () => {
  it('returns null when the device has no voice for the target', () => {
    expect(resolveVoice('hi', [EN_US, EN_IN])).toBeNull();
    expect(resolveVoice('hi', [])).toBeNull();
  });

  it('prefers Enhanced over Default within the same locale', () => {
    expect(resolveVoice('hi', [HI_DEFAULT, HI_ENHANCED])?.identifier).toBe(HI_ENHANCED.identifier);
    expect(resolveVoice('hi', [HI_ENHANCED, HI_DEFAULT])?.identifier).toBe(HI_ENHANCED.identifier);
  });

  it('honours a saved identifier that is still installed', () => {
    expect(resolveVoice('hi', [HI_DEFAULT, HI_ENHANCED], HI_DEFAULT.identifier)?.identifier).toBe(
      HI_DEFAULT.identifier
    );
  });

  it('falls back to ranking when the saved identifier was uninstalled', () => {
    expect(resolveVoice('hi', [HI_ENHANCED], 'com.example.deleted')?.identifier).toBe(
      HI_ENHANCED.identifier
    );
  });

  it('prefers the Indian voice over the en-US fallback', () => {
    // en-IN is the app's chosen accent for 'en'; en-US is only the fallback.
    expect(resolveVoice('en', [EN_US, EN_IN])?.identifier).toBe(EN_IN.identifier);
  });

  it('falls back to en-US when no Indian English voice is installed', () => {
    // Option B: English stays audible on a plain device rather than going silent.
    expect(resolveVoice('en', [EN_US])?.identifier).toBe(EN_US.identifier);
  });

  it('falls back ONLY to en-US — never another English accent', () => {
    // "Indian in the app, en-US the single fallback." A British/Australian/etc. voice is
    // not an accepted accent, so an en-GB-only device reports English unavailable.
    expect(resolveVoice('en', [EN_GB])).toBeNull();
    // With both present, en-US wins — en-GB is never chosen.
    expect(resolveVoice('en', [EN_GB, EN_US])?.identifier).toBe(EN_US.identifier);
  });

  it('ignores a saved voice in an accent the app no longer offers', () => {
    // A stale en-GB preference must not resurrect a dropped accent; resolution falls
    // through to the permitted en-US fallback.
    expect(resolveVoice('en', [EN_GB, EN_US], EN_GB.identifier)?.identifier).toBe(EN_US.identifier);
  });

  it('normalizes Android-style underscored tags', () => {
    // Android's LanguageUtils.getISOCode can yield 'hi_IN' shapes.
    expect(resolveVoice('hi', [v('android-hi', 'hi_IN')])?.identifier).toBe('android-hi');
  });

  it('is deterministic when quality ties, so the pick does not vary run to run', () => {
    const b = v('b', 'hi-IN', 'Default', 'Bharat');
    const a = v('a', 'hi-IN', 'Default', 'Aarav');
    expect(resolveVoice('hi', [b, a])?.identifier).toBe('a');
    expect(resolveVoice('hi', [a, b])?.identifier).toBe('a');
  });
});

describe('voicesForTarget', () => {
  it('lists every Indian-locale voice for the target, Enhanced first', () => {
    const list = voicesForTarget('hi', [HI_DEFAULT, EN_US, HI_ENHANCED]);
    expect(list.map((x) => x.identifier)).toEqual([HI_ENHANCED.identifier, HI_DEFAULT.identifier]);
  });

  it('excludes other languages', () => {
    expect(voicesForTarget('hi', [EN_US, EN_IN])).toEqual([]);
  });

  it('offers ONLY the Indian English voice — the en-US fallback is never presented', () => {
    // "Only Indian in the app": the picker lists en-IN and hides en-US/en-GB, even though
    // en-US remains reachable as resolveVoice's invisible fallback.
    expect(voicesForTarget('en', [EN_IN, EN_US, EN_GB]).map((x) => x.identifier)).toEqual([
      EN_IN.identifier,
    ]);
    expect(voicesForTarget('en', [EN_US, EN_GB])).toEqual([]);
  });
});

describe('speakOptionsFor — Android trap', () => {
  it('NEVER passes a region-tagged locale as `language`', () => {
    // SpeechModule.kt does `Locale(options.language)`, and Java's single-arg Locale
    // treats the whole string as the language: 'hi-IN' becomes "hi-in", resolves to
    // LANG_NOT_SUPPORTED, and silently falls back to Locale.getDefault().
    const withVoice = speakOptionsFor('hi', HI_DEFAULT, 1, 'android');
    const withoutVoice = speakOptionsFor('hi', null, 1, 'android');
    for (const opts of [withVoice, withoutVoice]) {
      expect(opts.language ?? '').not.toContain('-');
    }
  });

  it('omits `language` entirely when a probed voice identifier is available', () => {
    const opts = speakOptionsFor('hi', HI_DEFAULT, 1, 'android');
    expect(opts.voice).toBe(HI_DEFAULT.identifier);
    expect('language' in opts).toBe(false);
  });

  it('falls back to the bare primary subtag when no voice was probed', () => {
    expect(speakOptionsFor('hi', null, 1, 'android').language).toBe('hi');
    expect(speakOptionsFor('en', null, 1, 'android').language).toBe('en');
    expect(SPEECH_LOCALE.hi.android).toBe('hi');
  });

  it('never sets the iOS-only audio-session flag', () => {
    expect(speakOptionsFor('hi', HI_DEFAULT, 1, 'android').useApplicationAudioSession).toBeUndefined();
  });
});

describe('speakOptionsFor — iOS', () => {
  it('adopts the application audio session so the mute switch does not silence speech', () => {
    expect(speakOptionsFor('hi', HI_DEFAULT, 1, 'ios').useApplicationAudioSession).toBe(true);
  });

  it('passes the BCP-47 tag and the probed identifier', () => {
    const opts = speakOptionsFor('hi', HI_ENHANCED, 1, 'ios');
    expect(opts.language).toBe('hi-IN');
    expect(opts.voice).toBe(HI_ENHANCED.identifier);
  });

  it('omits `voice` when none was probed, so a bad identifier can never throw', () => {
    // AVSpeechSynthesisVoice(identifier:) throws InvalidVoiceException for an unknown id,
    // so only ever-probed identifiers are passed.
    const opts = speakOptionsFor('hi', null, 1, 'ios');
    expect('voice' in opts).toBe(false);
    expect(opts.language).toBe('hi-IN');
  });
});

describe('gu/kn targets', () => {
  const GU = v('gu-voice', 'gu-IN', 'Default', 'Dhwani');
  const KN = v('kn-voice', 'kn-IN', 'Default', 'Soumya');

  it('resolves a Gujarati or Kannada voice when the device has one', () => {
    expect(resolveVoice('gu', [HI_DEFAULT, GU])?.identifier).toBe('gu-voice');
    expect(resolveVoice('kn', [HI_DEFAULT, KN])?.identifier).toBe('kn-voice');
  });

  it('returns null rather than falling back to Hindi', () => {
    // The whole point: no voice for the reading language means "unavailable", which the
    // UI surfaces. Returning a Hindi voice here would read Gujarati text as Hindi.
    expect(resolveVoice('gu', [HI_DEFAULT, HI_ENHANCED])).toBeNull();
    expect(resolveVoice('kn', [HI_DEFAULT, EN_IN])).toBeNull();
  });

  it('builds Android options without the region tag for gu/kn too', () => {
    expect(speakOptionsFor('gu', null, 1, 'android').language).toBe('gu');
    expect(speakOptionsFor('kn', null, 1, 'android').language).toBe('kn');
    expect('language' in speakOptionsFor('gu', GU, 1, 'android')).toBe(false);
  });

  it('builds iOS options with the BCP-47 tag for gu/kn', () => {
    expect(speakOptionsFor('gu', GU, 1, 'ios').language).toBe('gu-IN');
    expect(speakOptionsFor('kn', KN, 1, 'ios').language).toBe('kn-IN');
  });

  it('keeps a saved voice per language, so switching language switches voice', () => {
    const voices = [HI_DEFAULT, GU, KN];
    expect(resolveVoice('hi', voices, HI_DEFAULT.identifier)?.identifier).toBe(HI_DEFAULT.identifier);
    expect(resolveVoice('gu', voices, GU.identifier)?.identifier).toBe(GU.identifier);
    // A saved identifier belonging to another language must not leak across targets.
    expect(resolveVoice('kn', voices, GU.identifier)?.identifier).toBe(KN.identifier);
  });
});

describe('speakOptionsFor — rate', () => {
  it('passes the rate through on both platforms', () => {
    expect(speakOptionsFor('hi', HI_DEFAULT, 0.7, 'ios').rate).toBe(0.7);
    expect(speakOptionsFor('hi', HI_DEFAULT, 1.3, 'android').rate).toBe(1.3);
  });
});
