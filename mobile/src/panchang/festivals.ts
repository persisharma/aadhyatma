import type { KathaCatalogEntry, ObservanceRule, Paksha } from './types';

const VratListUrl = 'https://www.drikpanchang.com/vrats/hindu-vrat-list.html';
const HinduCalendarUrl = 'https://www.drikpanchang.com/calendars/hindu/hinducalendar.html';
const VratKathaUrl = 'https://www.drikpanchang.com/vrat-katha/vrat-katha.html';

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
    ruleType: seed.ruleType ?? (seed.type === 'solar' ? 'solar-sankranti' : 'lunar-tithi'),
    recurrence: seed.recurrence ?? 'annual',
    type: seed.type,
    lunarMonth: seed.lunarMonth,
    monthSystem: seed.monthSystem,
    paksha: seed.paksha,
    tithi: seed.tithi,
    weekday: seed.weekday,
    nakshatra: seed.nakshatra,
    solarLongitude: seed.solarLongitude,
    solarIngress: seed.solarIngress,
    relativeRule: seed.relativeRule,
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
  katha({ id: 'hartalika-teej-katha', nameHi: 'हरतालिका तीज कथा', nameEn: 'Hartalika Teej Katha', sourceUrl: 'https://www.drikpanchang.com/festivals/teej/legends/hartalika-vrat-legend.html', relatedRuleIds: ['hartalika-teej'] }),
  katha({ id: 'maha-shivaratri-vrat-katha', nameHi: 'महा शिवरात्रि व्रत कथा', nameEn: 'Maha Shivaratri Vrat Katha', sourceUrl: 'https://www.drikpanchang.com/vrat-katha/maha-shivaratri/maha-shivaratri-vrat-katha.html', relatedRuleIds: ['maha-shivaratri', 'masik-shivaratri'] }),
  katha({ id: 'gangaur-vrat-katha', nameHi: 'गणगौर व्रत कथा', nameEn: 'Gangaur Vrat Katha', sourceUrl: VratKathaUrl, relatedRuleIds: ['gangaur'] }),
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
];

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
  searchTerms: ['sankranti', 'solar ingress'],
}));

