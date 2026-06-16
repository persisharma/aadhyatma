export const fontFamilies = {
  devanagari: 'NotoSerifDevanagari_500Medium',
  devanagariBold: 'NotoSerifDevanagari_600SemiBold',
  latinItalic: 'CormorantGaramond_400Regular_Italic',
  latinSemiBold: 'CormorantGaramond_600SemiBold',
  latinBold: 'CormorantGaramond_700Bold',
  latinSemiBoldItalic: 'CormorantGaramond_600SemiBold_Italic',
  latin: 'CormorantGaramond_500Medium',
  // Sister-script serifs for the gu/kn reading languages — same Noto Serif family,
  // same weights as the Devanagari cuts so the reading scale carries over unchanged.
  gujarati: 'NotoSerifGujarati_500Medium',
  gujaratiBold: 'NotoSerifGujarati_600SemiBold',
  kannada: 'NotoSerifKannada_500Medium',
  kannadaBold: 'NotoSerifKannada_600SemiBold',
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
    // Hindi meaning matches the English meaning size (meaningEnglish) so the two
    // languages read at the same scale; Devanagari's larger x-height needs a touch
    // more leading.
    fontSize: 20,
    lineHeight: 34,
  },
  verseLatin: {
    fontFamily: fontFamilies.latinSemiBold,
    // English transliteration sits above the meaning (20) to mirror the Hindi
    // verse↔meaning hierarchy. Cormorant's small x-height reads smaller than
    // Devanagari, so it takes a few extra points to feel dominant.
    fontSize: 24,
    lineHeight: 35,
  },
  // gu/kn verse bodies share the Devanagari metrics — same x-height class, so the
  // verse↔meaning hierarchy carries over without per-script tuning.
  verseGujarati: {
    fontFamily: fontFamilies.gujarati,
    fontSize: 23,
    lineHeight: 39,
  },
  verseKannada: {
    fontFamily: fontFamilies.kannada,
    fontSize: 23,
    lineHeight: 39,
  },
  meaningEnglish: {
    fontFamily: fontFamilies.latin,
    fontSize: 20,
    lineHeight: 33,
  },
  meaningGujarati: {
    fontFamily: fontFamilies.gujarati,
    fontSize: 20,
    lineHeight: 34,
  },
  meaningKannada: {
    fontFamily: fontFamilies.kannada,
    fontSize: 20,
    lineHeight: 34,
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
