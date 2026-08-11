/**
 * Pins the read-aloud text-assembly contract: which of the seven verse shapes are
 * speakable, what gets spoken per reading language, and the chunking invariants that
 * keep Android's `speak()` from throwing.
 */

import { toReadableVerse } from '../verseAdapter';
import { buildVerseScript } from '../verseScript';
import { verseLinesByLang } from '@/utils/localize';
import { transliterateDevanagari } from '@/utils/transliterate';

const OPTS = { readMeaning: true, readCommentary: false, maxChars: 1000 };

const chalisaVerse = {
  id: 'hc-1',
  labelHi: 'चौपाई १',
  labelEn: 'Chaupai 1',
  lines: ['जय हनुमान ज्ञान गुन सागर।', 'जय कपीस तिहुँ लोक उजागर॥'],
  linesEn: ['Jai Hanuman gyan gun sagar,', 'Jai Kapis tihun lok ujagar.'],
  meaningHi: 'हे हनुमान जी, आपकी जय हो।',
  meaningEn: 'Victory to you, Hanuman.',
};

const gitaVerse = {
  id: 'bg-1-1',
  chapter: 1,
  number: 1,
  sanskrit: ['धृतराष्ट्र उवाच।', 'धर्मक्षेत्रे कुरुक्षेत्रे॥'],
  transliteration: ['dhṛitarāśhtra uvācha', 'dharma-kṣhetre kuru-kṣhetre'],
  meaningHi: 'धृतराष्ट्र ने कहा।',
  meaningEn: 'Dhritarashtra said.',
  commentaryHi: ['यह प्रथम श्लोक है।'],
  commentaryEn: ['This is the first verse.'],
};

const shivaVerse = {
  id: 'ss-1-1',
  chapter: 1,
  number: 1,
  sanskrit: ['ॐ नमः शिवाय॥'],
  linesEn: ['Om Namah Shivaya'],
  meaningHi: 'शिव को नमन।',
  meaningEn: 'Salutations to Shiva.',
};

const sanskarVerse = {
  id: 'sk-1',
  number: 1,
  type: 'vidhi' as const,
  labelHi: 'विधि',
  labelEn: 'Vidhi',
  lines: ['ॐ गं गणपतये नमः।'],
  linesEn: ['Om Gam Ganapataye Namah'],
  meaningHi: 'गणपति को नमन।',
  meaningEn: 'Salutations to Ganapati.',
  vidhiHi: 'पूर्व दिशा की ओर मुख करके बैठें।',
  vidhiEn: 'Sit facing east.',
};

const kathaSection = {
  id: 'k-1',
  headingHi: 'कथा',
  headingEn: 'Katha',
  bodyHi: ['एक समय की बात है।', 'राजा वन में गया।'],
  bodyEn: ['Once upon a time.', 'The king went to the forest.'],
};

describe('toReadableVerse', () => {
  it('rejects chapter-transition sentinels before anything else', () => {
    expect(toReadableVerse({ __type: 'transition', chapter: 2 })).toBeNull();
    expect(toReadableVerse({ __type: 'prev-transition', chapter: 1 })).toBeNull();
    // A sentinel that also happens to carry verse-ish fields is still not a verse.
    expect(toReadableVerse({ __type: 'transition', lines: ['x'], linesEn: ['x'] })).toBeNull();
  });

  it('rejects non-objects and shapes with no text fields', () => {
    expect(toReadableVerse(null)).toBeNull();
    expect(toReadableVerse(undefined)).toBeNull();
    expect(toReadableVerse('verse')).toBeNull();
    expect(toReadableVerse({ id: 'x', labelHi: 'क' })).toBeNull();
  });

  it('maps `lines`/`linesEn` shapes (chalisa, aarti, sundarkand, bajrang baan)', () => {
    const r = toReadableVerse(chalisaVerse);
    expect(r).not.toBeNull();
    expect(r).toMatchObject({ kind: 'verse', deva: chalisaVerse.lines, latin: chalisaVerse.linesEn });
  });

  it('maps `sanskrit`/`transliteration` (Gita) and `sanskrit`/`linesEn` (stotrams)', () => {
    expect(toReadableVerse(gitaVerse)).toMatchObject({
      deva: gitaVerse.sanskrit,
      latin: gitaVerse.transliteration,
    });
    expect(toReadableVerse(shivaVerse)).toMatchObject({
      deva: shivaVerse.sanskrit,
      latin: shivaVerse.linesEn,
    });
  });

  it('carries Gita commentary and Sanskar vidhi', () => {
    expect(toReadableVerse(gitaVerse)).toMatchObject({ commentaryHi: gitaVerse.commentaryHi });
    expect(toReadableVerse(sanskarVerse)).toMatchObject({ extraHi: sanskarVerse.vidhiHi });
  });

  it('maps vrat-katha prose sections to the prose branch', () => {
    expect(toReadableVerse(kathaSection)).toMatchObject({ kind: 'prose', bodyHi: kathaSection.bodyHi });
  });
});