export const FESTIVAL_RULES: ObservanceRule[] = [
  ...SANKRANTI_RULES,
  festival({ id: 'vasant-panchami', nameHi: 'वसंत पंचमी', nameEn: 'Vasant Panchami', lunarMonth: 11, paksha: 'shukla', tithi: 5, marker: 'star', deityHi: 'मां सरस्वती', deityEn: 'Maa Saraswati' }),
  festival({ id: 'maha-shivaratri', nameHi: 'महा शिवरात्रि', nameEn: 'Maha Shivaratri', lunarMonth: 11, paksha: 'krishna', tithi: 14, marker: 'star', deityHi: 'भगवान शिव', deityEn: 'Lord Shiva', linkSectionId: 'shiv-chalisa', kathaId: 'maha-shivaratri-vrat-katha' }),
  festival({ id: 'holi', nameHi: 'होली', nameEn: 'Holi', lunarMonth: 12, paksha: 'shukla', tithi: 15, marker: 'star', deityHi: 'श्री कृष्ण', deityEn: 'Shri Krishna', kathaId: 'holi-legends' }),
  festival({ id: 'ram-navami', nameHi: 'राम नवमी', nameEn: 'Ram Navami', lunarMonth: 1, paksha: 'shukla', tithi: 9, marker: 'star', deityHi: 'श्री राम', deityEn: 'Shri Ram', linkSectionId: 'ram-stuti', kathaId: 'rama-navami-vrat-katha' }),
  festival({ id: 'hanuman-jayanti', nameHi: 'हनुमान जयंती', nameEn: 'Hanuman Jayanti', lunarMonth: 1, paksha: 'shukla', tithi: 15, marker: 'star', deityHi: 'हनुमान जी', deityEn: 'Hanuman Ji', linkSectionId: 'hanuman-chalisa', kathaId: 'hanuman-jayanti-vrat-katha' }),
  festival({ id: 'akshaya-tritiya', nameHi: 'अक्षय तृतीया', nameEn: 'Akshaya Tritiya', lunarMonth: 2, paksha: 'shukla', tithi: 3, marker: 'star', deityHi: 'श्री विष्णु', deityEn: 'Shri Vishnu', linkSectionId: 'vishnu-sahasranama', kathaId: 'akshaya-tritiya-vrat-katha' }),
  festival({ id: 'parashurama-jayanti', nameHi: 'परशुराम जयंती', nameEn: 'Parashurama Jayanti', lunarMonth: 2, paksha: 'shukla', tithi: 3, marker: 'dot', deityHi: 'भगवान परशुराम', deityEn: 'Lord Parashurama', kathaId: 'parashurama-jayanti-vrat-katha' }),
  festival({ id: 'ganga-saptami', nameHi: 'गंगा सप्तमी', nameEn: 'Ganga Saptami', lunarMonth: 2, paksha: 'shukla', tithi: 7, marker: 'dot', deityHi: 'मां गंगा', deityEn: 'Maa Ganga', kathaId: 'ganga-saptami-vrat-katha' }),
  festival({ id: 'sita-navami', nameHi: 'सीता नवमी', nameEn: 'Sita Navami', lunarMonth: 2, paksha: 'shukla', tithi: 9, marker: 'dot', deityHi: 'मां सीता', deityEn: 'Maa Sita', kathaId: 'sita-navami-vrat-katha' }),
  festival({ id: 'narasimha-jayanti', nameHi: 'नरसिंह जयंती', nameEn: 'Narasimha Jayanti', lunarMonth: 2, paksha: 'shukla', tithi: 14, marker: 'dot', deityHi: 'भगवान नरसिंह', deityEn: 'Lord Narasimha', kathaId: 'narasimha-jayanti-vrat-katha' }),
  festival({ id: 'buddha-purnima', nameHi: 'बुद्ध पूर्णिमा', nameEn: 'Buddha Purnima', lunarMonth: 2, paksha: 'shukla', tithi: 15, marker: 'dot', deityHi: 'भगवान बुद्ध', deityEn: 'Lord Buddha', kathaId: 'buddha-purnima-vrat-katha' }),
  festival({ id: 'narada-jayanti', nameHi: 'नारद जयंती', nameEn: 'Narada Jayanti', lunarMonth: 2, paksha: 'krishna', tithi: 1, marker: 'dot', deityHi: 'देवर्षि नारद', deityEn: 'Devarshi Narada', kathaId: 'narada-jayanti-vrat-katha' }),
  festival({ id: 'ganga-dussehra', nameHi: 'गंगा दशहरा', nameEn: 'Ganga Dussehra', lunarMonth: 3, paksha: 'shukla', tithi: 10, marker: 'dot', deityHi: 'मां गंगा', deityEn: 'Maa Ganga' }),
  festival({ id: 'guru-purnima', nameHi: 'गुरु पूर्णिमा', nameEn: 'Guru Purnima', lunarMonth: 4, paksha: 'shukla', tithi: 15, marker: 'star', deityHi: 'गुरु परंपरा', deityEn: 'Guru Parampara' }),
  festival({ id: 'nag-panchami', nameHi: 'नाग पंचमी', nameEn: 'Nag Panchami', lunarMonth: 5, paksha: 'shukla', tithi: 5, marker: 'dot', deityHi: 'नाग देवता', deityEn: 'Naga Devata', kathaId: 'nag-panchami-vrat-katha' }),
  festival({ id: 'raksha-bandhan', nameHi: 'रक्षा बंधन', nameEn: 'Raksha Bandhan', lunarMonth: 5, paksha: 'shukla', tithi: 15, marker: 'star', kathaId: 'raksha-bandhan-legends' }),
  festival({ id: 'janmashtami', nameHi: 'जन्माष्टमी', nameEn: 'Janmashtami', lunarMonth: 5, paksha: 'krishna', tithi: 8, marker: 'star', deityHi: 'श्री कृष्ण', deityEn: 'Shri Krishna', linkSectionId: 'bhagavad-gita' }),
  festival({ id: 'hartalika-teej', nameHi: 'हरतालिका तीज', nameEn: 'Hartalika Teej', lunarMonth: 6, paksha: 'shukla', tithi: 3, marker: 'dot', category: 'vrat', deityHi: 'मां पार्वती', deityEn: 'Maa Parvati', kathaId: 'hartalika-teej-katha' }),
  festival({ id: 'ganesh-chaturthi', nameHi: 'गणेश चतुर्थी', nameEn: 'Ganesh Chaturthi', lunarMonth: 6, paksha: 'shukla', tithi: 4, marker: 'star', deityHi: 'श्री गणेश', deityEn: 'Shri Ganesh', linkSectionId: 'ganesh-chalisa', kathaId: 'ganesha-chaturthi-vrat-katha' }),
  festival({ id: 'rishi-panchami', nameHi: 'ऋषि पंचमी', nameEn: 'Rishi Panchami', lunarMonth: 6, paksha: 'shukla', tithi: 5, marker: 'dot', category: 'vrat', deityHi: 'ऋषि परंपरा', deityEn: 'Rishi Parampara', kathaId: 'rishi-panchami-vrat-katha' }),
  festival({ id: 'durva-ashtami', nameHi: 'दूर्वा अष्टमी', nameEn: 'Durva Ashtami', lunarMonth: 6, paksha: 'shukla', tithi: 8, marker: 'dot', category: 'vrat', deityHi: 'श्री गणेश', deityEn: 'Shri Ganesh', kathaId: 'durva-ashtami-vrat-katha' }),
  festival({ id: 'anant-chaturdashi', nameHi: 'अनंत चतुर्दशी', nameEn: 'Anant Chaturdashi', lunarMonth: 6, paksha: 'shukla', tithi: 14, marker: 'dot', category: 'vrat', deityHi: 'भगवान विष्णु', deityEn: 'Lord Vishnu', kathaId: 'anant-chaturdashi-vrat-katha' }),
  festival({ id: 'navratri-start', nameHi: 'नवरात्रि प्रारंभ', nameEn: 'Navratri Begins', lunarMonth: 7, paksha: 'shukla', tithi: 1, marker: 'star', deityHi: 'मां दुर्गा', deityEn: 'Maa Durga', linkSectionId: 'durga-stotram' }),
  festival({ id: 'dussehra', nameHi: 'दशहरा', nameEn: 'Dussehra', lunarMonth: 7, paksha: 'shukla', tithi: 10, marker: 'star', deityHi: 'श्री राम', deityEn: 'Shri Ram', linkSectionId: 'ram-stuti' }),
  festival({ id: 'sharad-purnima', nameHi: 'शरद पूर्णिमा', nameEn: 'Sharad Purnima', lunarMonth: 7, paksha: 'shukla', tithi: 15, marker: 'dot', deityHi: 'चंद्र देव', deityEn: 'Chandra Deva', kathaId: 'sharad-purnima-vrat-katha' }),
  festival({ id: 'kojagara-puja', nameHi: 'कोजागरा पूजा', nameEn: 'Kojagara Puja', lunarMonth: 7, paksha: 'shukla', tithi: 15, marker: 'dot', category: 'vrat', deityHi: 'मां लक्ष्मी', deityEn: 'Maa Lakshmi', kathaId: 'sharad-purnima-vrat-katha' }),
  festival({ id: 'karwa-chauth', nameHi: 'करवा चौथ', nameEn: 'Karwa Chauth', lunarMonth: 8, paksha: 'krishna', tithi: 4, marker: 'star', category: 'vrat', deityHi: 'मां गौरी', deityEn: 'Maa Gauri', kathaId: 'karwa-chauth-vrat-katha' }),
  festival({ id: 'ahoi-ashtami', nameHi: 'अहोई अष्टमी', nameEn: 'Ahoi Ashtami', lunarMonth: 8, paksha: 'krishna', tithi: 8, marker: 'dot', category: 'vrat', deityHi: 'अहोई माता', deityEn: 'Ahoi Mata', kathaId: 'ahoi-ashtami-vrat-katha' }),
  festival({ id: 'dhanteras', nameHi: 'धनतेरस', nameEn: 'Dhanteras', lunarMonth: 8, paksha: 'krishna', tithi: 13, marker: 'dot', deityHi: 'धन्वंतरि देव', deityEn: 'Dhanvantari Deva', kathaId: 'dhanteras-legends' }),
  festival({ id: 'diwali', nameHi: 'दीपावली', nameEn: 'Diwali', lunarMonth: 8, paksha: 'krishna', tithi: 15, marker: 'star', deityHi: 'मां लक्ष्मी', deityEn: 'Maa Lakshmi', kathaId: 'diwali-legends' }),
  festival({ id: 'govardhan-puja', nameHi: 'गोवर्धन पूजा', nameEn: 'Govardhan Puja', lunarMonth: 8, paksha: 'shukla', tithi: 1, marker: 'star', deityHi: 'श्री कृष्ण', deityEn: 'Shri Krishna' }),
  festival({ id: 'bhai-dooj', nameHi: 'भाई दूज', nameEn: 'Bhai Dooj', lunarMonth: 8, paksha: 'shukla', tithi: 2, marker: 'star' }),
  festival({ id: 'chhath-puja', nameHi: 'छठ पूजा', nameEn: 'Chhath Puja', lunarMonth: 8, paksha: 'shukla', tithi: 6, marker: 'dot', category: 'upavas', deityHi: 'सूर्य देव', deityEn: 'Surya Deva' }),
  festival({ id: 'dev-uthani-ekadashi', nameHi: 'देव उठनी एकादशी', nameEn: 'Dev Uthani Ekadashi', lunarMonth: 8, paksha: 'shukla', tithi: 11, marker: 'dot', category: 'vrat', deityHi: 'श्री विष्णु', deityEn: 'Shri Vishnu', linkSectionId: 'vishnu-sahasranama', kathaId: 'kartika-mahatmya' }),
  festival({ id: 'tulasi-vivah', nameHi: 'तुलसी विवाह', nameEn: 'Tulasi Vivah', lunarMonth: 8, paksha: 'shukla', tithi: 12, marker: 'dot', deityHi: 'तुलसी माता', deityEn: 'Tulasi Mata', kathaId: 'kartika-mahatmya' }),
  festival({ id: 'akshaya-navami', nameHi: 'अक्षय नवमी', nameEn: 'Akshaya Navami', lunarMonth: 8, paksha: 'shukla', tithi: 9, marker: 'dot', category: 'vrat' }),
  festival({ id: 'vivah-panchami', nameHi: 'विवाह पंचमी', nameEn: 'Vivah Panchami', lunarMonth: 9, paksha: 'shukla', tithi: 5, marker: 'dot', deityHi: 'सीता राम', deityEn: 'Sita Ram' }),
  festival({ id: 'gita-jayanti', nameHi: 'गीता जयंती', nameEn: 'Gita Jayanti', lunarMonth: 9, paksha: 'shukla', tithi: 11, marker: 'dot', deityHi: 'श्री कृष्ण', deityEn: 'Shri Krishna', linkSectionId: 'bhagavad-gita' }),
  festival({ id: 'dattatreya-jayanti', nameHi: 'दत्तात्रेय जयंती', nameEn: 'Dattatreya Jayanti', lunarMonth: 9, paksha: 'shukla', tithi: 15, marker: 'dot', deityHi: 'भगवान दत्तात्रेय', deityEn: 'Lord Dattatreya' }),
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
  searchTerms: ['ekadashi', 'upavas', 'vishnu'],
}));

