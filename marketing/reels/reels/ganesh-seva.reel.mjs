// ganesh-seva.reel.mjs — "हर दिन की सेवा, आरती के साथ" — the daily-seva (Ganesh aarti) reel (~10s).
// Story: the murti is installed — now what each day until visarjan? → Vedansh keeps the daily aarti
// (Jai Ganesh Deva), each line with its meaning, a swipe away. Hindi-first, tight ~2s narration/beat.
//
// Navigation (native, Hindi UI — verified live). The Aarti tile and the library rows expose stable
// English a11y ("Aarti", "Jai Ganesh Deva. 7 verses…"); the reader refrain is Devanagari:
//   Home → Aarti tile → आरती सूची → "Jai Ganesh Deva" → reader (जय गणेश देवा) → swipe to next verse.

export default {
  slug: 'ganesh-seva',
  readingLang: 'hi',

  hook: {
    hi: 'मूर्ति स्थापना हो गई, और अब हर दिन की सेवा —',
    en: 'The murti is seated — now what each day?',
  },

  // Unrecorded: open the Aarti library AND reset Jai Ganesh Deva's reading progress before the
  // camera rolls. The Resume sheet only interposes when saved progress is past verse 0, so the
  // preroll opens the aarti once, taps "Start over" (clears progress to verse 0), and backs out —
  // the recorded tap then goes straight into the reader, sheet-free, on every run.
  preroll: [
    { scrollTo: 'Aarti.*' }, { tap: 'Aarti.*' }, { wait: true },
    { scrollTo: 'Jai Ganesh Deva.*' }, { tap: 'Jai Ganesh Deva.*' }, { wait: true },
    { tapOptional: 'Start over.*' }, { wait: true },
    { tapPoint: '8%,8%' }, { wait: true }, // ‹ back to the आरती list
  ],

  beats: [
    {
      // ONE motion-rich beat: open Jai Ganesh Deva and swipe a verse — single beat keeps the reel
      // inside the 12s cap while still showing the reader in motion.
      action: [
        { scrollTo: 'Jai Ganesh Deva.*' }, { tap: 'Jai Ganesh Deva.*' }, { wait: true },
        { swipe: 'LEFT' }, { wait: true },
      ],
      anchor: 'जय गणेश',
      narration: {
        hi: 'आरती अर्थ सहित, विधि और सामग्री — सब मिलेगा एक जगह,',
        en: 'The Jai Ganesh Deva aarti with meaning — and the vidhi and samagri too.',
      },
      caption: { hi: 'आरती · विधि · सामग्री', en: 'aarti · vidhi · samagri' },
    },
  ],

  cta: {
    hi: 'सेवा से विसर्जन तक — वेदांश के साथ।',
    en: 'Daily seva — with Vedansh.',
  },
};
