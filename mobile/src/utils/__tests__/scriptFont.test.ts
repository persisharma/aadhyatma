import { captionFont, isDevanagari } from '../scriptFont';

describe('scriptFont', () => {
  test('detects Devanagari vs Latin', () => {
    expect(isDevanagari('मिथुन संक्रांति')).toBe(true);
    expect(isDevanagari('Mithuna Sankranti')).toBe(false);
    expect(isDevanagari('')).toBe(false);
  });

  test('Devanagari captions use the Noto Serif Devanagari face (not a Latin fallback)', () => {
    // The bug: Devanagari rendered in Cormorant (a Latin face) fell back thin/tiny.
    const f = captionFont('मेरा व्रत');
    expect(f.fontFamily).toBe('NotoSerifDevanagari_500Medium');
    expect(f.fontStyle).toBe('normal');
  });

  test('Latin captions stay Cormorant italic', () => {
    const f = captionFont('My Vrat');
    expect(f.fontFamily).toBe('CormorantGaramond_400Regular_Italic');
    expect(f.fontStyle).toBe('italic');
  });
});
