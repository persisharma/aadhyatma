// pitru-paksha-kya — पितृ पक्ष 2026 campaign, reel #1 (rung 1 · शिक्षा). ≤17s.
// The season opener: what the fortnight is, and the frame we hold all campaign — स्मरण, not शोक.
// Dates are the app engine's own solve (pitruPakshaWindow(2026), mobile/src/panchang/pitruSmaran.ts):
// भाद्रपद पूर्णिमा Sat 26 Sep 2026 → सर्वपितृ अमावस्या Sat 10 Oct 2026.
// Plan: marketing/reels/plans/pitru-paksha-2026.md §2–§3.
export default {
  slug: 'pitru-paksha-kya',
  bg: 'vishnu',
  hook: { hi: 'पितृ पक्ष 26 सितम्बर से —\nहै क्या यह?', en: 'Pitru Paksha begins 26 September — what is it?' },
  beats: [
    {
      text: { hi: 'भाद्रपद पूर्णिमा से\nआश्विन अमावस्या तक —\nसोलह दिन।', en: 'Bhadrapada Purnima to Ashvina Amavasya — sixteen days.' },
      narration: { hi: 'भाद्रपद पूर्णिमा से आश्विन अमावस्या तक, सोलह दिन।', en: 'Bhadrapada Purnima to Ashvina Amavasya — sixteen days.' },
    },
    {
      text: { hi: 'शोक का पक्ष नहीं —\nस्मरण का पक्ष।', en: 'Not a fortnight of grief — of remembrance.' },
      narration: { hi: 'यह शोक का पक्ष नहीं, स्मरण का पक्ष है।', en: 'This is not a fortnight of grief. It is one of remembrance.' },
    },
  ],
  cta: { hi: 'जिनके घर यह पक्ष मनता है, उन्हें भेजिए।', en: 'Send it to the homes that keep it.' },
  send: { hi: 'जिनके घर यह पक्ष मनता है —\nउन्हें भेजिए', en: 'Send it to the homes that keep it' },
};
