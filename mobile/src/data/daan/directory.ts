/**
 * दान-द्वार — the giving directory (PRD-26 §5 P2, §6.2, RULEBOOK §27.14).
 *
 * A row is deliberately THIN: a name, ONE line of what they actually do, and
 * the official page the user leaves by. The teaching lives on the cause
 * (`causes.ts` mahatva) — this file names places, it does not profile
 * organizations, and the द्वार must never read like a fundraising portal.
 *
 * Hard rules encoded here:
 *  - `officialUrl` is the organization's OWN domain (or the government's),
 *    https, pointing at the page where the giving actually happens — never an
 *    aggregator, never a payment gateway of ours.
 *  - No account numbers, no UPI VPAs, no registration/80G/paperwork text, no
 *    figures the app would be asserting on an organization's behalf. Whatever
 *    receipt or exemption exists is between the giver and the organization.
 *  - The app never collects, processes, confirms, or takes a share of any
 *    donation. The hand-off is Linking.openURL behind the honest interstitial.
 *
 * `verifiedOn` is EDITORIAL, never rendered: every row was checked against the
 * two independent references in its `source` block, and a row past 18 months
 * drops to draft via `isOrgRowStale`. Verification is our discipline, not a
 * badge shown to the user.
 */
import type { DaanOrgEntry } from './types';

