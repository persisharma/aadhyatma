// sanskar.reel.mjs — "संस्कार, अगली पीढ़ी तक" — the Good Habits (संस्कार) reel.
// Story: we want to pass sanskaras to our children, but we half-remember the shlokas ourselves →
// Vedansh gathers the daily little rituals (Morning Slokas, Surya Namaskar, Meal Prayer…) with
// simple meaning, easy to say and to teach. Hindi-first storytelling (spec §3.5).
//
// Navigation (native, Hindi UI — content a11y stays English so it's matchable):
//   Home → Good Habits (संस्कार) → Morning Slokas reader → swipe to the next shloka.

export default {
  slug: 'sanskar',
  readingLang: 'hi',

  hook: {
    hi: 'बच्चों को संस्कार तो सिखाना है — पर आधे श्लोक हमें ख़ुद याद नहीं।',
    en: 'We want to pass on sanskaras — but we half-remember the shlokas ourselves.',
  },

  beats: [
    // 1 — the turn (Good Habits list): the day's little rituals, gathered in one place.
    {
      action: [{ scrollTo: 'Good Habits.*' }, { tap: 'Good Habits.*' }, { wait: true }],
      anchor: 'Morning Slokas',
      narration: {
        hi: 'वेदांश़ रोज़ के छोटे-छोटे संस्कार — एक ही जगह ले आता है।',
        en: 'Vedansh gathers the day’s little sanskaras — in one place.',
      },
      caption: { hi: 'रोज़ के संस्कार, एक जगह', en: 'daily sanskaras, one place' },
    },

    // 2 — the reveal (Morning Slokas reader): the Sanskrit shloka, with a simple meaning.
    {
      action: [{ tap: 'Morning Slokas.*' }, { wait: true }],
      narration: {
        hi: 'सुबह की प्रभाती — संस्कृत श्लोक, सरल अर्थ के साथ।',
        en: 'The morning prayer — the Sanskrit shloka, with a simple meaning.',
      },
      caption: { hi: 'श्लोक · सरल अर्थ', en: 'shloka · simple meaning' },
    },

    // 3 — the payoff (swipe to the next shloka): simple enough to say — and to teach.
    {
      action: [{ swipe: 'LEFT' }, { wait: true }],
      narration: {
        hi: 'इतने सरल, कि आप कहिए — और अपने बच्चों को भी सिखाइए।',
        en: 'Simple enough to say — and to teach your children.',
      },
      caption: { hi: 'कहिए, बच्चों को सिखाइए', en: 'say it, teach them' },
    },
  ],

  cta: {
    hi: 'संस्कार, अगली पीढ़ी तक — वेदांश़ के साथ।',
    en: 'Sanskaras, to the next generation — with Vedansh.',
  },
};
