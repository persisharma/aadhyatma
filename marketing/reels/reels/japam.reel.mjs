// japam.reel.mjs — "मन जाप में, गिनती वेदांश़ पर" — the Japam counter reel.
// Story: we do our japa, but lose count midway → Vedansh keeps every mantra ready and counts each
// touch for you, up to the 108-bead mala and rounds. (spec §3.5)
//
// Navigation (native, Hindi UI — content a11y stays English so it's matchable):
//   Home → Japa & Mantras → Om Namah Shivaya (counter) → tap the beads to count.

export default {
  slug: 'japam',
  readingLang: 'hi',

  hook: {
    hi: 'जाप तो हम रोज़ करते हैं — पर बीच में गिनती भूल जाती है।',
    en: 'We do our japa daily — but lose the count midway.',
  },

  beats: [
    // 1 — the turn (Japa & Mantras): every mantra, ready for japa.
    {
      action: [{ scrollTo: 'Japa & Mantras.*' }, { tap: 'Japa & Mantras.*' }, { wait: true }],
      anchor: 'Om Namah Shivaya',
      narration: {
        hi: 'वेदांश़ में हर मंत्र — जाप के लिए तैयार।',
        en: 'In Vedansh every mantra — ready for japa.',
      },
      caption: { hi: 'हर मंत्र, जाप के लिए', en: 'every mantra, for japa' },
    },

    // 2 — the reveal (counter): open the mantra; just touch to count.
    {
      action: [{ tap: 'Om Namah Shivaya.*' }, { wait: true }],
      narration: {
        hi: 'बस स्पर्श कीजिए — हर जाप अपने-आप गिना जाए।',
        en: 'Just touch — each japa counts itself.',
      },
      caption: { hi: 'स्पर्श कीजिए, गिनती अपने-आप', en: 'touch — it counts itself' },
    },

    // 3 — the payoff (tap the beads): the 108-bead mala, without counting on fingers.
    {
      action: [{ tapPoint: '50%,48%' }, { tapPoint: '50%,48%' }, { tapPoint: '50%,48%' }, { tapPoint: '50%,48%' }, { wait: true }],
      narration: {
        hi: 'एक-सौ-आठ की माला — बिना उंगली पर गिने।',
        en: 'A mala of one hundred and eight — without counting on your fingers.',
      },
      caption: { hi: '१०८ की माला, बिना गिने', en: '108-bead mala, no counting' },
    },
  ],

  cta: {
    hi: 'मन जाप में, गिनती वेदांश़ पर — वेदांश़ के साथ।',
    en: 'Mind on the japa, count on Vedansh — with Vedansh.',
  },
};
