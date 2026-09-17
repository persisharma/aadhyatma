// ganesh-sthapana.reel.mjs — "स्थापना की पूरी विधि, एक जगह" — the Ganesh Chaturthi Sthapana reel (~10s).
// Story: Ganesh Chaturthi is near, but who remembers the full sthapana vidhi? → Ask Vedansh and the
// whole festival opens — samagri (modak, durva…) and the complete step-by-step puja, sankalp to
// aarti. Hindi-first, tight ~2s narration/beat.
//
// Navigation (native, Hindi UI — verified live). Text selectors are FULL-MATCH regexes (partial →
// trailing .*); the festival is reached via the Vrat & Parv search box (the tappable upcoming
// carousel is capped + horizontal), whose result row exposes Devanagari "गणेश चतुर्थी":
//   Home → पंचांग tab → Vrat & Parv → search "Ganesh" → गणेश चतुर्थी → detail (Festival arc)
//   → पूजा विधि card (observance-vidhi-card) → Sthapana vidhi (तैयारी·सामग्री = modak/durva)
//   → vidhi-mode-steps (पूजा · 17 चरण).

export default {
  slug: 'ganesh-sthapana',
  readingLang: 'hi',

  hook: {
    hi: 'गणेश चतुर्थी आ रही है — और इस बार विधि की चिंता नहीं,',
    en: 'Who remembers the right Ganesh sthapana vidhi?',
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
      // ONE motion-rich beat: open the vidhi (samagri) and move into the step list — continuous
      // motion keeps simctl's recorder fed, and one beat keeps the reel inside the 12s cap.
      action: [
        { scrollTo: 'पूजा विधि.*' }, { tapId: 'observance-vidhi-card' }, { wait: true },
        { tapId: 'vidhi-mode-steps' }, { wait: true }, { swipe: 'UP' },
      ],
      narration: {
        hi: 'क्योंकि पूरी विधि — सामग्री से आरती तक — अब आपके हाथ में,',
        en: 'The full vidhi on Vedansh — samagri through aarti, every step.',
      },
      caption: { hi: 'सामग्री · संकल्प से आरती तक', en: 'samagri · sankalp to aarti' },
    },
  ],

  cta: {
    hi: 'स्थापना से विसर्जन तक — वेदांश के साथ।',
    en: 'Sthapana to visarjan — with Vedansh.',
  },
};
