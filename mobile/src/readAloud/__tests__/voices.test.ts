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

describe('speechLangFor', () => {
  it('maps gu and kn to the Hindi voice, not their own', () => {
    // gu/kn verse text on screen is a runtime transliteration of Devanagari, so the
    // speech path deliberately reads the Devanagari source with a Hindi voice.
    expect(speechLangFor('gu')).toBe('hi');
    expect(speechLangFor('kn')).toBe('hi');
  });

  it('maps hi to hi and en to en', () => {
    expect(speechLangFor('hi')).toBe('hi');
    expect(speechLangFor('en')).toBe('en');
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

  it('prefers an exact locale match over a same-language one', () => {
    // en-IN is the exact target for 'en'; en-US only shares the primary subtag.
    expect(resolveVoice('en', [EN_US, EN_IN])?.identifier).toBe(EN_IN.identifier);
  });

  it('accepts a same-language voice when no exact locale match exists', () => {
    expect(resolveVoice('en', [EN_US])?.identifier).toBe(EN_US.identifier);
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
  it('lists every same-language voice, Enhanced first', () => {
    const list = voicesForTarget('hi', [HI_DEFAULT, EN_US, HI_ENHANCED]);
    expect(list.map((x) => x.identifier)).toEqual([HI_ENHANCED.identifier, HI_DEFAULT.identifier]);
  });

  it('excludes other languages', () => {
    expect(voicesForTarget('hi', [EN_US, EN_IN])).toEqual([]);
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

describe('speakOptionsFor — rate', () => {
  it('passes the rate through on both platforms', () => {
    expect(speakOptionsFor('hi', HI_DEFAULT, 0.7, 'ios').rate).toBe(0.7);
    expect(speakOptionsFor('hi', HI_DEFAULT, 1.3, 'android').rate).toBe(1.3);
  });
});
