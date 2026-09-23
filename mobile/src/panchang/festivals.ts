import type { KathaCatalogEntry, ObservanceRule, Paksha } from './types';
import { ruleVisibleForLenses, type ObservanceLens } from './lenses';

const VratListUrl = 'https://www.drikpanchang.com/vrats/hindu-vrat-list.html';
const HinduCalendarUrl = 'https://www.drikpanchang.com/calendars/hindu/hinducalendar.html';
const VratKathaUrl = 'https://www.drikpanchang.com/vrat-katha/vrat-katha.html';

// Regional folk-deity and community observances are absent from the Drik festival
// index, so their rules cite a different authority (RULEBOOK §11.1 lets any of the
// listed authoritative sources stand; `observances.test.ts` pins the allowlist).
// Every such rule also names its second, independent published source in the
// comment above it — the field holds one URL, the contract wants two readings.
const RajasthanTourismUrl = 'https://www.tourism.rajasthan.gov.in/fairs-and-festivals.html';
const BiharTourismUrl = 'https://www.bihartourism.gov.in/fairs_and_festivals.html';

// Drik's Tamil and Malayalam calendars — the index for the nakshatra-in-solar-month
// observances (§23a.2's first reading; each rule names its second in its comment).
const TamilCalendarUrl = 'https://www.drikpanchang.com/tamil/tamil-calendar.html';
const MalayalamCalendarUrl = 'https://www.drikpanchang.com/malayalam/malayalam-calendar.html';

type ObservanceSeed = Pick<ObservanceRule, 'id' | 'nameHi' | 'nameEn'> &
  Partial<Omit<ObservanceRule, 'id' | 'nameHi' | 'nameEn'>>;

type KathaSeed = Pick<KathaCatalogEntry, 'id' | 'nameHi' | 'nameEn' | 'sourceUrl' | 'relatedRuleIds'> &
  Partial<Omit<KathaCatalogEntry, 'id' | 'nameHi' | 'nameEn' | 'sourceUrl' | 'relatedRuleIds'>>;

const SourceInformedAttribution = 'Source-informed app retelling; source story text is not copied into the app.';

const EkadashiKathaRuleIds = [
  'kamada-ekadashi',
  'varuthini-ekadashi',
  'mohini-ekadashi',
  'apara-ekadashi',
  'nirjala-ekadashi',
  'yogini-ekadashi',
  'devshayani-ekadashi',
  'kamika-ekadashi',
  'putrada-ekadashi',
  'aja-ekadashi',
  'parivartini-ekadashi',
  'indira-ekadashi',
  'papankusha-ekadashi',
  'rama-ekadashi',
  'dev-uthani-ekadashi',
  'mokshada-ekadashi',
  'saphala-ekadashi',
  'shattila-ekadashi',
  'jaya-ekadashi',
  'vijaya-ekadashi',
  'amalaki-ekadashi',
  'papmochani-ekadashi',
];

function createRule(seed: ObservanceSeed): ObservanceRule {
  const category = seed.category ?? 'festival';
  const sourceUrl = seed.sourceUrl ?? (seed.kathaId ? VratKathaUrl : category === 'festival' ? HinduCalendarUrl : VratListUrl);
  const deityHi = seed.deityHi ?? (category === 'festival' ? 'पारंपरिक पर्व' : 'व्रत उपासना');
  const deityEn = seed.deityEn ?? (category === 'festival' ? 'Traditional observance' : 'Vrat observance');
  const shortDescriptionHi = seed.shortDescriptionHi
    ?? `${seed.nameHi} के दिन विशेष पूजा, पाठ और स्मरण का महत्व माना जाता है।`;
  const shortDescriptionEn = seed.shortDescriptionEn
    ?? `${seed.nameEn} is observed with special puja, reading, and remembrance.`;

  return {
    id: seed.id,
    nameHi: seed.nameHi,
    nameEn: seed.nameEn,
    category,
    visibility: seed.visibility ?? 'default',
    lens: seed.lens,
    ruleType: seed.ruleType ?? (seed.type === 'solar' ? 'solar-sankranti' : 'lunar-tithi'),
    recurrence: seed.recurrence ?? 'annual',
    type: seed.type,
    lunarMonth: seed.lunarMonth,
    monthSystem: seed.monthSystem,
    paksha: seed.paksha,
    tithi: seed.tithi,
    weekday: seed.weekday,
    nakshatra: seed.nakshatra,
    solarMonth: seed.solarMonth,
    solarLongitude: seed.solarLongitude,
    solarIngress: seed.solarIngress,
    relativeRule: seed.relativeRule,
    dayRule: seed.dayRule,
    arcId: seed.arcId,
    arcRole: seed.arcRole,
    arcOrdinal: seed.arcOrdinal,
    marker: seed.marker ?? (category === 'festival' ? 'star' : 'halfmoon'),
    deityHi,
    deityEn,
    shortDescriptionHi,
    shortDescriptionEn,
    linkSectionId: seed.linkSectionId,
    articleId: seed.articleId,
    detailRoute: seed.detailRoute,
    sourceUrl,
    kathaId: seed.kathaId,
    vidhiId: seed.vidhiId,
    upvasId: seed.upvasId,
    bhogId: seed.bhogId,
    searchTerms: seed.searchTerms,
  };
}

function festival(seed: ObservanceSeed): ObservanceRule {
  return createRule({ category: 'festival', sourceUrl: HinduCalendarUrl, ...seed });
}

function vrat(seed: ObservanceSeed): ObservanceRule {
  return createRule({ category: 'vrat', sourceUrl: VratListUrl, marker: 'halfmoon', ...seed });
}

function upavas(seed: ObservanceSeed): ObservanceRule {
  return createRule({ category: 'upavas', sourceUrl: VratListUrl, marker: 'halfmoon', ...seed });
}

function hidden(seed: ObservanceSeed): ObservanceRule {
  return createRule({ category: 'vrat', visibility: 'advanced', recurrence: 'catalog', ruleType: 'catalog-only', marker: 'dot', sourceUrl: VratListUrl, ...seed });
}

function katha(seed: KathaSeed): KathaCatalogEntry {
  return {
    id: seed.id,
    nameHi: seed.nameHi,
    nameEn: seed.nameEn,
    kind: seed.kind ?? 'vrat-katha',
    contentStatus: seed.contentStatus ?? 'original-content-ready',
    languageAvailability: seed.languageAvailability ?? 'bilingual',
    summaryHi: seed.summaryHi ?? `${seed.nameHi} के लिए ऐप-लिखित कथा सार, व्रत महत्त्व और स्रोत संदर्भ उपलब्ध हैं।`,
    summaryEn: seed.summaryEn ?? `${seed.nameEn} has an app-authored story summary, observance meaning, and source reference.`,
    sourceUrl: seed.sourceUrl,
    sourceAttribution: seed.sourceAttribution ?? SourceInformedAttribution,
    relatedRuleIds: seed.relatedRuleIds,
  };
}

