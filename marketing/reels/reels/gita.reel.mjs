// gita.reel.mjs — "जब मन अशांत हो, गीता खोलिए" — the Bhagavad Gita reader (flagship).
// Story: when the mind is troubled and the way unclear, the Gita has an answer → Vedansh holds the
// whole Gita, in your language, every shloka with a simple meaning, a swipe away. (spec §3.5)
//
// Navigation (native, Hindi UI — content a11y stays English so it's matchable):
//   Home → Sacred Books → Bhagavad Gita → Chapter 1 (reader, śloka 1.1) → swipe to the next verse.

export default {
  slug: 'gita',
  readingLang: 'hi',

  hook: {
    hi: 'जब मन घबराए और राह न सूझे — गीता के पास हर उत्तर है।',
    en: 'When the mind is troubled and the way unclear — the Gita has every answer.',
  },

  beats: [
    // 1 — the turn (Sacred Books): the great texts, gathered together.
    {
      action: [{ tap: 'Sacred Books.*' }, { wait: true }],
      anchor: 'Bhagavad',
      narration: {
        hi: 'ग्रन्थ — गीता, सुंदरकांड, रामायण — सब एक ही जगह।',
        en: 'The scriptures — Gita, Sundarkand, Ramayan — all in one place.',
      },
      caption: { hi: 'ग्रन्थ, सब एक जगह', en: 'the scriptures, one place' },
    },

    // 2 — open the Gita: all eighteen chapters. (Book content localizes — the chapter reads
    // "Chapter 1" in English but "अध्याय 1" in Hindi — so match either.)
    {
      action: [{ tap: 'Bhagavad.*' }, { wait: true }],
      narration: {
        hi: 'पूरी श्रीमद्भगवद्गीता — अठारह अध्याय, आपकी भाषा में।',
        en: 'The whole Bhagavad Gita — eighteen chapters, in your language.',
      },
      caption: { hi: '१८ अध्याय, पूरी गीता', en: '18 chapters, whole Gita' },
    },

    // 3 — the reveal (reader, śloka 1.1): each verse in Sanskrit, with a simple meaning.
    {
      action: [{ tap: '(Chapter|अध्याय) 1.*' }, { wait: true }],
      narration: {
        hi: 'हर श्लोक — संस्कृत में, और सरल अर्थ के साथ।',
        en: 'Every verse — in Sanskrit, and with a simple meaning.',
      },
      caption: { hi: 'श्लोक · सरल अर्थ', en: 'verse · simple meaning' },
    },

    // 4 — the payoff (swipe to the next verse): the whole Gita, a touch away.
    {
      action: [{ swipe: 'LEFT' }, { wait: true }],
      narration: {
        hi: 'एक स्पर्श में अगला श्लोक — पूरी गीता, हमेशा आपके साथ।',
        en: 'The next verse in one swipe — the whole Gita, always with you.',
      },
      caption: { hi: 'अगला श्लोक, एक स्पर्श में', en: 'next verse, one swipe' },
    },
  ],

  cta: {
    hi: 'जब भी मन अशांत हो — गीता खोलिए, वेदांश़ के साथ।',
    en: 'Whenever the mind is unsettled — open the Gita, with Vedansh.',
  },
};
