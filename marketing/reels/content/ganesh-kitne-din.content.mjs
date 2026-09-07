// ganesh-kitne-din — Ganesh Utsav 2026, day 2 (Tue 15 Sep). The one question every family asks at
// sthapana. Mirrors the app's पर्व-अर्क stance: it offers 1½/3/5/7/10 and recommends none.
export default {
  slug: 'ganesh-kitne-din',
  bg: 'ganesha',
  hook: { hi: 'गणपति कितने दिन?', en: 'How many days do the Ganpati stay?' },
  beats: [
    {
      text: { hi: 'डेढ़, तीन, पाँच,\nसात या दस दिन।', en: 'One and a half, three, five, seven or ten days.' },
      narration: { hi: 'डेढ़, तीन, पाँच, सात या दस दिन — पाँचों रीतियाँ चली आ रही हैं।', en: 'One and a half, three, five, seven or ten days — all five are long-standing practice.' },
    },
    {
      text: { hi: 'कोई एक नियम नहीं है।\nयह परिवार का निर्णय है।', en: 'There is no single rule. The family decides.' },
      narration: { hi: 'इनमें कोई एक सही नहीं है। यह हर परिवार का अपना निर्णय है।', en: 'None of them is the correct one. It is each family’s own decision.' },
    },
    {
      text: { hi: 'आपने जो दिन चुना,\nविसर्जन की तिथि वही है।', en: 'The day you choose is the visarjan date.' },
      narration: { hi: 'आप जो दिन चुनते हैं, विसर्जन की तिथि उसी से तय होती है।', en: 'The day you choose is what fixes the visarjan date.' },
    },
  ],
  cta: { hi: 'जिनके घर बप्पा विराजे हैं, उन्हें भेजिए।', en: 'Send it to a home where Bappa is seated.' },
  send: { hi: 'अपने परिवार को\nभेज दीजिए 🙏', en: 'Send it to your family' },
};
