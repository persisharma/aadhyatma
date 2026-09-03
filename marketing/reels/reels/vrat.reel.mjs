// vrat.reel.mjs — "व्रत की तारीख़ अब न छूटे" — the Vrat & Parv (fasting companion) reel.
// Story: keeping a vrat is easy; remembering its date is not → Vedansh holds every vrat with its
// date, lets you mark your own, and reminds you in time. Hindi-first storytelling (spec §3.5).
//
// Full reminder flow shown (native, Hindi UI — content/tab a11y stays English so it's matchable):
//   Home → पंचांग tab → व्रत-पर्व hub → व्रत list (dates + ☆ stars) → mark a favourite (☆→★)
//   → open a vrat detail (date · कथा · महत्व) → ‹ ‹ back to hub → मेरा व्रत → अनुस्मारक sheet
//   (advance-notice · time · सहेजें). The "notify + save time" screen is the payoff.

export default {
  slug: 'vrat',
  readingLang: 'hi',

  // Even today we flip calendar pages for vrat dates — and still, in the day's rush the fast slips
  // by, or we remember only after we've eaten. Vedansh fixes that: choose your vrat, and the
  // reminder reaches you in time (callback: before you eat).
  hook: {
    hi: 'आज भी व्रत के लिए कैलेंडर के पन्ने पलटने पड़ते हैं…',
    en: 'Even today, we flip calendar pages hunting for vrat dates…',
  },

  beats: [
    // 1 — the pain (over the व्रत-पर्व hub): the rush makes us forget — or remember too late.
    {
      action: [
        { tapId: 'tab-panchang' }, { wait: true },
        { scrollTo: 'Vrat & Parv' }, { tap: 'Vrat & Parv' }, { wait: true },
      ],
      anchor: 'Katha library',
      narration: {
        hi: 'फिर भी भागदौड़ में तिथि छूट जाती है — या कुछ खाने के बाद याद आती है।',
        en: 'Yet in the rush the day slips by — or we remember only after we have eaten.',
      },
      caption: { hi: 'खाने के बाद याद आता है!', en: 'remembered… after eating!' },
    },

    // 2 — the turn (व्रत list with dates): Vedansh keeps every vrat, each with its date.
    {
      action: [{ scrollTo: 'Vrat,.*' }, { tap: 'Vrat,.*' }, { wait: true }],
      narration: {
        hi: 'अब नहीं — वेदांश़ में हर व्रत, अपनी तिथि के साथ।',
        en: 'Not anymore — Vedansh keeps every vrat, with its date.',
      },
      caption: { hi: 'हर व्रत, अपनी तिथि के साथ', en: 'every vrat, with its date' },
    },

    // 3 — mark a favourite (☆→★ fills on tap): choose your own vrat in one tap.
    {
      action: [{ tap: 'Follow.*' }, { wait: true }],
      narration: {
        hi: 'बस अपना व्रत चुनिए — एक टैप में।',
        en: 'Just pick your vrat — in one tap.',
      },
      caption: { hi: 'एक टैप — व्रत चुनें', en: 'one tap — pick your vrat' },
    },

    // 4 — the vrat detail: its tithi, katha and significance, all in one place.
    {
      action: [{ tapPoint: '50%,26%' }, { wait: true }],
      narration: {
        hi: 'तिथि, कथा और महत्व — सब एक जगह।',
        en: 'Its date, story and significance — all in one place.',
      },
      caption: { hi: 'तिथि · कथा · महत्व', en: 'date · story · significance' },
    },

    // 5 — मेरा व्रत (‹‹ back to hub → My Vrat): every vrat you follow, gathered in one place with
    // its date and its own reminder bell. (Kept a separate beat from the sheet so neither beat's
    // navigation dominates the capture — that skews the uniform time-scale and drifts captions.)
    {
      action: [
        { tapPoint: '8%,8%' }, { wait: true }, // ‹ detail → list
        { tapPoint: '8%,8%' }, { wait: true }, // ‹ list → hub
        { tapPoint: '50%,33%' }, { wait: true }, // मेरा व्रत card
      ],
      narration: {
        hi: 'आपके सारे व्रत, एक ही जगह — “मेरा व्रत” में।',
        en: 'All your vrats, in one place — under “My Vrat”.',
      },
      caption: { hi: 'सब एक जगह — मेरा व्रत', en: 'all in one place — My Vrat' },
    },

    // 6 — resolution (अनुस्मारक sheet): pick your reminder time & save. Callback to the hook's
    // pain — now Vedansh remembers for you, right on time. The sheet is a BOTTOM SHEET, so the hold
    // must stay inside it (holdSwipe), or the default top-band hold dismisses it.
    {
      action: [{ tap: 'Reminders for.*' }, { wait: true }], // notify bell → अनुस्मारक sheet
      holdSwipe: { start: '50%, 56%', end: '50%, 55%' }, // hold on the sheet's subtitle, dragging up
      narration: {
        hi: 'और याद दिलाने की ज़िम्मेदारी वेदांश़ की — ठीक समय पर।',
        en: 'And the reminding is Vedansh’s job — right on time.',
      },
      caption: { hi: 'याद दिलाना, वेदांश़ की ज़िम्मेदारी', en: 'reminding? Vedansh’s job' },
    },
  ],

  cta: {
    hi: 'अब कोई व्रत न छूटे — वेदांश़ के साथ।',
    en: 'Never miss a vrat — with Vedansh.',
  },
};