export const DAAN_ORG_ENTRIES: readonly DaanOrgEntry[] = [
  {
    id: 'akshaya-patra',
    nameHi: 'अक्षय पात्र फाउंडेशन',
    nameEn: 'The Akshaya Patra Foundation',
    kind: 'anna-kshetra',
    causes: ['anna', 'bal'],
    aboutHi: 'सरकारी विद्यालयों के बच्चों को प्रतिदिन ताज़ा मध्याह्न भोजन।',
    aboutEn: 'Fresh mid-day meals for government-school children, every school day.',
    officialUrl: 'https://www.akshayapatra.org/donate-to-midday-meal-programme',
    verifiedOn: '2026-09-01',
    daanKathaId: 'rantideva',
    status: 'verified',
    source: {
      referenceUrls: [
        'https://www.akshayapatra.org/about-us',
        'https://en.wikipedia.org/wiki/Akshaya_Patra_Foundation',
      ],
      verificationNote:
        '2026-09-01: official domain and the mid-day-meal work (a PM-POSHAN implementing partner) concordant across the official site and Wikipedia; donation page is on the org’s own domain.',
    },
  },
  {
    id: 'annamrita',
    nameHi: 'अन्नामृत फाउंडेशन',
    nameEn: 'Annamrita Foundation',
    kind: 'anna-kshetra',
    causes: ['anna', 'bal'],
    aboutHi: 'केन्द्रीकृत रसोइयों से विद्यालयों में प्रतिदिन मध्याह्न भोजन।',
    aboutEn: 'Mid-day meals cooked in centralized kitchens and served in schools daily.',
    officialUrl: 'https://annamrita.org',
    verifiedOn: '2026-09-01',
    daanKathaId: 'rantideva',
    status: 'verified',
    source: {
      referenceUrls: ['https://annamrita.org/about-us/', 'https://iskcon.org/food-relief/'],
      verificationNote:
        '2026-09-01: official domain and the ISKCON Food Relief lineage concordant across annamrita.org and iskcon.org.',
    },
  },
  {
    id: 'ttd-annaprasadam',
    nameHi: 'श्री वेंकटेश्वर अन्नप्रसादम् ट्रस्ट (TTD)',
    nameEn: 'Sri Venkateswara Annaprasadam Trust (TTD)',
    kind: 'temple-trust',
    causes: ['anna', 'gau'],
    aboutHi: 'तिरुमला में तीर्थयात्रियों को निःशुल्क अन्नप्रसादम्; देवस्थानम् का गोसंरक्षण ट्रस्ट गौ-सेवा का द्वार है।',
    aboutEn: 'Free annaprasadam for pilgrims at Tirumala; the devasthanam’s Gosamrakshana Trust is its gau-seva door.',
    officialUrl: 'https://ttdevasthanams.ap.gov.in',
    verifiedOn: '2026-09-01',
    status: 'verified',
    source: {
      referenceUrls: [
        'https://services.india.gov.in/service/detail/online-donation-for-tirumala-tirupathi-devastana-1',
        'https://www.tirumala.org',
      ],
      verificationNote:
        '2026-09-01: the Annaprasadam and Gosamrakshana trusts and the official donation portal (ttdevasthanams.ap.gov.in, a state devasthanam domain) concordant across the India.gov services directory and the official TTD site.',
    },
  },
  {
    id: 'goonj',
    nameHi: 'गूँज',
    nameEn: 'Goonj',
    kind: 'ngo',
    causes: ['vastra', 'aapada'],
    aboutHi: 'नगरों का अतिरिक्त वस्त्र गाँवों तक — वस्त्र-सेवा और आपदा-राहत।',
    aboutEn: 'Urban surplus cloth carried to villages — clothing work and disaster relief.',
    officialUrl: 'https://goonj.org/donate/',
    verifiedOn: '2026-09-01',
    status: 'verified',
    source: {
      referenceUrls: ['https://goonj.org/faq/', 'https://en.wikipedia.org/wiki/Goonj_(NGO)'],
      verificationNote:
        '2026-09-01: official domain and the Vastra-Samman cloth work concordant across goonj.org and Wikipedia.',
    },
  },
  {
    id: 'belur-math',
    nameHi: 'रामकृष्ण मठ एवं मिशन, बेलूड़',
    nameEn: 'Ramakrishna Math & Mission, Belur',
    kind: 'ngo',
    causes: ['anna', 'vidya', 'arogya', 'aapada'],
    aboutHi: 'रामकृष्ण मिशन की सेवा — अन्न, शिक्षा, चिकित्सा और आपदा-राहत।',
    aboutEn: 'The Ramakrishna Mission’s seva — food, education, medical care and disaster relief.',
    officialUrl: 'https://donations.belurmath.org',
    verifiedOn: '2026-09-01',
    daanKathaId: 'shibi',
    status: 'verified',
    source: {
      referenceUrls: ['https://belurmath.org/donations/', 'https://donations.belurmath.org/about-us'],
      verificationNote:
        '2026-09-01: the official donations portal (own subdomain) and the Math/Mission service work concordant across belurmath.org and its donations subdomain.',
    },
  },
  {
    id: 'e-raktkosh',
    nameHi: 'ई-रक्तकोष (भारत सरकार)',
    nameEn: 'e-RaktKosh (Government of India)',
    kind: 'seva-portal',
    causes: ['arogya'],
    aboutHi: 'स्वास्थ्य मंत्रालय का राष्ट्रीय रक्त-सेवा पोर्टल — रक्तदाता पंजीकरण, ब्लड बैंक और शिविर।',
    aboutEn: 'The Health Ministry’s national blood-services portal — donor registration, blood banks and camps.',
    officialUrl: 'https://eraktkosh.mohfw.gov.in/eraktkoshPortal/',
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
        '2026-09-01: the MoHFW/NHM ownership and the donor-registration function concordant across CDAC and UMANG (both government sources).',
    },
  },
  {
    id: 'helpage-india',
    nameHi: 'हेल्पएज इंडिया',
    nameEn: 'HelpAge India',
    kind: 'ngo',
    causes: ['vriddha', 'arogya', 'aapada'],
    aboutHi: 'वृद्धजनों के लिए आश्रय, चलती-फिरती चिकित्सा इकाइयाँ और आजीविका।',
    aboutEn: 'Shelter, mobile healthcare units and livelihood support for the elderly.',
    officialUrl: 'https://www.helpageindia.org/donate',
    verifiedOn: '2026-09-03',
    status: 'verified',
    source: {
      referenceUrls: [
        'https://www.helpageindia.org/',
        'https://en.wikipedia.org/wiki/HelpAge_India',
      ],
      verificationNote:
        '2026-09-03: official domain and the eldercare/healthcare/livelihood programme set concordant across the official site and Wikipedia.',
    },
  },
  {
    id: 'cry',
    nameHi: 'क्राई — चाइल्ड राइट्स एंड यू',
    nameEn: 'CRY — Child Rights and You',
    kind: 'ngo',
    causes: ['bal', 'vidya', 'arogya'],
    aboutHi: 'वंचित बच्चों के लिए शिक्षा, सुरक्षा और पोषण का कार्य।',
    aboutEn: 'Education, protection and nutrition work for underprivileged children.',
    officialUrl: 'https://www.cry.org/donation/',
    verifiedOn: '2026-09-03',
    status: 'verified',
    source: {
      referenceUrls: [
        'https://www.cry.org/',
        'https://en.wikipedia.org/wiki/Child_Rights_and_You',
      ],
      verificationNote:
        '2026-09-03: official domain and the education/protection/health-nutrition programme areas concordant across the official site and Wikipedia.',
    },
  },
  {
    id: 'blue-cross-india',
    nameHi: 'ब्लू क्रॉस ऑफ़ इंडिया',
    nameEn: 'Blue Cross of India',
    kind: 'ngo',
    causes: ['jeev'],
    aboutHi: 'चेन्नई की पशु-कल्याण संस्था — आवारा पशु-पक्षियों के अस्पताल और आश्रय।',
    aboutEn: 'A Chennai animal-welfare organization — hospitals and shelters for stray animals and birds.',
    officialUrl: 'https://bluecrossofindia.org/Donate.html',
    verifiedOn: '2026-09-03',
    status: 'verified',
    source: {
      referenceUrls: [
        'https://en.wikipedia.org/wiki/Blue_Cross_of_India',
        'https://bluecrossofindia.org/What-We-Do.html',
      ],
      verificationNote:
        '2026-09-03: the Chennai base and the hospital/shelter work for strays concordant across Wikipedia and the official site.',
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
