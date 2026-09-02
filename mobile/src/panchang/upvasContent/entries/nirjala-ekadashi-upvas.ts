import { upvasEntry } from '../_helpers';

/** निर्जला एकादशी — the family's strictest form, so it gets its own entry. */
export default upvasEntry({
  id: 'nirjala-ekadashi-upvas',
  fastType: 'nirjala',
  fastTypeNoteHi: 'जल भी वर्जित — कठोरतम एकादशी',
  fastTypeNoteEn: 'Even water is abstained — the strictest Ekadashi',
  window: {
    kind: 'sunrise-to-next-sunrise',
    textHi: 'एकादशी के सूर्योदय से द्वादशी के सूर्योदय तक — अन्न और जल दोनों का त्याग।',
    textEn: 'From sunrise on Ekadashi until sunrise on Dwadashi — both food and water are given up.',
  },
  parana: {
    kind: 'next-day-sunrise-tithi-bound',
    boundTithi: 12,
    textHi:
      'द्वादशी के दिन सूर्योदय के बाद, द्वादशी तिथि रहते जल ग्रहण कर पारण करें; हरि वासर में पारण वर्जित माना जाता है। यदि द्वादशी सूर्योदय से पूर्व ही समाप्त हो जाए तो सूर्योदय के बाद पारण करें।',
    textEn:
      'Break the fast by taking water after sunrise on the Dwadashi day, while Dwadashi tithi prevails; parana during Hari Vasara is held to be prohibited. If Dwadashi ends before sunrise, break the fast after sunrise.',
  },
  strictnessHi:
    'यह वर्ष की सबसे कठोर एकादशी मानी जाती है; इस एक व्रत का फल वर्ष की सभी एकादशियों के तुल्य कहा गया है। परंपरा अनुसार अस्वस्थ, वृद्ध एवं गर्भवती फलाहार या सजल व्रत रख सकते हैं।',
  strictnessEn:
    'This is held to be the year’s most austere Ekadashi; observing this one fast is said to carry the merit of all the year’s Ekadashis. Traditionally the unwell, the elderly, and expectant mothers may observe with fruit fare or with water.',
  whoObservesHi: 'विष्णु उपासक; विशेषतः वे जो वर्ष भर की एकादशियाँ नहीं रख पाते।',
  whoObservesEn: 'Vishnu devotees; especially those unable to keep every Ekadashi of the year.',
  status: 'verified',
  source: {
    referenceUrls: [
      'https://www.drikpanchang.com/ekadashis/nirjala/nirjala-ekadashi-date-time.html',
      'https://www.iskconbangalore.org/blog/pandava-nirjala-ekadashi/',
      'https://www.iskconbangalore.org/blog/ekadashi/',
    ],
    verificationNote:
      'Verified 2026-08-19 against DrikPanchang and two ISKCON Bangalore publications: complete food-and-water abstention, Dwadashi parana, and the tradition that this observance carries the merit of the year\'s Ekadashis. The general Ekadashi guide supplies the age/health-based leniency row.',
  },
});
