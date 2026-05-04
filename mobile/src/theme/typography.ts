export const fontFamilies = {
  devanagari: 'NotoSerifDevanagari_500Medium',
  devanagariBold: 'NotoSerifDevanagari_600SemiBold',
  latinItalic: 'CormorantGaramond_400Regular_Italic',
  latinSemiBold: 'CormorantGaramond_600SemiBold',
  latinSemiBoldItalic: 'CormorantGaramond_600SemiBold_Italic',
  latin: 'CormorantGaramond_500Medium',
} as const;

export const typography = {
  screenTitle: {
    fontFamily: fontFamilies.devanagariBold,
    fontSize: 34,
    letterSpacing: 0.3,
  },
  readerTitle: {
    fontFamily: fontFamilies.devanagariBold,
    fontSize: 16,
  },
  verse: {
    fontFamily: fontFamilies.devanagari,
    fontSize: 23,
    lineHeight: 39,
  },
  meaning: {
    fontFamily: fontFamilies.devanagari,
    fontSize: 15,
    lineHeight: 26,
  },
  meaningEnglish: {
    fontFamily: fontFamilies.latin,
    fontSize: 18,
    lineHeight: 30,
  },
  transliteration: {
    fontFamily: fontFamilies.latinSemiBold,
    fontSize: 17,
    lineHeight: 26,
  },
  cardHindi: {
    fontFamily: fontFamilies.devanagariBold,
    fontSize: 17,
  },
  cardLatin: {
    fontFamily: fontFamilies.latinItalic,
    fontSize: 13,
  },
  pageCounter: {
    fontFamily: fontFamilies.latinItalic,
    fontSize: 14,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 2.4,
    textTransform: 'uppercase' as const,
  },
  versePill: {
    fontSize: 10,
    fontWeight: '600' as const,
    letterSpacing: 3,
    textTransform: 'uppercase' as const,
  },
  meaningLabel: {
    fontFamily: fontFamilies.latinSemiBoldItalic,
    fontSize: 13,
    letterSpacing: 1.8,
    textTransform: 'uppercase' as const,
  },
  swipeHint: {
    fontFamily: fontFamilies.latinItalic,
    fontSize: 12,
  },
  subtitle: {
    fontFamily: fontFamilies.latinItalic,
    fontSize: 15,
    letterSpacing: 0.6,
  },
  cardMeta: {
    fontSize: 11,
    letterSpacing: 0.4,
  },
  thumb: {
    fontFamily: fontFamilies.devanagariBold,
    fontSize: 22,
  },
  footerMantra: {
    fontFamily: fontFamilies.devanagari,
    fontSize: 18,
    letterSpacing: 0.4,
  },
} as const;

export type TypographyScale = typeof typography;
