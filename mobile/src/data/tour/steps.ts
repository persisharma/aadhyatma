/**
 * First-launch feature tour content.
 *
 * Bilingual by design — the user has not yet picked a reading language when the
 * tour runs (default is Hindi). Showing both languages doubles as language
 * discovery and matches the app's "Hindi-led, bilingual" philosophy
 * (design.md §1).
 */

export type TourStep = {
  id: string;
  /** Decorative Devanagari glyph for the step crest. */
  glyph: string;
  titleHi: string;
  titleEn: string;
  bodyHi: string;
  bodyEn: string;
};

export const tourSteps: readonly TourStep[] = [
  {
    id: 'home',
    glyph: 'ॐ',
    titleHi: 'मुख पृष्ठ',
    titleEn: 'Home',
    bodyHi:
      'चालीसा, ग्रंथ, स्तोत्रम्, आरती, जप — सभी श्रेणियों में पाठ उपलब्ध हैं। देवता के अनुसार भी पाठ खोज सकते हैं।',
    bodyEn:
      'Browse by category — Chalisa, Granth, Stotram, Aarti, Japam — or by deity. Tap any tile to open the list.',
  },
  {
    id: 'wishlist',
    glyph: '♥',
    titleHi: 'मेरी सूची',
    titleEn: 'Wishlist',
    bodyHi:
      'किसी भी श्लोक पर हृदय चिह्न दबाकर उसे सुरक्षित कर सकते हैं। "अन्य" टैब में सूची देखें — वहीं से पुनः पढ़ें।',
    bodyEn:
      'Tap the heart on any verse to save it. Open the More tab → Wishlist to find your saved verses and tap one to jump straight back.',
  },
  {
    id: 'reminders',
    glyph: '⏰',
    titleHi: 'दैनिक स्मरण',
    titleEn: 'Daily Reminder',
    bodyHi:
      'अपनी पसंद के समय पर एक श्लोक की सूचना पाएँ। "अन्य" → "Reminders" से समय बदलें या बंद करें।',
    bodyEn:
      'Get one verse a day at the time you choose. Open the More tab → Reminders to set the time or turn it off.',
  },
  {
    id: 'bhakti',
    glyph: '॥',
    titleHi: 'भक्ति',
    titleEn: 'Bhakti',
    bodyHi:
      'भक्ति टैब पर हर बार एक यादृच्छिक श्लोक खुलेगा। "नवीन" दबाकर दूसरा श्लोक देखें — दैनिक चिंतन के लिए सरल।',
    bodyEn:
      'The Bhakti tab opens one random verse each visit. Tap refresh for another — a quiet way to start the day.',
  },
  {
    id: 'japa',
    glyph: '१०८',
    titleHi: 'जप',
    titleEn: 'Japa & Mantras',
    bodyHi:
      'मुख पृष्ठ → जप से कोई मंत्र चुनें। प्रत्येक स्पर्श पर माला आगे बढ़ती है, १०८ मनकों पर एक आवृत्ति पूर्ण। आपकी प्रगति स्वतः सहेजी जाती है।',
    bodyEn:
      'Pick a mantra from Home → Japa & Mantras. Each tap moves the mala forward; 108 beads complete one round. Your progress is saved automatically.',
  },
  {
    id: 'share',
    glyph: '↗',
    titleHi: 'साझा करें',
    titleEn: 'Share',
    bodyHi:
      'किसी भी श्लोक के नीचे साझा बटन से सुंदर श्लोक कार्ड बनाकर WhatsApp या अन्य ऐप पर भेजें।',
    bodyEn:
      'Tap the share icon below any verse to generate a beautifully composed verse card and send it via WhatsApp or any app.',
  },
] as const;
