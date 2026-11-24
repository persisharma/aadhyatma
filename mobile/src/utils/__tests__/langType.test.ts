import { meaningToken, pillTextStyle, titleFontByLang, titleLeading, verseToken } from '../langType';
import { typography } from '@/theme/typography';

const PILL = { fontSize: 10, fontWeight: '600' as const, letterSpacing: 3 };

describe('pillTextStyle', () => {
  test('English keeps the Latin tracking + uppercase and the system face', () => {
    const s = pillTextStyle('en', PILL);
    expect(s.letterSpacing).toBe(3);
    expect(s.textTransform).toBe('uppercase');
    // No explicit fontFamily for en — the original tokens rendered in the system face.
    expect(s.fontFamily).toBeUndefined();
    expect(s.fontSize).toBe(10);
    expect(s.fontWeight).toBe('600');
  });

  test('Hindi uses the Devanagari serif and drops tracking/uppercase', () => {
    // The bug this fixes: letterSpacing split the shirorekha ("सु झा व") and a
    // missing face leaned on an inconsistent fallback.
    const s = pillTextStyle('hi', PILL);
    expect(s.fontFamily).toBe('NotoSerifDevanagari_600SemiBold');
    expect(s.letterSpacing).toBe(0);
    expect(s.textTransform).toBe('none');
  });

  test('Gujarati and Kannada use their own script serifs', () => {
    expect(pillTextStyle('gu', PILL).fontFamily).toBe('NotoSerifGujarati_600SemiBold');
    expect(pillTextStyle('kn', PILL).fontFamily).toBe('NotoSerifKannada_600SemiBold');
    expect(pillTextStyle('gu', PILL).letterSpacing).toBe(0);
    expect(pillTextStyle('kn', PILL).textTransform).toBe('none');
  });
});

describe('Marathi and Telugu typography', () => {
  test('Marathi reads in the Devanagari faces, Telugu in Noto Serif Telugu', () => {
    expect(pillTextStyle('mr', PILL).fontFamily).toBe('NotoSerifDevanagari_600SemiBold');
    expect(pillTextStyle('te', PILL).fontFamily).toBe('NotoSerifTelugu_600SemiBold');
    expect(pillTextStyle('te', PILL).letterSpacing).toBe(0);
    expect(titleFontByLang('mr')).toBe('NotoSerifDevanagari_600SemiBold');
    expect(titleFontByLang('te')).toBe('NotoSerifTelugu_600SemiBold');
  });

  test('reading tokens: mr shares the Devanagari tokens; te has its own at the same metrics', () => {
    expect(verseToken('mr', typography)).toBe(typography.verse);
    expect(meaningToken('mr', typography)).toBe(typography.meaning);
    expect(verseToken('te', typography).fontFamily).toBe('NotoSerifTelugu_500Medium');
    expect(verseToken('te', typography).fontSize).toBe(typography.verse.fontSize);
    expect(meaningToken('te', typography).lineHeight).toBe(typography.meaning.lineHeight);
  });
});

describe('titleLeading (UX-03)', () => {
  test.each([14.5, 21, 22, 24, 25])('%s pt titles clear the Kannada 1.65x minimum', (size) => {
    expect(titleLeading(size) / size).toBeGreaterThanOrEqual(1.65);
  });
  test('matches the listing-title token ratio', () => {
    expect(titleLeading(17)).toBe(29);
  });
});