export const MONTHLY_VRAT_RULES: ObservanceRule[] = [
  vrat({ id: 'sankashti-chaturthi-vrat', nameHi: 'संकष्टी चतुर्थी व्रत', nameEn: 'Sankashti Chaturthi Vrat', recurrence: 'monthly', paksha: 'krishna', tithi: 4, deityHi: 'श्री गणेश', deityEn: 'Shri Ganesh', linkSectionId: 'ganesh-chalisa', kathaId: 'sankashti-chaturthi-vrat-katha' }),
  vrat({ id: 'vinayaka-chaturthi-vrat', nameHi: 'विनायक चतुर्थी व्रत', nameEn: 'Vinayaka Chaturthi Vrat', recurrence: 'monthly', paksha: 'shukla', tithi: 4, deityHi: 'श्री गणेश', deityEn: 'Shri Ganesh', linkSectionId: 'ganesh-chalisa', kathaId: 'ganesha-chaturthi-vrat-katha' }),
  vrat({ id: 'pradosh-vrat-shukla', nameHi: 'शुक्ल प्रदोष व्रत', nameEn: 'Shukla Pradosh Vrat', recurrence: 'monthly', paksha: 'shukla', tithi: 13, deityHi: 'भगवान शिव', deityEn: 'Lord Shiva', linkSectionId: 'shiv-chalisa', kathaId: 'pradosha-vrat-katha' }),
  vrat({ id: 'pradosh-vrat-krishna', nameHi: 'कृष्ण प्रदोष व्रत', nameEn: 'Krishna Pradosh Vrat', recurrence: 'monthly', paksha: 'krishna', tithi: 13, deityHi: 'भगवान शिव', deityEn: 'Lord Shiva', linkSectionId: 'shiv-chalisa', kathaId: 'pradosha-vrat-katha' }),
  vrat({ id: 'dwadashi-vrat-shukla', nameHi: 'शुक्ल द्वादशी व्रत', nameEn: 'Shukla Dwadashi Vrat', recurrence: 'monthly', paksha: 'shukla', tithi: 12, deityHi: 'श्री विष्णु', deityEn: 'Shri Vishnu', linkSectionId: 'vishnu-sahasranama', kathaId: 'dwadashi-vrat-katha' }),
  vrat({ id: 'dwadashi-vrat-krishna', nameHi: 'कृष्ण द्वादशी व्रत', nameEn: 'Krishna Dwadashi Vrat', recurrence: 'monthly', paksha: 'krishna', tithi: 12, deityHi: 'श्री विष्णु', deityEn: 'Shri Vishnu', linkSectionId: 'vishnu-sahasranama', kathaId: 'dwadashi-vrat-katha' }),
  vrat({ id: 'masik-shivaratri', nameHi: 'मासिक शिवरात्रि', nameEn: 'Masik Shivaratri', recurrence: 'monthly', paksha: 'krishna', tithi: 14, deityHi: 'भगवान शिव', deityEn: 'Lord Shiva', linkSectionId: 'shiv-chalisa', kathaId: 'maha-shivaratri-vrat-katha' }),
  upavas({ id: 'purnima-vrat', nameHi: 'पूर्णिमा व्रत', nameEn: 'Purnima Vrat', recurrence: 'monthly', paksha: 'shukla', tithi: 15, deityHi: 'श्री विष्णु', deityEn: 'Shri Vishnu', kathaId: 'satyanarayana-vrat-katha' }),
  vrat({ id: 'shree-satyanarayan-vrat', nameHi: 'श्री सत्यनारायण व्रत', nameEn: 'Shree Satyanarayan Vrat', recurrence: 'monthly', paksha: 'shukla', tithi: 15, deityHi: 'श्री सत्यनारायण', deityEn: 'Shree Satyanarayan', linkSectionId: 'vishnu-sahasranama', kathaId: 'satyanarayana-vrat-katha' }),
  upavas({ id: 'amavasya-vrat', nameHi: 'अमावस्या व्रत', nameEn: 'Amavasya Vrat', recurrence: 'monthly', paksha: 'krishna', tithi: 15, deityHi: 'पितृ तर्पण', deityEn: 'Pitru Tarpana' }),
  vrat({ id: 'skanda-sashti', nameHi: 'स्कंद षष्ठी', nameEn: 'Skanda Sashti', recurrence: 'monthly', paksha: 'shukla', tithi: 6, deityHi: 'भगवान कार्तिकेय', deityEn: 'Lord Kartikeya' }),
  vrat({ id: 'masik-durgashtami', nameHi: 'मासिक दुर्गाष्टमी', nameEn: 'Masik Durgashtami', recurrence: 'monthly', paksha: 'shukla', tithi: 8, deityHi: 'मां दुर्गा', deityEn: 'Maa Durga', linkSectionId: 'durga-stotram' }),
  vrat({ id: 'masik-kalashtami', nameHi: 'मासिक कालाष्टमी', nameEn: 'Masik Kalashtami', recurrence: 'monthly', paksha: 'krishna', tithi: 8, deityHi: 'काल भैरव', deityEn: 'Kala Bhairava' }),
  vrat({ id: 'masik-krishna-janmashtami', nameHi: 'मासिक कृष्ण जन्माष्टमी', nameEn: 'Masik Krishna Janmashtami', recurrence: 'monthly', paksha: 'krishna', tithi: 8, deityHi: 'श्री कृष्ण', deityEn: 'Shri Krishna', linkSectionId: 'bhagavad-gita' }),
  vrat({ id: 'sawan-somwar-vrat', nameHi: 'सावन सोमवार व्रत', nameEn: 'Sawan Somwar Vrat', recurrence: 'seasonal', ruleType: 'weekday-in-lunar-month', lunarMonth: 5, weekday: 1, deityHi: 'भगवान शिव', deityEn: 'Lord Shiva', linkSectionId: 'shiv-chalisa', kathaId: 'shravana-mahatmya' }),
  vrat({ id: 'mangala-gauri-vrat', nameHi: 'मंगला गौरी व्रत', nameEn: 'Mangala Gauri Vrat', recurrence: 'seasonal', ruleType: 'weekday-in-lunar-month', lunarMonth: 5, weekday: 2, deityHi: 'मां गौरी', deityEn: 'Maa Gauri', kathaId: 'mangala-gauri-vrat-katha' }),
  vrat({ id: 'varalakshmi-vrat', nameHi: 'वरलक्ष्मी व्रत', nameEn: 'Varalakshmi Vrat', recurrence: 'annual', ruleType: 'relative-to-lunar', lunarMonth: 5, paksha: 'shukla', tithi: 15, weekday: 5, relativeRule: 'friday-before-purnima', deityHi: 'मां लक्ष्मी', deityEn: 'Maa Lakshmi', kathaId: 'varalakshmi-vrat-katha' }),
  vrat({ id: 'vat-savitri-vrat', nameHi: 'वट सावित्री व्रत', nameEn: 'Vat Savitri Vrat', recurrence: 'annual', lunarMonth: 3, paksha: 'krishna', tithi: 15, deityHi: 'सावित्री माता', deityEn: 'Maa Savitri', kathaId: 'vat-savitri-vrat-katha' }),
  vrat({ id: 'jivitputrika-vrat', nameHi: 'जीवित्पुत्रिका व्रत', nameEn: 'Jivitputrika Vrat', recurrence: 'annual', lunarMonth: 7, paksha: 'krishna', tithi: 8, deityHi: 'जीवित्पुत्रिका माता', deityEn: 'Jivitputrika Mata', kathaId: 'jivitputrika-vrat-katha' }),
  vrat({ id: 'mahalakshmi-vrat', nameHi: 'महालक्ष्मी व्रत', nameEn: 'Mahalakshmi Vrat', recurrence: 'annual', lunarMonth: 6, paksha: 'shukla', tithi: 8, deityHi: 'मां लक्ष्मी', deityEn: 'Maa Lakshmi', kathaId: 'mahalakshmi-vrat-katha' }),
];

