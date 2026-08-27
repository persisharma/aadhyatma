/**
 * Room-by-room वास्तु guidance (PRD-24 §4, RULEBOOK §22). Each row is the
 * classical convention WITH its stated reason, and the traditional
 * accommodation where the texts allow one — never a verdict on a home, never
 * fear copy, never a remedy product (PRD-24 §2 stance guard).
 *
 * ⚠ CONTENT: source blocks are review-only provenance (RULEBOOK §22.6) — the
 * customer never sees a URL, a status word, or a verification note.
 */
import type { VastuRoomEntry } from './types';

export const VASTU_ROOM_ENTRIES: readonly VastuRoomEntry[] = [
  {
    id: 'puja-room',
    titleHi: 'पूजा स्थान · घर का मंदिर',
    titleEn: 'Puja space · home mandir',
    directions: ['northeast'],
    conventionHi:
      'पूजा स्थान ईशान कोण (उत्तर-पूर्व) में रखा जाता है। पूजा करते समय मुख पूर्व या उत्तर की ओर रहे। मंदिर शौचालय-स्नानघर से सटी दीवार पर या सीढ़ियों के नीचे नहीं रखा जाता।',
    conventionEn:
      'The puja space sits in the ईशान corner (north-east). While worshipping, one faces east or north. The mandir is not placed against a wall shared with a bathroom, nor under a staircase.',
    reasonHi:
      'ईशान ईश्वर (शिव) की दिशा मानी गई है — घर का सबसे शांत, प्रातः प्रकाश पाने वाला कोण, इसलिए परंपरा ने उसे उपासना के लिए रखा।',
    reasonEn:
      'ईशान is held to be the direction of Ishvara (Shiva) — the quietest corner and the first to receive morning light, which is why tradition reserves it for worship.',
    accommodationHi:
      'फ्लैट में ईशान उपलब्ध न हो तो किसी भी स्वच्छ, शांत कमरे की पूर्व या उत्तर दीवार पर मंदिर रखना पर्याप्त माना जाता है — एक छोटा सा आला या ताक भी।',
    accommodationEn:
      'Where the north-east is not available in a flat, tradition accepts the mandir on the east or north wall of any clean, quiet room — a small shelf or alcove is enough.',
    status: 'verified',
    source: {
      referenceUrls: [
        'https://drrpsharma.com/blog/vastu-pooja-room.html',
        'https://divyachadhava.com/en/sanatan-sahitya/pooja-room-vastu-shastra-direction',
        'https://nakshamastro.com/astrohub/vastu/directions/northeast',
      ],
      verificationNote:
        '2026-08-27: three independent published pages concur on ईशान placement, the east/north facing while worshipping, and keeping the puja space away from bathrooms/staircases.',
    },
  },
  {
    id: 'kitchen',
    titleHi: 'रसोई',
    titleEn: 'Kitchen',
    directions: ['southeast'],
    conventionHi:
      'रसोई आग्नेय कोण (दक्षिण-पूर्व) में रखी जाती है; भोजन बनाते समय मुख पूर्व की ओर रहे।',
    conventionEn:
      'The kitchen sits in the आग्नेय corner (south-east); the cook faces east while preparing food.',
    reasonHi:
      'आग्नेय अग्नि देव की दिशा है — अग्नि का कार्य उसी कोण में रखने की परंपरा है, और पूर्वमुख भोजन-निर्माण को शुभ माना गया।',
    reasonEn:
      'आग्नेय is the direction of Agni — fire work is kept in the fire corner, and cooking while facing east is held auspicious.',
    accommodationHi:
      'आग्नेय संभव न हो तो वायव्य (उत्तर-पश्चिम) रसोई का दूसरा स्थान बताया गया है।',
    accommodationEn:
      'Where the south-east is not possible, the वायव्य corner (north-west) is the stated second place for the kitchen.',
    status: 'verified',
    source: {
      referenceUrls: [
        'https://nakshamastro.com/astrohub/vastu/directions/southeast',
        'https://www.vedicbirth.com/vastu/direction/south-east',
      ],
      verificationNote:
        '2026-08-27: both published direction pages state the south-east/Agni kitchen convention with the east-facing cook and the north-west alternate.',
    },
  },
  {
    id: 'main-door',
    titleHi: 'मुख्य द्वार',
    titleEn: 'Main door',
    directions: ['north', 'east', 'northeast'],
    conventionHi:
      'मुख्य द्वार उत्तर, पूर्व या ईशान की ओर शुभ माना जाता है; द्वार के सामने अवरोध (खम्भा, बड़ा वृक्ष) न हो और द्वार स्वच्छ, प्रकाशित रहे।',
    conventionEn:
      'A main door toward the north, east or north-east is held auspicious; the doorway is kept unobstructed (no pillar or large tree directly facing it), clean and lit.',
    reasonHi:
      'उगते सूर्य की दिशा से प्रकाश-वायु घर में आती है; उत्तर कुबेर की दिशा मानी गई है।',
    reasonEn:
      'Doors toward the rising sun bring light and air through the house; the north is held to be Kubera’s direction.',
    accommodationHi:
      'पूर्ण शास्त्रीय नियम घर के मुख और पद-विन्यास पर निर्भर है — हर दिशा में शुभ पद बताए गए हैं, इसलिए बने घर का द्वार बदलने की आवश्यकता परंपरा नहीं मानती।',
    accommodationEn:
      'The full classical rule grades door positions (padas) by the house’s facing — auspicious padas exist on every side, so tradition does not ask an existing door to be moved.',
    status: 'verified',
    source: {
      referenceUrls: [
        'https://nakshamastro.com/astrohub/vastu/directions/north',
        'https://nakshamastro.com/astrohub/vastu/directions/east',
        'https://www.vedicbirth.com/vastu/direction/north-east',
      ],
      verificationNote:
        '2026-08-27: published direction pages concur that north/east entrances are favoured; the pada-based grading by house facing is the classical fuller rule, stated here as the accommodation.',
      variantNote:
        'Texts grade door padas by house facing — south- and west-facing homes have their own auspicious door positions; this row deliberately states the simple form plus that fuller rule.',
    },
  },
  {
    id: 'sleeping',
    titleHi: 'शयन · सिर की दिशा',
    titleEn: 'Sleeping · head direction',
    directions: ['south', 'east'],
    conventionHi:
      'सोते समय सिर दक्षिण की ओर सर्वोत्तम, पूर्व की ओर भी शुभ; उत्तर की ओर सिर करके सोना वर्जित माना गया है। गृहस्वामी का शयनकक्ष नैऋत्य (दक्षिण-पश्चिम) में बताया गया है।',
    conventionEn:
      'The head points south while sleeping (best), or east (also auspicious); sleeping with the head toward the north is traditionally avoided. The householder’s bedroom is placed in the नैऋत्य (south-west).',
    reasonHi:
      'स्मृति-पुराण परंपरा में उत्तर की ओर सिर रखना निषिद्ध कहा गया है; दक्षिण को स्थिरता और गहरी निद्रा की दिशा माना गया, और नैऋत्य का भारीपन गृहस्थ की स्थिरता से जोड़ा गया।',
    reasonEn:
      'The Smriti-Purana tradition proscribes a north-pointing head; the south is held to be the direction of steadiness and deep rest, and the heavy south-west corner is linked to the householder’s stability.',
    status: 'verified',
    source: {
      referenceUrls: [
        'https://nakshamastro.com/astrohub/vastu/directions/south',
        'https://nakshamastro.com/astrohub/vastu/directions/southwest',
        'https://www.vedicbirth.com/vastu/direction/south-east',
      ],
      verificationNote:
        '2026-08-27: published pages concur on the south/south-west sleeping conventions and the avoided north-pointing head; the reason is stated from the classical register, not the modern magnet claim (stance guard).',
    },
  },
  {
    id: 'tulsi',
    titleHi: 'तुलसी',
    titleEn: 'Tulsi',
    directions: ['north', 'northeast', 'east'],
    conventionHi:
      'तुलसी उत्तर, ईशान या पूर्व में रखी जाती है — जहाँ प्रातः धूप मिले और नित्य जल चढ़ाना सहज हो। पुराने घरों में तुलसी चौरा आँगन के मध्य होता था।',
    conventionEn:
      'Tulsi is kept toward the north, north-east or east — where it receives morning sun and the daily water offering is easy. Older homes kept the tulsi chaura at the centre of the courtyard.',
    reasonHi:
      'तुलसी नित्य पूजा का अंग है; उसे पवित्र मानी गई दिशाओं में, प्रकाश के साथ रखना परंपरा है।',
    reasonEn:
      'Tulsi is part of daily worship; tradition keeps it in the directions held pure, with the light it needs.',
    accommodationHi:
      'बालकनी वाले घरों में उत्तर या पूर्व की बालकनी पर्याप्त मानी जाती है।',
    accommodationEn: 'In apartment homes, a north- or east-facing balcony is accepted as enough.',
    status: 'verified',
    source: {
      referenceUrls: [
        'https://www.vedicbirth.com/vastu/plant/tulsi-vastu',
        'https://nakshamastro.com/astrohub/vastu/directions/north',
        'https://www.vedicbirth.com/vastu/room/vastu-for-courtyard',
      ],
      verificationNote:
        '2026-08-27: the dedicated tulsi page states north/north-east/east with the courtyard-centre form as most auspicious; the north direction page concurs on tulsi in the north garden.',
    },
  },
  {
    id: 'toilet',
    titleHi: 'शौचालय · स्नानघर',
    titleEn: 'Toilet · bathroom',
    directions: ['northwest', 'west'],
    conventionHi:
      'शौचालय वायव्य या पश्चिम की ओर बताया गया है; ईशान और ब्रह्मस्थान (केंद्र) में नहीं, और पूजा स्थान से सटी दीवार पर नहीं।',
    conventionEn:
      'Toilets are stated toward the north-west or west; not in the north-east, not at the ब्रह्मस्थान (centre), and not against a wall shared with the puja space.',
    reasonHi:
      'शास्त्रीय ग्रन्थों में शौच-स्थान मुख्य मंडल से बाहर रखा जाता था; ईशान जल और उपासना के लिए आरक्षित दिशा है।',
    reasonEn:
      'The classical texts placed sanitation outside the main mandala; the north-east is the direction reserved for water and worship.',
    accommodationHi:
      'बने-बनाए घर में शौचालय हटाना संभव नहीं — द्वार बंद रखना और ईशान को स्वच्छ, हल्का रखना ही व्यावहारिक परंपरा है।',
    accommodationEn:
      'An existing bathroom cannot move — keeping its door closed and the north-east clean and light is the practical tradition.',
    status: 'verified',
    source: {
      referenceUrls: [
        'https://nakshamastro.com/astrohub/vastu/directions/northwest',
        'https://www.vedicbirth.com/vastu/direction/north-east',
        'https://nakshamastro.com/astrohub/vastu/directions/northeast',
      ],
      verificationNote:
        '2026-08-27: published pages concur on the north-west placement and on keeping toilets out of the north-east; the no-shared-wall-with-puja convention is stated on the pooja-room pages.',
    },
  },
  {
    id: 'brahmasthan',
    titleHi: 'ब्रह्मस्थान',
    titleEn: 'Brahmasthan',
    directions: [],
    isCenter: true,
    conventionHi:
      'घर का केंद्र — ब्रह्मस्थान — खुला, हल्का और स्वच्छ रखा जाता है; वहाँ भारी संग्रह, स्तंभ या निर्माण नहीं किया जाता।',
    conventionEn:
      'The centre of the home — the ब्रह्मस्थान — is kept open, light and clean; heavy storage, pillars or construction are not placed there.',
    reasonHi:
      'वास्तु पुरुष मंडल में केंद्र ब्रह्मा का स्थान है — पुराने घरों का खुला आँगन इसी का रूप था।',
    reasonEn:
      'In the Vastu Purusha Mandala the centre belongs to Brahma — the open courtyard of older homes was this very form.',
    accommodationHi:
      'फ्लैट में खुला आँगन संभव नहीं — केंद्र को भारी फ़र्नीचर से मुक्त और प्रकाशित रखना ही बताया गया रूप है।',
    accommodationEn:
      'Apartments cannot open the centre to the sky — keeping it free of heavy furniture and well-lit is the stated form.',
    status: 'verified',
    source: {
      referenceUrls: [
        'https://nakshamastro.com/astrohub/vastu/learn/what-is-vastu',
        'https://www.vedicbirth.com/vastu/room/vastu-for-courtyard',
      ],
      verificationNote:
        '2026-08-27: both pages state the open-centre convention verbatim — "seat of Brahma… open or lightweight furniture, well-lit, free of heavy permanent structures" and "keep Brahmasthan centre open… apartment dwellers keep the area free of heavy furniture and well-lit".',
    },
  },
];

/** Verified-only accessors (RULEBOOK §22.2): drafts and unknown ids stay invisible. */
export function getVastuRoomEntries(): readonly VastuRoomEntry[] {
  return VASTU_ROOM_ENTRIES.filter((entry) => entry.status === 'verified');
}

export function getVastuRoomEntry(id: string): VastuRoomEntry | null {
  const entry = VASTU_ROOM_ENTRIES.find((row) => row.id === id);
  return entry && entry.status === 'verified' ? entry : null;
}
