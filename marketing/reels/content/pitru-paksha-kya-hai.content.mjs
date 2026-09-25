// pitru-paksha-kya-hai — Pitru Paksha 2026 begins tomorrow (26 Sep → 10 Oct). Post 25 Sep evening.
// Facts: data/pitru/lessons.ts (tithi-purnima, tithi-amavasya, verified) + engine fixtures.
export default {
  slug: 'pitru-paksha-kya-hai',
  bg: 'ganga',
  hook: { hi: 'पितृ पक्ष कल से —\nक्या है?', en: 'Pitru Paksha begins tomorrow. What is it?' },
  beats: [
    {
      text: { hi: 'भाद्रपद पूर्णिमा से\nआश्विन अमावस्या तक', en: 'From Bhadrapada Purnima to Ashwin Amavasya' },
      sub: { hi: '26 सितम्बर – 10 अक्टूबर', en: '26 Sep – 10 Oct' },
      narration: { hi: 'भाद्रपद पूर्णिमा से आश्विन अमावस्या तक — छब्बीस सितम्बर से दस अक्टूबर।', en: 'From Bhadrapada Purnima to Ashwin Amavasya — the twenty-sixth of September to the tenth of October.' },
    },
    {
      text: { hi: 'सोलह दिन —\nपितरों के नाम।', en: 'Sixteen days, in the name of the ancestors.' },
      narration: { hi: 'सोलह दिन, जब परिवार अपने दिवंगत पितरों को उनकी तिथि पर याद करता है।', en: 'Sixteen days when a family remembers its departed on their own tithi.' },
    },
    {
      text: { hi: 'जिसकी जो तिथि,\nउसका वही दिन।', en: 'Whose tithi it is, that is their day.' },
      narration: { hi: 'देहान्त की जो तिथि, इस पक्ष में उसका वही दिन।', en: 'The tithi of passing decides the day in this fortnight.' },
    },
    {
      text: { hi: 'तिथि न मालूम हो —\nतो सर्वपितृ अमावस्या।', en: 'Tithi unknown? Then Sarvapitri Amavasya.' },
      sub: { hi: '10 अक्टूबर', en: '10 Oct' },
      narration: { hi: 'और तिथि न मालूम हो, तो अन्तिम दिन — सर्वपितृ अमावस्या, दस अक्टूबर।', en: 'And if the tithi is unknown, the last day — Sarvapitri Amavasya, the tenth of October.' },
    },
  ],
  cta: { hi: 'जो पितरों को याद करते हैं, उन्हें भेजिए।', en: 'Send it to those who remember their ancestors.' },
  send: { hi: 'जो पितरों को याद करते हैं —\nउन्हें भेजिए', en: 'Send it to those who remember' },
};
