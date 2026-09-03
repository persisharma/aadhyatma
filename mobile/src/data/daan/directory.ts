/**
 * दान-द्वार — the giving directory (PRD-26 §5 P2, §6.2). Small and
 * unimpeachable: six launch rows, each verified against ≥2 independent
 * sources on the dated line below. Hard rules encoded here:
 *  - officialUrl/donateUrl come from the organization's OWN domain (or the
 *    government's) only — never an aggregator.
 *  - No UPI VPAs (open decision #4: web-only hand-off at launch).
 *  - Registration KINDS are stated; numbers are never transcribed — the
 *    receipt always comes from the organization, never the app.
 *  - The app never collects, processes, confirms, or takes a share of any
 *    donation. The hand-off is Linking.openURL to the official page, behind
 *    the honest interstitial (design.md §72).
 * Rows older than 18 months since `verifiedOn` are dropped to draft by the
 * registry test (§6.2 staleness rule).
 */
import type { DaanOrgEntry } from './types';

export const DAAN_ORG_ENTRIES: readonly DaanOrgEntry[] = [
  {
    id: 'akshaya-patra',
    nameHi: 'अक्षय पात्र फाउंडेशन',
    nameEn: 'The Akshaya Patra Foundation',
    kind: 'anna-kshetra',
    causes: ['anna', 'bal'],
    aboutHi:
      'सरकारी विद्यालयों के बच्चों को प्रतिदिन ताज़ा mid-day meal — PM-POSHAN का कार्यान्वयन साझेदार; 78 रसोइयों से 23 लाख से अधिक बच्चों तक। विश्व का सबसे बड़ा NGO-संचालित school-lunch कार्यक्रम।',
    aboutEn:
      'Fresh mid-day meals for government-school children every school day — an implementing partner of PM-POSHAN, reaching 2.35M+ children from 78 kitchens. The world’s largest NGO-run school lunch programme.',
    registrationHi: 'Indian Trusts Act, 1882 के अंतर्गत पंजीकृत ट्रस्ट · 80G (₹500+ पर 50% छूट) — रसीद फाउंडेशन देगा, ऐप नहीं',
    registrationEn: 'Trust registered under the Indian Trusts Act, 1882 · 80G (50% for ₹500+) — the receipt comes from the foundation, never the app',
    officialUrl: 'https://www.akshayapatra.org',
    donateUrl: 'https://www.akshayapatra.org/donate-to-midday-meal-programme',
    verifiedOn: '2026-09-01',
    daanKathaId: 'rantideva',
    status: 'verified',
    source: {
      referenceUrls: [
        'https://www.akshayapatra.org/about-us',
        'https://en.wikipedia.org/wiki/Akshaya_Patra_Foundation',
      ],
      verificationNote:
        '2026-09-01: official domain, PM-POSHAN partnership, scale (2.35M+/78 kitchens), Trusts Act registration and 80G(50%) concordant across the official site and Wikipedia.',
    },
  },
  {
    id: 'annamrita',
    nameHi: 'अन्नामृत फाउंडेशन',
    nameEn: 'Annamrita Foundation',
    kind: 'anna-kshetra',
    causes: ['anna', 'bal'],
    aboutHi:
      'ISKCON Food Relief Foundation से जन्मा अन्न-सेवा संगठन — 8 राज्यों की 21 केन्द्रीकृत रसोइयों से प्रतिदिन 12 लाख से अधिक mid-day meals।',
    aboutEn:
      'Born of the ISKCON Food Relief Foundation — 1.2M+ mid-day meals daily from 21 centralized kitchens across 8 states.',
    registrationHi: 'पंजीकृत संस्था (पूर्व नाम: ISKCON Food Relief Foundation) · कर-छूट रसीद संस्था देगी',
    registrationEn: 'Registered organization (formerly ISKCON Food Relief Foundation) · tax receipt comes from the organization',
    officialUrl: 'https://annamrita.org',
    donateUrl: 'https://annamrita.org',
    verifiedOn: '2026-09-01',
    daanKathaId: 'rantideva',
    status: 'verified',
    source: {
      referenceUrls: ['https://annamrita.org/about-us/', 'https://iskcon.org/food-relief/'],
      verificationNote:
        '2026-09-01: official domain, the ISKCON Food Relief lineage and the 1.2M+/21-kitchen scale concordant across annamrita.org and iskcon.org.',
    },
  },
  {
    id: 'ttd-annaprasadam',
    nameHi: 'श्री वेंकटेश्वर अन्नप्रसादम् ट्रस्ट (TTD)',
    nameEn: 'Sri Venkateswara Annaprasadam Trust (TTD)',
    kind: 'temple-trust',
    causes: ['anna', 'gau'],
    aboutHi:
      'तिरुमला तिरुपति देवस्थानम् का अन्नदान ट्रस्ट — तिरुमला में प्रतिदिन हज़ारों तीर्थयात्रियों को निःशुल्क अन्नप्रसादम्। TTD का गोसंरक्षण ट्रस्ट गौ-सेवा का द्वार है।',
    aboutEn:
      'The annadanam trust of Tirumala Tirupati Devasthanams — free annaprasadam for thousands of pilgrims at Tirumala every day. TTD’s Gosamrakshana Trust is its gau-seva door.',
    registrationHi: 'TTD (आन्ध्र प्रदेश शासन का देवस्थानम्) का विधिक ट्रस्ट — रसीद देवस्थानम् देगा',
    registrationEn: 'A statutory trust of TTD (the Andhra Pradesh devasthanam) — the receipt comes from the devasthanam',
    officialUrl: 'https://www.tirumala.org',
    donateUrl: 'https://ttdevasthanams.ap.gov.in',
    verifiedOn: '2026-09-01',
    status: 'verified',
    source: {
      referenceUrls: [
        'https://services.india.gov.in/service/detail/online-donation-for-tirumala-tirupathi-devastana-1',
        'https://www.tirumala.org',
      ],
      verificationNote:
        '2026-09-01: the Annaprasadam and Gosamrakshana trusts and the official donation portal (ttdevasthanams.ap.gov.in) concordant across the India.gov services directory and the official TTD site.',
    },
  },
  {
    id: 'goonj',
    nameHi: 'गूँज',
    nameEn: 'Goonj',
    kind: 'ngo',
    causes: ['vastra', 'aapada'],
    aboutHi:
      'वस्त्र को गरिमा का साधन बनाने वाला संगठन — "वस्त्र-सम्मान" के अंतर्गत नगरों का अतिरिक्त कपड़ा गाँवों में विकास-कार्य का आधार बनता है; 95 लाख किलो से अधिक कपड़ा पुनःउपयोग।',
    aboutEn:
      'The organization that made cloth a means of dignity — under Vastra-Samman, urban surplus cloth becomes the basis of rural development work; 9.5M+ kg of cloth repurposed.',
    registrationHi: 'पंजीकृत संस्था · 80G — रसीद संस्था देगी',
    registrationEn: 'Registered organization · 80G — the receipt comes from the organization',
    officialUrl: 'https://goonj.org',
    donateUrl: 'https://goonj.org/donate/',
    verifiedOn: '2026-09-01',
    status: 'verified',
    source: {
      referenceUrls: ['https://goonj.org/faq/', 'https://en.wikipedia.org/wiki/Goonj_(NGO)'],
      verificationNote:
        '2026-09-01: official domain, the Vastra-Samman framing and the cloth-repurposing scale concordant across goonj.org and Wikipedia.',
    },
  },
  {
    id: 'belur-math',
    nameHi: 'रामकृष्ण मठ एवं मिशन, बेलूड़',
    nameEn: 'Ramakrishna Math & Mission, Belur',
    kind: 'ngo',
    causes: ['anna', 'vidya', 'arogya', 'aapada'],
    aboutHi:
      'सेवा-परम्परा की संस्था — आपदा-राहत, ग्रामीण कल्याण, शिक्षा और चिकित्सा। मठ (पूजा-उत्सव) और मिशन (राहत-सेवा) के दान-मार्ग अलग-अलग हैं; दोनों का द्वार आधिकारिक donations पोर्टल है।',
    aboutEn:
      'The institution of the seva tradition — disaster relief, rural welfare, education and medical care. The Math (worship/celebrations) and the Mission (relief/service) take donations separately; both through the official donations portal.',
    registrationHi: '80G के अंतर्गत छूट — Form 10BE/रसीद मठ-मिशन देगा',
    registrationEn: 'Exempt under 80G — Form 10BE/receipt comes from the Math/Mission',
    officialUrl: 'https://belurmath.org',
    donateUrl: 'https://donations.belurmath.org',
    verifiedOn: '2026-09-01',
    daanKathaId: 'shibi',
    status: 'verified',
    source: {
      referenceUrls: ['https://belurmath.org/donations/', 'https://donations.belurmath.org/about-us'],
      verificationNote:
        '2026-09-01: the official donations portal, the Math/Mission split, 80G exemption and Form 10BE process concordant across belurmath.org and its donations subdomain.',
    },
  },
  {
    id: 'e-raktkosh',
    nameHi: 'ई-रक्तकोष (भारत सरकार)',
    nameEn: 'e-RaktKosh (Government of India)',
    kind: 'seva-portal',
    causes: ['arogya'],
    aboutHi:
      'स्वास्थ्य एवं परिवार कल्याण मंत्रालय का राष्ट्रीय रक्त-सेवा पोर्टल — 2800+ ब्लड बैंक, रक्तदाता पंजीकरण और शिविर-सूचना।',
    aboutEn:
      'The national blood-services portal of the Ministry of Health & Family Welfare — 2800+ blood banks, donor registration and camp information.',
    registrationHi: 'भारत सरकार का पोर्टल (राष्ट्रीय स्वास्थ्य मिशन)',
    registrationEn: 'A Government of India portal (National Health Mission)',
    officialUrl: 'https://eraktkosh.mohfw.gov.in',
    donateUrl: 'https://eraktkosh.mohfw.gov.in/eraktkoshPortal/',
    verifiedOn: '2026-09-01',
    nonMonetaryHi: 'यह द्वार धन का नहीं — रक्तदाता पंजीकरण का है। रक्त-दान ही यहाँ का दान है।',
    nonMonetaryEn: 'This door takes no money — it is blood-donor registration. The blood itself is the daan here.',
    status: 'verified',
    source: {
      referenceUrls: [
        'https://www.cdac.in/index.aspx?id=product_details&productId=e-RaktKosh',
        'https://web.umang.gov.in/landing/department/e-raktkosh.html',
      ],
      verificationNote:
        '2026-09-01: the MoHFW/NHM ownership, the 2800+ blood-bank scale and the donor-registration function concordant across CDAC and UMANG (both government sources).',
    },
  },
  {
    id: 'helpage-india',
    nameHi: 'हेल्पएज इंडिया',
    nameEn: 'HelpAge India',
    kind: 'ngo',
    causes: ['vriddha', 'arogya', 'aapada'],
    aboutHi:
      'वृद्धजनों के लिए भारत की प्रमुख संस्था — 20 लाख से अधिक वरिष्ठ नागरिकों तक आश्रय, चलती-फिरती चिकित्सा इकाइयाँ, आजीविका और आपदा-राहत। 2020 में संयुक्त राष्ट्र जनसंख्या पुरस्कार से सम्मानित।',
    aboutEn:
      'India’s leading organization for the elderly — shelter, mobile healthcare units, livelihood and disaster relief reaching 2M+ senior citizens. Awarded the UN Population Award in 2020.',
    registrationHi: '12A एवं 80G के अंतर्गत पंजीकृत सोसाइटी (50% छूट) — रसीद संस्था देगी, ऐप नहीं',
    registrationEn: 'Society registered under 12A and 80G (50% exemption) — the receipt comes from the organization, never the app',
    officialUrl: 'https://www.helpageindia.org',
    donateUrl: 'https://www.helpageindia.org/donate',
    verifiedOn: '2026-09-03',
    status: 'verified',
    source: {
      referenceUrls: [
        'https://www.helpageindia.org/',
        'https://en.wikipedia.org/wiki/HelpAge_India',
      ],
      verificationNote:
        '2026-09-03: official domain, the eldercare/healthcare/livelihood/disaster programme set, the 2M+ reach, 12A+80G registration and the 2020 UN Population Award concordant across the official site and Wikipedia.',
    },
  },
  {
    id: 'cry',
    nameHi: 'क्राई — चाइल्ड राइट्स एंड यू',
    nameEn: 'CRY — Child Rights and You',
    kind: 'ngo',
    causes: ['bal', 'vidya', 'arogya'],
    aboutHi:
      '1979 में रिप्पन कपूर द्वारा स्थापित — वंचित बच्चों के लिए शिक्षा, सुरक्षा, स्वास्थ्य-पोषण और भागीदारी के चार क्षेत्रों में कार्य; 23 राज्यों की 165 परियोजनाओं से 23 लाख से अधिक बच्चों तक।',
    aboutEn:
      'Founded in 1979 by Rippan Kapur — works across four areas for underprivileged children: education, safety and protection, health and nutrition, and participation; 165 projects across 23 states reaching 2.3M+ children.',
    registrationHi: '80G के अंतर्गत 50% छूट — रसीद संस्था देगी, ऐप नहीं',
    registrationEn: '50% exemption under 80G — the receipt comes from the organization, never the app',
    officialUrl: 'https://www.cry.org',
    donateUrl: 'https://www.cry.org/donation/',
    verifiedOn: '2026-09-03',
    status: 'verified',
    source: {
      referenceUrls: [
        'https://www.cry.org/',
        'https://en.wikipedia.org/wiki/Child_Rights_and_You',
      ],
      verificationNote:
        '2026-09-03: official domain, the 1979 founding by Rippan Kapur, the four programme areas, the 165-project/23-state scale and 80G(50%) concordant across the official site and Wikipedia.',
    },
  },
  {
    id: 'blue-cross-india',
    nameHi: 'ब्लू क्रॉस ऑफ़ इंडिया',
    nameEn: 'Blue Cross of India',
    kind: 'ngo',
    causes: ['jeev'],
    aboutHi:
      '1959 में कैप्टन सुंदरम द्वारा स्थापित, चेन्नई — भारत की सबसे पुरानी जन-सहयोग से चलने वाली पशु-कल्याण संस्था; आवारा कुत्ते-बिल्ली, गौवंश, घोड़े और पक्षियों के लिए तीन अस्पताल एवं आश्रय।',
    aboutEn:
      'Founded 1959 by Captain Sundaram, Chennai — India’s oldest animal-welfare organization run on public donations; three facilities with hospitals and shelters for stray dogs, cats, cattle, horses and birds.',
    registrationHi: 'पंजीकृत पशु-कल्याण संस्था — रसीद संस्था देगी, ऐप नहीं',
    registrationEn: 'Registered animal-welfare organization — the receipt comes from the organization, never the app',
    officialUrl: 'https://bluecrossofindia.org',
    donateUrl: 'https://bluecrossofindia.org/Donate.html',
    verifiedOn: '2026-09-03',
    status: 'verified',
    source: {
      referenceUrls: [
        'https://en.wikipedia.org/wiki/Blue_Cross_of_India',
        'https://bluecrossofindia.org/What-We-Do.html',
      ],
      verificationNote:
        '2026-09-03: the 1959 founding by Captain Sundaram, Chennai base, oldest-on-public-donations standing and the hospital/shelter facilities concordant across Wikipedia and the official site.',
    },
  },
];

const STALE_AFTER_MONTHS = 18;

/** §6.2 staleness rule: a row past re-verification age is treated as draft. */
export function isOrgRowStale(entry: DaanOrgEntry, now: Date = new Date()): boolean {
  const verified = new Date(`${entry.verifiedOn}T00:00:00Z`);
  const staleAt = new Date(verified);
  staleAt.setUTCMonth(staleAt.getUTCMonth() + STALE_AFTER_MONTHS);
  return now.getTime() >= staleAt.getTime();
}

export function getDaanOrgs(now: Date = new Date()): readonly DaanOrgEntry[] {
  return DAAN_ORG_ENTRIES.filter((entry) => entry.status === 'verified' && !isOrgRowStale(entry, now));
}

export function getDaanOrg(id: string, now: Date = new Date()): DaanOrgEntry | null {
  return getDaanOrgs(now).find((entry) => entry.id === id) ?? null;
}
