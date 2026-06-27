import { pillTextStyle } from '../langType';

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
