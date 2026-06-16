import { orderTitlesByLanguage, type TitleSizeScale } from '../titleByLanguage';
import { fontFamilies } from '@/theme/typography';

// Distinct sizes per slot so we can assert the right scale lands on the right role.
const SIZES: TitleSizeScale = {
  devPrimary: 22,
  devSecondary: 15,
  latPrimary: 20,
  latSecondary: 13,
};

const NAME_HI = 'हनुमान चालीसा';
const NAME_EN = 'Hanuman Chalisa';

describe('orderTitlesByLanguage', () => {
  test("hi: Devanagari is primary (prominent), Latin is the supporting line", () => {
    const { primary, secondary } = orderTitlesByLanguage('hi', NAME_HI, NAME_EN, SIZES);

    expect(primary).toEqual({
      text: NAME_HI,
      script: 'devanagari',
      fontFamily: fontFamilies.devanagariBold,
      fontStyle: 'normal',
      fontSize: SIZES.devPrimary,
    });
    expect(secondary).toEqual({
      text: NAME_EN,
      script: 'latin',
      fontFamily: fontFamilies.latinItalic,
      fontStyle: 'italic',
      fontSize: SIZES.latSecondary,
    });
  });

  test('en: Latin is primary (prominent), Devanagari is the supporting line', () => {
    const { primary, secondary } = orderTitlesByLanguage('en', NAME_HI, NAME_EN, SIZES);

    expect(primary).toEqual({
      text: NAME_EN,
      script: 'latin',
      fontFamily: fontFamilies.latinBold,
      fontStyle: 'normal',
      fontSize: SIZES.latPrimary,
      letterSpacing: 0.3,
    });
    expect(secondary).toEqual({
      text: NAME_HI,
      script: 'devanagari',
      fontFamily: fontFamilies.devanagari,
      fontStyle: 'normal',
      fontSize: SIZES.devSecondary,
    });
  });

  test('weight/style follow role, not script — the primary slot is always the heavier face', () => {
    const hi = orderTitlesByLanguage('hi', NAME_HI, NAME_EN, SIZES);
    const en = orderTitlesByLanguage('en', NAME_HI, NAME_EN, SIZES);

    // Devanagari heavier when primary (hi), lighter when demoted (en).
    expect(hi.primary.fontFamily).toBe(fontFamilies.devanagariBold);
    expect(en.secondary.fontFamily).toBe(fontFamilies.devanagari);

    // Latin upright+bold when primary (en), italic+regular when demoted (hi).
    expect(en.primary.fontFamily).toBe(fontFamilies.latinBold);
    expect(en.primary.fontStyle).toBe('normal');
    expect(hi.secondary.fontFamily).toBe(fontFamilies.latinItalic);
    expect(hi.secondary.fontStyle).toBe('italic');
  });

  test('the Latin primary carries tracking; demoted lines carry none', () => {
    const en = orderTitlesByLanguage('en', NAME_HI, NAME_EN, SIZES);
    const hi = orderTitlesByLanguage('hi', NAME_HI, NAME_EN, SIZES);

    expect(en.primary.letterSpacing).toBe(0.3);
    expect(en.secondary.letterSpacing).toBeUndefined();
    expect(hi.secondary.letterSpacing).toBeUndefined();
  });

  test('the primary slot always carries the larger point size for its script', () => {
    const hi = orderTitlesByLanguage('hi', NAME_HI, NAME_EN, SIZES);
    const en = orderTitlesByLanguage('en', NAME_HI, NAME_EN, SIZES);

    expect(hi.primary.fontSize).toBeGreaterThan(en.secondary.fontSize); // dev primary > dev secondary
    expect(en.primary.fontSize).toBeGreaterThan(hi.secondary.fontSize); // lat primary > lat secondary
  });

  test('text content is preserved verbatim in both orderings', () => {
    const hi = orderTitlesByLanguage('hi', NAME_HI, NAME_EN, SIZES);
    const en = orderTitlesByLanguage('en', NAME_HI, NAME_EN, SIZES);

    expect([hi.primary.text, hi.secondary.text].sort()).toEqual([NAME_EN, NAME_HI].sort());
    expect([en.primary.text, en.secondary.text].sort()).toEqual([NAME_EN, NAME_HI].sort());
  });

  test('gu: re-scripted Devanagari name is primary in the Gujarati serif, English supports', () => {
    const { primary, secondary } = orderTitlesByLanguage('gu', NAME_HI, NAME_EN, SIZES);

    expect(primary).toEqual({
      text: 'હનુમાન ચાલીસા',
      script: 'gujarati',
      fontFamily: fontFamilies.gujaratiBold,
      fontStyle: 'normal',
      fontSize: SIZES.devPrimary, // Devanagari size class — same x-height family
    });
    expect(secondary).toEqual({
      text: NAME_EN,
      script: 'latin',
      fontFamily: fontFamilies.latinItalic,
      fontStyle: 'italic',
      fontSize: SIZES.latSecondary,
    });
  });

  test('kn: re-scripted Devanagari name is primary in the Kannada serif, English supports', () => {
    const { primary, secondary } = orderTitlesByLanguage('kn', NAME_HI, NAME_EN, SIZES);

    expect(primary).toEqual({
      text: 'ಹನುಮಾನ ಚಾಲೀಸಾ',
      script: 'kannada',
      fontFamily: fontFamilies.kannadaBold,
      fontStyle: 'normal',
      fontSize: SIZES.devPrimary,
    });
    expect(secondary.text).toBe(NAME_EN);
    expect(secondary.fontStyle).toBe('italic');
  });
});
