export const fontFamilies = {
  devanagari: 'NotoSerifDevanagari_500Medium',
  devanagariBold: 'NotoSerifDevanagari_600SemiBold',
  latinItalic: 'CormorantGaramond_400Regular_Italic',
  latinSemiBold: 'CormorantGaramond_600SemiBold',
  latinBold: 'CormorantGaramond_700Bold',
  latinSemiBoldItalic: 'CormorantGaramond_600SemiBold_Italic',
  latin: 'CormorantGaramond_500Medium',
  // English reading text: romanized verse lines and English meaning/commentary.
  // Tiro Devanagari Sanskrit (Tiro Typeworks) is drawn for romanized Sanskrit and
  // carries every IAST letter; it ships one weight, so hierarchy comes from size.
  sanskritLatin: 'TiroDevanagariSanskrit_400Regular',
  // Sister-script serifs for the gu/kn reading languages — same Noto Serif family,
  // same weights as the Devanagari cuts so the reading scale carries over unchanged.
  gujarati: 'NotoSerifGujarati_500Medium',
  gujaratiBold: 'NotoSerifGujarati_600SemiBold',
  kannada: 'NotoSerifKannada_500Medium',
  kannadaBold: 'NotoSerifKannada_600SemiBold',
  // Inter carries the tiny UI chrome (section labels, verse pills, card meta,
  // and tab labels in en — localized tab labels take their script's serif face,
  // design.md §17) per design.md §3 — never used for reading content.
  inter: 'Inter_500Medium',
  interSemiBold: 'Inter_600SemiBold',
} as const;

export const typography = {
  catalogTitle: { fontSize: 18, lineHeight: 28 },
  catalogMeta: { fontSize: 12, lineHeight: 20 },
  catalogBody: { fontSize: 13, lineHeight: 21 },
  practiceHeroTitle: { fontSize: 24, lineHeight: 36 },
  practiceItemTitle: { fontSize: 17, lineHeight: 26 },
  practiceItemMeta: { fontSize: 13, lineHeight: 20 },
  screenTitle: {
    // Devanagari-only token — no letterSpacing: tracking splits the shirorekha.
    fontFamily: fontFamilies.devanagariBold,
    fontSize: 34,
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
    // Devanagari's larger x-height needs a touch more leading. English meaning
    // (meaningEnglish) is sized by x-height, not points, so it reads at this scale.
    fontSize: 20,
    lineHeight: 34,
  },
  verseLatin: {
    fontFamily: fontFamilies.sanskritLatin,
    // Sized to the x-height of the Cormorant SemiBold 24 it replaced, so the
    // apparent size is unchanged; sits above the meaning (17) to mirror the Hindi
    // verse↔meaning hierarchy.
    fontSize: 20,
    lineHeight: 29,
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
    // x-height match for the Cormorant Medium 20 it replaced.
    fontFamily: fontFamilies.sanskritLatin,
    fontSize: 17,
    lineHeight: 28,
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
    fontFamily: fontFamilies.interSemiBold,
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 2.4,
    textTransform: 'uppercase' as const,
  },
  versePill: {
    fontFamily: fontFamilies.interSemiBold,
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
    fontFamily: fontFamilies.inter,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  // Shared content-listing card (`ListingCard`, design.md §82). Sizes only: the
  // face follows the script. Latin (Cormorant) title runs a step smaller and its
  // body a step larger than the Indic sizes, matching their apparent size.
  listingEyebrow: {
    fontSize: 13,
    lineHeight: 20,
  },
  listingTitle: {
    fontSize: 17,
    lineHeight: 25,
  },
  listingTitleLatin: {
    fontSize: 16,
    lineHeight: 22,
  },
  listingBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  listingBodyLatin: {
    fontSize: 13,
    lineHeight: 18,
  },
  listingSection: {
    fontSize: 18,
    lineHeight: 26,
  },
  listingScope: {
    fontSize: 14,
    lineHeight: 22,
  },
  thumb: {
    fontFamily: fontFamilies.devanagariBold,
    fontSize: 22,
  },
  footerMantra: {
    // Devanagari-only token — no letterSpacing: tracking splits the shirorekha.
    fontFamily: fontFamilies.devanagari,
    fontSize: 18,
  },
} as const;

export type TypographyScale = typeof typography;