describe('buildVerseScript', () => {
  it('emits one chunk per verse line, in order', () => {
    const chunks = buildVerseScript(toReadableVerse(chalisaVerse), 'hi', {
      ...OPTS,
      readMeaning: false,
    });
    expect(chunks).toHaveLength(2);
    expect(chunks.map((c) => c.part)).toEqual(['verse', 'verse']);
    expect(chunks[0].text).toContain('जय हनुमान');
    expect(chunks[1].text).toContain('जय कपीस');
  });

  it('returns [] for a sentinel and for a page with no lines', () => {
    expect(buildVerseScript(toReadableVerse({ __type: 'transition' }), 'hi', OPTS)).toEqual([]);
    // Stotram intro pages (number === 0) carry no verse lines and no meaning.
    const intro = { id: 'i', chapter: 1, number: 0, sanskrit: [], linesEn: [], meaningHi: '', meaningEn: '' };
    expect(buildVerseScript(toReadableVerse(intro), 'hi', OPTS)).toEqual([]);
  });

  it('speaks the meaning by default and gates commentary behind its flag', () => {
    const withMeaning = buildVerseScript(toReadableVerse(gitaVerse), 'hi', OPTS);
    expect(withMeaning.some((c) => c.part === 'meaning')).toBe(true);
    expect(withMeaning.some((c) => c.part === 'commentary')).toBe(false);

    const withCommentary = buildVerseScript(toReadableVerse(gitaVerse), 'hi', {
      ...OPTS,
      readCommentary: true,
    });
    expect(withCommentary.some((c) => c.part === 'commentary')).toBe(true);
    // Order is always verse → meaning → commentary.
    expect(withCommentary.map((c) => c.part)).toEqual([
      ...withCommentary.filter((c) => c.part === 'verse').map(() => 'verse'),
      'meaning',
      'commentary',
    ]);
  });

  it('speaks Sanskar vidhi with the meaning', () => {
    const chunks = buildVerseScript(toReadableVerse(sanskarVerse), 'hi', OPTS);
    expect(chunks.filter((c) => c.part === 'meaning')).toHaveLength(2);
    expect(chunks.some((c) => c.text.includes('पूर्व दिशा'))).toBe(true);
  });

  it('speaks katha prose as `verse` so it is never silenced by readMeaning: false', () => {
    const chunks = buildVerseScript(toReadableVerse(kathaSection), 'hi', {
      ...OPTS,
      readMeaning: false,
    });
    expect(chunks).toHaveLength(2);
    expect(chunks.every((c) => c.part === 'verse')).toBe(true);
  });

  it('speaks the romanization for en', () => {
    const chunks = buildVerseScript(toReadableVerse(gitaVerse), 'en', OPTS);
    const verse = chunks.filter((c) => c.part === 'verse');
    expect(verse[0].text).toContain('dhṛitarāśhtra');
    expect(chunks.find((c) => c.part === 'meaning')?.text).toBe('Dhritarashtra said.');
  });

  it('speaks exactly what gu/kn readers SEE — their own script, never Devanagari', () => {
    // Read-aloud substitutes no language: a Gujarati reader hears the Gujarati on
    // screen, and a device without a Gujarati voice reports unavailable instead.
    for (const lang of ['gu', 'kn'] as const) {
      const chunks = buildVerseScript(toReadableVerse(chalisaVerse), lang, OPTS);
      const verse = chunks.filter((c) => c.part === 'verse');

      const onScreen = verseLinesByLang(lang, chalisaVerse.lines, chalisaVerse.linesEn)[0];
      // Compare on the danda-stripped form, since prepareForSpeech normalizes those.
      expect(verse[0].text).toBe(onScreen.replace(/[।॥]/g, '.'));
      expect(verse[0].text).not.toContain('जय हनुमान');
    }
  });

  it('speaks an authored meaningGu/meaningKn when the section has one', () => {
    const withNative = { ...chalisaVerse, meaningGu: 'ગુજરાતી અર્થ', meaningKn: 'ಕನ್ನಡ ಅರ್ಥ' };
    expect(buildVerseScript(toReadableVerse(withNative), 'gu', OPTS).find((c) => c.part === 'meaning')?.text)
      .toBe('ગુજરાતી અર્થ');
    expect(buildVerseScript(toReadableVerse(withNative), 'kn', OPTS).find((c) => c.part === 'meaning')?.text)
      .toBe('ಕನ್ನಡ ಅರ್ಥ');
  });

  it('falls back to the re-scripted Hindi meaning when no native one is authored', () => {
    // Matches what the page renders (meaningByLang's documented policy) — the spoken
    // text tracks the visible text, whichever branch that policy takes.
    const chunks = buildVerseScript(toReadableVerse(chalisaVerse), 'gu', OPTS);
    const meaning = chunks.find((c) => c.part === 'meaning')?.text ?? '';
    expect(meaning).toMatch(/[\u0A80-\u0AFF]/); // Gujarati block
    expect(meaning).not.toMatch(/[\u0900-\u097F]/); // no Devanagari
  });

  it('normalizes dandas to a single sentence stop', () => {
    const chunks = buildVerseScript(toReadableVerse(chalisaVerse), 'hi', {
      ...OPTS,
      readMeaning: false,
    });
    expect(chunks[0].text).not.toMatch(/[।॥]/);
    expect(chunks[1].text).not.toMatch(/\.\s*\./);
  });

  it('never exceeds maxChars, and splits long prose only at boundaries', () => {
    const long = Array.from({ length: 60 }, (_, i) => `यह वाक्य संख्या ${i} है।`).join(' ');
    const chunks = buildVerseScript(
      toReadableVerse({ ...chalisaVerse, meaningHi: long, meaningEn: long }),
      'hi',
      { ...OPTS, maxChars: 80 }
    );
    const meaning = chunks.filter((c) => c.part === 'meaning');
    expect(meaning.length).toBeGreaterThan(1);
    for (const c of meaning) expect(c.text.length).toBeLessThanOrEqual(80);
    // Nothing was dropped: every sentence index still appears somewhere.
    const joined = meaning.map((c) => c.text).join(' ');
    for (let i = 0; i < 60; i += 1) expect(joined).toContain(`संख्या ${i} `.trim());
  });

  it('hard-truncates a pathological unbroken run rather than letting speak() throw', () => {
    const unbroken = 'क'.repeat(500);
    const chunks = buildVerseScript(
      toReadableVerse({ ...chalisaVerse, meaningHi: unbroken, meaningEn: unbroken }),
      'hi',
      { ...OPTS, maxChars: 100 }
    );
    const meaning = chunks.filter((c) => c.part === 'meaning');
    expect(meaning.length).toBe(5);
    for (const c of meaning) expect(c.text.length).toBeLessThanOrEqual(100);
  });

  it('produces unique chunk ids within a page', () => {
    const chunks = buildVerseScript(toReadableVerse(gitaVerse), 'hi', {
      ...OPTS,
      readCommentary: true,
    });
    expect(new Set(chunks.map((c) => c.id)).size).toBe(chunks.length);
  });

  it('keeps transliterate available for the on-screen comparison above', () => {
    // Guards the assumption that gu differs from hi at all for this corpus line.
    expect(transliterateDevanagari('जय हनुमान', 'gu')).not.toBe('जय हनुमान');
  });
});
