// sanskar.reel.mjs — storytelling script + capture beats for the "Good Habits" (संस्कार) reel.
//
// Feature: the `sanskar` content category ("Good Habits") — daily-life rituals & mantras:
//   Morning Slokas, Surya Namaskar, Tulsi Puja, Meal Prayer, Serving Cows & Birds,
//   Evening Lamp, Bedtime Slokas, Vidyarambha Prarthana.
//
// Story arc: Hook (a felt need) → Turn (enter Vedansh) → Reveal (the feature, live) →
//            Payoff (the benefit) → CTA. Authored in both hi + en (`--lang` picks one).
//
// `action` is a small vocabulary the flow generator understands:
//   { tap: '<regex>' }  { swipe: 'LEFT'|'RIGHT'|'UP'|'DOWN' }  { wait: true }
// An empty `action: []` is a "hold" beat (dwell on the current screen while the VO plays).
// `anchor` (optional) is an on-screen English label the flow waits for before the dwell.

/** @typedef {{ hi: string, en: string }} Localized */

export default {
  slug: 'sanskar',
  // App content reading-language to set before recording. English keeps the Maestro
  // accessibility tree matchable (see spec §3.6). A `--lang hi` render still narrates in
  // Hindi over these English-driven screens; the Devanagari shlokas render either way.
  readingLang: 'en',

  // ── Intro card (spoken over the branded intro) ──
  hook: {
    en: 'What if every moment of your day had its own little prayer?',
    hi: 'क्या हो, अगर दिन के हर पल की अपनी एक छोटी प्रार्थना हो?',
  },

  beats: [
    // 1 — Turn: open the "Good Habits" (Habits) category from Home.
    {
      action: [{ tap: 'Good Habits.*' }, { wait: true }],
      anchor: 'Morning Slokas',
      narration: {
        en: 'Vedansh brings the sanskaras of everyday life together in one place.',
        hi: 'वेदांश़ रोज़मर्रा के संस्कारों को एक ही जगह ले आता है।',
      },
      caption: { en: 'Everyday sanskaras, in one place', hi: 'रोज़ के संस्कार, एक ही जगह' },
      minHoldMs: 2800,
    },

    // 2 — Reveal breadth: hold on the list while the VO names the moments of the day.
    {
      action: [],
      narration: {
        en: 'A shloka for waking, for meals, for the evening lamp — and for sleep.',
        hi: 'उठने का, भोजन का, सन्ध्या दीप का — और सोने का, हर पल का श्लोक।',
      },
      caption: { en: 'Waking · meals · evening lamp · sleep', hi: 'उठना · भोजन · सन्ध्या दीप · शयन' },
      minHoldMs: 3200,
    },

    // 3 — Reveal the reader: open Morning Slokas.
    {
      action: [{ tap: 'Morning Slokas.*' }, { wait: true }],
      anchor: 'Morning',
      narration: {
        en: 'Open one, and the Sanskrit arrives with its meaning.',
        hi: 'कोई एक खोलिए — संस्कृत, अपने अर्थ के साथ।',
      },
      caption: { en: 'Sanskrit, with its meaning', hi: 'संस्कृत, अर्थ के साथ' },
      minHoldMs: 3000,
    },

    // 4 — Reveal paging: swipe to the next shloka.
    {
      action: [{ swipe: 'LEFT' }, { wait: true }],
      narration: {
        en: 'Simple words — ready to say, and to understand.',
        hi: 'सरल शब्द — कहने और समझने के लिए तैयार।',
      },
      caption: { en: 'Ready to say, and to understand', hi: 'कहने और समझने के लिए तैयार' },
      minHoldMs: 3000,
    },

    // 5 — Payoff: one more swipe, then the emotional close.
    {
      action: [{ swipe: 'LEFT' }, { wait: true }],
      narration: {
        en: 'Small rituals, every day — sanskaras for the whole family, fully offline.',
        hi: 'छोटे नित्य संस्कार — पूरे परिवार के लिए, बिना इंटरनेट के भी।',
      },
      caption: { en: 'For the whole family — fully offline', hi: 'पूरे परिवार के लिए — बिना नेट' },
      minHoldMs: 3400,
    },
  ],

  // ── CTA card (spoken over the closing brand card) ──
  cta: {
    en: 'Bring sanskaras home. Download Vedansh — free.',
    hi: 'संस्कार, घर लाइए। वेदांश़ डाउनलोड करें — नि:शुल्क।',
  },
};