export const KATHA_CATALOG: KathaCatalogEntry[] = [
  katha({ id: 'satyanarayana-vrat-katha', nameHi: 'श्री सत्यनारायण व्रत कथा', nameEn: 'Shri Satyanarayana Vrat Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/satyanarayana/satyanarayana-vrat-katha.html', relatedRuleIds: ['shree-satyanarayan-vrat', 'purnima-vrat'] }),
  katha({ id: 'ekadashi-vrat-katha', nameHi: 'एकादशी व्रत कथा', nameEn: 'Ekadashi Vrat Katha', sourceUrl: 'https://www.drikpanchang.com/legends/ekadashi/ekadashi-vrat-katha.html', relatedRuleIds: EkadashiKathaRuleIds }),
  katha({ id: 'utpanna-ekadashi-katha', nameHi: 'उत्पन्ना एकादशी कथा', nameEn: 'Utpanna Ekadashi Katha', sourceUrl: 'https://www.drikpanchang.com/ekadashis/utpanna/legends/utpanna-ekadashi-vrat-katha.html', relatedRuleIds: ['utpanna-ekadashi'] }),
  katha({ id: 'kamada-ekadashi-katha', nameHi: 'कामदा एकादशी व्रत कथा', nameEn: 'Kamada Ekadashi Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/ekadashi/kamada-ekadashi-vrat-katha.html', relatedRuleIds: ['kamada-ekadashi'] }),
  katha({ id: 'varuthini-ekadashi-katha', nameHi: 'वरूथिनी एकादशी व्रत कथा', nameEn: 'Varuthini Ekadashi Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/ekadashi/varuthini-ekadashi-vrat-katha.html', relatedRuleIds: ['varuthini-ekadashi'] }),
  katha({ id: 'mohini-ekadashi-katha', nameHi: 'मोहिनी एकादशी व्रत कथा', nameEn: 'Mohini Ekadashi Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/ekadashi/mohini-ekadashi-vrat-katha.html', relatedRuleIds: ['mohini-ekadashi'] }),
  katha({ id: 'apara-ekadashi-katha', nameHi: 'अपरा एकादशी व्रत कथा', nameEn: 'Apara Ekadashi Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/ekadashi/apara-ekadashi-vrat-katha.html', relatedRuleIds: ['apara-ekadashi'] }),
  katha({ id: 'nirjala-ekadashi-katha', nameHi: 'निर्जला एकादशी व्रत कथा', nameEn: 'Nirjala Ekadashi Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/ekadashi/nirjala-ekadashi-vrat-katha.html', relatedRuleIds: ['nirjala-ekadashi'] }),
  katha({ id: 'yogini-ekadashi-katha', nameHi: 'योगिनी एकादशी व्रत कथा', nameEn: 'Yogini Ekadashi Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/ekadashi/yogini-ekadashi-vrat-katha.html', relatedRuleIds: ['yogini-ekadashi'] }),
  katha({ id: 'devshayani-ekadashi-katha', nameHi: 'देवशयनी एकादशी व्रत कथा', nameEn: 'Devshayani Ekadashi Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/ekadashi/devshayani-ekadashi-vrat-katha.html', relatedRuleIds: ['devshayani-ekadashi'] }),
  katha({ id: 'kamika-ekadashi-katha', nameHi: 'कामिका एकादशी व्रत कथा', nameEn: 'Kamika Ekadashi Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/ekadashi/kamika-ekadashi-vrat-katha.html', relatedRuleIds: ['kamika-ekadashi'] }),
  katha({ id: 'dwadashi-vrat-katha', nameHi: 'द्वादशी व्रत कथा', nameEn: 'Dwadashi Vrat Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/dwadashi/dwadashi-vrat-katha-collection.html', relatedRuleIds: ['dwadashi-vrat-shukla', 'dwadashi-vrat-krishna'] }),
  katha({ id: 'sankashti-chaturthi-vrat-katha', nameHi: 'संकष्टी चतुर्थी व्रत कथा', nameEn: 'Sankashti Chaturthi Vrat Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/sankashti/sankashti-chaturthi-vrat-katha.html', relatedRuleIds: ['sankashti-chaturthi-vrat'] }),
  katha({ id: 'sakat-chauth-vrat-katha', nameHi: 'सकट चौथ व्रत कथा', nameEn: 'Sakat Chauth Vrat Katha', sourceUrl: VratKathaUrl, relatedRuleIds: ['sakat-chauth'] }),
  katha({ id: 'ganesha-chaturthi-vrat-katha', nameHi: 'गणेश चतुर्थी व्रत कथा', nameEn: 'Ganesha Chaturthi Vrat Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/ganesha-chaturthi/ganesha-chaturthi-katha-collection.html', relatedRuleIds: ['ganesh-chaturthi', 'vinayaka-chaturthi-vrat'] }),
  katha({ id: 'pradosha-vrat-katha', nameHi: 'प्रदोष व्रत कथा', nameEn: 'Pradosha Vrat Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/pradosha/pradosha-vrat-katha.html', relatedRuleIds: ['pradosh-vrat-shukla', 'pradosh-vrat-krishna'] }),
  katha({ id: 'weekday-vrat-katha', nameHi: 'वार व्रत कथा', nameEn: 'Weekday Vrat Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/weekdays/deities-weekdays-vrat-katha.html', relatedRuleIds: ['navagraha-weekday-fasts', 'deity-weekday-fasts'] }),
  katha({ id: 'karwa-chauth-vrat-katha', nameHi: 'करवा चौथ व्रत कथा', nameEn: 'Karwa Chauth Vrat Katha', sourceUrl: 'https://www.drikpanchang.com/festivals/karwa-chauth/legends/karwa-chauth-legends.html', relatedRuleIds: ['karwa-chauth'] }),
  katha({ id: 'ahoi-ashtami-vrat-katha', nameHi: 'अहोई अष्टमी व्रत कथा', nameEn: 'Ahoi Ashtami Vrat Katha', sourceUrl: 'https://www.drikpanchang.com/festivals/ahoi-ashtami/legends/ahoi-ashtami-vrat-katha.html', relatedRuleIds: ['ahoi-ashtami'] }),
  katha({ id: 'diwali-legends', nameHi: 'दीपावली कथा', nameEn: 'Diwali Legends', kind: 'festival-legend', sourceUrl: 'https://www.drikpanchang.com/diwali/legends/diwali-legends.html', relatedRuleIds: ['diwali'] }),
  katha({ id: 'dhanteras-legends', nameHi: 'धनतेरस कथा', nameEn: 'Dhanteras Legends', kind: 'festival-legend', sourceUrl: 'https://www.drikpanchang.com/festivals/dhanteras/legends/dhanteras-legends.html', relatedRuleIds: ['dhanteras'] }),
  katha({ id: 'sharad-purnima-vrat-katha', nameHi: 'शरद पूर्णिमा व्रत कथा', nameEn: 'Sharad Purnima Vrat Katha', sourceUrl: 'https://www.drikpanchang.com/purnima/sharad/legends/sharad-purnima-vrat-katha.html', relatedRuleIds: ['sharad-purnima'] }),
  katha({ id: 'kojagara-puja-katha', nameHi: 'कोजागरा पूजा कथा', nameEn: 'Kojagara Puja Katha', sourceUrl: VratKathaUrl, relatedRuleIds: ['kojagara-puja'] }),
  katha({ id: 'holi-legends', nameHi: 'होली कथा', nameEn: 'Holi Legends', kind: 'festival-legend', sourceUrl: 'https://www.drikpanchang.com/festivals/holi/festivals-holi-legends.html', relatedRuleIds: ['holi'] }),
  katha({ id: 'raksha-bandhan-legends', nameHi: 'रक्षा बंधन कथा', nameEn: 'Raksha Bandhan Legends', kind: 'festival-legend', sourceUrl: 'https://www.drikpanchang.com/festivals/raksha-bandhan/legends/raksha-bandhan-legends.html', relatedRuleIds: ['raksha-bandhan'] }),
  // Tejaji is a Rajasthani lokdevta, not a pan-Hindu vrat, so Drik carries no
  // katha page for him; the observance and this retelling cite the Rajasthan
  // tourism portal (the same §11.1 carve-out the teja-dashami rule uses).
  katha({ id: 'teja-dashami-katha', nameHi: 'वीर तेजाजी कथा', nameEn: 'Veer Tejaji Katha', kind: 'festival-legend', summaryHi: 'वीर तेजाजी की कथा — जलती झाड़ी से निकाले गए नाग को दिया वचन, लाछा गुजरी की गायें छुड़ाना और घावों से भरी देह लौटाकर वचन निभाना।', summaryEn: 'The story of Veer Tejaji — the word given to a serpent lifted out of a burning thicket, the rescue of Lachha Gujari’s cows, and the wounded return that kept the promise.', sourceUrl: RajasthanTourismUrl, relatedRuleIds: ['teja-dashami'] }),
  katha({ id: 'hartalika-teej-katha', nameHi: 'हरतालिका तीज कथा', nameEn: 'Hartalika Teej Katha', sourceUrl: 'https://www.drikpanchang.com/festivals/teej/legends/hartalika-vrat-legend.html', relatedRuleIds: ['hartalika-teej'] }),
  katha({ id: 'maha-shivaratri-vrat-katha', nameHi: 'महा शिवरात्रि व्रत कथा', nameEn: 'Maha Shivaratri Vrat Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/maha-shivaratri/maha-shivaratri-vrat-katha.html', relatedRuleIds: ['maha-shivaratri', 'masik-shivaratri'] }),
  katha({ id: 'gangaur-vrat-katha', nameHi: 'गणगौर व्रत कथा', nameEn: 'Gangaur Vrat Katha', sourceUrl: VratKathaUrl, relatedRuleIds: ['gangaur'] }),
  katha({ id: 'sheetala-saptami-vrat-katha', nameHi: 'शीतला सप्तमी व्रत कथा (बसोड़ा)', nameEn: 'Sheetala Saptami Vrat Katha (Basoda)', sourceUrl: VratKathaUrl, relatedRuleIds: ['shitala-saptami', 'shitala-ashtami'] }),
  katha({ id: 'bachh-baras-vrat-katha', nameHi: 'बछ बारस व्रत कथा', nameEn: 'Bachh Baras Vrat Katha', sourceUrl: VratKathaUrl, relatedRuleIds: ['bachh-baras'] }),
  katha({ id: 'rama-navami-vrat-katha', nameHi: 'राम नवमी व्रत कथा', nameEn: 'Rama Navami Vrat Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/rama-navami/rama-navami-vrat-katha.html', relatedRuleIds: ['ram-navami'] }),
  katha({ id: 'sita-navami-vrat-katha', nameHi: 'सीता नवमी व्रत कथा', nameEn: 'Sita Navami Vrat Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/sita-navami/sita-navami-vrat-katha.html', relatedRuleIds: ['sita-navami'] }),
  katha({ id: 'hanuman-jayanti-vrat-katha', nameHi: 'हनुमान जयंती व्रत कथा', nameEn: 'Hanuman Jayanti Vrat Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/hanuman-jayanti/hanuman-jayanti-vrat-katha.html', relatedRuleIds: ['hanuman-jayanti'] }),
  katha({ id: 'akshaya-tritiya-vrat-katha', nameHi: 'अक्षय तृतीया व्रत कथा', nameEn: 'Akshaya Tritiya Vrat Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/akshaya-tritiya/akshaya-tritiya-vrat-katha.html', relatedRuleIds: ['akshaya-tritiya'] }),
  katha({ id: 'vat-savitri-vrat-katha', nameHi: 'वट सावित्री व्रत कथा', nameEn: 'Vat Savitri Vrat Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/vat-savitri/vat-savitri-vrat-katha.html', relatedRuleIds: ['vat-savitri-vrat'] }),
  katha({ id: 'mangala-gauri-vrat-katha', nameHi: 'मंगला गौरी व्रत कथा', nameEn: 'Mangala Gauri Vrat Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/mangala-gauri/mangala-gauri-vrat-katha.html', relatedRuleIds: ['mangala-gauri-vrat'] }),
  katha({ id: 'nag-panchami-vrat-katha', nameHi: 'नाग पंचमी व्रत कथा', nameEn: 'Nag Panchami Vrat Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/nag-panchami/nag-panchami-vrat-katha.html', relatedRuleIds: ['nag-panchami'] }),
  katha({ id: 'varalakshmi-vrat-katha', nameHi: 'वरलक्ष्मी व्रत कथा', nameEn: 'Varalakshmi Vrat Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/varalakshmi-puja/varalakshmi-vrata-katha.html', relatedRuleIds: ['varalakshmi-vrat'] }),
  katha({ id: 'jayaparvati-vrat-katha', nameHi: 'जयापार्वती व्रत कथा', nameEn: 'Jayaparvati Vrat Katha', sourceUrl: VratKathaUrl, relatedRuleIds: ['jayaparvati-vrat'] }),
  katha({ id: 'mahalakshmi-vrat-katha', nameHi: 'महालक्ष्मी व्रत कथा', nameEn: 'Mahalakshmi Vrat Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/maha-lakshmi/mahalakshmi-vrat-katha.html', relatedRuleIds: ['mahalakshmi-vrat'] }),
  katha({ id: 'rishi-panchami-vrat-katha', nameHi: 'ऋषि पंचमी व्रत कथा', nameEn: 'Rishi Panchami Vrat Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/rishi-panchami/rishi-panchami-vrat-katha.html', relatedRuleIds: ['rishi-panchami'] }),
  katha({ id: 'anant-chaturdashi-vrat-katha', nameHi: 'अनंत चतुर्दशी व्रत कथा', nameEn: 'Anant Chaturdashi Vrat Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/ananta-chaturdashi/ananta-chaturdashi-vrat-katha.html', relatedRuleIds: ['anant-chaturdashi'] }),
  katha({ id: 'jivitputrika-vrat-katha', nameHi: 'जीवित्पुत्रिका व्रत कथा', nameEn: 'Jivitputrika Vrat Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/jivitputrika-vrata/jivitputrika-vrat-katha.html', relatedRuleIds: ['jivitputrika-vrat'] }),
  katha({ id: 'durva-ashtami-vrat-katha', nameHi: 'दूर्वा अष्टमी व्रत कथा', nameEn: 'Durva Ashtami Vrat Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/durva-ashtami/durva-ashtami-vrat-katha.html', relatedRuleIds: ['durva-ashtami'] }),
  katha({ id: 'ashoka-ashtami-vrat-katha', nameHi: 'अशोक अष्टमी व्रत कथा', nameEn: 'Ashoka Ashtami Vrat Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/ashoka-ashtami/ashoka-ashtami-vrat-katha.html', relatedRuleIds: ['ashoka-ashtami'] }),
  katha({ id: 'parashurama-jayanti-vrat-katha', nameHi: 'परशुराम जयंती व्रत कथा', nameEn: 'Parashurama Jayanti Vrat Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/parashurama-jayanti/parashurama-jayanti-vrat-katha.html', relatedRuleIds: ['parashurama-jayanti'] }),
  katha({ id: 'narasimha-jayanti-vrat-katha', nameHi: 'नरसिंह जयंती व्रत कथा', nameEn: 'Narasimha Jayanti Vrat Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/narasimha-jayanti/narasimha-jayanti-vrat-katha.html', relatedRuleIds: ['narasimha-jayanti'] }),
  katha({ id: 'ganga-saptami-vrat-katha', nameHi: 'गंगा सप्तमी व्रत कथा', nameEn: 'Ganga Saptami Vrat Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/ganga-saptami/ganga-saptami-vrat-katha.html', relatedRuleIds: ['ganga-saptami'] }),
  katha({ id: 'buddha-purnima-vrat-katha', nameHi: 'बुद्ध पूर्णिमा व्रत कथा', nameEn: 'Buddha Purnima Vrat Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/buddha-purnima/buddha-purnima-vrat-katha.html', relatedRuleIds: ['buddha-purnima'] }),
  katha({ id: 'narada-jayanti-vrat-katha', nameHi: 'नारद जयंती व्रत कथा', nameEn: 'Narada Jayanti Vrat Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/narada-jayanti/narada-jayanti-vrat-katha.html', relatedRuleIds: ['narada-jayanti'] }),
  katha({ id: 'shravana-mahatmya', nameHi: 'श्रावण माहात्म्य', nameEn: 'Shravana Mahatmya', kind: 'mahatmya', sourceUrl: VratKathaUrl, relatedRuleIds: ['sawan-somwar-vrat', 'mangala-gauri-vrat'] }),
  katha({ id: 'kartika-mahatmya', nameHi: 'कार्तिक माहात्म्य', nameEn: 'Kartika Mahatmya', kind: 'mahatmya', sourceUrl: VratKathaUrl, relatedRuleIds: ['dev-uthani-ekadashi', 'tulasi-vivah'] }),
  katha({ id: 'putrada-ekadashi-katha', nameHi: 'पुत्रदा एकादशी व्रत कथा', nameEn: 'Putrada Ekadashi Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/ekadashi/putrada-ekadashi-vrat-katha.html', relatedRuleIds: ['putrada-ekadashi'] }),
  katha({ id: 'aja-ekadashi-katha', nameHi: 'अजा एकादशी व्रत कथा', nameEn: 'Aja Ekadashi Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/ekadashi/aja-ekadashi-vrat-katha.html', relatedRuleIds: ['aja-ekadashi'] }),
  katha({ id: 'indira-ekadashi-katha', nameHi: 'इन्दिरा एकादशी व्रत कथा', nameEn: 'Indira Ekadashi Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/ekadashi/indira-ekadashi-vrat-katha.html', relatedRuleIds: ['indira-ekadashi'] }),
  katha({ id: 'mokshada-ekadashi-katha', nameHi: 'मोक्षदा एकादशी व्रत कथा', nameEn: 'Mokshada Ekadashi Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/ekadashi/mokshada-ekadashi-vrat-katha.html', relatedRuleIds: ['mokshada-ekadashi'] }),
  katha({ id: 'papankusha-ekadashi-katha', nameHi: 'पापांकुशा एकादशी व्रत कथा', nameEn: 'Papankusha Ekadashi Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/ekadashi/papankusha-ekadashi-vrat-katha.html', relatedRuleIds: ['papankusha-ekadashi'] }),
  katha({ id: 'parivartini-ekadashi-katha', nameHi: 'परिवर्तिनी एकादशी व्रत कथा', nameEn: 'Parivartini Ekadashi Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/ekadashi/parivartini-ekadashi-vrat-katha.html', relatedRuleIds: ['parivartini-ekadashi'] }),
  katha({ id: 'rama-ekadashi-katha', nameHi: 'रमा एकादशी व्रत कथा', nameEn: 'Rama Ekadashi Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/ekadashi/rama-ekadashi-vrat-katha.html', relatedRuleIds: ['rama-ekadashi'] }),
  katha({ id: 'amalaki-ekadashi-katha', nameHi: 'आमलकी एकादशी व्रत कथा', nameEn: 'Amalaki Ekadashi Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/ekadashi/amalaki-ekadashi-vrat-katha.html', relatedRuleIds: ['amalaki-ekadashi'] }),
  katha({ id: 'dev-uthani-ekadashi-katha', nameHi: 'देव उठनी एकादशी व्रत कथा', nameEn: 'Dev Uthani Ekadashi Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/ekadashi/dev-uthani-ekadashi-vrat-katha.html', relatedRuleIds: ['dev-uthani-ekadashi'] }),
  katha({ id: 'jaya-ekadashi-katha', nameHi: 'जया एकादशी व्रत कथा', nameEn: 'Jaya Ekadashi Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/ekadashi/jaya-ekadashi-vrat-katha.html', relatedRuleIds: ['jaya-ekadashi'] }),
  katha({ id: 'papmochani-ekadashi-katha', nameHi: 'पापमोचनी एकादशी व्रत कथा', nameEn: 'Papmochani Ekadashi Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/ekadashi/papmochani-ekadashi-vrat-katha.html', relatedRuleIds: ['papmochani-ekadashi'] }),
  katha({ id: 'saphala-ekadashi-katha', nameHi: 'सफला एकादशी व्रत कथा', nameEn: 'Saphala Ekadashi Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/ekadashi/saphala-ekadashi-vrat-katha.html', relatedRuleIds: ['saphala-ekadashi'] }),
  katha({ id: 'shattila-ekadashi-katha', nameHi: 'षटतिला एकादशी व्रत कथा', nameEn: 'Shattila Ekadashi Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/ekadashi/shattila-ekadashi-vrat-katha.html', relatedRuleIds: ['shattila-ekadashi'] }),
  katha({ id: 'vijaya-ekadashi-katha', nameHi: 'विजया एकादशी व्रत कथा', nameEn: 'Vijaya Ekadashi Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/ekadashi/vijaya-ekadashi-vrat-katha.html', relatedRuleIds: ['vijaya-ekadashi'] }),
  katha({ id: 'bhai-dooj-katha', nameHi: 'भाई दूज कथा', nameEn: 'Bhai Dooj Katha', kind: 'festival-legend', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/vrat-katha.html', relatedRuleIds: ['bhai-dooj'] }),
  katha({ id: 'dussehra-katha', nameHi: 'दशहरा कथा', nameEn: 'Dussehra Katha', kind: 'festival-legend', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/vrat-katha.html', relatedRuleIds: ['dussehra'] }),
  katha({ id: 'govardhan-puja-katha', nameHi: 'गोवर्धन पूजा कथा', nameEn: 'Govardhan Puja Katha', kind: 'festival-legend', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/vrat-katha.html', relatedRuleIds: ['govardhan-puja'] }),
  katha({ id: 'guru-purnima-katha', nameHi: 'गुरु पूर्णिमा कथा', nameEn: 'Guru Purnima Katha', kind: 'festival-legend', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/vrat-katha.html', relatedRuleIds: ['guru-purnima'] }),
  katha({ id: 'janmashtami-katha', nameHi: 'जन्माष्टमी कथा', nameEn: 'Janmashtami Katha', kind: 'festival-legend', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/vrat-katha.html', relatedRuleIds: ['janmashtami'] }),
  katha({ id: 'vasant-panchami-katha', nameHi: 'वसंत पंचमी कथा', nameEn: 'Vasant Panchami Katha', kind: 'festival-legend', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/vrat-katha.html', relatedRuleIds: ['vasant-panchami'] }),
  katha({ id: 'akshaya-navami-katha', nameHi: 'अक्षय नवमी कथा', nameEn: 'Akshaya Navami Katha', kind: 'vrat-katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/vrat-katha.html', relatedRuleIds: ['akshaya-navami'] }),
  katha({ id: 'chhath-puja-katha', nameHi: 'छठ पूजा कथा', nameEn: 'Chhath Puja Katha', kind: 'vrat-katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/vrat-katha.html', relatedRuleIds: ['chhath-puja', 'chaiti-chhath'] }),
  katha({ id: 'ganga-dussehra-katha', nameHi: 'गंगा दशहरा कथा', nameEn: 'Ganga Dussehra Katha', kind: 'festival-legend', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/vrat-katha.html', relatedRuleIds: ['ganga-dussehra'] }),
  katha({ id: 'gita-jayanti-katha', nameHi: 'गीता जयंती कथा', nameEn: 'Gita Jayanti Katha', kind: 'festival-legend', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/vrat-katha.html', relatedRuleIds: ['gita-jayanti'] }),
  katha({ id: 'navratri-start-katha', nameHi: 'नवरात्रि प्रारंभ कथा', nameEn: 'Navratri Begins Katha', kind: 'festival-legend', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/vrat-katha.html', relatedRuleIds: ['navratri-start'] }),
  katha({ id: 'vivah-panchami-katha', nameHi: 'विवाह पंचमी कथा', nameEn: 'Vivah Panchami Katha', kind: 'festival-legend', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/vrat-katha.html', relatedRuleIds: ['vivah-panchami'] }),
  katha({ id: 'amavasya-vrat-katha', nameHi: 'अमावस्या व्रत कथा', nameEn: 'Amavasya Vrat Katha', kind: 'vrat-katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/vrat-katha.html', relatedRuleIds: ['amavasya-vrat', 'darsha-amavasya'] }),
  katha({ id: 'dattatreya-jayanti-katha', nameHi: 'दत्तात्रेय जयंती कथा', nameEn: 'Dattatreya Jayanti Katha', kind: 'festival-legend', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/vrat-katha.html', relatedRuleIds: ['dattatreya-jayanti'] }),
  katha({ id: 'masik-durgashtami-katha', nameHi: 'मासिक दुर्गाष्टमी कथा', nameEn: 'Masik Durgashtami Katha', kind: 'vrat-katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/vrat-katha.html', relatedRuleIds: ['masik-durgashtami'] }),
  katha({ id: 'masik-kalashtami-katha', nameHi: 'मासिक कालाष्टमी कथा', nameEn: 'Masik Kalashtami Katha', kind: 'vrat-katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/vrat-katha.html', relatedRuleIds: ['masik-kalashtami'] }),
  katha({ id: 'masik-krishna-janmashtami-katha', nameHi: 'मासिक कृष्ण जन्माष्टमी कथा', nameEn: 'Masik Krishna Janmashtami Katha', kind: 'vrat-katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/vrat-katha.html', relatedRuleIds: ['masik-krishna-janmashtami'] }),
  katha({ id: 'skanda-sashti-katha', nameHi: 'स्कंद षष्ठी कथा', nameEn: 'Skanda Sashti Katha', kind: 'vrat-katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/vrat-katha.html', relatedRuleIds: ['skanda-sashti'] }),
];

/**
 * Regional names for the two sankrantis that carry a distinct regional identity —
 * the ingress itself is one astronomical instant, so these are ALIASES on the same
 * rule, never separate rules. Only the names for which the observance genuinely IS
 * the sankranti day belong here: Jur Sital (the Maithil new year) is the day AFTER
 * Mesha Sankranti and is deliberately absent — a "solar ingress + N days" rule type
 * does not exist yet (docs/roadmap/prds/42-regional-parv.md).
 */
const SANKRANTI_ALIASES: Record<string, string[]> = {
  'mesha-sankranti': ['satuani', 'sattuan', 'satua sankranti', 'baisakhi', 'vaisakhi', 'bohag bihu', 'pohela boishakh', 'puthandu', 'vishu', 'mesha sankranti'],
  'makar-sankranti': ['makar sankranti', 'khichdi parv', 'til sankranti', 'pongal', 'uttarayan', 'maghi'],
};

const SANKRANTI_RULES: ObservanceRule[] = [
  ['mesha-sankranti', 'मेष संक्रांति', 'Mesha Sankranti', 0],
  ['vrishabha-sankranti', 'वृषभ संक्रांति', 'Vrishabha Sankranti', 30],
  ['mithuna-sankranti', 'मिथुन संक्रांति', 'Mithuna Sankranti', 60],
  ['karka-sankranti', 'कर्क संक्रांति', 'Karka Sankranti', 90],
  ['simha-sankranti', 'सिंह संक्रांति', 'Simha Sankranti', 120],
  ['kanya-sankranti', 'कन्या संक्रांति', 'Kanya Sankranti', 150],
  ['tula-sankranti', 'तुला संक्रांति', 'Tula Sankranti', 180],
  ['vrishchika-sankranti', 'वृश्चिक संक्रांति', 'Vrishchika Sankranti', 210],
  ['dhanu-sankranti', 'धनु संक्रांति', 'Dhanu Sankranti', 240],
  ['makar-sankranti', 'मकर संक्रांति', 'Makar Sankranti', 270],
  ['kumbha-sankranti', 'कुंभ संक्रांति', 'Kumbha Sankranti', 300],
  ['meena-sankranti', 'मीन संक्रांति', 'Meena Sankranti', 330],
].map(([id, nameHi, nameEn, solarLongitude]) => festival({
  id: String(id),
  nameHi: String(nameHi),
  nameEn: String(nameEn),
  type: 'solar',
  ruleType: 'solar-sankranti',
  solarLongitude: Number(solarLongitude),
  solarIngress: Number(solarLongitude),
  marker: 'star',
  deityHi: 'सूर्य देव',
  deityEn: 'Surya Deva',
  shortDescriptionHi: `${nameHi} सूर्य के नए राशि प्रवेश का संक्रांति पर्व है।`,
  shortDescriptionEn: `${nameEn} marks the Sun's sidereal ingress into a new rashi.`,
  searchTerms: ['sankranti', 'solar ingress', ...(SANKRANTI_ALIASES[String(id)] ?? [])],
}));

export const FESTIVAL_RULES: ObservanceRule[] = [
  ...SANKRANTI_RULES,
  // Kanya Sankranti — the Sun's ingress into Kanya, and so a SOLAR rule sharing
  // `kanya-sankranti`'s longitude rather than a lunar one. It is a rule and not a
  // SANKRANTI_ALIASES entry because the observance is its own (Vishwakarma's puja
  // of the tools, the lathe and the workshop), not a regional NAME for the
  // ingress — the same reading PRD-42 gives Vishu Kani beside Mesha Sankranti.
  // Falls on 17 September in almost every year, which is why factories, garages
  // and workshops treat it as a fixed date. Published: 17 Sep 2026 (Sunday
  // Guardian "Vishwakarma Puja 2026", Vedantu; sankranti 7:58 AM IST).
  festival({ id: 'vishwakarma-puja', nameHi: 'विश्वकर्मा पूजा', nameEn: 'Vishwakarma Puja', type: 'solar', solarLongitude: 150, solarIngress: 150, marker: 'star', deityHi: 'भगवान विश्वकर्मा', deityEn: 'Bhagwan Vishwakarma', shortDescriptionHi: 'कन्या संक्रांति को विश्वकर्मा पूजा — सृष्टि के आदि शिल्पी और देव-वास्तुकार भगवान विश्वकर्मा का पूजन। कारखानों, कार्यशालाओं, वाहनों और औजारों की सफाई कर उनकी पूजा की जाती है; बंगाल, ओडिशा, बिहार, झारखंड और उत्तर प्रदेश में शिल्पी और श्रमिक समाज का यह सबसे बड़ा पर्व है। सूर्य की कन्या संक्रांति से बंधा होने के कारण यह प्रायः हर वर्ष 17 सितंबर को पड़ता है।', shortDescriptionEn: 'Vishwakarma Puja on Kanya Sankranti — worship of Bhagwan Vishwakarma, the first craftsman and architect of the devas. Factories, workshops, vehicles and tools are cleaned and worshipped; it is the great festival of the artisan and working communities of Bengal, Odisha, Bihar, Jharkhand and Uttar Pradesh. Being fixed to the Sun’s ingress into Kanya, it falls on 17 September in almost every year.', searchTerms: ['vishwakarma puja', 'vishwakarma jayanti', 'viswakarma', 'vishvakarma', 'biswakarma', 'kanya sankranti', 'aujar puja', 'shilpi', 'factory puja'] }),
  // Magha Krishna Chaturthi (purnimant month 11) — the same day as Magha's monthly
  // Sankashti (`sankashtiNames.ts`: लम्बोदर), so it MUST carry the sibling `chandrodaya`
  // dayRule (RULEBOOK §23.4) or the two would land on different nights.
  // Published: 6 Jan 2026 (India TV, Sunday Guardian). Katha already shipped.
  festival({ id: 'sakat-chauth', nameHi: 'सकट चौथ', nameEn: 'Sakat Chauth', lunarMonth: 11, paksha: 'krishna', tithi: 4, dayRule: 'chandrodaya', marker: 'dot', category: 'vrat', deityHi: 'श्री गणेश', deityEn: 'Shri Ganesh', linkSectionId: 'ganesh-chalisa', shortDescriptionHi: 'माघ कृष्ण चतुर्थी को सकट चौथ (तिल चौथ) — संतान के मंगल हेतु गणेश जी और चंद्रमा का पूजन; संध्या चंद्रोदय पर अर्घ्य देकर व्रत पूर्ण होता है। यह माघ मास की संकष्टी चतुर्थी ही है।', shortDescriptionEn: 'Sakat Chauth (Til Chauth) on Magha Krishna Chaturthi — Ganesha and the moon are worshipped for children’s well-being, and the fast ends with arghya at the evening moonrise. It is Magha’s own Sankashti Chaturthi.', searchTerms: ['sakat chauth', 'til chauth', 'tilkut chauth', 'sankat chauth', 'chauth', 'magha chauth'], kathaId: 'sakat-chauth-vrat-katha', bhogId: 'ganesha-bhog' }),
  festival({ id: 'vasant-panchami', nameHi: 'वसंत पंचमी', nameEn: 'Vasant Panchami', lunarMonth: 11, paksha: 'shukla', tithi: 5, marker: 'star', deityHi: 'मां सरस्वती', deityEn: 'Maa Saraswati', kathaId: 'vasant-panchami-katha' }),
  // Magha Shukla Saptami — सूर्य जयंती / अचला सप्तमी, the Sun's own day and one of
  // the largest observances in the South, where the arunodaya snan defines it.
  // Published: 25 Jan 2026 (India TV "Ratha Saptami 2026", Prokerala; Magha
  // Shukla Saptami 24 Jan 12:40 AM → 25 Jan 11:11 PM).
  festival({ id: 'ratha-saptami', nameHi: 'रथ सप्तमी', nameEn: 'Ratha Saptami', lunarMonth: 11, paksha: 'shukla', tithi: 7, marker: 'star', deityHi: 'सूर्य देव', deityEn: 'Surya Deva', shortDescriptionHi: 'माघ शुक्ल सप्तमी को रथ सप्तमी — सूर्य जयंती और अचला सप्तमी; सूर्य देव के सात अश्वों वाले रथ के उत्तरायण प्रस्थान का स्मरण। अरुणोदय स्नान, अर्घ्य और सूर्य नमस्कार इस दिन के मुख्य कर्म हैं; तिरुमला और दक्षिण भारत के सूर्य मंदिरों में विशेष उत्सव होता है।', shortDescriptionEn: 'Ratha Saptami on Magha Shukla Saptami — Surya Jayanti and Achala Saptami, remembering the Sun’s seven-horsed chariot turning north. The arunodaya bath, the arghya and Surya Namaskar are the day’s rites, and Tirumala and the Sun temples of the South keep it as a major utsav.', searchTerms: ['ratha saptami', 'rath saptami', 'surya jayanti', 'achala saptami', 'magha saptami', 'arogya saptami'] }),
  // Krishna-paksha lunarMonth is the PURNIMANT (North-Indian) month — Maha Shivaratri is Phalguna (12), not Magha (11, its amanta name). See monthForRuleInSystem.
  festival({ id: 'maha-shivaratri', nameHi: 'महा शिवरात्रि', nameEn: 'Maha Shivaratri', lunarMonth: 12, paksha: 'krishna', tithi: 14, marker: 'star', deityHi: 'भगवान शिव', deityEn: 'Lord Shiva', linkSectionId: 'shiv-chalisa', kathaId: 'maha-shivaratri-vrat-katha', vidhiId: 'maha-shivaratri-puja', upvasId: 'maha-shivaratri-upvas', bhogId: 'maha-shivaratri-bhog' }),
  festival({ id: 'holi', nameHi: 'होली', nameEn: 'Holi', lunarMonth: 12, paksha: 'shukla', tithi: 15, marker: 'star', deityHi: 'श्री कृष्ण', deityEn: 'Shri Krishna', kathaId: 'holi-legends' }),
  // Chaitra Krishna Panchami (purnimant month 1) — the fifth day after Holi, and in
  // Malwa, Nimar and much of Maharashtra the day the colour is actually played
  // rather than on Holi itself; Indore's gair is this day. Published: 8 Mar 2026
  // (Republic World "Rang Panchami 2026", MyPandit; Panchami 7 Mar 7:17 PM →
  // 8 Mar 9:11 PM). Appendix C / A.9 of PRD-42 cross-listed it; shipped universal.
  festival({ id: 'rang-panchami', nameHi: 'रंग पंचमी', nameEn: 'Rang Panchami', lunarMonth: 1, paksha: 'krishna', tithi: 5, marker: 'dot', deityHi: 'श्री कृष्ण व राधा रानी', deityEn: 'Shri Krishna and Radha Rani', shortDescriptionHi: 'चैत्र कृष्ण पंचमी को रंग पंचमी — होली के पांचवें दिन खेली जाने वाली रंगों की पंचमी; मालवा, निमाड़ और महाराष्ट्र में मुख्य रंग इसी दिन खेला जाता है और इंदौर की गैर इसी दिन निकलती है। देवताओं के साथ रंग खेलने की भावना से इसे देव पंचमी भी कहा जाता है।', shortDescriptionEn: 'Rang Panchami on Chaitra Krishna Panchami — the playing of colour on the fifth day after Holi. In Malwa, Nimar and Maharashtra this, not Holi, is the day the colour is actually played, and Indore’s great gair procession is held on it. Kept as the day colour is played with the deities themselves.', searchTerms: ['rang panchami', 'ranga panchami', 'rangpanchami', 'dev panchami', 'indore gair', 'malwa holi'] }),
  // Chaitra Krishna 7/8/10 (purnimant month 1) — the Rajasthani spring cluster that
  // follows Holi. Published 2026: Shitala Saptami 10 Mar, Shitala Ashtami 11 Mar
  // (HinduPad, Hindu Blog), Dasha Mata 13 Mar (India TV, News9).
  festival({ id: 'shitala-saptami', nameHi: 'शीतला सप्तमी', nameEn: 'Shitala Saptami', lunarMonth: 1, paksha: 'krishna', tithi: 7, marker: 'dot', category: 'vrat', deityHi: 'शीतला माता', deityEn: 'Shitala Mata', shortDescriptionHi: 'चैत्र कृष्ण सप्तमी को शीतला माता का पूजन — भोजन एक दिन पहले बनाकर रखा जाता है और इस दिन चूल्हा नहीं जलाया जाता; इसे बसोड़ा कहते हैं। राजस्थान में मुख्य पूजन प्रायः अगले दिन शीतला अष्टमी को होता है।', shortDescriptionEn: 'Worship of Shitala Mata on Chaitra Krishna Saptami — the meal is cooked the previous day and the hearth stays unlit, the custom called Basoda. In Rajasthan the principal day is usually the following Shitala Ashtami.', searchTerms: ['shitala saptami', 'sheetala saptami', 'basoda', 'basoda saptami', 'shitala mata'], kathaId: 'sheetala-saptami-vrat-katha', bhogId: 'shitala-bhog' }),
  festival({ id: 'shitala-ashtami', nameHi: 'शीतला अष्टमी (बसोड़ा)', nameEn: 'Shitala Ashtami (Basoda)', lunarMonth: 1, paksha: 'krishna', tithi: 8, marker: 'dot', category: 'vrat', deityHi: 'शीतला माता', deityEn: 'Shitala Mata', shortDescriptionHi: 'चैत्र कृष्ण अष्टमी को शीतला अष्टमी — राजस्थान, हरियाणा और गुजरात के अधिकांश घरों में यही बसोड़ा का मुख्य दिन है; एक दिन पहले बना ठंडा भोजन शीतला माता को अर्पित किया जाता है और चूल्हा नहीं जलता।', shortDescriptionEn: 'Shitala Ashtami on Chaitra Krishna Ashtami — in most households of Rajasthan, Haryana and Gujarat this is the principal Basoda day; the previous day’s cold food is offered to Shitala Mata and the hearth stays unlit.', searchTerms: ['shitala ashtami', 'sheetala ashtami', 'basoda', 'basoda ashtami', 'shitala mata'], kathaId: 'sheetala-saptami-vrat-katha', bhogId: 'shitala-bhog' }),
  festival({ id: 'dasha-mata-vrat', nameHi: 'दशा माता व्रत', nameEn: 'Dasha Mata Vrat', lunarMonth: 1, paksha: 'krishna', tithi: 10, marker: 'dot', category: 'vrat', deityHi: 'दशा माता', deityEn: 'Dasha Mata', shortDescriptionHi: 'चैत्र कृष्ण दशमी को दशा माता का व्रत — पीपल का पूजन और दस गांठ वाला डोरा धारण; राजस्थान और गुजरात में घर की दशा सुधरने और सौभाग्य की कामना से किया जाता है।', shortDescriptionEn: 'The Dasha Mata vrat on Chaitra Krishna Dashami — worship of the peepal and the wearing of a ten-knot thread; kept in Rajasthan and Gujarat praying for the household’s fortune and well-being.', searchTerms: ['dasha mata', 'dashama', 'dasha mata vrat', 'dashamata', 'doro'], sourceUrl: RajasthanTourismUrl, bhogId: 'devi-vrat-bhog' }),
  // Chaitra Shukla Pratipada — the tithi that opens Vasantik Navratri and the Vikram
  // Samvat year. Ram Navami (shukla 9) already shipped without its own opening day.
  festival({ id: 'chaitra-navratri-start', nameHi: 'चैत्र नवरात्रि प्रारंभ', nameEn: 'Chaitra Navratri Begins', lunarMonth: 1, paksha: 'shukla', tithi: 1, marker: 'star', deityHi: 'मां दुर्गा', deityEn: 'Maa Durga', linkSectionId: 'durga-stotram', shortDescriptionHi: 'चैत्र शुक्ल प्रतिपदा से वासंतिक (चैत्र) नवरात्रि प्रारंभ — घटस्थापना और नौ दिन की दुर्गा उपासना, जो राम नवमी पर पूर्ण होती है। यही तिथि विक्रम संवत का नववर्ष है और गुड़ी पड़वा, उगादि व चेटीचंड के रूप में भी मनाई जाती है।', shortDescriptionEn: 'Vasantik (Chaitra) Navratri begins on Chaitra Shukla Pratipada — ghatasthapana and nine days of Durga worship that conclude on Ram Navami. The same tithi opens the Vikram Samvat new year and is kept as Gudi Padwa, Ugadi and Cheti Chand.', searchTerms: ['chaitra navratri', 'vasant navratri', 'vasantik navratri', 'gudi padwa', 'ugadi', 'cheti chand', 'nav samvatsar', 'hindu nav varsh'], vidhiId: 'navratri-ghatasthapana', bhogId: 'navratri-bhog' }),
  // Chaitra Shukla Tritiya — Rajasthan's Gangaur, the close of the sixteen/eighteen-day
  // cycle begun the day after Holika Dahan. Published: 21 Mar 2026 (HinduPad, StayVista).
  festival({ id: 'gangaur', nameHi: 'गणगौर', nameEn: 'Gangaur', lunarMonth: 1, paksha: 'shukla', tithi: 3, marker: 'star', category: 'vrat', deityHi: 'ईसर जी व गौरी माता', deityEn: 'Isar Ji and Gauri Mata', shortDescriptionHi: 'चैत्र शुक्ल तृतीया को गणगौर — ईसर जी और गौरी माता का पूजन; होलिका दहन के अगले दिन से चलने वाली पूजा इसी दिन विसर्जन के साथ पूर्ण होती है। जयपुर और उदयपुर की गणगौर सवारी प्रसिद्ध है।', shortDescriptionEn: 'Gangaur on Chaitra Shukla Tritiya — worship of Isar Ji and Gauri Mata; the cycle begun the day after Holika Dahan concludes with the immersion on this day. The Gangaur processions of Jaipur and Udaipur are famous.', searchTerms: ['gangaur', 'gangor', 'gauri tritiya', 'isar gauri', 'teej gangaur'], kathaId: 'gangaur-vrat-katha', bhogId: 'gangaur-bhog' }),
  // Chaitra Shukla Shashthi — the spring Chhath of Bihar/Mithila, the same four-day
  // rite as the Kartik one. Published: 24 Mar 2026 (Drik Chhath calendar, Samvat).
  festival({ id: 'chaiti-chhath', nameHi: 'चैती छठ', nameEn: 'Chaiti Chhath', lunarMonth: 1, paksha: 'shukla', tithi: 6, marker: 'dot', category: 'upavas', deityHi: 'सूर्य देव', deityEn: 'Surya Deva', shortDescriptionHi: 'चैत्र शुक्ल षष्ठी को चैती छठ — सूर्य देव और छठी मैया की चार दिवसीय उपासना (नहाय-खाय, खरना, संध्या अर्घ्य, उषा अर्घ्य); बिहार, झारखंड, पूर्वी उत्तर प्रदेश और मिथिला में कार्तिक छठ की ही भांति की जाती है।', shortDescriptionEn: 'Chaiti Chhath on Chaitra Shukla Shashthi — the four-day worship of Surya and Chhathi Maiya (Nahay-Khay, Kharna, evening arghya, dawn arghya), kept in Bihar, Jharkhand, eastern Uttar Pradesh and Mithila exactly as the Kartik Chhath is.', searchTerms: ['chaiti chhath', 'chaitra chhath', 'chhath', 'surya shashthi', 'chhathi maiya'], kathaId: 'chhath-puja-katha', bhogId: 'chhath-bhog' }),
  festival({ id: 'ram-navami', nameHi: 'राम नवमी', nameEn: 'Ram Navami', lunarMonth: 1, paksha: 'shukla', tithi: 9, dayRule: 'madhyahna', marker: 'star', deityHi: 'श्री राम', deityEn: 'Shri Ram', linkSectionId: 'ram-stuti', kathaId: 'rama-navami-vrat-katha' }),
  // Chaitra Shukla Trayodashi — Mahavir Janma Kalyanak. Shipped default-visible for
  // the same reason Buddha Purnima is: a gazetted, pan-India observance. The rest of
  // the Jain calendar is a regional wave (docs/roadmap/prds/42-regional-parv.md).
  // Published: 31 Mar 2026 (Outlook, Daily Jagran).
  festival({ id: 'mahavir-jayanti', nameHi: 'महावीर जयंती', nameEn: 'Mahavir Jayanti', lunarMonth: 1, paksha: 'shukla', tithi: 13, marker: 'dot', deityHi: 'भगवान महावीर', deityEn: 'Bhagwan Mahavir', shortDescriptionHi: 'चैत्र शुक्ल त्रयोदशी को भगवान महावीर का जन्म कल्याणक — जैन परंपरा का प्रमुख पर्व; प्रभात फेरी, अभिषेक और अहिंसा व संयम के उपदेशों का स्मरण।', shortDescriptionEn: 'Bhagwan Mahavir’s Janma Kalyanak on Chaitra Shukla Trayodashi — the principal festival of the Jain tradition, marked by the dawn procession, the abhisheka and remembrance of his teachings of ahimsa and restraint.', searchTerms: ['mahavir jayanti', 'mahaveer jayanti', 'janma kalyanak', 'jain', 'mahavir swami'] }),
  festival({ id: 'hanuman-jayanti', nameHi: 'हनुमान जयंती', nameEn: 'Hanuman Jayanti', lunarMonth: 1, paksha: 'shukla', tithi: 15, marker: 'star', deityHi: 'हनुमान जी', deityEn: 'Hanuman Ji', linkSectionId: 'hanuman-chalisa', kathaId: 'hanuman-jayanti-vrat-katha', bhogId: 'hanuman-jayanti-bhog' }),
  // The Purnima of the MESHA solar month (Tamil Chithirai) — NOT Chaitra Purnima,
  // which is the lunar month of the same name and a different day in most years
  // (2026: Chaitra Purnima 2 Apr, Chitra Pournami 1 May). That is why this rule
  // carries `solarMonth` and no `lunarMonth`, and why it is NOT a sibling of
  // `hanuman-jayanti` despite sharing shukla 15. Published: 1 May 2026 (Astroyogi
  // "Chitra Pournami 2026", AstroVed).
  festival({ id: 'chitra-pournami', nameHi: 'चित्रा पूर्णिमा', nameEn: 'Chitra Pournami', paksha: 'shukla', tithi: 15, solarMonth: 0, marker: 'dot', deityHi: 'भगवान चित्रगुप्त', deityEn: 'Bhagwan Chitragupta', shortDescriptionHi: 'मेष सौर मास (तमिल चित्तिरै) की पूर्णिमा को चित्रा पूर्णिमा — तमिलनाडु और केरल में चित्रगुप्त जी का दिन, जब वे वर्ष भर के कर्मों का लेखा पूर्ण करते हैं; कांचीपुरम के चित्रगुप्त मंदिर में विशेष पूजा और चित्रान्न का नैवेद्य होता है। यह चैत्र मास की पूर्णिमा से भिन्न तिथि है।', shortDescriptionEn: 'Chitra Pournami on the Purnima of the Mesha solar month (Tamil Chithirai) — in Tamil Nadu and Kerala this is Chitragupta’s day, when he closes the year’s account of deeds; the Chitragupta temple at Kanchipuram keeps a special puja and the chitrannam offering. It is a different day from the Purnima of the lunar month Chaitra.', searchTerms: ['chitra pournami', 'chithra pournami', 'chitra purnima', 'chitragupta', 'chithirai pournami', 'tamil'], sourceUrl: TamilCalendarUrl }),
  festival({ id: 'akshaya-tritiya', nameHi: 'अक्षय तृतीया', nameEn: 'Akshaya Tritiya', lunarMonth: 2, paksha: 'shukla', tithi: 3, marker: 'star', deityHi: 'श्री विष्णु', deityEn: 'Shri Vishnu', linkSectionId: 'vishnu-sahasranama', kathaId: 'akshaya-tritiya-vrat-katha' }),
  festival({ id: 'parashurama-jayanti', nameHi: 'परशुराम जयंती', nameEn: 'Parashurama Jayanti', lunarMonth: 2, paksha: 'shukla', tithi: 3, marker: 'dot', deityHi: 'भगवान परशुराम', deityEn: 'Lord Parashurama', kathaId: 'parashurama-jayanti-vrat-katha' }),
  festival({ id: 'ganga-saptami', nameHi: 'गंगा सप्तमी', nameEn: 'Ganga Saptami', lunarMonth: 2, paksha: 'shukla', tithi: 7, marker: 'dot', deityHi: 'मां गंगा', deityEn: 'Maa Ganga', kathaId: 'ganga-saptami-vrat-katha' }),
  festival({ id: 'sita-navami', nameHi: 'सीता नवमी', nameEn: 'Sita Navami', lunarMonth: 2, paksha: 'shukla', tithi: 9, marker: 'dot', deityHi: 'मां सीता', deityEn: 'Maa Sita', kathaId: 'sita-navami-vrat-katha' }),
  festival({ id: 'narasimha-jayanti', nameHi: 'नरसिंह जयंती', nameEn: 'Narasimha Jayanti', lunarMonth: 2, paksha: 'shukla', tithi: 14, marker: 'dot', deityHi: 'भगवान नरसिंह', deityEn: 'Lord Narasimha', kathaId: 'narasimha-jayanti-vrat-katha' }),
  festival({ id: 'buddha-purnima', nameHi: 'बुद्ध पूर्णिमा', nameEn: 'Buddha Purnima', lunarMonth: 2, paksha: 'shukla', tithi: 15, marker: 'dot', deityHi: 'भगवान बुद्ध', deityEn: 'Lord Buddha', kathaId: 'buddha-purnima-vrat-katha' }),
  // Purnimant month: Narada Jayanti is Jyeshtha (3) Krishna Pratipada, not Vaishakha (2, amanta name).
  festival({ id: 'narada-jayanti', nameHi: 'नारद जयंती', nameEn: 'Narada Jayanti', lunarMonth: 3, paksha: 'krishna', tithi: 1, marker: 'dot', deityHi: 'देवर्षि नारद', deityEn: 'Devarshi Narada', kathaId: 'narada-jayanti-vrat-katha' }),
  // Jyeshtha Amavasya — the SAME day as the shipped `vat-savitri-vrat` (RULEBOOK
  // §23.4 sibling, asserted in observanceDates.test.ts), which is why it carries
  // that rule's purnimant month 3 rather than Vaishakha, its amanta name.
  // Published: 16 May 2026 (Drik "Shani Jayanti", Rudraksha-Ratna; both state
  // Jyeshtha Amavasya by the North-Indian Purnimanta reckoning).
  festival({ id: 'shani-jayanti', nameHi: 'शनि जयंती', nameEn: 'Shani Jayanti', lunarMonth: 3, paksha: 'krishna', tithi: 15, marker: 'dot', deityHi: 'शनि देव', deityEn: 'Shani Deva', shortDescriptionHi: 'ज्येष्ठ अमावस्या को शनि जयंती — शनि देव का जन्म दिवस; तैल अभिषेक, दीप दान और शनि स्तोत्र का पाठ किया जाता है। उत्तर भारत में यही दिन वट सावित्री व्रत का भी है, और शिंगणापुर व अन्य शनि धामों में विशेष उत्सव होता है।', shortDescriptionEn: 'Shani Jayanti on Jyeshtha Amavasya — the birth day of Shani Deva, marked with the oil abhisheka, the lamp offering and the recitation of the Shani stotra. In North India it is also the Vat Savitri vrat day, and Shingnapur and the other Shani shrines keep it as a major utsav.', searchTerms: ['shani jayanti', 'shani amavasya', 'shani dev', 'shanaishchara jayanti', 'shingnapur'] }),
  festival({ id: 'ganga-dussehra', nameHi: 'गंगा दशहरा', nameEn: 'Ganga Dussehra', lunarMonth: 3, paksha: 'shukla', tithi: 10, marker: 'dot', deityHi: 'मां गंगा', deityEn: 'Maa Ganga', kathaId: 'ganga-dussehra-katha' }),
  // Ashadha Shukla Dashami. Drik lists Asha Dashami under its own vrat page; the
  // annual observance is Ashadha's. Published: 24 Jul 2026 (Drik, SanatanaVibes).
  festival({ id: 'asha-dashami', nameHi: 'आशा दशमी', nameEn: 'Asha Dashami', lunarMonth: 4, paksha: 'shukla', tithi: 10, marker: 'dot', category: 'vrat', deityHi: 'मां पार्वती', deityEn: 'Maa Parvati', shortDescriptionHi: 'आषाढ़ शुक्ल दशमी को आशा दशमी व्रत — मां पार्वती की उपासना और मनोकामना-पूर्ति का संकल्प।', shortDescriptionEn: 'The Asha Dashami vrat on Ashadha Shukla Dashami — worship of Maa Parvati with a resolve for the fulfilment of a heartfelt wish.', searchTerms: ['asha dashami', 'asha dasami', 'dashami vrat'], sourceUrl: VratListUrl, bhogId: 'devi-vrat-bhog' }),
  festival({ id: 'guru-purnima', nameHi: 'गुरु पूर्णिमा', nameEn: 'Guru Purnima', lunarMonth: 4, paksha: 'shukla', tithi: 15, marker: 'star', deityHi: 'गुरु परंपरा', deityEn: 'Guru Parampara', kathaId: 'guru-purnima-katha' }),
  festival({ id: 'hariyali-teej', nameHi: 'हरियाली तीज', nameEn: 'Hariyali Teej', lunarMonth: 5, paksha: 'shukla', tithi: 3, marker: 'dot', category: 'vrat', deityHi: 'मां पार्वती', deityEn: 'Maa Parvati', shortDescriptionHi: 'श्रावण शुक्ल तृतीया का स्त्रियों का व्रत — शिव-पार्वती पूजन, झूला और सौभाग्य की कामना; छोटी तीज व सिंधारा तीज भी कहलाती है।', shortDescriptionEn: 'A women’s vrat on Shravana Shukla Tritiya — Shiva–Parvati worship, swings, and prayers for marital well-being; also called Chhoti Teej or Sindhara Teej.', searchTerms: ['teej', 'chhoti teej', 'sindhara teej', 'sawan teej'], bhogId: 'hariyali-teej-bhog' }),
  // Shravana Shukla Tritiya — the CONCLUDING day of Mithila's Madhushravani, whose
  // daily puja/katha cycle opens on Shravana Krishna Panchami. Only the closing day
  // is a tithi rule; the fortnight itself is not modelled. Published close: 15 Aug
  // 2026 (The Mithila Times, Hindu Blog "Madhushravani Tritiya").
  festival({ id: 'madhushravani', nameHi: 'मधुश्रावणी', nameEn: 'Madhushravani', lunarMonth: 5, paksha: 'shukla', tithi: 3, marker: 'dot', category: 'vrat', deityHi: 'शिव-पार्वती व विषहरा', deityEn: 'Shiva–Parvati and Vishahara', shortDescriptionHi: 'श्रावण शुक्ल तृतीया को मधुश्रावणी — मिथिला की नवविवाहिताओं का व्रत; श्रावण कृष्ण पंचमी से चलने वाले पूजन-कथा क्रम का समापन दिवस, जिसमें शिव-पार्वती और विषहरा (मनसा) का पूजन होता है।', shortDescriptionEn: 'Madhushravani on Shravana Shukla Tritiya — the vrat of the newly married women of Mithila; the closing day of the cycle of daily puja and katha begun on Shravana Krishna Panchami, honouring Shiva–Parvati and Vishahara (Manasa).', searchTerms: ['madhushravani', 'madhusravani', 'mithila', 'maithil teej', 'madhushrawani'], sourceUrl: BiharTourismUrl, bhogId: 'devi-vrat-bhog' }),
  festival({ id: 'nag-panchami', nameHi: 'नाग पंचमी', nameEn: 'Nag Panchami', lunarMonth: 5, paksha: 'shukla', tithi: 5, marker: 'dot', deityHi: 'नाग देवता', deityEn: 'Naga Devata', kathaId: 'nag-panchami-vrat-katha' }),
  festival({ id: 'raksha-bandhan', nameHi: 'रक्षा बंधन', nameEn: 'Raksha Bandhan', lunarMonth: 5, paksha: 'shukla', tithi: 15, marker: 'star', kathaId: 'raksha-bandhan-legends' }),
  // Shravana Purnima — the SAME tithi as `raksha-bandhan` (RULEBOOK §23.4 sibling,
  // asserted in observanceDates.test.ts). The upakarma is the day's own rite in
  // the South and West: the Yajur-vedin's is this Purnima, the Rig-vedin's the
  // Shravana nakshatra day, which this rule does not claim. Second reading:
  // Drik's Tamil calendar 2026 Avani Avittam row (read 2026-09-18).
  festival({ id: 'avani-avittam', nameHi: 'अवनि अविट्टम (उपाकर्म)', nameEn: 'Avani Avittam (Upakarma)', lunarMonth: 5, paksha: 'shukla', tithi: 15, marker: 'dot', deityHi: 'वेद परंपरा', deityEn: 'Veda Parampara', shortDescriptionHi: 'श्रावण पूर्णिमा को अवनि अविट्टम — यजुर्वेदी ब्राह्मणों का उपाकर्म, जिस दिन पुराना यज्ञोपवीत त्यागकर नया धारण किया जाता है और वर्ष भर के वेदाध्ययन का संकल्प लिया जाता है। तमिलनाडु, केरल, आंध्र और महाराष्ट्र में यह श्रावणी उपाकर्म रक्षा बंधन की ही तिथि पर होता है।', shortDescriptionEn: 'Avani Avittam on Shravana Purnima — the Yajur-vedin’s upakarma, when the old sacred thread is set aside for a new one and the year’s Veda study is resolved upon. Kept across Tamil Nadu, Kerala, Andhra and Maharashtra as Shravani Upakarma, on the same tithi as Raksha Bandhan.', searchTerms: ['avani avittam', 'upakarma', 'upakarmam', 'shravani upakarma', 'janeu', 'yajnopavita', 'rig upakarma'], sourceUrl: TamilCalendarUrl }),
  // Purnimant month: Kajari Teej is Bhadrapada (6) Krishna Tritiya, not Shravana (5, its amanta name).
  festival({ id: 'kajari-teej', nameHi: 'कजरी तीज', nameEn: 'Kajari Teej', lunarMonth: 6, paksha: 'krishna', tithi: 3, marker: 'dot', category: 'vrat', deityHi: 'मां पार्वती', deityEn: 'Maa Parvati', shortDescriptionHi: 'भाद्रपद कृष्ण तृतीया का स्त्रियों का बड़ा व्रत — शिव-पार्वती व नीम पूजन और सौभाग्य की कामना; बड़ी तीज, कजली व सातुड़ी तीज भी कहलाती है।', shortDescriptionEn: 'A major women’s vrat on Bhadrapada Krishna Tritiya — Shiva–Parvati and neem worship with prayers for marital well-being; also called Badi Teej, Kajali or Satudi Teej.', searchTerms: ['teej', 'badi teej', 'kajali teej', 'satudi teej'], bhogId: 'kajari-teej-bhog' }),
  // Chandrodaya like the monthly Sankashti it coincides with (RULEBOOK §23.4): the
  // fast concludes in the evening after Godhuli puja and moonrise.
  festival({ id: 'bahula-chaturthi', nameHi: 'बहुला चतुर्थी', nameEn: 'Bahula Chaturthi', lunarMonth: 6, paksha: 'krishna', tithi: 4, dayRule: 'chandrodaya', marker: 'dot', category: 'vrat', deityHi: 'गौ माता व श्री कृष्ण', deityEn: 'Gau Mata and Shri Krishna', shortDescriptionHi: 'भाद्रपद कृष्ण चतुर्थी का संतान-मंगल व्रत — संध्या गोधूलि बेला में गौ माता और बछड़े का पूजन; गुजरात में बोल चौथ नाम से प्रचलित।', shortDescriptionEn: 'A vrat for children’s well-being on Bhadrapada Krishna Chaturthi — cow and calf worship at the evening Godhuli hour; known as Bol Choth in Gujarat.', searchTerms: ['bahula chauth', 'bol choth', 'chauth', 'gau puja'], bhogId: 'bahula-chaturthi-bhog' }),
  // The Rajasthani identity of the same tithi (chandrodaya sibling, RULEBOOK §23.4):
  // a suhag vrat to Chauth Mata, concluded with the evening moon arghya.
  festival({ id: 'bhadwa-chauth', nameHi: 'भादवा चौथ (चौथ माता व्रत)', nameEn: 'Bhadwa Chauth (Chauth Mata Vrat)', lunarMonth: 6, paksha: 'krishna', tithi: 4, dayRule: 'chandrodaya', marker: 'dot', category: 'vrat', deityHi: 'चौथ माता व विनायक जी', deityEn: 'Chauth Mata and Vinayak Ji', shortDescriptionHi: 'राजस्थान का सुहाग व्रत — भाद्रपद कृष्ण चतुर्थी को चौथ माता और विनायक जी का पूजन, संध्या चंद्रोदय पर अर्घ्य; चौथ का बरवाड़ा (सवाई माधोपुर) का प्रसिद्ध मेला इसी दिन भरता है।', shortDescriptionEn: 'Rajasthan’s marital-well-being vrat — Chauth Mata and Vinayak Ji worship on Bhadrapada Krishna Chaturthi, with arghya at the evening moonrise; the famed Chauth Ka Barwara (Sawai Madhopur) fair is held this day.', searchTerms: ['bhadwa chauth', 'chauth mata', 'bhaduri chauth', 'chauth'], bhogId: 'bhadwa-chauth-bhog' }),
  // Purnimant month: Janmashtami is Bhadrapada (6) Krishna Ashtami, not Shravana (5, its amanta name).
  festival({ id: 'janmashtami', nameHi: 'जन्माष्टमी', nameEn: 'Janmashtami', lunarMonth: 6, paksha: 'krishna', tithi: 8, marker: 'star', deityHi: 'श्री कृष्ण', deityEn: 'Shri Krishna', linkSectionId: 'bhagavad-gita', kathaId: 'janmashtami-katha', upvasId: 'janmashtami-upvas', bhogId: 'janmashtami-bhog' }),
  // Bhadrapada Krishna Navami — Gogaji (Jaharveer), the folk deity of Rajasthan's
  // Gogamedi. Published: 5 Sep 2026 (BhaktiBharat, Prokerala; Drik "Goga Navami").
  festival({ id: 'goga-navami', nameHi: 'गोगा नवमी', nameEn: 'Goga Navami', lunarMonth: 6, paksha: 'krishna', tithi: 9, marker: 'dot', deityHi: 'गोगाजी (जाहरवीर)', deityEn: 'Gogaji (Jaharveer)', shortDescriptionHi: 'भाद्रपद कृष्ण नवमी को लोक देवता गोगाजी — जाहरवीर — का पूजन, सर्पदंश से रक्षा की कामना के साथ; गोगामेड़ी (हनुमानगढ़) का विशाल मेला इसी तिथि पर भरता है। राजस्थान, हरियाणा, पंजाब और पश्चिमी उत्तर प्रदेश में मनाई जाती है।', shortDescriptionEn: 'Worship of the folk deity Gogaji — Jaharveer — on Bhadrapada Krishna Navami, prayed to for protection from snakebite; the great Gogamedi (Hanumangarh) fair is held on this tithi. Kept across Rajasthan, Haryana, Punjab and western Uttar Pradesh.', searchTerms: ['goga navami', 'gogaji', 'goga ji', 'jaharveer', 'jahar veer', 'gogamedi', 'goga nomi', 'goga maharaj'] }),
  // Bhadrapada Krishna Dwadashi — Rajasthan's Bachh Baras. Published: 7 Sep 2026
  // (Drik "Bachha Baras Dwadashi"). Katha already shipped.
  festival({ id: 'bachh-baras', nameHi: 'बछ बारस', nameEn: 'Bachh Baras', lunarMonth: 6, paksha: 'krishna', tithi: 12, marker: 'dot', category: 'vrat', deityHi: 'गौ माता', deityEn: 'Gau Mata', shortDescriptionHi: 'भाद्रपद कृष्ण द्वादशी को बछ बारस — गाय और बछड़े का पूजन; माताएं संतान के मंगल हेतु व्रत रखती हैं और इस दिन गाय का दूध-दही तथा चाकू से कटी वस्तु ग्रहण नहीं करतीं।', shortDescriptionEn: 'Bachh Baras on Bhadrapada Krishna Dwadashi — cow and calf worship; mothers keep the fast for their children’s well-being and avoid cow’s milk and curd and anything cut with a knife for the day.', searchTerms: ['bachh baras', 'bach baras', 'bachbaras', 'govatsa dwadashi', 'bachhbaras'], kathaId: 'bachh-baras-vrat-katha', bhogId: 'bachh-baras-bhog' }),
  // Bhadrapada Shukla Dwitiya (भादवा सुदी बीज) — Baba Ramdevji's avataran; the
  // Ramdevra/Runicha fair runs from this tithi to Bhadrapada Shukla Ekadashi.
  // Published tithi: BankBazaar, Pincodify; 2026 date 12 Sep.
  festival({ id: 'ramdev-jayanti', nameHi: 'रामदेव जयंती', nameEn: 'Ramdev Jayanti', lunarMonth: 6, paksha: 'shukla', tithi: 2, marker: 'dot', deityHi: 'बाबा रामदेव जी', deityEn: 'Baba Ramdevji', shortDescriptionHi: 'भाद्रपद शुक्ल द्वितीया (भादवा सुदी बीज) को बाबा रामदेव जी का अवतरण दिवस — रुणिचा/रामदेवरा (जैसलमेर) का मेला इसी तिथि से भाद्रपद शुक्ल एकादशी तक चलता है; भक्त जम्मा-जागरण और पैदल यात्रा करते हैं।', shortDescriptionEn: 'Baba Ramdevji’s birth anniversary on Bhadrapada Shukla Dwitiya (Bhadva Sudi Beej) — the Ramdevra (Runicha, Jaisalmer) fair runs from this tithi to Bhadrapada Shukla Ekadashi, with night jamma-jagarans and pilgrim walks.', searchTerms: ['ramdev jayanti', 'ramdevji', 'ramdev pir', 'ramdevra', 'runicha', 'baba ramdev', 'bhadva beej'], sourceUrl: RajasthanTourismUrl }),
  festival({ id: 'hartalika-teej', nameHi: 'हरतालिका तीज', nameEn: 'Hartalika Teej', lunarMonth: 6, paksha: 'shukla', tithi: 3, marker: 'dot', category: 'vrat', deityHi: 'मां पार्वती', deityEn: 'Maa Parvati', kathaId: 'hartalika-teej-katha', bhogId: 'hartalika-teej-bhog' }),
  festival({ id: 'ganesh-chaturthi', nameHi: 'गणेश चतुर्थी', nameEn: 'Ganesh Chaturthi', lunarMonth: 6, paksha: 'shukla', tithi: 4, dayRule: 'madhyahna', arcId: 'ganesh-utsav', arcRole: 'sthapana', arcOrdinal: 1, marker: 'star', deityHi: 'श्री गणेश', deityEn: 'Shri Ganesh', linkSectionId: 'ganesh-chalisa', kathaId: 'ganesha-chaturthi-vrat-katha', vidhiId: 'ganesh-chaturthi-sthapana', bhogId: 'ganesha-bhog' }),
  festival({ id: 'rishi-panchami', nameHi: 'ऋषि पंचमी', nameEn: 'Rishi Panchami', lunarMonth: 6, paksha: 'shukla', tithi: 5, marker: 'dot', category: 'vrat', deityHi: 'ऋषि परंपरा', deityEn: 'Rishi Parampara', kathaId: 'rishi-panchami-vrat-katha', bhogId: 'rishi-panchami-bhog' }),
  festival({ id: 'durva-ashtami', nameHi: 'दूर्वा अष्टमी', nameEn: 'Durva Ashtami', lunarMonth: 6, paksha: 'shukla', tithi: 8, marker: 'dot', category: 'vrat', deityHi: 'श्री गणेश', deityEn: 'Shri Ganesh', kathaId: 'durva-ashtami-vrat-katha', bhogId: 'durva-ashtami-bhog' }),
  // Bhadrapada Shukla Ashtami — the SAME tithi as `durva-ashtami` (RULEBOOK §23.4
  // sibling, asserted in observanceDates.test.ts). PRD-42 Appendix C calls this
  // "the largest single universal gap left". Published: 19 Sep 2026 (Drik
  // "Radha Ashtami", Vedantu; madhyahna puja muhurat 11:19 AM – 1:45 PM, which is
  // the PUJA window — the day itself is fixed by the udaya Ashtami, as its
  // sibling is).
  festival({ id: 'radha-ashtami', nameHi: 'राधा अष्टमी', nameEn: 'Radha Ashtami', lunarMonth: 6, paksha: 'shukla', tithi: 8, marker: 'star', deityHi: 'राधा रानी', deityEn: 'Radha Rani', shortDescriptionHi: 'भाद्रपद शुक्ल अष्टमी को राधा अष्टमी — श्री राधा रानी का प्राकट्य दिवस, जन्माष्टमी के पंद्रह दिन बाद। बरसाना, वृंदावन, नंदगांव और मथुरा में यह सबसे बड़े उत्सवों में है; भक्त उपवास, अभिषेक और राधा नाम संकीर्तन करते हैं।', shortDescriptionEn: 'Radha Ashtami on Bhadrapada Shukla Ashtami — the appearance day of Shri Radha Rani, a fortnight after Janmashtami. Barsana, Vrindavan, Nandgaon and Mathura keep it as one of their greatest festivals, with fasting, the abhisheka and the kirtan of Radha’s name.', searchTerms: ['radha ashtami', 'radhashtami', 'radha jayanti', 'radha rani', 'barsana', 'braj'] }),
  // Bhadrapada Shukla Dashami — Veer Tejaji. Published: 21 Sep 2026, and the tithi
  // itself in BhaktiBharat + BankBazaar; Parbatsar (Nagaur) cattle fair.
  festival({ id: 'teja-dashami', nameHi: 'तेजा दशमी', nameEn: 'Teja Dashami', lunarMonth: 6, paksha: 'shukla', tithi: 10, marker: 'dot', deityHi: 'वीर तेजाजी', deityEn: 'Veer Tejaji', shortDescriptionHi: 'भाद्रपद शुक्ल दशमी को वीर तेजाजी का स्मरण — खरनाल और परबतसर (नागौर) के पशु मेले इसी दिन से जुड़े हैं; किसान और ग्रामीण सर्पदंश से रक्षा की मान्यता से तांती बांधते हैं।', shortDescriptionEn: 'Remembrance of Veer Tejaji on Bhadrapada Shukla Dashami — the Kharnal and Parbatsar (Nagaur) cattle fairs are tied to this day, and farmers and villagers tie the protective tanti thread against snakebite.', searchTerms: ['teja dashami', 'teja dashmi', 'tejaji', 'veer teja', 'parbatsar', 'kharnal'], kathaId: 'teja-dashami-katha', sourceUrl: RajasthanTourismUrl }),
  festival({ id: 'anant-chaturdashi', nameHi: 'अनंत चतुर्दशी', nameEn: 'Anant Chaturdashi', lunarMonth: 6, paksha: 'shukla', tithi: 14, arcId: 'ganesh-utsav', arcRole: 'visarjan', arcOrdinal: 10, marker: 'dot', category: 'vrat', deityHi: 'भगवान विष्णु', deityEn: 'Lord Vishnu', kathaId: 'anant-chaturdashi-vrat-katha', bhogId: 'anant-chaturdashi-bhog' }),
  festival({ id: 'navratri-start', nameHi: 'नवरात्रि प्रारंभ', nameEn: 'Navratri Begins', lunarMonth: 7, paksha: 'shukla', tithi: 1, arcId: 'sharad-navratri', arcRole: 'sthapana', arcOrdinal: 1, marker: 'star', deityHi: 'मां दुर्गा', deityEn: 'Maa Durga', linkSectionId: 'durga-stotram', kathaId: 'navratri-start-katha', vidhiId: 'navratri-ghatasthapana', bhogId: 'navratri-bhog' }),
  festival({ id: 'dussehra', nameHi: 'दशहरा', nameEn: 'Dussehra', lunarMonth: 7, paksha: 'shukla', tithi: 10, arcId: 'sharad-navratri', arcRole: 'visarjan', arcOrdinal: 10, marker: 'star', deityHi: 'श्री राम', deityEn: 'Shri Ram', linkSectionId: 'ram-stuti', kathaId: 'dussehra-katha' }),
  festival({ id: 'sharad-purnima', nameHi: 'शरद पूर्णिमा', nameEn: 'Sharad Purnima', lunarMonth: 7, paksha: 'shukla', tithi: 15, marker: 'dot', deityHi: 'चंद्र देव', deityEn: 'Chandra Deva', kathaId: 'sharad-purnima-vrat-katha' }),
  festival({ id: 'kojagara-puja', nameHi: 'कोजागरा पूजा', nameEn: 'Kojagara Puja', lunarMonth: 7, paksha: 'shukla', tithi: 15, marker: 'dot', category: 'vrat', deityHi: 'मां लक्ष्मी', deityEn: 'Maa Lakshmi', kathaId: 'sharad-purnima-vrat-katha', bhogId: 'kojagara-bhog' }),
  festival({ id: 'karwa-chauth', nameHi: 'करवा चौथ', nameEn: 'Karwa Chauth', lunarMonth: 8, paksha: 'krishna', tithi: 4, dayRule: 'chandrodaya', marker: 'star', category: 'vrat', deityHi: 'मां गौरी', deityEn: 'Maa Gauri', kathaId: 'karwa-chauth-vrat-katha', vidhiId: 'karwa-chauth-puja', upvasId: 'karwa-chauth-upvas', bhogId: 'karwa-chauth-bhog' }),
  festival({ id: 'ahoi-ashtami', nameHi: 'अहोई अष्टमी', nameEn: 'Ahoi Ashtami', lunarMonth: 8, paksha: 'krishna', tithi: 8, marker: 'dot', category: 'vrat', deityHi: 'अहोई माता', deityEn: 'Ahoi Mata', kathaId: 'ahoi-ashtami-vrat-katha', bhogId: 'ahoi-ashtami-bhog' }),
  festival({ id: 'dhanteras', nameHi: 'धनतेरस', nameEn: 'Dhanteras', lunarMonth: 8, paksha: 'krishna', tithi: 13, arcId: 'deepavali', arcRole: 'day', arcOrdinal: 1, marker: 'dot', deityHi: 'धन्वंतरि देव', deityEn: 'Dhanvantari Deva', kathaId: 'dhanteras-legends' }),
  // Kartika Krishna Chaturdashi — Naraka Chaturdashi, and in the Telugu, Kannada
  // and Tamil reckoning the day of Hanuman's birth. A SECOND rule, never a moved
  // one: the app also ships the Chaitra Purnima `hanuman-jayanti`, and both are
  // correct for different households (PRD-42 locked decision ⑥ / RULEBOOK §23.9).
  // Published: 8 Nov 2026 (BankBazaar "Naraka Chaturdashi 2026", 99Pandit;
  // Wikipedia "Hanuman Jayanti" for the Kartika Krishna Chaturdashi reckoning).
  festival({ id: 'hanuman-jayanti-kartik', nameHi: 'हनुमान जयंती (कार्तिक)', nameEn: 'Hanuman Jayanti (Kartik)', lunarMonth: 8, paksha: 'krishna', tithi: 14, marker: 'dot', deityHi: 'हनुमान जी', deityEn: 'Hanuman Ji', linkSectionId: 'hanuman-chalisa', shortDescriptionHi: 'कार्तिक कृष्ण चतुर्दशी को हनुमान जयंती — आंध्र, तेलंगाना, कर्नाटक और तमिलनाडु की परंपरा में हनुमान जी का जन्म दिवस, जो नरक चतुर्दशी की ही तिथि है। उत्तर भारत की चैत्र पूर्णिमा वाली हनुमान जयंती अलग तिथि है और दोनों अपने-अपने क्षेत्र में शास्त्रसम्मत हैं।', shortDescriptionEn: 'Hanuman Jayanti on Kartika Krishna Chaturdashi — the birth day of Hanuman Ji in the Andhra, Telangana, Karnataka and Tamil reckoning, falling on the same tithi as Naraka Chaturdashi. The North Indian Chaitra Purnima Hanuman Jayanti is a different date, and both are correct in their own tradition.', searchTerms: ['hanuman jayanti', 'hanumath jayanti', 'hanuman jayanthi kartik', 'naraka chaturdashi hanuman', 'telugu hanuman jayanti'] }),
  festival({ id: 'diwali', nameHi: 'दीपावली', nameEn: 'Diwali', lunarMonth: 8, paksha: 'krishna', tithi: 15, arcId: 'deepavali', arcRole: 'day', arcOrdinal: 3, marker: 'star', deityHi: 'मां लक्ष्मी', deityEn: 'Maa Lakshmi', kathaId: 'diwali-legends', vidhiId: 'diwali-lakshmi-ganesh-puja', bhogId: 'diwali-lakshmi-bhog' }),
  festival({ id: 'govardhan-puja', nameHi: 'गोवर्धन पूजा', nameEn: 'Govardhan Puja', lunarMonth: 8, paksha: 'shukla', tithi: 1, arcId: 'deepavali', arcRole: 'day', arcOrdinal: 4, marker: 'star', deityHi: 'श्री कृष्ण', deityEn: 'Shri Krishna', kathaId: 'govardhan-puja-katha' }),
  festival({ id: 'bhai-dooj', nameHi: 'भाई दूज', nameEn: 'Bhai Dooj', lunarMonth: 8, paksha: 'shukla', tithi: 2, arcId: 'deepavali', arcRole: 'day', arcOrdinal: 5, marker: 'star', kathaId: 'bhai-dooj-katha' }),
  // Kartika Shukla Dwitiya — Yama Dwitiya, the same day as Bhai Dooj. Published:
  // 11 Nov 2026 (Drik "Chitragupta Puja", 99Pandit).
  festival({ id: 'chitragupta-puja', nameHi: 'चित्रगुप्त पूजा', nameEn: 'Chitragupta Puja', lunarMonth: 8, paksha: 'shukla', tithi: 2, marker: 'dot', deityHi: 'भगवान चित्रगुप्त', deityEn: 'Bhagwan Chitragupta', shortDescriptionHi: 'कार्तिक शुक्ल द्वितीया (यम द्वितीया) को चित्रगुप्त पूजा — कलम, दवात और बही-खाते का पूजन; बिहार, झारखंड और उत्तर प्रदेश के कायस्थ समाज में इसी दिन भगवान चित्रगुप्त की उपासना होती है।', shortDescriptionEn: 'Chitragupta Puja on Kartika Shukla Dwitiya (Yama Dwitiya) — the pen, the inkpot and the ledgers are worshipped; the Kayastha community of Bihar, Jharkhand and Uttar Pradesh honours Bhagwan Chitragupta on this day.', searchTerms: ['chitragupta puja', 'chitragupt', 'kalam dawat', 'dawat puja', 'kayastha', 'yama dwitiya'] }),
  festival({ id: 'chhath-puja', nameHi: 'छठ पूजा', nameEn: 'Chhath Puja', lunarMonth: 8, paksha: 'shukla', tithi: 6, marker: 'dot', category: 'upavas', deityHi: 'सूर्य देव', deityEn: 'Surya Deva', kathaId: 'chhath-puja-katha', bhogId: 'chhath-bhog' }),
  // Kartika Shukla Saptami — Mithila's Sama Chakeva OPENS here and is immersed on
  // Kartik Purnima; only the opening day is a tithi rule. Sources: Wikipedia
  // (Sama Chakeva), utsav.gov.in, Bihar Museum folklore note.
  festival({ id: 'sama-chakeva', nameHi: 'सामा-चकेवा', nameEn: 'Sama Chakeva', lunarMonth: 8, paksha: 'shukla', tithi: 7, marker: 'dot', deityHi: 'लोक परंपरा', deityEn: 'Folk tradition', shortDescriptionHi: 'कार्तिक शुक्ल सप्तमी से सामा-चकेवा — मिथिला में बहन-भाई के स्नेह का लोकपर्व; मिट्टी की सामा, चकेवा और चुगला की मूर्तियां बनाकर गीत गाए जाते हैं और कार्तिक पूर्णिमा को विसर्जन होता है।', shortDescriptionEn: 'Sama Chakeva begins on Kartika Shukla Saptami — Mithila’s folk festival of the bond between sister and brother; clay figures of Sama, Chakeva and Chugla are made and sung to, and immersed on Kartik Purnima.', searchTerms: ['sama chakeva', 'sama chakeba', 'mithila', 'maithil', 'bhai bahan'], sourceUrl: BiharTourismUrl }),
  festival({ id: 'dev-uthani-ekadashi', nameHi: 'देव उठनी एकादशी', nameEn: 'Dev Uthani Ekadashi', lunarMonth: 8, paksha: 'shukla', tithi: 11, marker: 'dot', category: 'vrat', deityHi: 'श्री विष्णु', deityEn: 'Shri Vishnu', linkSectionId: 'vishnu-sahasranama', kathaId: 'kartika-mahatmya', bhogId: 'ekadashi-food' }),
  festival({ id: 'tulasi-vivah', nameHi: 'तुलसी विवाह', nameEn: 'Tulasi Vivah', lunarMonth: 8, paksha: 'shukla', tithi: 12, marker: 'dot', deityHi: 'तुलसी माता', deityEn: 'Tulasi Mata', kathaId: 'kartika-mahatmya' }),
  // Kartika Shukla Ashtami — the cow-and-calf day of Braj, when the calves are
  // first taken to graze and Krishna becomes a gopa. Published: 17 Nov 2026
  // (BhaktiBharat "Gopashtami", Drik "Gopashtami"; 99Pandit concurs).
  festival({ id: 'gopashtami', nameHi: 'गोपाष्टमी', nameEn: 'Gopashtami', lunarMonth: 8, paksha: 'shukla', tithi: 8, marker: 'dot', deityHi: 'श्री कृष्ण व गौ माता', deityEn: 'Shri Krishna and Gau Mata', shortDescriptionHi: 'कार्तिक शुक्ल अष्टमी को गोपाष्टमी — वह दिन जब श्री कृष्ण ने पहली बार गायों को चराने वन भेजा और गोप कहलाए। गौ माता और बछड़ों का श्रृंगार कर पूजन, परिक्रमा और गोग्रास अर्पण किया जाता है; मथुरा, वृंदावन और समस्त ब्रज में यह बड़ा उत्सव है।', shortDescriptionEn: 'Gopashtami on Kartika Shukla Ashtami — the day Shri Krishna first took the cows out to graze and became a gopa. Cows and calves are adorned and worshipped, circumambulated and offered the gograsa; Mathura, Vrindavan and all of Braj keep it as a great festival.', searchTerms: ['gopashtami', 'gopastami', 'gau puja', 'braj', 'vrindavan', 'krishna gopa'] }),
  festival({ id: 'akshaya-navami', nameHi: 'अक्षय नवमी', nameEn: 'Akshaya Navami', lunarMonth: 8, paksha: 'shukla', tithi: 9, marker: 'dot', category: 'vrat', kathaId: 'akshaya-navami-katha', bhogId: 'akshaya-navami-bhog' }),
  // Kartika Purnima — Tripurari Purnima / Dev Deepawali, the close of Kartik snan.
  // Published: 24 Nov 2026 (Drik "Kartik Purnima", SmartPuja). The monthly
  // `purnima-vrat` already fires on this tithi; the named festival did not exist.
  festival({ id: 'kartik-purnima', nameHi: 'कार्तिक पूर्णिमा', nameEn: 'Kartik Purnima', lunarMonth: 8, paksha: 'shukla', tithi: 15, marker: 'star', deityHi: 'भगवान शिव व श्री विष्णु', deityEn: 'Lord Shiva and Shri Vishnu', shortDescriptionHi: 'कार्तिक पूर्णिमा — त्रिपुरारी पूर्णिमा और देव दीपावली; कार्तिक स्नान और दीपदान का समापन दिवस। पुष्कर (राजस्थान) और सोनपुर (बिहार) के मेले तथा मिथिला का सामा-चकेवा विसर्जन इसी तिथि पर होते हैं।', shortDescriptionEn: 'Kartik Purnima — Tripurari Purnima and Dev Deepawali, the closing day of the Kartik snan and the lamp offerings. The Pushkar (Rajasthan) and Sonepur (Bihar) fairs and Mithila’s Sama Chakeva immersion all fall on this tithi.', searchTerms: ['kartik purnima', 'kartika purnima', 'dev deepawali', 'dev diwali', 'tripurari purnima', 'pushkar mela', 'sonepur mela', 'kartik snan'] }),
  festival({ id: 'vivah-panchami', nameHi: 'विवाह पंचमी', nameEn: 'Vivah Panchami', lunarMonth: 9, paksha: 'shukla', tithi: 5, marker: 'dot', deityHi: 'सीता राम', deityEn: 'Sita Ram', kathaId: 'vivah-panchami-katha' }),
  // Margashirsha Shukla Shashthi — the ANNUAL Skanda Shashthi, and so the same day
  // as that month's `skanda-sashti` in the monthly series (RULEBOOK §23.4 sibling,
  // asserted in observanceDates.test.ts). Champa Shashthi in Maharashtra is
  // Khandoba's; Subrahmanya Shashthi in Karnataka is Kukke Subramanya's.
  // Published: 15 Dec 2026 (BhaktiBharat "Champa Shashthi", mpanchang).
  festival({ id: 'champa-shashthi', nameHi: 'चंपा षष्ठी', nameEn: 'Champa Shashthi', lunarMonth: 9, paksha: 'shukla', tithi: 6, marker: 'dot', deityHi: 'खंडोबा व भगवान कार्तिकेय', deityEn: 'Khandoba and Lord Kartikeya', shortDescriptionHi: 'मार्गशीर्ष शुक्ल षष्ठी को चंपा षष्ठी — महाराष्ट्र में खंडोबा जी का और कर्नाटक में सुब्रह्मण्य षष्ठी के रूप में भगवान कार्तिकेय का पर्व; जेजुरी (पुणे) और कुक्के सुब्रह्मण्य के मंदिरों में छह दिन के उत्सव का समापन इसी दिन होता है। यह मार्गशीर्ष मास की स्कंद षष्ठी ही है।', shortDescriptionEn: 'Champa Shashthi on Margashirsha Shukla Shashthi — Khandoba’s festival in Maharashtra and, as Subrahmanya Shashthi, Lord Kartikeya’s in Karnataka; the six-day utsav at Jejuri (Pune) and Kukke Subramanya concludes on this day. It is Margashirsha’s own Skanda Shashthi.', searchTerms: ['champa shashthi', 'champa sashti', 'skanda shashthi', 'subrahmanya shashthi', 'khandoba', 'jejuri', 'kukke subramanya'] }),
  festival({ id: 'gita-jayanti', nameHi: 'गीता जयंती', nameEn: 'Gita Jayanti', lunarMonth: 9, paksha: 'shukla', tithi: 11, marker: 'dot', deityHi: 'श्री कृष्ण', deityEn: 'Shri Krishna', linkSectionId: 'bhagavad-gita', kathaId: 'gita-jayanti-katha' }),
  festival({ id: 'dattatreya-jayanti', nameHi: 'दत्तात्रेय जयंती', nameEn: 'Dattatreya Jayanti', lunarMonth: 9, paksha: 'shukla', tithi: 15, marker: 'dot', deityHi: 'भगवान दत्तात्रेय', deityEn: 'Lord Dattatreya', kathaId: 'dattatreya-jayanti-katha' }),

  // ── Pan-India jayantis and named days (Sept 2026 gap sweep) ──────────────
  //
  // A sweep of the standard pan-Hindu festival list (Drik, the Sri Mandir
  // calendar) against this catalog found these absent for EVERYONE — not a
  // regional gap, so no lens (RULEBOOK §23a.5). Every one is a plain lunar-tithi
  // rule; none needed engine work. Each is pinned to its published civil date in
  // observanceDates.test.ts (SECTION_A_PUBLISHED) and, where it shares a tithi
  // with a shipped rule, asserted against it (§23a.4).
  //
  // Four Vishnu-avatar jayantis carry `dayRule: 'aparahna'`: Drik publishes an
  // AFTERNOON puja window for Varaha, Matsya, Kalki and Hayagriva Jayanti and
  // fixes the day by that window, not by the sunrise tithi. It is load-bearing for
  // two of them — Varaha 2026 (Tritiya 07:08 AM 13 Sep → 07:06 AM 14 Sep) and
  // Hayagriva 2026 (Purnima 09:08 AM 27 Aug → 09:48 AM 28 Aug) are both the day
  // BEFORE their sunrise tithi — and a no-op for the other two in 2025–2027.
  //
  // Held back, and why (§23a.11 — a rule whose engine date disagrees with its
  // published date does not ship):
  //   • Lalita Panchami — published 26 Sep 2025 (Drik) vs the sunrise Panchami
  //     of 27 Sep; 2026 agrees. One matching year is not a convention.
  //   • Durga Ashtami / Maha Navami (Sharad) — published sources split 18 vs 19
  //     Oct 2026 (Ashtami) and 19 vs 20 Oct (Navami); Drik's own date unread.
  //   • Vaikuntha Chaturdashi — nishita-vyapini, which the engine does not model,
  //     and a single source for 2026.
  //   • Balarama Jayanti (Bhadrapada S6, Drik) — distinct from Hal Shashthi
  //     below; sources give three dates across three traditions.
  //   • Gayatri Jayanti, Ramanuja Jayanti — the tithi itself is contested
  //     (Jyeshtha S11 vs Shravana S15; a nakshatra reckoning).
  //   • Sarva Pitru / Mahalaya Amavasya — already surfaced by Pitru Paksha
  //     (`pitruSmaran.ts`); a rule would put the day on the calendar twice.

  // ▸ Vishnu's avatars

  // Chaitra Shukla Tritiya — Gangaur's tithi, but read at aparahna rather than
  // sunrise, so the two are NOT siblings (they split by a day in 2028–2031).
  // Published: 21 Mar 2026 (Drik "Matsya Jayanti", BhaktiBharat; puja 1:29–3:54 PM).
  festival({ id: 'matsya-jayanti', nameHi: 'मत्स्य जयंती', nameEn: 'Matsya Jayanti', lunarMonth: 1, paksha: 'shukla', tithi: 3, dayRule: 'aparahna', marker: 'dot', deityHi: 'भगवान मत्स्य', deityEn: 'Lord Matsya', shortDescriptionHi: 'चैत्र शुक्ल तृतीया को भगवान विष्णु के प्रथम अवतार, मत्स्य भगवान की जयंती — जिन्होंने प्रलय के जल से मनु, सप्तर्षियों और वेदों की रक्षा की। अपराह्न में विष्णु पूजन और मत्स्य पुराण का पाठ होता है।', shortDescriptionEn: 'The jayanti of Lord Matsya, Vishnu’s first avatar, on Chaitra Shukla Tritiya — who carried Manu, the Saptarishis and the Vedas through the waters of the deluge. Vishnu puja in the afternoon and a reading from the Matsya Purana mark it.', searchTerms: ['matsya jayanti', 'matsya avatar', 'dashavatar', 'vishnu avatar', 'fish avatar'] }),
  // Vaishakha Purnima — the Buddha Purnima day (sibling, asserted). Published:
  // 1 May 2026 (Drik "Kurma Jayanti", tirthayatra.org) and 12 May 2025 (Drik;
  // Purnima 08:01 PM 11 May → 10:25 PM 12 May). Drik's window is sayahna, which
  // the sunrise Purnima has matched in both years, so it stays udaya.
  festival({ id: 'kurma-jayanti', nameHi: 'कूर्म जयंती', nameEn: 'Kurma Jayanti', lunarMonth: 2, paksha: 'shukla', tithi: 15, marker: 'dot', deityHi: 'भगवान कूर्म', deityEn: 'Lord Kurma', shortDescriptionHi: 'वैशाख पूर्णिमा को भगवान विष्णु के द्वितीय अवतार, कूर्म भगवान की जयंती — समुद्र मंथन में मंदराचल पर्वत को अपनी पीठ पर धारण करने वाले। संध्या में विष्णु पूजन होता है; आंध्र प्रदेश का श्रीकूर्मम् मंदिर इसका प्रमुख धाम है।', shortDescriptionEn: 'The jayanti of Lord Kurma, Vishnu’s second avatar, on Vaishakha Purnima — the tortoise who bore Mount Mandara on his back at the churning of the ocean. Vishnu puja is offered at dusk; the Srikurmam temple in Andhra Pradesh is his great shrine.', searchTerms: ['kurma jayanti', 'koorma jayanti', 'kurma avatar', 'dashavatar', 'srikurmam', 'tortoise avatar'] }),
  // Bhadrapada Shukla Tritiya — the Hartalika Teej tithi. `aparahna` is
  // load-bearing: Tritiya runs 07:08 AM 13 Sep → 07:06 AM 14 Sep 2026, so the
  // sunrise rule names the 14th and Drik's afternoon window names the 13th.
  // Published: 13 Sep 2026 (Drik "Varaha Jayanti", Boldsky).
  festival({ id: 'varaha-jayanti', nameHi: 'वराह जयंती', nameEn: 'Varaha Jayanti', lunarMonth: 6, paksha: 'shukla', tithi: 3, dayRule: 'aparahna', marker: 'dot', deityHi: 'भगवान वराह', deityEn: 'Lord Varaha', shortDescriptionHi: 'भाद्रपद शुक्ल तृतीया को भगवान विष्णु के तृतीय अवतार, वराह भगवान की जयंती — जिन्होंने हिरण्याक्ष का वध कर पृथ्वी को रसातल से अपने दांतों पर उठाया। अपराह्न में वराह-विष्णु पूजन होता है; मथुरा का आदि वराह और तिरुमला का भू-वराह मंदिर इसके प्रमुख धाम हैं।', shortDescriptionEn: 'The jayanti of Lord Varaha, Vishnu’s third avatar, on Bhadrapada Shukla Tritiya — the boar who slew Hiranyaksha and raised the Earth from the depths on his tusks. Varaha–Vishnu puja is offered in the afternoon; the Adi Varaha temple in Mathura and Tirumala’s Bhu Varaha shrine keep it.', searchTerms: ['varaha jayanti', 'varah jayanti', 'varaha avatar', 'dashavatar', 'bhu varaha', 'boar avatar'] }),
  // Bhadrapada Shukla Dwadashi — the day after Parivartini Ekadashi. Published:
  // 23 Sep 2026 (Drik "Vamana Jayanti", hindutone.com; Dwadashi 09:43 PM 22 Sep
  // → 10:50 PM 23 Sep, prevailing at sunrise).
  festival({ id: 'vamana-jayanti', nameHi: 'वामन जयंती', nameEn: 'Vamana Jayanti', lunarMonth: 6, paksha: 'shukla', tithi: 12, marker: 'dot', deityHi: 'भगवान वामन', deityEn: 'Lord Vamana', shortDescriptionHi: 'भाद्रपद शुक्ल द्वादशी को भगवान विष्णु के पांचवें अवतार, वामन भगवान की जयंती — जिन्होंने राजा बलि से तीन पग भूमि मांगकर तीनों लोक नाप लिए। श्रवण नक्षत्र के साथ पड़ने पर इसका विशेष महत्त्व है; केरल में यही कथा ओणम की है।', shortDescriptionEn: 'The jayanti of Lord Vamana, Vishnu’s fifth avatar, on Bhadrapada Shukla Dwadashi — who asked King Bali for three paces of land and measured the three worlds. It is held especially sacred when it falls with Shravana nakshatra; in Kerala the same story is Onam’s.', searchTerms: ['vamana jayanti', 'vaman jayanti', 'vamana dwadashi', 'vamana avatar', 'dashavatar', 'raja bali', 'trivikrama'] }),
  // Shravana Shukla Shashthi. Published: 18 Aug 2026 (Drik "Kalki Jayanti",
  // BhaktiBharat; Shashthi 5:00 PM 17 Aug → 5:50 PM 18 Aug; Drik's afternoon
  // window 04:21–05:50 PM, clipped by the tithi's end).
  festival({ id: 'kalki-jayanti', nameHi: 'कल्कि जयंती', nameEn: 'Kalki Jayanti', lunarMonth: 5, paksha: 'shukla', tithi: 6, dayRule: 'aparahna', marker: 'dot', deityHi: 'भगवान कल्कि', deityEn: 'Lord Kalki', shortDescriptionHi: 'श्रावण शुक्ल षष्ठी को भगवान विष्णु के भावी दसवें अवतार, कल्कि भगवान की जयंती — जो कलियुग के अंत में धर्म की पुनः स्थापना के लिए प्रकट होंगे। अपराह्न में विष्णु पूजन होता है।', shortDescriptionEn: 'The jayanti of Lord Kalki, the tenth avatar of Vishnu still to come, on Shravana Shukla Shashthi — who will appear at the end of the Kali Yuga to restore dharma. Vishnu puja is offered in the afternoon.', searchTerms: ['kalki jayanti', 'kalki avatar', 'dashavatar', 'kalki dwadashi'] }),
  // Shravana Purnima. `aparahna` is load-bearing: Purnima runs 09:08 AM 27 Aug →
  // 09:48 AM 28 Aug 2026, and Drik's afternoon window (04:14–06:48 PM, New
  // Delhi) names the 27th. It therefore does NOT ride Raksha Bandhan / Avani
  // Avittam, which are sunrise-Purnima rules (28 Aug) — two conventions, two
  // days, exactly as Drik publishes them. Published: 27 Aug 2026 (Drik
  // "Hayagriva Jayanti", DKScore; daivakshetra.com gives the sunrise 28th).
  festival({ id: 'hayagriva-jayanti', nameHi: 'हयग्रीव जयंती', nameEn: 'Hayagriva Jayanti', lunarMonth: 5, paksha: 'shukla', tithi: 15, dayRule: 'aparahna', marker: 'dot', deityHi: 'भगवान हयग्रीव', deityEn: 'Lord Hayagriva', shortDescriptionHi: 'श्रावण पूर्णिमा को भगवान हयग्रीव की जयंती — ज्ञान और विद्या के अधिदेवता, विष्णु का अश्वमुख रूप, जिन्होंने मधु-कैटभ से वेदों को वापस लाया। दक्षिण भारत की वैष्णव परंपरा में विद्यार्थी इस दिन विशेष पूजन करते हैं।', shortDescriptionEn: 'The jayanti of Lord Hayagriva on Shravana Purnima — the horse-headed form of Vishnu, lord of knowledge and learning, who recovered the Vedas from Madhu and Kaitabha. In the South Indian Vaishnava tradition students keep it with a special puja.', searchTerms: ['hayagriva jayanti', 'hayagreeva jayanti', 'hayagriva', 'vidya', 'vishnu avatar'] }),
  // Bhadrapada Krishna Shashthi (purnimant; Shravana Krishna in amanta).
  // Published: 2 Sep 2026 (Drik "Hala Shashthi", Boldsky; Shashthi 6:12 AM 2 Sep
  // → 4:25 AM 3 Sep). Drik keeps Balarama Jayanti as a SEPARATE observance on
  // Bhadrapada Shukla Shashthi, so this rule does not carry that name.
  festival({ id: 'hal-shashthi', nameHi: 'हलषष्ठी · ललही छठ', nameEn: 'Hal Shashthi', lunarMonth: 6, paksha: 'krishna', tithi: 6, marker: 'dot', deityHi: 'भगवान बलराम', deityEn: 'Lord Balarama', shortDescriptionHi: 'भाद्रपद कृष्ण षष्ठी को हलषष्ठी — हलधर बलराम जी का पर्व, जिसे पूर्वी उत्तर प्रदेश, बिहार और मध्य प्रदेश में ललही छठ या हरछठ कहते हैं। माताएं संतान की दीर्घायु के लिए व्रत रखती हैं और हल से जुती भूमि का अन्न नहीं खातीं — पसही के चावल और भैंस का दूध-दही ही लेती हैं।', shortDescriptionEn: 'Hal Shashthi on Bhadrapada Krishna Shashthi — the festival of Balarama, bearer of the plough, kept in eastern Uttar Pradesh, Bihar and Madhya Pradesh as Lalahi Chhath or Harchhath. Mothers fast for their children’s long life and eat nothing grown on ploughed land — only pasahi rice and buffalo milk and curd.', searchTerms: ['hal shashthi', 'hal shashti', 'halshashthi', 'lalahi chhath', 'lalhi chhath', 'harchhath', 'har chhath', 'balram', 'haldhar'] }),

  // ▸ Saints and acharyas

  // Vaishakha Shukla Panchami. Published: 21 Apr 2026 (Drik "Kavi Surdas
  // Jayanti", newspress.co.in) and 2 May 2025 (Free Press Journal).
  festival({ id: 'surdas-jayanti', nameHi: 'सूरदास जयंती', nameEn: 'Surdas Jayanti', lunarMonth: 2, paksha: 'shukla', tithi: 5, marker: 'dot', deityHi: 'संत सूरदास', deityEn: 'Sant Surdas', shortDescriptionHi: 'वैशाख शुक्ल पंचमी को भक्त कवि सूरदास की जयंती — सूरसागर के रचयिता और अष्टछाप के प्रमुख कवि, जिनके पदों में बालकृष्ण की लीलाएं गाई जाती हैं। ब्रज और पुष्टिमार्गीय मंदिरों में सूर के पदों का कीर्तन होता है।', shortDescriptionEn: 'The jayanti of the poet-saint Surdas on Vaishakha Shukla Panchami — author of the Sursagar and foremost of the Ashtachhap poets, whose padas sing the child Krishna’s lilas. Braj and the Pushtimarg temples keep it with kirtan of his verses.', searchTerms: ['surdas jayanti', 'soordas jayanti', 'surdas', 'sursagar', 'ashtachhap'] }),
  // Vaishakha Shukla Panchami — the Surdas Jayanti day (sibling, asserted).
  // Published: 21 Apr 2026 (Drik "Adi Shankaracharya Jayanti", Belur Math) and
  // 2 May 2025 (Drik).
  festival({ id: 'shankaracharya-jayanti', nameHi: 'आदि शंकराचार्य जयंती', nameEn: 'Adi Shankaracharya Jayanti', lunarMonth: 2, paksha: 'shukla', tithi: 5, marker: 'dot', deityHi: 'आदि शंकराचार्य', deityEn: 'Adi Shankaracharya', shortDescriptionHi: 'वैशाख शुक्ल पंचमी को आदि शंकराचार्य की जयंती — अद्वैत वेदांत के आचार्य, जिन्होंने चारों दिशाओं में मठ स्थापित किए। कालड़ी (केरल), शृंगेरी, द्वारका, पुरी और ज्योतिर्मठ में विशेष पूजन और भाष्य-पाठ होता है।', shortDescriptionEn: 'The jayanti of Adi Shankaracharya on Vaishakha Shukla Panchami — the teacher of Advaita Vedanta who founded the mathas of the four directions. Kalady in Kerala, Sringeri, Dwarka, Puri and Jyotirmath keep it with puja and readings from his bhashyas.', searchTerms: ['shankaracharya jayanti', 'adi shankaracharya jayanti', 'shankara jayanti', 'adi shankara', 'advaita', 'kalady', 'sringeri'] }),
  // Shravana Shukla Saptami. Published: 19 Aug 2026 (Drik "Goswami Tulsidas
  // Jayanti", Dainik Jagran; Saptami 5:50 PM 18 Aug → 7:19 PM 19 Aug).
  festival({ id: 'tulsidas-jayanti', nameHi: 'तुलसीदास जयंती', nameEn: 'Tulsidas Jayanti', lunarMonth: 5, paksha: 'shukla', tithi: 7, marker: 'dot', deityHi: 'गोस्वामी तुलसीदास', deityEn: 'Goswami Tulsidas', linkSectionId: 'ramcharitmanas', shortDescriptionHi: 'श्रावण शुक्ल सप्तमी को गोस्वामी तुलसीदास की जयंती — श्रीरामचरितमानस और हनुमान चालीसा के रचयिता। रामचरितमानस का पाठ, राम कथा और मानस के दोहा-चौपाई का गायन इस दिन के मुख्य कर्म हैं; काशी और चित्रकूट में विशेष आयोजन होते हैं।', shortDescriptionEn: 'The jayanti of Goswami Tulsidas on Shravana Shukla Saptami — author of the Shri Ramcharitmanas and the Hanuman Chalisa. Recitation of the Manas, Rama katha and the singing of its dohas and chaupais mark the day, with special gatherings in Kashi and Chitrakoot.', searchTerms: ['tulsidas jayanti', 'tulsi das jayanti', 'goswami tulsidas', 'ramcharitmanas', 'manas'] }),
  // Ashvina Purnima. Published: 26 Oct 2026 (Drik "Maharishi Valmiki Jayanti",
  // BhaktiBharat, NationalToday; Purnima 11:55 AM 25 Oct → 09:41 AM 26 Oct).
  // It is the sunrise Purnima, the same reading as the shipped `sharad-purnima`
  // (sibling, asserted).
  festival({ id: 'valmiki-jayanti', nameHi: 'वाल्मीकि जयंती', nameEn: 'Valmiki Jayanti', lunarMonth: 7, paksha: 'shukla', tithi: 15, marker: 'dot', deityHi: 'महर्षि वाल्मीकि', deityEn: 'Maharishi Valmiki', linkSectionId: 'valmiki-ramayan', shortDescriptionHi: 'आश्विन पूर्णिमा को आदिकवि महर्षि वाल्मीकि की जयंती (प्रगट दिवस) — श्रीमद् वाल्मीकि रामायण के रचयिता। शोभायात्रा, रामायण पाठ और वाल्मीकि मंदिरों में विशेष पूजन होता है; पंजाब, हरियाणा और उत्तर भारत में यह बड़े उत्सव के रूप में मनाई जाती है।', shortDescriptionEn: 'The jayanti (Pragat Divas) of Maharishi Valmiki, the Adi Kavi and author of the Valmiki Ramayana, on Ashvina Purnima. Processions, Ramayana readings and puja at Valmiki temples mark it, and Punjab, Haryana and North India keep it as a major utsav.', searchTerms: ['valmiki jayanti', 'valmiki pragat divas', 'maharishi valmiki', 'adi kavi', 'ramayana'] }),

  // ▸ Devi jayantis and sampradaya days

  // Vaishakha Krishna Ekadashi (purnimant) — the Varuthini Ekadashi day, so it
  // must ride `varuthini-ekadashi` (sibling, asserted). Published: 13 Apr 2026
  // (Drik "Shri Vallabhacharya Jayanti", Oneindia; Ekadashi 01:16 AM 13 Apr →
  // 01:08 AM 14 Apr, prevailing at sunrise).
  festival({ id: 'vallabhacharya-jayanti', nameHi: 'वल्लभाचार्य जयंती', nameEn: 'Vallabhacharya Jayanti', lunarMonth: 2, paksha: 'krishna', tithi: 11, marker: 'dot', deityHi: 'श्री वल्लभाचार्य', deityEn: 'Shri Vallabhacharya', shortDescriptionHi: 'वैशाख कृष्ण एकादशी को पुष्टिमार्ग के प्रवर्तक श्री वल्लभाचार्य का प्राकट्य दिवस — वरूथिनी एकादशी का ही दिन। नाथद्वारा, गोकुल और पुष्टिमार्गीय हवेलियों में श्रीनाथजी का विशेष श्रृंगार और उत्सव होता है।', shortDescriptionEn: 'The appearance day of Shri Vallabhacharya, founder of the Pushtimarg, on Vaishakha Krishna Ekadashi — the Varuthini Ekadashi day. Nathdwara, Gokul and the Pushtimarg havelis keep it with Shrinathji’s special shringar and utsav.', searchTerms: ['vallabhacharya jayanti', 'vallabh jayanti', 'vallabhacharya', 'pushtimarg', 'shrinathji', 'nathdwara', 'mahaprabhuji'] }),
  // Jyeshtha Purnima. Published: 29 Jun 2026 (Drik "Sant Kabir Jayanti",
  // NationalToday; Purnima 03:06 AM 29 Jun → 05:26 AM 30 Jun). Rides the
  // Jyeshtha `purnima-vrat` day (asserted).
  festival({ id: 'kabir-jayanti', nameHi: 'कबीर जयंती', nameEn: 'Kabir Jayanti', lunarMonth: 3, paksha: 'shukla', tithi: 15, marker: 'dot', deityHi: 'संत कबीर', deityEn: 'Sant Kabir', shortDescriptionHi: 'ज्येष्ठ पूर्णिमा को संत कबीरदास का प्राकट्य दिवस — काशी के लहरतारा और कबीर चौरा में सत्संग, और देश भर के कबीरपंथी समाज में उनकी साखियों व भजनों का गायन होता है।', shortDescriptionEn: 'The appearance day of Sant Kabirdas on Jyeshtha Purnima — marked with satsang at Lahartara and Kabir Chaura in Kashi, and the singing of his sakhis and bhajans across the Kabirpanthi community.', searchTerms: ['kabir jayanti', 'kabirdas jayanti', 'sant kabir', 'kabir das', 'kabirpanth', 'jyeshtha purnima'] }),
  // Vaishakha Shukla Ashtami. Published: 24 Apr 2026 (Drik "Bagalamukhi
  // Jayanti", BhaktiBharat; Ashtami prevailing at sunrise on the 24th).
  festival({ id: 'baglamukhi-jayanti', nameHi: 'बगलामुखी जयंती', nameEn: 'Baglamukhi Jayanti', lunarMonth: 2, paksha: 'shukla', tithi: 8, marker: 'dot', deityHi: 'मां बगलामुखी', deityEn: 'Maa Baglamukhi', shortDescriptionHi: 'वैशाख शुक्ल अष्टमी को दस महाविद्याओं में आठवीं, पीताम्बरा मां बगलामुखी की जयंती — पीले वस्त्र, पीले पुष्प और हल्दी की माला से पूजन होता है। दतिया का पीताम्बरा पीठ और नलखेड़ा (मध्य प्रदेश) इसके प्रमुख धाम हैं।', shortDescriptionEn: 'The jayanti of Pitambara Maa Baglamukhi, the eighth of the ten Mahavidyas, on Vaishakha Shukla Ashtami — worshipped in yellow, with yellow flowers and a turmeric mala. The Pitambara Peeth at Datia and Nalkheda in Madhya Pradesh are her great shrines.', searchTerms: ['baglamukhi jayanti', 'bagalamukhi jayanti', 'pitambara', 'mahavidya', 'datia', 'nalkheda'] }),
  // Vaishakha Shukla Chaturdashi — the Narasimha Jayanti day (sibling,
  // asserted). Published: 30 Apr 2026 (Drik "Chhinnamasta Jayanti",
  // Rudraksha-Ratna; Chaturdashi 07:51 PM 29 Apr → 09:12 PM 30 Apr).
  festival({ id: 'chhinnamasta-jayanti', nameHi: 'छिन्नमस्ता जयंती', nameEn: 'Chhinnamasta Jayanti', lunarMonth: 2, paksha: 'shukla', tithi: 14, marker: 'dot', deityHi: 'मां छिन्नमस्ता', deityEn: 'Maa Chhinnamasta', shortDescriptionHi: 'वैशाख शुक्ल चतुर्दशी को दस महाविद्याओं में छठी, मां छिन्नमस्ता की जयंती — नरसिंह जयंती का ही दिन। झारखंड के रजरप्पा का छिन्नमस्तिका मंदिर इसका प्रमुख शक्तिपीठ है।', shortDescriptionEn: 'The jayanti of Maa Chhinnamasta, the sixth of the ten Mahavidyas, on Vaishakha Shukla Chaturdashi — the Narasimha Jayanti day. The Chhinnamastika temple at Rajrappa in Jharkhand is her great shrine.', searchTerms: ['chhinnamasta jayanti', 'chinnamasta jayanti', 'chhinnamastika', 'rajrappa', 'mahavidya'] }),
  // Jyeshtha Shukla Ashtami. Published: 22 Jun 2026 (Drik "Dhumavati
  // Jayanti", BhaktiBharat; Ashtami 03:20 PM 21 Jun → 03:39 PM 22 Jun, and both
  // name the sunrise Ashtami as the rule).
  festival({ id: 'dhumavati-jayanti', nameHi: 'धूमावती जयंती', nameEn: 'Dhumavati Jayanti', lunarMonth: 3, paksha: 'shukla', tithi: 8, marker: 'dot', deityHi: 'मां धूमावती', deityEn: 'Maa Dhumavati', shortDescriptionHi: 'ज्येष्ठ शुक्ल अष्टमी को दस महाविद्याओं में सातवीं, मां धूमावती की जयंती — दरिद्रता, रोग और शत्रु-बाधा के निवारण के लिए उनकी उपासना की जाती है; दतिया के पीताम्बरा पीठ में उनका प्रसिद्ध मंदिर है।', shortDescriptionEn: 'The jayanti of Maa Dhumavati, the seventh of the ten Mahavidyas, on Jyeshtha Shukla Ashtami — worshipped for release from poverty, illness and adversity; her best-known shrine stands in the Pitambara Peeth at Datia.', searchTerms: ['dhumavati jayanti', 'dhoomavati jayanti', 'dhumavati', 'mahavidya', 'datia'] }),
  // Jyeshtha Shukla Navami. Published: 23 Jun 2026 (Drik "Mahesh Navami",
  // BhaktiBharat; Navami 03:39 PM 22 Jun → 04:39 PM 23 Jun).
  festival({ id: 'mahesh-navami', nameHi: 'महेश नवमी', nameEn: 'Mahesh Navami', lunarMonth: 3, paksha: 'shukla', tithi: 9, marker: 'dot', deityHi: 'भगवान महेश', deityEn: 'Bhagwan Mahesh', shortDescriptionHi: 'ज्येष्ठ शुक्ल नवमी को महेश नवमी — माहेश्वरी समाज का उत्पत्ति दिवस, जब भगवान शिव के वरदान से उनके पूर्वजों को नया जीवन मिला। शिव-पार्वती का पूजन, शोभायात्रा और सामाजिक आयोजन होते हैं।', shortDescriptionEn: 'Mahesh Navami on Jyeshtha Shukla Navami — the founding day of the Maheshwari community, whose ancestors were restored to life by Shiva’s boon. Shiva–Parvati puja, processions and community gatherings mark it.', searchTerms: ['mahesh navami', 'maheshwari', 'maheshwari samaj', 'shiv parvati'] }),
  // Margashirsha Purnima — the Dattatreya Jayanti day (sibling, asserted).
  // Published: 23 Dec 2026 and 4 Dec 2025 (Drik "Annapurna Jayanti",
  // BhaktiBharat; panchang.org for 2025).
  festival({ id: 'annapurna-jayanti', nameHi: 'अन्नपूर्णा जयंती', nameEn: 'Annapurna Jayanti', lunarMonth: 9, paksha: 'shukla', tithi: 15, marker: 'dot', deityHi: 'मां अन्नपूर्णा', deityEn: 'Maa Annapurna', shortDescriptionHi: 'मार्गशीर्ष पूर्णिमा को मां अन्नपूर्णा की जयंती — अन्न और पोषण की देवी, जिन्होंने काशी में स्वयं शिव को भिक्षा दी। रसोई की स्वच्छता, चूल्हे का पूजन और अन्नदान इस दिन के कर्म हैं; काशी के अन्नपूर्णा मंदिर में विशेष उत्सव होता है।', shortDescriptionEn: 'The jayanti of Maa Annapurna on Margashirsha Purnima — the goddess of food and nourishment, who gave alms to Shiva himself in Kashi. The kitchen is cleaned, the hearth worshipped and food given away; Kashi’s Annapurna temple keeps a great utsav.', searchTerms: ['annapurna jayanti', 'annapoorna jayanti', 'annapurna', 'margashirsha purnima', 'kashi annapurna'] }),
  // Magha Shukla Saptami — the Ratha Saptami day (sibling, asserted).
  // Published: 25 Jan 2026 (Drik "Narmada Jayanti", DKScore; Saptami 12:39 AM
  // → 11:10 PM on the 25th).
  festival({ id: 'narmada-jayanti', nameHi: 'नर्मदा जयंती', nameEn: 'Narmada Jayanti', lunarMonth: 11, paksha: 'shukla', tithi: 7, marker: 'dot', deityHi: 'मां नर्मदा', deityEn: 'Maa Narmada', shortDescriptionHi: 'माघ शुक्ल सप्तमी को मां नर्मदा का प्राकट्य दिवस — रथ सप्तमी का ही दिन। अमरकंटक, ओंकारेश्वर, जबलपुर के ग्वारीघाट और होशंगाबाद में स्नान, दीपदान और नर्मदा आरती होती है।', shortDescriptionEn: 'The appearance day of Maa Narmada on Magha Shukla Saptami — the Ratha Saptami day. Amarkantak, Omkareshwar, Jabalpur’s Gwarighat and Narmadapuram keep it with the holy bath, the lamp offering and the Narmada aarti.', searchTerms: ['narmada jayanti', 'narmada', 'rewa', 'amarkantak', 'omkareshwar', 'gwarighat'] }),
  // Phalguna Krishna Ashtami (purnimant; Magha Krishna in amanta) — a Kalashtami
  // day in the monthly series (asserted). Published: 9 Feb 2026 (Drik "Janaki
  // Jayanti", India TV; Ashtami from 05:01 AM on the 9th). Distinct from
  // Vaishakha's `sita-navami`: two traditions, two days (§23.9).
  festival({ id: 'janaki-jayanti', nameHi: 'जानकी जयंती', nameEn: 'Janaki Jayanti', lunarMonth: 12, paksha: 'krishna', tithi: 8, marker: 'dot', deityHi: 'माता सीता', deityEn: 'Mata Sita', shortDescriptionHi: 'फाल्गुन कृष्ण अष्टमी को जानकी जयंती (सीता अष्टमी) — माता सीता का प्राकट्य दिवस इस परंपरा में; सुहागिन स्त्रियां व्रत रखकर सीता-राम का पूजन करती हैं। वैशाख शुक्ल नवमी की सीता नवमी दूसरी परंपरा का दिन है, और दोनों अपने-अपने क्षेत्र में मान्य हैं।', shortDescriptionEn: 'Janaki Jayanti (Sita Ashtami) on Phalguna Krishna Ashtami — Mata Sita’s appearance day in this reckoning, kept by married women with a fast and Sita–Rama puja. Vaishakha Shukla Navami’s Sita Navami is the other tradition’s day, and both are correct where they are kept.', searchTerms: ['janaki jayanti', 'sita ashtami', 'sita jayanti', 'janaki', 'mata sita'] }),
  // Phalguna Shukla Dwitiya. Published: 19 Feb 2026 (Drik "Phulera Dooj", Free
  // Press Journal; Dwitiya 04:57 PM 18 Feb → 03:58 PM 19 Feb).
  festival({ id: 'phulera-dooj', nameHi: 'फुलेरा दूज', nameEn: 'Phulera Dooj', lunarMonth: 12, paksha: 'shukla', tithi: 2, marker: 'dot', deityHi: 'श्री राधा-कृष्ण', deityEn: 'Shri Radha-Krishna', shortDescriptionHi: 'फाल्गुन शुक्ल द्वितीया को फुलेरा दूज — ब्रज में फूलों की होली का दिन, जब ठाकुर जी को फूलों से श्रृंगारित कर होली के उत्सव का आरंभ होता है। अबूझ मुहूर्त माना जाने के कारण उत्तर भारत में विवाह के लिए भी प्रसिद्ध है।', shortDescriptionEn: 'Phulera Dooj on Phalguna Shukla Dwitiya — Braj’s day of the flower Holi, when Thakurji is adorned with flowers and the Holi season opens. Held to be an abujh (self-auspicious) day, it is also a favoured wedding date across North India.', searchTerms: ['phulera dooj', 'phulera duj', 'phoolon ki holi', 'braj holi', 'abujh muhurat'] }),

  // ▸ Named days of the calendar

  // Kartika Krishna Chaturdashi (purnimant) — the abhyanga-snan morning before
  // Lakshmi Puja. The same tithi as `hanuman-jayanti-kartik` (sibling, asserted),
  // whose published day has tracked the udaya Chaturdashi in every year checked.
  // Published: 8 Nov 2026 (Drik "Abhyang Snan on Narak Chaturdashi", snan 05:41–
  // 06:38 AM; muhuratchoghadiya.com). A rule rather than only the `deepavali`
  // arc's gap label, so the day carries its own card, search and follow.
  festival({ id: 'narak-chaturdashi', nameHi: 'नरक चतुर्दशी', nameEn: 'Narak Chaturdashi', lunarMonth: 8, paksha: 'krishna', tithi: 14, marker: 'dot', deityHi: 'श्री कृष्ण व यमराज', deityEn: 'Shri Krishna and Yamaraja', shortDescriptionHi: 'कार्तिक कृष्ण चतुर्दशी को नरक चतुर्दशी — छोटी दीवाली, रूप चौदस। श्री कृष्ण द्वारा नरकासुर वध का स्मरण; सूर्योदय से पहले तिल-तेल से अभ्यंग स्नान, और संध्या में यमराज के लिए दीपदान किया जाता है।', shortDescriptionEn: 'Narak Chaturdashi on Kartika Krishna Chaturdashi — Choti Diwali, Roop Chaudas — remembering Shri Krishna’s slaying of Narakasura. The abhyanga bath with sesame oil before sunrise, and the evening lamp offered to Yamaraja, are the day’s rites.', searchTerms: ['narak chaturdashi', 'naraka chaturdashi', 'choti diwali', 'chhoti diwali', 'roop chaudas', 'roop chaturdashi', 'kali chaudas', 'abhyang snan', 'yam deepam', 'narakasura'] }),
  // Margashirsha Krishna Ashtami (purnimant; Kartika Krishna in amanta) — a
  // `masik-kalashtami` day (asserted). Published: 12 Nov 2025 (Drik; Ashtami
  // 11:08 PM 11 Nov → 10:58 PM 12 Nov) and 1 Dec 2026 (BhaktiBharat, 99Pandit;
  // Ashtami 12:11 AM → 11:13 PM on the 1st).
  festival({ id: 'kaal-bhairav-jayanti', nameHi: 'काल भैरव जयंती', nameEn: 'Kaal Bhairav Jayanti', lunarMonth: 9, paksha: 'krishna', tithi: 8, marker: 'dot', deityHi: 'काल भैरव', deityEn: 'Kala Bhairava', shortDescriptionHi: 'मार्गशीर्ष कृष्ण अष्टमी को काल भैरव जयंती (कालभैरव अष्टमी) — भगवान शिव के उग्र रूप काल भैरव का प्राकट्य दिवस, जो काशी के कोतवाल हैं। रात्रि जागरण, भैरव अष्टक का पाठ और काले श्वान को भोजन कराना इस दिन के कर्म हैं; काशी और उज्जैन के भैरव मंदिरों में विशेष उत्सव होता है।', shortDescriptionEn: 'Kaal Bhairav Jayanti (Kalabhairav Ashtami) on Margashirsha Krishna Ashtami — the appearance day of Kala Bhairava, Shiva’s fierce form and the kotwal of Kashi. A night vigil, the Bhairava Ashtakam and feeding a black dog mark it, with great utsavs at the Bhairava temples of Kashi and Ujjain.', searchTerms: ['kaal bhairav jayanti', 'kalabhairav jayanti', 'kal bhairav ashtami', 'bhairav ashtami', 'kalashtami', 'bhairava'] }),
  // Magha Amavasya (purnimant Magha Krishna 15) — an
  // `amavasya-vrat` day (asserted). Published: 18 Jan 2026 (Drik "Mauni
  // Amavasya", narayanseva.org; Amavasya 12:03 AM 18 Jan → 01:21 AM 19 Jan).
  festival({ id: 'mauni-amavasya', nameHi: 'मौनी अमावस्या', nameEn: 'Mauni Amavasya', lunarMonth: 11, paksha: 'krishna', tithi: 15, marker: 'dot', deityHi: 'पवित्र स्नान', deityEn: 'Sacred snan', shortDescriptionHi: 'माघ अमावस्या को मौनी अमावस्या — माघ मास का सबसे पवित्र स्नान दिवस। मौन रहकर गंगा या संगम में स्नान, दान और पितृ तर्पण किया जाता है; प्रयागराज के माघ मेले और कुंभ में यही प्रमुख स्नान पर्व है।', shortDescriptionEn: 'Mauni Amavasya on Magha Amavasya — the holiest bathing day of Magha. The bath in the Ganga or at the Sangam is taken in silence, with daan and pitru tarpan; it is the principal snan of Prayagraj’s Magh Mela and of the Kumbh.', searchTerms: ['mauni amavasya', 'mauni amavas', 'magha amavasya', 'maghi amavasya', 'magh mela', 'sangam snan', 'kumbh snan'] }),
  // Magha Shukla Chaturthi, `madhyahna` — Drik's Ganesha puja is madhyahna,
  // the convention the shipped `ganesh-chaturthi` and monthly
  // `vinayaka-chaturthi-vrat` already carry, so this rides the latter
  // (asserted). Published: 22 Jan 2026 (Drik "Ganesha Jayanti", Prokerala;
  // Chaturthi 2:47 AM 22 Jan → 2:28 AM 23 Jan).
  festival({ id: 'ganesh-jayanti', nameHi: 'गणेश जयंती', nameEn: 'Ganesh Jayanti', lunarMonth: 11, paksha: 'shukla', tithi: 4, dayRule: 'madhyahna', marker: 'dot', deityHi: 'श्री गणेश', deityEn: 'Shri Ganesh', linkSectionId: 'ganesh-chalisa', shortDescriptionHi: 'माघ शुक्ल चतुर्थी को गणेश जयंती — तिलकुंद या माघी गणेश चतुर्थी, इस परंपरा में श्री गणेश का जन्म दिवस। मध्याह्न में गणेश पूजन, तिल के लड्डू का भोग और व्रत किया जाता है; महाराष्ट्र और कोंकण में यह बड़े उत्सव के रूप में मनाई जाती है।', shortDescriptionEn: 'Ganesh Jayanti on Magha Shukla Chaturthi — Tilkund or Maghi Ganesh Chaturthi, Shri Ganesh’s birth day in this reckoning. Ganesha puja at midday, an offering of sesame laddoos and a fast mark it; Maharashtra and the Konkan keep it as a major utsav.', searchTerms: ['ganesh jayanti', 'ganesha jayanti', 'maghi ganesh', 'magha ganesh chaturthi', 'tilkund chaturthi', 'tilkunda chaturthi', 'varad chaturthi'] }),
  // Magha Shukla Ashtami, `madhyahna` — Drik fixes the tarpan day by the
  // madhyahna window (11:44 AM – 01:58 PM). Published: 26 Jan 2026 (Drik
  // "Bhishma Ashtami", Prokerala; Ashtami 11:10 PM 25 Jan → 09:17 PM 26 Jan).
  festival({ id: 'bhishma-ashtami', nameHi: 'भीष्म अष्टमी', nameEn: 'Bhishma Ashtami', lunarMonth: 11, paksha: 'shukla', tithi: 8, dayRule: 'madhyahna', marker: 'dot', deityHi: 'पितामह भीष्म', deityEn: 'Pitamah Bhishma', shortDescriptionHi: 'माघ शुक्ल अष्टमी को भीष्म अष्टमी — पितामह भीष्म का निर्वाण दिवस, जिन्होंने उत्तरायण की प्रतीक्षा में शरशय्या पर प्राण त्यागे। मध्याह्न में भीष्म के निमित्त तिल-जल से तर्पण किया जाता है।', shortDescriptionEn: 'Bhishma Ashtami on Magha Shukla Ashtami — the nirvana day of Pitamah Bhishma, who gave up his life on the bed of arrows after waiting for Uttarayana. Tarpan with sesame and water is offered in his name at midday.', searchTerms: ['bhishma ashtami', 'bheeshma ashtami', 'bhishma tarpan', 'bhishma nirvana'] }),
  // Magha Purnima — the Magha `purnima-vrat` day (asserted). Published: 1 Feb
  // 2026 (Drik "Magha Purnima", daanyam.in; Purnima 05:52 AM 1 Feb → 03:38 AM
  // 2 Feb).
  festival({ id: 'magha-purnima', nameHi: 'माघ पूर्णिमा', nameEn: 'Magha Purnima', lunarMonth: 11, paksha: 'shukla', tithi: 15, marker: 'dot', deityHi: 'पवित्र स्नान', deityEn: 'Sacred snan', shortDescriptionHi: 'माघ पूर्णिमा — माघ स्नान और प्रयागराज के कल्पवास का समापन दिवस। संगम व पवित्र नदियों में स्नान, दान और सत्यनारायण पूजन किया जाता है; संत रविदास जयंती भी इसी दिन मनाई जाती है।', shortDescriptionEn: 'Magha Purnima — the closing day of the Magha snan and of the Kalpavas at Prayagraj. The bath at the Sangam and the sacred rivers, daan and the Satyanarayan puja mark it, and Sant Ravidas Jayanti is kept on the same day.', searchTerms: ['magha purnima', 'maghi purnima', 'magh purnima', 'kalpavas', 'ravidas jayanti', 'guru ravidas'] }),
  // Ashadha Shukla Pratipada. Published: 15 Jul 2026 (Prokerala "Ashadha Gupta
  // Navratri", ending 23 Jul; Drik lists the ghatasthapana on its Ashadha page).
  festival({ id: 'ashadha-gupt-navratri', nameHi: 'आषाढ़ गुप्त नवरात्रि प्रारंभ', nameEn: 'Ashadha Gupt Navratri Begins', lunarMonth: 4, paksha: 'shukla', tithi: 1, marker: 'dot', deityHi: 'दस महाविद्या', deityEn: 'The ten Mahavidyas', shortDescriptionHi: 'आषाढ़ शुक्ल प्रतिपदा से गुप्त नवरात्रि — वर्ष की चार नवरात्रियों में से एक, जिसमें घटस्थापना कर नौ दिन दस महाविद्याओं की गुप्त साधना की जाती है। यह तांत्रिक और शाक्त साधकों की नवरात्रि है।', shortDescriptionEn: 'Gupt Navratri from Ashadha Shukla Pratipada — one of the year’s four Navratris, opened with ghatasthapana and given to nine days of quiet sadhana of the ten Mahavidyas. It is the Navratri of the Shakta and tantric practitioner.', searchTerms: ['gupt navratri', 'gupta navratri', 'ashadha navratri', 'ashadha gupt navratri', 'mahavidya', 'ghatasthapana'] }),
  // Magha Shukla Pratipada. Published: 19 Jan 2026 (India TV, AstroSage;
  // Pratipada 01:21 AM 19 Jan → 02:14 AM 20 Jan).
  festival({ id: 'magha-gupt-navratri', nameHi: 'माघ गुप्त नवरात्रि प्रारंभ', nameEn: 'Magha Gupt Navratri Begins', lunarMonth: 11, paksha: 'shukla', tithi: 1, marker: 'dot', deityHi: 'दस महाविद्या', deityEn: 'The ten Mahavidyas', shortDescriptionHi: 'माघ शुक्ल प्रतिपदा से गुप्त नवरात्रि — घटस्थापना के साथ नौ दिन दस महाविद्याओं की गुप्त साधना; इसी नवरात्रि की पंचमी वसंत पंचमी है।', shortDescriptionEn: 'Gupt Navratri from Magha Shukla Pratipada — nine days of quiet sadhana of the ten Mahavidyas, opened with ghatasthapana; its Panchami is Vasant Panchami.', searchTerms: ['gupt navratri', 'gupta navratri', 'magha navratri', 'magh gupt navratri', 'mahavidya', 'ghatasthapana'] }),


  // ── Tamil & Malayalam observances — nakshatra in a sidereal solar month ──
  //
  // These are grouped rather than filed by lunar month because they HAVE no lunar
  // month: the Tamil and Malayalam calendars count solar months (Karthigai =
  // Vrischika, Thai = Makara, Panguni = Meena, Karkidakam = Karka), and the
  // observance is the day a named nakshatra prevails inside one of them. The
  // matcher is `matchesNakshatraRuleOnDate`; `nakshatra` is 0-indexed from Ashwini
  // and `solarMonth` 0-indexed from Mesha (types.ts pins both).
  //
  // They ship UNIVERSAL — `default` with no `lens` — and that stays right now that
  // wave 2 exists. RULEBOOK §23a.5: a lens is additive metadata on a rule that
  // would otherwise not ship at all, never a retagging of something already
  // universal, and these are whole states' observances whose descriptions already
  // name the state. That is the wave-1 precedent (Goga Navami, Teja Dashami, Sama
  // Chakeva all shipped universal). Only a rule that would be genuine NOISE for
  // everyone earns a lens.
  //
  // Onam is deliberately ABSENT. It needs this solver AND a 10-day arc AND the
  // vyapini convention PRD-42 leaves open (sunrise-prevailing Thiruvonam vs the
  // nakshatra's own peak — almanacs differ, and the wrong choice moves Onam for
  // every Malayali household). It ships when that decision is made, not before.

  // Krittika in Vrischika — the beacon on Arunachala. Distinct from the monthly
  // `karthigai-vrat`, which is the same nakshatra unconstrained by solar month.
  // Published: 24 Nov 2026 (karthigaideepam.com, astrospeaks; both name the Tamil
  // month Karthigai, 17 Nov – 15 Dec 2026, as solar Vrischika).
  festival({ id: 'karthigai-deepam', nameHi: 'कार्तिगई दीपम', nameEn: 'Karthigai Deepam', ruleType: 'nakshatra', nakshatra: 2, solarMonth: 7, marker: 'star', deityHi: 'भगवान शिव व मुरुगन', deityEn: 'Lord Shiva and Murugan', shortDescriptionHi: 'वृश्चिक सौर मास (तमिल कार्तिगई) की कृत्तिका नक्षत्र तिथि को कार्तिगई दीपम — तमिलनाडु का दीप पर्व; तिरुवण्णामलै की अरुणाचल पहाड़ी पर विशाल महादीपम प्रज्वलित होता है और घर-घर दीप पंक्तियां सजती हैं। शिव के अनंत ज्योतिर्लिंग स्वरूप का स्मरण इस पर्व का मूल है।', shortDescriptionEn: 'Karthigai Deepam on the Krittika nakshatra of the Vrischika solar month (Tamil Karthigai) — Tamil Nadu’s festival of lamps. The great Mahadeepam is lit atop the Arunachala hill at Tiruvannamalai and rows of lamps are set out in every home, remembering Shiva as the endless column of light.', searchTerms: ['karthigai deepam', 'karthika deepam', 'kartika deepam', 'thirukarthigai', 'arunachala', 'tiruvannamalai', 'mahadeepam', 'tamil'], sourceUrl: TamilCalendarUrl }),
  // Pushya in Makara. Published: 1 Feb 2026 (Drik Tamil calendar 2026, Wikipedia
  // "Thaipusam"; read 2026-09-18).
  festival({ id: 'thai-pusam', nameHi: 'थै पूसम', nameEn: 'Thai Pusam', ruleType: 'nakshatra', nakshatra: 7, solarMonth: 9, marker: 'dot', deityHi: 'भगवान मुरुगन', deityEn: 'Lord Murugan', shortDescriptionHi: 'मकर सौर मास (तमिल थै) के पुष्य नक्षत्र पर थै पूसम — भगवान मुरुगन का पर्व, जिस दिन पार्वती ने उन्हें वेल शक्ति प्रदान की थी। पलनी और बटु गुफाओं सहित मुरुगन धामों में भक्त काँवड़ी लेकर पदयात्रा करते हैं; तमिलनाडु, मलेशिया, सिंगापुर और श्रीलंका में बड़े स्तर पर मनाया जाता है।', shortDescriptionEn: 'Thai Pusam on the Pushya nakshatra of the Makara solar month (Tamil Thai) — the festival of Lord Murugan, the day Parvati gave him the vel. Devotees walk in procession bearing the kavadi to Palani and the other Murugan shrines; kept on a great scale in Tamil Nadu, Malaysia, Singapore and Sri Lanka.', searchTerms: ['thai pusam', 'thaipusam', 'thaipoosam', 'murugan', 'kavadi', 'palani', 'batu caves', 'tamil'], sourceUrl: TamilCalendarUrl }),
  // Uttara Phalguni in Meena. Published: 1 Apr 2026 (Drik Tamil calendar 2026,
  // Wikipedia "Panguni Uthiram"; read 2026-09-18).
  festival({ id: 'panguni-uthiram', nameHi: 'पंगुनि उत्तिरम', nameEn: 'Panguni Uthiram', ruleType: 'nakshatra', nakshatra: 11, solarMonth: 11, marker: 'dot', deityHi: 'भगवान मुरुगन व शिव-पार्वती', deityEn: 'Lord Murugan and Shiva–Parvati', shortDescriptionHi: 'मीन सौर मास (तमिल पंगुनि) के उत्तर फाल्गुनी नक्षत्र पर पंगुनि उत्तिरम — दिव्य विवाहों का दिन; मुरुगन और देवसेना, शिव और पार्वती तथा राम और सीता के विवाह का स्मरण इसी दिन होता है। तमिलनाडु के मुरुगन और शिव मंदिरों में कल्याणोत्सव होता है।', shortDescriptionEn: 'Panguni Uthiram on the Uttara Phalguni nakshatra of the Meena solar month (Tamil Panguni) — the day of the divine marriages, remembering the weddings of Murugan and Devasena, Shiva and Parvati, and Rama and Sita. The Murugan and Shiva temples of Tamil Nadu keep the kalyanotsavam on it.', searchTerms: ['panguni uthiram', 'panguni uttiram', 'murugan', 'kalyanotsavam', 'tamil'], sourceUrl: TamilCalendarUrl }),
  // Vishakha in Vrishabha. Published: 30 May 2026 (Drik "Vaikasi Visakam" 2026,
  // astrobhava; both name the Tamil month Vaikasi as solar Vrishabha).
  festival({ id: 'vaikasi-visakam', nameHi: 'वैकासि विशाकम', nameEn: 'Vaikasi Visakam', ruleType: 'nakshatra', nakshatra: 15, solarMonth: 1, marker: 'dot', deityHi: 'भगवान मुरुगन', deityEn: 'Lord Murugan', shortDescriptionHi: 'वृषभ सौर मास (तमिल वैकासि) के विशाखा नक्षत्र पर वैकासि विशाकम — भगवान मुरुगन का अवतरण दिवस; तिरुचेंदूर, पलनी और स्वामिमलै सहित छहों पडैवीडु मंदिरों में अभिषेक और विशेष पूजा होती है। तमिलनाडु और श्रीलंका के मुरुगन भक्तों का प्रमुख पर्व है।', shortDescriptionEn: 'Vaikasi Visakam on the Vishakha nakshatra of the Vrishabha solar month (Tamil Vaikasi) — the appearance day of Lord Murugan, kept with the abhisheka and special puja at Tiruchendur, Palani, Swamimalai and the rest of the six Padaiveedu shrines. It is the principal festival of Murugan’s devotees in Tamil Nadu and Sri Lanka.', searchTerms: ['vaikasi visakam', 'vaikasi visakham', 'murugan', 'tiruchendur', 'palani', 'tamil'], sourceUrl: TamilCalendarUrl }),
  // Every POORAM (Purva Phalguni) observance is deliberately ABSENT, for the same
  // reason Onam is — an unresolved vyapini convention, not a missing solver:
  //   • Thrissur Pooram  — engine 27 Apr 2026, published 26 Apr.
  //   • Attukal Pongala  — engine  4 Mar 2026, published  3 Mar.
  // Two independent Malayalam rules failing by one day in the SAME direction is a
  // convention difference (the pooram observances are not fixed by the sunrise
  // nakshatra), and choosing one to make the arithmetic agree is exactly what
  // PRD-42 Open decision 6 says belongs in a convention doc.
  //   • Aadi Pooram — engine 18 Jul 2026, published 14 Aug. A different fault: a
  //     ~31-day solar month can contain Pooram TWICE, and the almanacs take the
  //     SECOND, which `recurrence: 'annual'` (first match wins) cannot express.
  //     Sources also disagree — Madurai Meenakshi and Nellaiappar keep the July
  //     one — so this is a two-conventions-two-rules case (§23.9), not a tweak.
  // The Tamil rules above all match their published dates to the day, so the
  // sunrise rule is right for them; the poorams need their own reading first.
  // Amavasya in Karka (Malayalam Karkidakam) — a LUNAR tithi narrowed by the solar
  // month, not a nakshatra rule; it therefore rides the shipped `amavasya-vrat`
  // series and must land on one of its days (asserted in observanceDates.test.ts).
  // Published: 12 Aug 2026 (Prokerala "Karkidaka Vavu", BankBazaar; amavasya
  // 01:53 AM → 11:06 PM).
  upavas({ id: 'karkidaka-vavu', nameHi: 'कर्किडक वावु', nameEn: 'Karkidaka Vavu', lunarMonth: undefined, paksha: 'krishna', tithi: 15, solarMonth: 3, recurrence: 'annual', marker: 'dot', deityHi: 'पितृ तर्पण', deityEn: 'Pitru Tarpana', shortDescriptionHi: 'कर्क सौर मास (मलयालम कर्किडकम) की अमावस्या को कर्किडक वावु — केरल का प्रमुख पितृ तर्पण दिवस; तिरुनेल्ली, तिरुवल्लम और आलुवा के तटों पर लाखों लोग बलि तर्पण करते हैं। कर्किडकम रामायण मास भी है, जिसमें प्रतिदिन अध्यात्म रामायणम का पाठ होता है।', shortDescriptionEn: 'Karkidaka Vavu on the amavasya of the Karka solar month (Malayalam Karkidakam) — Kerala’s principal day of pitru tarpana, when lakhs perform the bali tarpanam on the banks at Thirunelli, Thiruvallam and Aluva. Karkidakam is also the Ramayana month, read through daily from the Adhyatma Ramayanam.', searchTerms: ['karkidaka vavu', 'karkidaka vavu bali', 'vavu bali', 'bali tharpanam', 'karkidakam', 'kerala', 'pitru tarpan'], sourceUrl: MalayalamCalendarUrl, bhogId: 'pitru-offering' }),
];

export const EKADASHI_NAMES: { lunarMonth: number; paksha: Paksha; nameHi: string; nameEn: string }[] = [
  { lunarMonth: 1, paksha: 'shukla', nameHi: 'कामदा एकादशी', nameEn: 'Kamada Ekadashi' },
  { lunarMonth: 1, paksha: 'krishna', nameHi: 'वरूथिनी एकादशी', nameEn: 'Varuthini Ekadashi' },
  { lunarMonth: 2, paksha: 'shukla', nameHi: 'मोहिनी एकादशी', nameEn: 'Mohini Ekadashi' },
  { lunarMonth: 2, paksha: 'krishna', nameHi: 'अपरा एकादशी', nameEn: 'Apara Ekadashi' },
  { lunarMonth: 3, paksha: 'shukla', nameHi: 'निर्जला एकादशी', nameEn: 'Nirjala Ekadashi' },
  { lunarMonth: 3, paksha: 'krishna', nameHi: 'योगिनी एकादशी', nameEn: 'Yogini Ekadashi' },
  { lunarMonth: 4, paksha: 'shukla', nameHi: 'देवशयनी एकादशी', nameEn: 'Devshayani Ekadashi' },
  { lunarMonth: 4, paksha: 'krishna', nameHi: 'कामिका एकादशी', nameEn: 'Kamika Ekadashi' },
  { lunarMonth: 5, paksha: 'shukla', nameHi: 'पुत्रदा एकादशी', nameEn: 'Putrada Ekadashi' },
  { lunarMonth: 5, paksha: 'krishna', nameHi: 'अजा एकादशी', nameEn: 'Aja Ekadashi' },
  { lunarMonth: 6, paksha: 'shukla', nameHi: 'परिवर्तिनी एकादशी', nameEn: 'Parivartini Ekadashi' },
  { lunarMonth: 6, paksha: 'krishna', nameHi: 'इन्दिरा एकादशी', nameEn: 'Indira Ekadashi' },
  { lunarMonth: 7, paksha: 'shukla', nameHi: 'पापांकुशा एकादशी', nameEn: 'Papankusha Ekadashi' },
  { lunarMonth: 7, paksha: 'krishna', nameHi: 'रमा एकादशी', nameEn: 'Rama Ekadashi' },
  { lunarMonth: 8, paksha: 'shukla', nameHi: 'देव उठनी एकादशी', nameEn: 'Dev Uthani Ekadashi' },
  { lunarMonth: 8, paksha: 'krishna', nameHi: 'उत्पन्ना एकादशी', nameEn: 'Utpanna Ekadashi' },
  { lunarMonth: 9, paksha: 'shukla', nameHi: 'मोक्षदा एकादशी', nameEn: 'Mokshada Ekadashi' },
  { lunarMonth: 9, paksha: 'krishna', nameHi: 'सफला एकादशी', nameEn: 'Saphala Ekadashi' },
  { lunarMonth: 10, paksha: 'shukla', nameHi: 'पुत्रदा एकादशी', nameEn: 'Putrada Ekadashi' },
  { lunarMonth: 10, paksha: 'krishna', nameHi: 'षटतिला एकादशी', nameEn: 'Shattila Ekadashi' },
  { lunarMonth: 11, paksha: 'shukla', nameHi: 'जया एकादशी', nameEn: 'Jaya Ekadashi' },
  { lunarMonth: 11, paksha: 'krishna', nameHi: 'विजया एकादशी', nameEn: 'Vijaya Ekadashi' },
  { lunarMonth: 12, paksha: 'shukla', nameHi: 'आमलकी एकादशी', nameEn: 'Amalaki Ekadashi' },
  { lunarMonth: 12, paksha: 'krishna', nameHi: 'पापमोचनी एकादशी', nameEn: 'Papmochani Ekadashi' },
];

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/**
 * Regional names an Ekadashi is actually KNOWN BY in a region — the tithi is the
 * same, so these are search aliases on the generated rule, not new rules.
 * Bhadrapada Shukla Ekadashi is जलझूलनी / देव झूलनी ग्यारस across Rajasthan and
 * Malwa, and the Bundi/Mewar boat processions are held on it.
 */
const EKADASHI_EXTRA_SEARCH_TERMS: Record<string, string[]> = {
  'Parivartini Ekadashi': ['jaljhulani', 'jal jhulani', 'dev jhulni', 'devjhulni', 'jhulni gyaras', 'padma ekadashi', 'vaman ekadashi'],
  'Dev Uthani Ekadashi': ['dev uthani', 'devuthani', 'prabodhini ekadashi', 'gyaras', 'khatu shyam janmotsav'],
  'Mokshada Ekadashi': ['maun agiyaras', 'maun ekadashi'],
};

// Individual Ekadashi kathas, added incrementally. Names not listed here fall
// back to the shared generic `ekadashi-vrat-katha` until their own katha exists.
const EKADASHI_KATHA_BY_NAME: Record<string, string> = {
  'Utpanna Ekadashi': 'utpanna-ekadashi-katha',
  'Kamada Ekadashi': 'kamada-ekadashi-katha',
  'Varuthini Ekadashi': 'varuthini-ekadashi-katha',
  'Mohini Ekadashi': 'mohini-ekadashi-katha',
  'Apara Ekadashi': 'apara-ekadashi-katha',
  'Nirjala Ekadashi': 'nirjala-ekadashi-katha',
  'Yogini Ekadashi': 'yogini-ekadashi-katha',
  'Devshayani Ekadashi': 'devshayani-ekadashi-katha',
  'Kamika Ekadashi': 'kamika-ekadashi-katha',
  'Putrada Ekadashi': 'putrada-ekadashi-katha',
  'Aja Ekadashi': 'aja-ekadashi-katha',
  'Indira Ekadashi': 'indira-ekadashi-katha',
  'Mokshada Ekadashi': 'mokshada-ekadashi-katha',
  'Papankusha Ekadashi': 'papankusha-ekadashi-katha',
  'Parivartini Ekadashi': 'parivartini-ekadashi-katha',
  'Rama Ekadashi': 'rama-ekadashi-katha',
  'Amalaki Ekadashi': 'amalaki-ekadashi-katha',
  'Dev Uthani Ekadashi': 'dev-uthani-ekadashi-katha',
  'Jaya Ekadashi': 'jaya-ekadashi-katha',
  'Papmochani Ekadashi': 'papmochani-ekadashi-katha',
  'Saphala Ekadashi': 'saphala-ekadashi-katha',
  'Shattila Ekadashi': 'shattila-ekadashi-katha',
  'Vijaya Ekadashi': 'vijaya-ekadashi-katha',
};

export const EKADASHI_RULES: ObservanceRule[] = EKADASHI_NAMES.map((item) => vrat({
  id: slugify(item.nameEn),
  nameHi: item.nameHi,
  nameEn: item.nameEn,
  lunarMonth: item.lunarMonth,
  paksha: item.paksha,
  tithi: 11,
  marker: 'halfmoon',
  deityHi: 'श्री विष्णु',
  deityEn: 'Shri Vishnu',
  shortDescriptionHi: `${item.nameHi} विष्णु उपासना और एकादशी व्रत का दिन है।`,
  shortDescriptionEn: `${item.nameEn} is observed for Vishnu worship and Ekadashi vrat.`,
  linkSectionId: 'vishnu-sahasranama',
  kathaId: EKADASHI_KATHA_BY_NAME[item.nameEn] ?? 'ekadashi-vrat-katha',
  // The whole family shares one fasting entry; निर्जला's strictness differs, so
  // it carries its own (PRD-09/P4 §6.1) — same sharing as the generic katha.
  upvasId: item.nameEn === 'Nirjala Ekadashi' ? 'nirjala-ekadashi-upvas' : 'ekadashi-upvas',
  bhogId: item.nameEn === 'Nirjala Ekadashi' ? 'nirjala-ekadashi-food' : 'ekadashi-food',
  searchTerms: ['ekadashi', 'upavas', 'vishnu', ...(EKADASHI_EXTRA_SEARCH_TERMS[item.nameEn] ?? [])],
}));

export const MONTHLY_VRAT_RULES: ObservanceRule[] = [
  vrat({ id: 'sankashti-chaturthi-vrat', nameHi: 'संकष्टी चतुर्थी व्रत', nameEn: 'Sankashti Chaturthi Vrat', recurrence: 'monthly', paksha: 'krishna', tithi: 4, dayRule: 'chandrodaya', deityHi: 'श्री गणेश', deityEn: 'Shri Ganesh', linkSectionId: 'ganesh-chalisa', kathaId: 'sankashti-chaturthi-vrat-katha', upvasId: 'sankashti-chaturthi-upvas', bhogId: 'ganesha-bhog' }),
  vrat({ id: 'vinayaka-chaturthi-vrat', nameHi: 'शुक्ल चतुर्थी व्रत', nameEn: 'Shukla Chaturthi Vrat', recurrence: 'monthly', paksha: 'shukla', tithi: 4, dayRule: 'madhyahna', deityHi: 'श्री गणेश', deityEn: 'Shri Ganesh', linkSectionId: 'ganesh-chalisa', kathaId: 'ganesha-chaturthi-vrat-katha', bhogId: 'ganesha-bhog' }),
  vrat({ id: 'pradosh-vrat-shukla', nameHi: 'शुक्ल प्रदोष व्रत', nameEn: 'Shukla Pradosh Vrat', recurrence: 'monthly', paksha: 'shukla', tithi: 13, deityHi: 'भगवान शिव', deityEn: 'Lord Shiva', linkSectionId: 'shiv-chalisa', kathaId: 'pradosha-vrat-katha', upvasId: 'pradosh-upvas', bhogId: 'pradosh-bhog' }),
  vrat({ id: 'pradosh-vrat-krishna', nameHi: 'कृष्ण प्रदोष व्रत', nameEn: 'Krishna Pradosh Vrat', recurrence: 'monthly', paksha: 'krishna', tithi: 13, deityHi: 'भगवान शिव', deityEn: 'Lord Shiva', linkSectionId: 'shiv-chalisa', kathaId: 'pradosha-vrat-katha', upvasId: 'pradosh-upvas', bhogId: 'pradosh-bhog' }),
  vrat({ id: 'dwadashi-vrat-shukla', nameHi: 'शुक्ल द्वादशी व्रत', nameEn: 'Shukla Dwadashi Vrat', recurrence: 'monthly', paksha: 'shukla', tithi: 12, deityHi: 'श्री विष्णु', deityEn: 'Shri Vishnu', linkSectionId: 'vishnu-sahasranama', kathaId: 'dwadashi-vrat-katha', bhogId: 'dwadashi-bhog' }),
  vrat({ id: 'dwadashi-vrat-krishna', nameHi: 'कृष्ण द्वादशी व्रत', nameEn: 'Krishna Dwadashi Vrat', recurrence: 'monthly', paksha: 'krishna', tithi: 12, deityHi: 'श्री विष्णु', deityEn: 'Shri Vishnu', linkSectionId: 'vishnu-sahasranama', kathaId: 'dwadashi-vrat-katha', bhogId: 'dwadashi-bhog' }),
  vrat({ id: 'masik-shivaratri', nameHi: 'मासिक शिवरात्रि', nameEn: 'Masik Shivaratri', recurrence: 'monthly', paksha: 'krishna', tithi: 14, deityHi: 'भगवान शिव', deityEn: 'Lord Shiva', linkSectionId: 'shiv-chalisa', kathaId: 'maha-shivaratri-vrat-katha', bhogId: 'recurring-shiva-bhog' }),
  upavas({ id: 'purnima-vrat', nameHi: 'पूर्णिमा व्रत', nameEn: 'Purnima Vrat', recurrence: 'monthly', paksha: 'shukla', tithi: 15, deityHi: 'श्री विष्णु', deityEn: 'Shri Vishnu', kathaId: 'satyanarayana-vrat-katha', vidhiId: 'satyanarayan-puja', upvasId: 'purnima-satyanarayan-upvas', bhogId: 'satyanarayan-bhog' }),
  vrat({ id: 'shree-satyanarayan-vrat', nameHi: 'श्री सत्यनारायण व्रत', nameEn: 'Shree Satyanarayan Vrat', recurrence: 'monthly', paksha: 'shukla', tithi: 15, deityHi: 'श्री सत्यनारायण', deityEn: 'Shree Satyanarayan', linkSectionId: 'vishnu-sahasranama', kathaId: 'satyanarayana-vrat-katha', vidhiId: 'satyanarayan-puja', upvasId: 'purnima-satyanarayan-upvas', bhogId: 'satyanarayan-bhog' }),
  upavas({ id: 'amavasya-vrat', nameHi: 'अमावस्या व्रत', nameEn: 'Amavasya Vrat', recurrence: 'monthly', paksha: 'krishna', tithi: 15, deityHi: 'पितृ तर्पण', deityEn: 'Pitru Tarpana', kathaId: 'amavasya-vrat-katha', bhogId: 'pitru-offering' }),
  // दर्श अमावस्या is the SAME amavasya as `amavasya-vrat` read by the other published
  // convention, so §23.4's "siblings share a dayRule" does not apply here — the two
  // conventions ARE the distinction, and Drik publishes both rows. `amavasya-vrat`
  // stays udaya (the snan-daan day, which is also the day the tithi tile labels
  // अमावस्या); this one is aparahna-vyapini, because the पितृ तर्पण that defines it is
  // an afternoon rite. They coincide in 64 of the 99 lunations from 2024–2031 and
  // differ in the other 35, always by exactly one day.
  // Drik prints the two as separate rows and names them differently: the aparahna row
  // is "Darsha Amavasya" every month, the udaya row carries the lunar month
  // ("Bhadrapada Amavasya", "Ashwina Amavasya"). Published civil dates from
  // drikpanchang.com/vrats/amavasyadates.html (2026 list, read 2026-09-10) — a
  // differing pair, a COINCIDING day, and a second differing pair:
  //   Bhadrapada — amavasya 10 Sep 10:33 AM → 11 Sep 8:56 AM.
  //     Sep 10 "Darsha Amavasya"; Sep 11 "Bhadrapada Amavasya".
  //   Ashwina — amavasya 9 Oct 9:35 PM → 10 Oct 9:19 PM.
  //     Oct 10 carries BOTH "Darsha Amavasya" and "Ashwina Amavasya".
  //   Kartika — Nov 8 "Darsha Amavasya"; the udaya row is Nov 9.
  // Second reading (§23a.2): Chaitra 2026 — amavasya 18 Mar 8:25 AM → 19 Mar
  //   6:52 AM; दर्श अमावस्या 18 Mar, udaya Chaitra Amavasya + snan-daan muhurat
  //   19 Mar (indiatvnews.com/lifestyle/spirituality/march-amavasya-2026-…-1033995,
  //   retrieved 2026-09-10).
  upavas({ id: 'darsha-amavasya', nameHi: 'दर्श अमावस्या', nameEn: 'Darsha Amavasya', recurrence: 'monthly', paksha: 'krishna', tithi: 15, dayRule: 'aparahna', deityHi: 'पितृ तर्पण', deityEn: 'Pitru Tarpana', shortDescriptionHi: 'दर्श अमावस्या — वह दिन जिसके अपराह्न में अमावस्या तिथि व्याप्त रहती है; पितृ तर्पण, श्राद्ध और उपवास इसी दिन किए जाते हैं। जब अमावस्या सूर्योदय के बाद आरंभ होकर पूरा दिन रहती है, तब यह स्नान-दान अमावस्या से एक दिन पहले पड़ती है।', shortDescriptionEn: 'Darsha Amavasya — the day whose aparahna (afternoon) the Amavasya tithi covers; pitru tarpan, shraddha and the fast are kept on it. When the amavasya begins after sunrise and runs the rest of the day, it falls a day before the snan-daan Amavasya.', searchTerms: ['darsha amavasya', 'darsh amavasya', 'darsha amavas', 'darsh amavas', 'amavasya tarpan', 'pitru tarpan amavasya', 'darshavela amavasya'], kathaId: 'amavasya-vrat-katha', bhogId: 'pitru-offering' }),
  // The amavasya that falls on a Monday — the ONE day Soma (the moon) and the
  // pitru tithi coincide, and the only vrat in the catalog fixed by a weekday and
  // a tithi together. It is a narrowing of `amavasya-vrat`, not a rival to it: the
  // `weekday` constraint filters the days that rule already claimed, so Somvati is
  // always one of its days (asserted in observanceDates.test.ts) and never lands
  // on a Monday the amavasya vrat itself skipped for vriddhi. Recurs 1–3 times a
  // year, which is why it is `monthly` (collect every match) rather than `annual`.
  // Sources: drikpanchang.com/vrats/amavasyadates.html marks the Somvati rows;
  // Wikipedia "Amavasya" for the Monday-coincidence definition (read 2026-09-18).
  vrat({ id: 'somvati-amavasya', nameHi: 'सोमवती अमावस्या', nameEn: 'Somvati Amavasya', recurrence: 'monthly', paksha: 'krishna', tithi: 15, weekday: 1, deityHi: 'पितृ तर्पण व शिव', deityEn: 'Pitru Tarpana and Shiva', shortDescriptionHi: 'सोमवार को पड़ने वाली अमावस्या को सोमवती अमावस्या — वर्ष में केवल एक से तीन बार आती है। स्त्रियां अखंड सौभाग्य हेतु व्रत रखकर पीपल की परिक्रमा करती हैं; पितृ तर्पण, स्नान-दान और शिव अभिषेक इस दिन विशेष फलदायी माने जाते हैं।', shortDescriptionEn: 'Somvati Amavasya — the amavasya that falls on a Monday, which happens only one to three times a year. Women keep the fast and circumambulate the peepal for lasting marital well-being, and the pitru tarpana, the snan-daan and the Shiva abhisheka are held to be especially fruitful on it.', searchTerms: ['somvati amavasya', 'somwati amavasya', 'somvati amavas', 'monday amavasya', 'peepal parikrama'], kathaId: 'amavasya-vrat-katha', bhogId: 'pitru-offering' }),
  vrat({ id: 'skanda-sashti', nameHi: 'स्कंद षष्ठी', nameEn: 'Skanda Sashti', recurrence: 'monthly', paksha: 'shukla', tithi: 6, deityHi: 'भगवान कार्तिकेय', deityEn: 'Lord Kartikeya', kathaId: 'skanda-sashti-katha', bhogId: 'skanda-sashti-bhog' }),
  vrat({ id: 'masik-durgashtami', nameHi: 'मासिक दुर्गाष्टमी', nameEn: 'Masik Durgashtami', recurrence: 'monthly', paksha: 'shukla', tithi: 8, deityHi: 'मां दुर्गा', deityEn: 'Maa Durga', linkSectionId: 'durga-stotram', kathaId: 'masik-durgashtami-katha', bhogId: 'devi-vrat-bhog' }),
  vrat({ id: 'masik-kalashtami', nameHi: 'मासिक कालाष्टमी', nameEn: 'Masik Kalashtami', recurrence: 'monthly', paksha: 'krishna', tithi: 8, deityHi: 'काल भैरव', deityEn: 'Kala Bhairava', kathaId: 'masik-kalashtami-katha', bhogId: 'kalashtami-bhog' }),
  vrat({ id: 'masik-krishna-janmashtami', nameHi: 'मासिक कृष्ण जन्माष्टमी', nameEn: 'Masik Krishna Janmashtami', recurrence: 'monthly', paksha: 'krishna', tithi: 8, deityHi: 'श्री कृष्ण', deityEn: 'Shri Krishna', linkSectionId: 'bhagavad-gita', kathaId: 'masik-krishna-janmashtami-katha', bhogId: 'krishna-monthly-bhog' }),
  vrat({ id: 'sawan-somwar-vrat', nameHi: 'सावन सोमवार व्रत', nameEn: 'Sawan Somwar Vrat', recurrence: 'seasonal', ruleType: 'weekday-in-lunar-month', lunarMonth: 5, weekday: 1, deityHi: 'भगवान शिव', deityEn: 'Lord Shiva', linkSectionId: 'shiv-chalisa', kathaId: 'shravana-mahatmya', bhogId: 'recurring-shiva-bhog' }),
  vrat({ id: 'mangala-gauri-vrat', nameHi: 'मंगला गौरी व्रत', nameEn: 'Mangala Gauri Vrat', recurrence: 'seasonal', ruleType: 'weekday-in-lunar-month', lunarMonth: 5, weekday: 2, deityHi: 'मां गौरी', deityEn: 'Maa Gauri', kathaId: 'mangala-gauri-vrat-katha', bhogId: 'mangala-gauri-bhog' }),
  vrat({ id: 'varalakshmi-vrat', nameHi: 'वरलक्ष्मी व्रत', nameEn: 'Varalakshmi Vrat', recurrence: 'annual', ruleType: 'relative-to-lunar', lunarMonth: 5, paksha: 'shukla', tithi: 15, weekday: 5, relativeRule: 'friday-before-purnima', deityHi: 'मां लक्ष्मी', deityEn: 'Maa Lakshmi', kathaId: 'varalakshmi-vrat-katha', bhogId: 'varalakshmi-bhog' }),
  vrat({ id: 'vat-savitri-vrat', nameHi: 'वट सावित्री व्रत', nameEn: 'Vat Savitri Vrat', recurrence: 'annual', lunarMonth: 3, paksha: 'krishna', tithi: 15, deityHi: 'सावित्री माता', deityEn: 'Maa Savitri', kathaId: 'vat-savitri-vrat-katha', bhogId: 'vat-savitri-bhog' }),
  vrat({ id: 'jivitputrika-vrat', nameHi: 'जीवित्पुत्रिका व्रत', nameEn: 'Jivitputrika Vrat', recurrence: 'annual', lunarMonth: 7, paksha: 'krishna', tithi: 8, deityHi: 'जीवित्पुत्रिका माता', deityEn: 'Jivitputrika Mata', kathaId: 'jivitputrika-vrat-katha', bhogId: 'jivitputrika-bhog' }),
  vrat({ id: 'mahalakshmi-vrat', nameHi: 'महालक्ष्मी व्रत', nameEn: 'Mahalakshmi Vrat', recurrence: 'annual', lunarMonth: 6, paksha: 'shukla', tithi: 8, deityHi: 'मां लक्ष्मी', deityEn: 'Maa Lakshmi', kathaId: 'mahalakshmi-vrat-katha', bhogId: 'mahalakshmi-vrat-bhog' }),
];

export const ADVANCED_OBSERVANCE_RULES: ObservanceRule[] = [
  hidden({ id: 'mahadwadashi', nameHi: 'महाद्वादशी', nameEn: 'Mahadwadashi', searchTerms: ['dwadashi', 'advanced ekadashi'], bhogId: 'ekadashi-food' }),
  // Monthly Karthigai — the Krittika nakshatra of every solar month, unconstrained
  // (drikpanchang.com/vrats/masik-karthigai-dates.html). Was `recurrence: 'catalog'`
  // + `nakshatra: 3`, which resolved to nothing twice over: the matcher
  // short-circuits on `catalog`, and 3 is Rohini on the 0-indexed scale the engine
  // and `PanchangData.nakshatra.index` use — 1-indexed Krittika. Both fixed in #344.
  // PRD-42 W2 then retired `visibility: 'regional'` (RULEBOOK §23a.5): this is now
  // `default` + `lens: ['tamil']`, which is exactly what #344's note meant by "it
  // starts producing dates the day the wave-2 lens exists, with no further engine
  // work". It is not the only home of its date — the annual `karthigai-deepam` is
  // universal — so a user with no तमिऴ calendar loses nothing.
  createRule({ id: 'karthigai-vrat', nameHi: 'कार्तिगई व्रत', nameEn: 'Karthigai Vrat', category: 'regional', visibility: 'default', lens: ['tamil'], recurrence: 'monthly', ruleType: 'nakshatra', marker: 'dot', sourceUrl: VratListUrl, nakshatra: 2, deityHi: 'भगवान कार्तिकेय', deityEn: 'Lord Kartikeya' }),
  hidden({ id: 'shraddha-dates', nameHi: 'श्राद्ध तिथियां', nameEn: 'Shraddha Dates', category: 'festival', bhogId: 'pitru-offering' }),
  // The Jain Rohini vrat — the Rohini nakshatra of every solar month. Same two
  // faults as `karthigai-vrat` above and the same #344 fix: 4 was 1-indexed Rohini,
  // 3 is its 0-indexed value. #344 had to leave it invisible and noted that this
  // one IS the only home of its date, which §23a.5 forbids — the alternative being
  // twelve Jain rows a year on every user's calendar, against PRD-42 decision ⑤.
  // W2 resolves exactly that tension: `default` + `lens: ['jain']` puts it on the
  // calendar of the households that keep it and on nobody else's.
  createRule({ id: 'rohini-vrat', nameHi: 'रोहिणी व्रत', nameEn: 'Rohini Vrat', category: 'regional', visibility: 'default', lens: ['jain'], recurrence: 'monthly', ruleType: 'nakshatra', marker: 'dot', sourceUrl: VratListUrl, nakshatra: 3, deityHi: 'जैन व्रत परंपरा', deityEn: 'Jain vrat tradition' }),
  hidden({ id: 'chandra-darshan', nameHi: 'चंद्र दर्शन', nameEn: 'Chandra Darshan', category: 'festival', ruleType: 'relative-to-lunar' }),
  hidden({ id: 'ishti-anvadhan', nameHi: 'इष्टि और अन्वाधान', nameEn: 'Ishti and Anvadhan', category: 'festival' }),
  hidden({ id: 'iskcon-ekadashi', nameHi: 'इस्कॉन एकादशी', nameEn: 'ISKCON Ekadashi', bhogId: 'ekadashi-food' }),
  hidden({ id: 'purushottam-maas', nameHi: 'पुरुषोत्तम मास', nameEn: 'Purushottam Maas', ruleType: 'range', bhogId: 'purushottam-maas-bhog' }),
  hidden({ id: 'chaturmasa', nameHi: 'चातुर्मास', nameEn: 'Chaturmasa', ruleType: 'range', bhogId: 'chaturmasa-bhog' }),
  hidden({ id: 'navagraha-weekday-fasts', nameHi: 'नवग्रह वार व्रत', nameEn: 'Navagraha Weekdays Fasting', recurrence: 'catalog', ruleType: 'catalog-only', kathaId: 'weekday-vrat-katha', bhogId: 'weekday-vrat-bhog' }),
  hidden({ id: 'deity-weekday-fasts', nameHi: 'देवता वार व्रत', nameEn: 'Deities Weekdays Fasting', recurrence: 'catalog', ruleType: 'catalog-only', kathaId: 'weekday-vrat-katha', bhogId: 'weekday-vrat-bhog' }),
  hidden({ id: 'dashavatara-vrat', nameHi: 'दशावतार व्रत', nameEn: 'Dashavatara Vrat', bhogId: 'dashavatara-bhog' }),
  hidden({ id: 'jayaparvati-vrat', nameHi: 'जयापार्वती व्रत', nameEn: 'Jayaparvati Vrat', kathaId: 'jayaparvati-vrat-katha', bhogId: 'jayaparvati-bhog' }),
  hidden({ id: 'ashoka-ashtami', nameHi: 'अशोक अष्टमी', nameEn: 'Ashoka Ashtami', lunarMonth: 1, paksha: 'shukla', tithi: 8, kathaId: 'ashoka-ashtami-vrat-katha', bhogId: 'devi-vrat-bhog' }),
];

export const OBSERVANCE_RULES: ObservanceRule[] = [
  ...FESTIVAL_RULES,
  ...EKADASHI_RULES,
  ...MONTHLY_VRAT_RULES,
  ...ADVANCED_OBSERVANCE_RULES,
];

/**
 * The browsable catalog.
 *
 * `lenses` is the user's क्षेत्रीय पंचांग set; omitting it means the EMPTY set, so
 * every existing caller keeps today's list byte for byte and a lensed rule stays
 * out of the catalog until its calendar is turned on. `includeHidden` is the
 * separate "advanced" axis and does not bypass the lens gate — an advanced rule
 * that belongs to a calendar the user has not chosen is still not theirs.
 *
 * SEARCH IS DELIBERATELY NOT FILTERED (see `searchObservances`): a user who types
 * पर्युषण by name has asked for it, lens or no lens.
 */
export function getObservanceCatalog(
  options: { includeHidden?: boolean; lenses?: ReadonlySet<ObservanceLens> } = {}
): ObservanceRule[] {
  const lenses = options.lenses ?? EMPTY_LENSES;
  const base = options.includeHidden
    ? OBSERVANCE_RULES
    : OBSERVANCE_RULES.filter((rule) => rule.visibility === 'default');
  return base.filter((rule) => ruleVisibleForLenses(rule.lens, lenses));
}

const EMPTY_LENSES: ReadonlySet<ObservanceLens> = new Set();