export const ADVANCED_OBSERVANCE_RULES: ObservanceRule[] = [
  hidden({ id: 'mahadwadashi', nameHi: 'महाद्वादशी', nameEn: 'Mahadwadashi', searchTerms: ['dwadashi', 'advanced ekadashi'] }),
  createRule({ id: 'karthigai-vrat', nameHi: 'कार्तिगई व्रत', nameEn: 'Karthigai Vrat', category: 'regional', visibility: 'regional', recurrence: 'catalog', ruleType: 'nakshatra', marker: 'dot', sourceUrl: VratListUrl, nakshatra: 3, deityHi: 'भगवान कार्तिकेय', deityEn: 'Lord Kartikeya' }),
  hidden({ id: 'shraddha-dates', nameHi: 'श्राद्ध तिथियां', nameEn: 'Shraddha Dates', category: 'upavas' }),
  createRule({ id: 'rohini-vrat', nameHi: 'रोहिणी व्रत', nameEn: 'Rohini Vrat', category: 'regional', visibility: 'regional', recurrence: 'catalog', ruleType: 'nakshatra', marker: 'dot', sourceUrl: VratListUrl, nakshatra: 4, deityHi: 'जैन व्रत परंपरा', deityEn: 'Jain vrat tradition' }),
  hidden({ id: 'chandra-darshan', nameHi: 'चंद्र दर्शन', nameEn: 'Chandra Darshan', ruleType: 'relative-to-lunar' }),
  hidden({ id: 'ishti-anvadhan', nameHi: 'इष्टि और अन्वाधान', nameEn: 'Ishti and Anvadhan', category: 'upavas' }),
  hidden({ id: 'iskcon-ekadashi', nameHi: 'इस्कॉन एकादशी', nameEn: 'ISKCON Ekadashi' }),
  hidden({ id: 'purushottam-maas', nameHi: 'पुरुषोत्तम मास', nameEn: 'Purushottam Maas', ruleType: 'range' }),
  hidden({ id: 'chaturmasa', nameHi: 'चातुर्मास', nameEn: 'Chaturmasa', ruleType: 'range' }),
  hidden({ id: 'navagraha-weekday-fasts', nameHi: 'नवग्रह वार व्रत', nameEn: 'Navagraha Weekdays Fasting', recurrence: 'catalog', ruleType: 'catalog-only', kathaId: 'weekday-vrat-katha' }),
  hidden({ id: 'deity-weekday-fasts', nameHi: 'देवता वार व्रत', nameEn: 'Deities Weekdays Fasting', recurrence: 'catalog', ruleType: 'catalog-only', kathaId: 'weekday-vrat-katha' }),
  hidden({ id: 'dashavatara-vrat', nameHi: 'दशावतार व्रत', nameEn: 'Dashavatara Vrat' }),
  hidden({ id: 'sakat-chauth', nameHi: 'सकट चौथ', nameEn: 'Sakat Chauth', kathaId: 'sakat-chauth-vrat-katha' }),
  hidden({ id: 'gangaur', nameHi: 'गणगौर', nameEn: 'Gangaur', kathaId: 'gangaur-vrat-katha' }),
  hidden({ id: 'jayaparvati-vrat', nameHi: 'जयापार्वती व्रत', nameEn: 'Jayaparvati Vrat', kathaId: 'jayaparvati-vrat-katha' }),
  hidden({ id: 'ashoka-ashtami', nameHi: 'अशोक अष्टमी', nameEn: 'Ashoka Ashtami', lunarMonth: 1, paksha: 'shukla', tithi: 8, kathaId: 'ashoka-ashtami-vrat-katha' }),
  hidden({ id: 'asha-dashami', nameHi: 'आशा दशमी', nameEn: 'Asha Dashami' }),
  hidden({ id: 'shitala-saptami', nameHi: 'शीतला सप्तमी', nameEn: 'Shitala Saptami', kathaId: 'sankashti-chaturthi-vrat-katha' }),
];

export const OBSERVANCE_RULES: ObservanceRule[] = [
  ...FESTIVAL_RULES,
  ...EKADASHI_RULES,
  ...MONTHLY_VRAT_RULES,
  ...ADVANCED_OBSERVANCE_RULES,
];

export function getObservanceCatalog(options: { includeHidden?: boolean } = {}): ObservanceRule[] {
  return options.includeHidden
    ? OBSERVANCE_RULES
    : OBSERVANCE_RULES.filter((rule) => rule.visibility === 'default');
}
