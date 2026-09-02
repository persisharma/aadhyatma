/**
 * घर का मंदिर upkeep set (PRD-24 §4, RULEBOOK §22) — the daily-discipline
 * guidance the app has never covered: what belongs in a home shrine, murti
 * condition and count conventions, and the diyā/water discipline. The निषेध
 * half renders in the warning tone (the bhog panel's split); the register is
 * dignity and cleanliness, never fear (PRD-24 §2).
 *
 * ⚠ CONTENT: `source` blocks are review-only provenance — never rendered.
 * The ancestor-photographs row is DRAFT (invisible) pending a second-domain
 * verification; RULEBOOK §22.2 keeps drafts out of every accessor.
 */
import type { MandirGuidanceEntry } from './types';

export const MANDIR_GUIDANCE_ENTRIES: readonly MandirGuidanceEntry[] = [
  {
    id: 'mandir-belongs',
    titleHi: 'मंदिर में क्या हो',
    titleEn: 'What belongs in the mandir',
    rows: [
      {
        id: 'elevated',
        textHi: 'मंदिर भूमि पर नहीं — चौकी, ताक या आले पर ऊँचा रखा जाता है; बैठकर पूजा में मूर्तियाँ आँखों की ऊँचाई के आसपास रहें।',
        textEn:
          'The mandir is not on the floor — it stands raised on a chowki, shelf or alcove; seated, the murtis sit near eye level.',
      },
      {
        id: 'small-murtis',
        textHi: 'घर के मंदिर में मूर्तियाँ छोटी रखी जाती हैं — बड़ी प्रतिमाएँ देवालय की परंपरा हैं, घर की नहीं।',
        textEn: 'Home-shrine murtis are kept small by tradition — large images belong to temples, not homes.',
      },
      {
        id: 'gap-wall',
        textHi: 'मूर्तियाँ दीवार से सटाकर नहीं — थोड़ा अंतर रखा जाता है, और वे एक-दूसरे के सम्मुख नहीं रखी जातीं।',
        textEn:
          'Murtis do not touch the wall — a small gap is left, and they are not placed facing one another.',
      },
      {
        id: 'shrine-articles',
        textHi: 'मंदिर की सामग्री — दीपक, घंटी, जल-पात्र, आसन — मंदिर के लिए ही रहे; घर के अन्य काम में नहीं।',
        textEn:
          'The shrine’s articles — diya, bell, water vessel, asana — stay the shrine’s; they are not borrowed for household use.',
      },
    ],
    avoidRows: [
      {
        id: 'no-bedroom',
        textHi: 'शयनकक्ष में मंदिर टाला जाता है; फ्लैट में विकल्प न हो तो पर्दे या पट से ढकने की परंपरा है।',
        textEn:
          'A mandir in the bedroom is avoided; where a flat leaves no choice, tradition covers it with a curtain or shutter.',
      },
      {
        id: 'no-bathroom-wall',
        textHi: 'मंदिर शौचालय-स्नानघर से सटी दीवार पर या सीढ़ियों के नीचे नहीं रखा जाता।',
        textEn: 'The mandir is not placed against a bathroom wall, nor under a staircase.',
      },
    ],
    status: 'verified',
    source: {
      referenceUrls: [
        'https://www.vedicbirth.com/vastu/room/home-temple-vastu',
        'https://drrpsharma.com/blog/vastu-pooja-room.html',
      ],
      verificationNote:
        '2026-08-27: both independent published pages state the elevated platform, small home murtis, the wall gap, murtis not facing each other, the bedroom accommodation (curtain), and the bathroom-wall/staircase exclusions.',
    },
  },
  {
    id: 'murti-condition',
    titleHi: 'मूर्ति विधान',
    titleEn: 'Murti conventions',
    rows: [
      {
        id: 'broken-visarjan',
        textHi: 'खंडित या चटकी मूर्ति मंदिर में नहीं रखी जाती — उसे कृतज्ञता के साथ जल में विसर्जित किया जाता है, अलमारी में नहीं रखा जाता और कूड़े में कभी नहीं।',
        textEn:
          'A broken or chipped murti is not kept in the mandir — it is immersed in water with gratitude (visarjan), not stored in a cupboard and never discarded as waste.',
      },
      {
        id: 'shivling-north',
        textHi: 'घर के शिवलिंग की जलधारी (नाली) उत्तर की ओर रहती है।',
        textEn: 'A home Shivalinga’s jaladhari (drain) points north.',
      },
    ],
    noteHi:
      'एक ही देवता की कितनी प्रतिमाएँ हों — इस पर परिवारों और परंपराओं की मान्यताएँ अलग-अलग हैं; अपने कुल की परंपरा ही प्रमाण है।',
    noteEn:
      'On how many images of one deity a home keeps, families and traditions differ — your family’s own tradition is the authority.',
    status: 'verified',
    source: {
      referenceUrls: [
        'https://www.vedicbirth.com/vastu/room/home-temple-vastu',
        'https://www.vedicbirth.com/vastu/room/pooja-room',
        'https://drrpsharma.com/blog/vastu-pooja-room.html',
      ],
      verificationNote:
        '2026-08-27: two independent domains state the visarjan convention for broken murtis; the Shivalinga nali-north rule is stated on the home-temple page. The murti-count question is genuinely split across published sources, so this row states the variance instead of a rule.',
      variantNote:
        'Murti-count conventions (e.g. two Ganesha images, Nataraja at home) vary by sampradaya; no universal rule is stated by aggregation (RULEBOOK §22.4).',
    },
  },
  {
    id: 'ancestor-photos',
    titleHi: 'पूर्वजों के चित्र',
    titleEn: 'Ancestor photographs',
    rows: [
      {
        id: 'not-in-mandir',
        textHi: 'दिवंगत परिजनों के चित्र देव-मंदिर के भीतर नहीं रखे जाते — पितृ और देवता की उपासना के स्थान परंपरा में अलग हैं।',
        textEn:
          'Photographs of departed family members are not kept inside the deity mandir — the places of pitru and devata worship are distinct in tradition.',
      },
      {
        id: 'south-wall',
        textHi: 'उनका स्थान घर की दक्षिण दीवार पर बताया जाता है — दक्षिण पितरों की दिशा मानी गई है।',
        textEn:
          'Their stated place is a south wall of the home — the south is held to be the direction of the pitrus.',
      },
    ],
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote:
        '2026-08-27: widely-held convention, but no second published domain could be verified this round (search egress limited) — DRAFT until the §22.3 two-domain threshold is met.',
    },
  },
  {
    id: 'daily-discipline',
    titleHi: 'दीप-जल विधान',
    titleEn: 'Diya & water discipline',
    rows: [
      {
        id: 'fresh-water',
        textHi: 'जल-पात्र का जल नित्य बदला जाता है; बासी जल तुलसी या किसी पौधे में अर्पित होता है।',
        textEn: 'The water vessel is refreshed daily; yesterday’s water goes to the tulsi or another plant.',
      },
      {
        id: 'nirmalya',
        textHi: 'बीते दिन के फूल-निर्माल्य प्रतिदिन हटाए जाते हैं — मंदिर की मर्यादा स्वच्छता है, वैभव नहीं।',
        textEn:
          'The previous day’s flowers (nirmalya) are removed each day — the shrine’s dignity is cleanliness, not expense.',
      },
      {
        id: 'diya-safety',
        textHi: 'दीपक पर्दों और हवा के झोंकों से सुरक्षित स्थान पर जलाया जाता है।',
        textEn: 'The diya burns where curtains and drafts cannot reach it.',
      },
    ],
    noteHi: 'रात में मंदिर का पट या पर्दा बंद करना कई परिवारों की परंपरा है — यह कुल-परंपरा का विषय है।',
    noteEn:
      'Closing the mandir’s shutter or curtain at night is many families’ practice — a matter of family tradition.',
    status: 'verified',
    source: {
      referenceUrls: [
        'https://www.vedicbirth.com/vastu/room/pooja-room',
        'https://drrpsharma.com/blog/vastu-pooja-room.html',
      ],
      verificationNote:
        '2026-08-27: both independent domains state the lamp discipline (akhand diya / diya kept from curtains and drafts) and the cleanliness-over-expense register; daily water/nirmalya renewal is the shared daily-upkeep convention across both pooja-room pages.',
    },
  },
];

/** Verified-only accessor (RULEBOOK §22.2): drafts stay invisible. */
export function getMandirGuidance(): readonly MandirGuidanceEntry[] {
  return MANDIR_GUIDANCE_ENTRIES.filter((entry) => entry.status === 'verified');
}
