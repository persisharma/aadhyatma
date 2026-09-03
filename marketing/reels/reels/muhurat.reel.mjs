// muhurat.reel.mjs — "सही काम, सही दिन पर" — the Muhurat finder reel.
// Story: we plan something auspicious (a housewarming, a new vehicle, a naming) but which day is
// right? → tell Vedansh what you're doing and it ranks the most auspicious days in the next three
// months, each with its abhijit muhurat. (spec §3.5)
//
// Navigation (native, Hindi UI — the Home tile a11y stays English; finder content is localized, so
// occasion labels are matched in both scripts):
//   Home → Muhurat → "what are you doing?" → गृह प्रवेश (occasion) → ranked auspicious days.

export default {
  slug: 'muhurat',
  readingLang: 'hi',

  hook: {
    hi: 'कोई शुभ काम — गृह प्रवेश, नया वाहन, नामकरण — पर सही दिन कौन-सा?',
    en: 'Something auspicious — a housewarming, a new vehicle, a naming — but which day is right?',
  },

  beats: [
    // 1 — the turn (Muhurat finder): just tell it what you're planning.
    {
      action: [{ scrollTo: 'Muhurat.*' }, { tap: 'Muhurat.*' }, { wait: true }],
      narration: {
        hi: 'बस बताइए — आप क्या करने जा रहे हैं।',
        en: 'Just tell it — what are you about to do.',
      },
      caption: { hi: 'आप क्या करने जा रहे हैं?', en: 'what are you planning?' },
    },

    // 2 — pick the occasion (e.g. Griha Pravesh).
    {
      action: [{ tap: '(गृह प्रवेश|Griha Pravesh).*' }, { wait: true }],
      narration: {
        hi: 'जैसे — गृह प्रवेश।',
        en: 'Say — a housewarming.',
      },
      caption: { hi: 'जैसे: गृह प्रवेश', en: 'e.g. Griha Pravesh' },
    },

    // 3 — the payoff (ranked days): the most auspicious days ahead, each with its muhurat.
    {
      action: [{ tap: '(गृह प्रवेश|Griha Pravesh).*' }, { wait: true }],
      narration: {
        hi: 'वेदांश़ अगले तीन महीनों के सबसे शुभ दिन — मुहूर्त के साथ बता देगा।',
        en: 'Vedansh ranks the most auspicious days over the next three months — each with its muhurat.',
      },
      caption: { hi: 'सबसे शुभ दिन, मुहूर्त सहित', en: 'best days, with muhurat' },
    },
  ],

  cta: {
    hi: 'हर शुभ काम, सही मुहूर्त में — वेदांश़ के साथ।',
    en: 'Every good beginning, at the right muhurat — with Vedansh.',
  },
};
