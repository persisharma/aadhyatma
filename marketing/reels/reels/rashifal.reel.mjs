// rashifal.reel.mjs — "आज का दिन, आपके लिए" — the Daily Rashifal reel.
// Story: how will today go for me? → Vedansh's Jyotish, on the same Panchang astronomy, gives a
// plain-language daily reflection for your Moon sign — what to favour, where to pause, what to
// reflect on. Framed as reflection, not prediction. (spec §3.5)
//
// Navigation (native, Hindi UI — content a11y stays English so it's matchable):
//   Home → Panchang tab → Jyotish → Daily Rashifal → choose Moon sign → today's guidance.

export default {
  slug: 'rashifal',
  readingLang: 'hi',

  hook: {
    hi: 'आज का दिन आपके लिए कैसा रहेगा?',
    en: 'How will today go for you?',
  },

  beats: [
    // 1 — the turn (Jyotish): the same Panchang astronomy, in plain language.
    {
      action: [{ tapId: 'tab-panchang' }, { wait: true }, { tap: 'Jyotish' }, { wait: true }],
      anchor: 'Open Daily Rashifal',
      narration: {
        hi: 'वेदांश़ का ज्योतिष — पंचांग की उसी गणना पर, सरल भाषा में।',
        en: 'Vedansh’s Jyotish — on the same Panchang astronomy, in plain language.',
      },
      caption: { hi: 'ज्योतिष, सरल भाषा में', en: 'Jyotish, in plain language' },
    },

    // 2 — the reveal (Daily Rashifal): just choose your Moon sign.
    {
      action: [{ tap: 'Open Daily Rashifal.*' }, { wait: true }],
      narration: {
        hi: 'बस अपनी राशि चुनिए।',
        en: 'Just choose your Moon sign.',
      },
      caption: { hi: 'अपनी राशि चुनिए', en: 'choose your Moon sign' },
    },

    // 3 — the payoff (guidance): today's Favour, Pause and Reflect — clear and calm.
    // Rashi tiles localize — a11y is "मेष, Mesha Moon sign" (hi) / "Mesha, Aries Moon sign" (en) —
    // so match "Mesha" anywhere in the label.
    {
      action: [{ tap: '.*Mesha.*' }, { wait: true }],
      narration: {
        hi: 'आज क्या शुभ, कहाँ ठहरें, किस पर मनन करें — सब स्पष्ट।',
        en: 'What to favour, where to pause, what to reflect on — all clear.',
      },
      caption: { hi: 'आज: करें · ठहरें · मनन', en: 'today: favour · pause · reflect' },
    },
  ],

  cta: {
    hi: 'हर सुबह, थोड़ा मार्गदर्शन — वेदांश़ के साथ।',
    en: 'A little guidance every morning — with Vedansh.',
  },
};
