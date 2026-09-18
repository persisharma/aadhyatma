// ganesh-utsav.reel.mjs — "स्थापना से विसर्जन तक, सही तिथि" — the Ganesh Utsav arc reel (~10s).
// Story: 1½ days or ten — how long will your Ganpati stay? The app never recommends; you choose your
// household's tradition and Vedansh solves the visarjan date (Anant Chaturdashi for a ten-day utsav).
// Literal sthapana→visarjan on one screen (PRD-28 पर्व-अर्क). Hindi-first, tight ~2s narration/beat.
//
// Navigation (native, Hindi UI — verified live). Maestro text selectors are FULL-MATCH regexes, so
// partial matches carry a trailing .*; content rows expose Devanagari, nav/widgets expose stable
// English a11y / testIDs:
//   Home → पंचांग tab → Vrat & Parv → search "Ganesh" → गणेश चतुर्थी → detail (Festival arc)
//   → arc-duration-chooser (कितने दिन विराजेंगे?) → arc-duration-10 (10 दिन · अनन्त चतुर्दशी).

export default {
  slug: 'ganesh-utsav',
  readingLang: 'hi',

  hook: {
    hi: 'गणपति कितने दिन विराजेंगे — डेढ़, पाँच, या दस?',
    en: 'How many days will Ganpati stay?',
  },

  // Unrecorded: the FULL navigation (tabs + search) happens before the camera rolls, so the reel
  // opens directly on the गणेश चतुर्थी व्रत-विवरण page — no screen time wasted on searching.
  preroll: [
    { tapId: 'tab-panchang' }, { wait: true },
    { tap: 'Vrat.*Parv' }, { wait: true },
    { tapPoint: '50%,26%' }, { inputText: 'Ganesh' }, { wait: true },
    { hideKeyboard: true }, { wait: true },
    { tap: 'गणेश चतुर्थी' }, { wait: true },
  ],

  beats: [
    {
      // ONE motion-rich beat (scroll to the chooser → pick 10 days). A separate "look at the arc
      // strip" beat has near-zero motion and simctl starves it to a ~0.1s clip — this combined
      // shape is the one that has recorded reliably every time. The hook plays over the top of the
      // व्रत-विवरण page (arc strip in frame) before this beat's scroll begins.
      action: [{ scrollTo: 'कितने दिन.*' }, { wait: true }, { tapId: 'arc-duration-10' }, { wait: true }],
      anchor: 'Festival arc',
      narration: {
        hi: 'बस अपनी परम्परा चुनिए, और विसर्जन की तिथि आ जाएगी सामने —',
        en: 'A day and a half or all ten — just pick your tradition, and your visarjan date appears.',
      },
      caption: { hi: 'आपकी विसर्जन तिथि', en: 'your visarjan date' },
    },
  ],

  cta: {
    hi: 'स्थापना से विसर्जन तक — वेदांश के साथ।',
    en: 'Sthapana to visarjan — on Vedansh.',
  },
};
