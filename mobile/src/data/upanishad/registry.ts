/**
 * The 108 Upanishads of the Muktika canon — the complete catalogue the
 * Upanishads section is built on (design.md §75).
 *
 * `muktika` is the text's number in the Muktikā Upaniṣad's own list (1.30–39)
 * and is the reader's `chapter` id: fixed forever, so bookmarks and reading
 * progress survive as texts are added in any order. Grouping follows the
 * traditional seven-fold classification used by the Adyar Library edition
 * (Mukhya · Sāmānya-Vedānta · Sannyāsa · Śākta · Vaiṣṇava · Śaiva · Yoga) and
 * the Veda each text is recited under. Both are browsing aids, not doctrine:
 * a few texts sit in more than one group across editions (Śvetāśvatara is
 * filed Śaiva here, Annapūrṇā under Sāmānya).
 *
 * Whether a text is READABLE comes from `chapters-manifest.json` (built by
 * scripts/build-upanishad.mjs from scripts/upanishad-content/<slug>.mjs), never
 * from this file — see `isUpanishadAvailable()` in ./index.ts.
 */

export type UpanishadCategory =
  | 'mukhya'
  | 'samanya'
  | 'sannyasa'
  | 'shakta'
  | 'vaishnava'
  | 'shaiva'
  | 'yoga';

export type UpanishadVeda = 'rigveda' | 'shukla-yajurveda' | 'krishna-yajurveda' | 'samaveda' | 'atharvaveda';

export type UpanishadCategoryMeta = {
  id: UpanishadCategory;
  nameHi: string;
  nameEn: string;
  /** One line on what the group's texts are about (index header, design.md §75). */
  descHi: string;
  descEn: string;
};

export const upanishadCategories: readonly UpanishadCategoryMeta[] = [
  { id: 'mukhya', nameHi: 'मुख्य', nameEn: 'Principal', descHi: 'शाङ्करभाष्य वाले दस प्रधान उपनिषद्', descEn: 'The ten principal Upanishads Shankara commented on' },
  { id: 'samanya', nameHi: 'सामान्य वेदान्त', nameEn: 'General Vedanta', descHi: 'ब्रह्म-आत्म विचार के सामान्य उपनिषद्', descEn: 'General teachings on Brahman and the Self' },
  { id: 'sannyasa', nameHi: 'संन्यास', nameEn: 'Renunciation', descHi: 'संन्यास-धर्म और परिव्राजक जीवन', descEn: 'The renunciant life and its discipline' },
  { id: 'shakta', nameHi: 'शाक्त', nameEn: 'Shakta', descHi: 'देवी-उपासना के उपनिषद्', descEn: 'Upanishads of the Goddess' },
  { id: 'vaishnava', nameHi: 'वैष्णव', nameEn: 'Vaishnava', descHi: 'नारायण, राम और कृष्ण की उपासना', descEn: 'Upanishads of Narayana, Rama and Krishna' },
  { id: 'shaiva', nameHi: 'शैव', nameEn: 'Shaiva', descHi: 'रुद्र-शिव उपासना के उपनिषद्', descEn: 'Upanishads of Rudra-Shiva' },
  { id: 'yoga', nameHi: 'योग', nameEn: 'Yoga', descHi: 'प्राण, नाद, बिन्दु और कुण्डलिनी योग', descEn: 'Prana, nada, bindu and kundalini yoga' },
];

export const upanishadVedas: Readonly<Record<UpanishadVeda, { nameHi: string; nameEn: string }>> = {
  rigveda: { nameHi: 'ऋग्वेद', nameEn: 'Rigveda' },
  'shukla-yajurveda': { nameHi: 'शुक्ल यजुर्वेद', nameEn: 'Shukla Yajurveda' },
  'krishna-yajurveda': { nameHi: 'कृष्ण यजुर्वेद', nameEn: 'Krishna Yajurveda' },
  samaveda: { nameHi: 'सामवेद', nameEn: 'Samaveda' },
  atharvaveda: { nameHi: 'अथर्ववेद', nameEn: 'Atharvaveda' },
};

export type UpanishadMeta = {
  /** 1–108, the Muktikā number — the reader's `chapter`. */
  muktika: number;
  /** Lowercase-hyphen slug; the content module and JSON file name. */
  slug: string;
  /** Bare name (`ईशावास्य`); the section title adds `उपनिषद्`. */
  nameHi: string;
  nameEn: string;
  veda: UpanishadVeda;
  category: UpanishadCategory;
};

const M = 'mukhya', SA = 'samanya', SN = 'sannyasa', SK = 'shakta', V = 'vaishnava', SH = 'shaiva', Y = 'yoga';
const RV = 'rigveda', SYV = 'shukla-yajurveda', KYV = 'krishna-yajurveda', SV = 'samaveda', AV = 'atharvaveda';

type Row = [number, string, string, string, UpanishadVeda, UpanishadCategory];

const ROWS: readonly Row[] = [
  [1, 'isha', 'ईशावास्य', 'Isha', SYV, M],
  [2, 'kena', 'केन', 'Kena', SV, M],
  [3, 'katha', 'कठ', 'Katha', KYV, M],
  [4, 'prashna', 'प्रश्न', 'Prashna', AV, M],
  [5, 'mundaka', 'मुण्डक', 'Mundaka', AV, M],
  [6, 'mandukya', 'माण्डूक्य', 'Mandukya', AV, M],
  [7, 'taittiriya', 'तैत्तिरीय', 'Taittiriya', KYV, M],
  [8, 'aitareya', 'ऐतरेय', 'Aitareya', RV, M],
  [9, 'chandogya', 'छान्दोग्य', 'Chandogya', SV, M],
  [10, 'brihadaranyaka', 'बृहदारण्यक', 'Brihadaranyaka', SYV, M],
  [11, 'brahma', 'ब्रह्म', 'Brahma', KYV, SN],
  [12, 'kaivalya', 'कैवल्य', 'Kaivalya', KYV, SH],
  [13, 'jabala', 'जाबाल', 'Jabala', SYV, SN],
  [14, 'shvetashvatara', 'श्वेताश्वतर', 'Shvetashvatara', KYV, SH],
  [15, 'hamsa', 'हंस', 'Hamsa', SYV, Y],
  [16, 'aruni', 'आरुणि', 'Aruni', SV, SN],
  [17, 'garbha', 'गर्भ', 'Garbha', KYV, SA],
  [18, 'narayana', 'नारायण', 'Narayana', KYV, V],
  [19, 'paramahamsa', 'परमहंस', 'Paramahamsa', SYV, SN],
  [20, 'amritabindu', 'अमृतबिन्दु', 'Amritabindu', KYV, Y],
  [21, 'amritanada', 'अमृतनाद', 'Amritanada', KYV, Y],
  [22, 'atharvashira', 'अथर्वशिर', 'Atharvashira', AV, SH],
  [23, 'atharvashikha', 'अथर्वशिखा', 'Atharvashikha', AV, SH],
  [24, 'maitrayani', 'मैत्रायणी', 'Maitrayani', SV, SA],
  [25, 'kaushitaki', 'कौषीतकि', 'Kaushitaki', RV, SA],
  [26, 'brihajjabala', 'बृहज्जाबाल', 'Brihajjabala', AV, SH],
  [27, 'nrisimhatapani', 'नृसिंहतापनी', 'Nrisimhatapani', AV, V],
  [28, 'kalagnirudra', 'कालाग्निरुद्र', 'Kalagnirudra', KYV, SH],
  [29, 'maitreyi', 'मैत्रेयी', 'Maitreyi', SV, SN],
  [30, 'subala', 'सुबाल', 'Subala', SYV, SA],
  [31, 'kshurika', 'क्षुरिका', 'Kshurika', KYV, Y],
  [32, 'mantrika', 'मान्त्रिक', 'Mantrika', SYV, SA],
  [33, 'sarvasara', 'सर्वसार', 'Sarvasara', KYV, SA],
  [34, 'niralamba', 'निरालम्ब', 'Niralamba', SYV, SA],
  [35, 'shukarahasya', 'शुकरहस्य', 'Shukarahasya', KYV, SA],
  [36, 'vajrasuchi', 'वज्रसूची', 'Vajrasuchi', SV, SA],
  [37, 'tejobindu', 'तेजोबिन्दु', 'Tejobindu', KYV, Y],
  [38, 'nadabindu', 'नादबिन्दु', 'Nadabindu', RV, Y],
  [39, 'dhyanabindu', 'ध्यानबिन्दु', 'Dhyanabindu', KYV, Y],
  [40, 'brahmavidya', 'ब्रह्मविद्या', 'Brahmavidya', KYV, Y],
  [41, 'yogatattva', 'योगतत्त्व', 'Yogatattva', KYV, Y],
  [42, 'atmabodha', 'आत्मबोध', 'Atmabodha', RV, SA],
  [43, 'naradaparivrajaka', 'नारदपरिव्राजक', 'Naradaparivrajaka', AV, SN],
  [44, 'trishikhibrahmana', 'त्रिशिखिब्राह्मण', 'Trishikhibrahmana', SYV, Y],
  [45, 'sita', 'सीता', 'Sita', AV, SK],
  [46, 'yogachudamani', 'योगचूडामणि', 'Yogachudamani', SV, Y],
  [47, 'nirvana', 'निर्वाण', 'Nirvana', RV, SN],
  [48, 'mandalabrahmana', 'मण्डलब्राह्मण', 'Mandalabrahmana', SYV, Y],
  [49, 'dakshinamurti', 'दक्षिणामूर्ति', 'Dakshinamurti', KYV, SH],
  [50, 'sharabha', 'शरभ', 'Sharabha', AV, SH],
  [51, 'skanda', 'स्कन्द', 'Skanda', KYV, SA],
  [52, 'tripadvibhuti-mahanarayana', 'त्रिपाद्विभूति महानारायण', 'Tripadvibhuti Mahanarayana', AV, V],
  [53, 'advayataraka', 'अद्वयतारक', 'Advayataraka', SYV, Y],
  [54, 'ramarahasya', 'रामरहस्य', 'Ramarahasya', AV, V],
  [55, 'ramatapani', 'रामतापनी', 'Ramatapani', AV, V],
  [56, 'vasudeva', 'वासुदेव', 'Vasudeva', SV, V],
  [57, 'mudgala', 'मुद्गल', 'Mudgala', RV, SA],
  [58, 'shandilya', 'शाण्डिल्य', 'Shandilya', AV, Y],
  [59, 'paingala', 'पैङ्गल', 'Paingala', SYV, SA],
  [60, 'bhikshuka', 'भिक्षुक', 'Bhikshuka', SYV, SN],
  [61, 'maha', 'महा', 'Maha', SV, SA],
  [62, 'shariraka', 'शारीरक', 'Shariraka', KYV, SA],
  [63, 'yogashikha', 'योगशिखा', 'Yogashikha', KYV, Y],
  [64, 'turiyatita', 'तुरीयातीत', 'Turiyatita', SYV, SN],
  [65, 'sannyasa', 'संन्यास', 'Sannyasa', SV, SN],
  [66, 'paramahamsaparivrajaka', 'परमहंसपरिव्राजक', 'Paramahamsaparivrajaka', AV, SN],
  [67, 'akshamalika', 'अक्षमालिका', 'Akshamalika', RV, SH],
  [68, 'avyakta', 'अव्यक्त', 'Avyakta', SV, V],
  [69, 'ekakshara', 'एकाक्षर', 'Ekakshara', KYV, SA],
  [70, 'annapurna', 'अन्नपूर्णा', 'Annapurna', AV, SA],
  [71, 'surya', 'सूर्य', 'Surya', AV, SA],
  [72, 'akshi', 'अक्षि', 'Akshi', KYV, SA],
  [73, 'adhyatma', 'अध्यात्म', 'Adhyatma', SYV, SA],
  [74, 'kundika', 'कुण्डिका', 'Kundika', SV, SN],
  [75, 'savitri', 'सावित्री', 'Savitri', SV, SA],
  [76, 'atma', 'आत्मा', 'Atma', AV, SA],
  [77, 'pashupatabrahma', 'पाशुपतब्रह्म', 'Pashupatabrahma', AV, Y],
  [78, 'parabrahma', 'परब्रह्म', 'Parabrahma', AV, SN],
  [79, 'avadhuta', 'अवधूत', 'Avadhuta', KYV, SN],
  [80, 'tripuratapini', 'त्रिपुरातापिनी', 'Tripuratapini', AV, SK],
  [81, 'devi', 'देवी', 'Devi', AV, SK],
  [82, 'tripura', 'त्रिपुरा', 'Tripura', RV, SK],
  [83, 'katharudra', 'कठरुद्र', 'Katharudra', KYV, SN],
  [84, 'bhavana', 'भावना', 'Bhavana', AV, SK],
  [85, 'rudrahridaya', 'रुद्रहृदय', 'Rudrahridaya', KYV, SH],
  [86, 'yogakundalini', 'योगकुण्डलिनी', 'Yogakundalini', KYV, Y],
  [87, 'bhasmajabala', 'भस्मजाबाल', 'Bhasmajabala', AV, SH],
  [88, 'rudrakshajabala', 'रुद्राक्षजाबाल', 'Rudrakshajabala', SV, SH],
  [89, 'ganapati', 'गणपति', 'Ganapati', AV, SH],
  [90, 'darshana', 'दर्शन', 'Darshana', SV, Y],
  [91, 'tarasara', 'तारसार', 'Tarasara', SYV, V],
  [92, 'mahavakya', 'महावाक्य', 'Mahavakya', AV, Y],
  [93, 'panchabrahma', 'पञ्चब्रह्म', 'Panchabrahma', KYV, SH],
  [94, 'pranagnihotra', 'प्राणाग्निहोत्र', 'Pranagnihotra', KYV, SA],
  [95, 'gopalatapani', 'गोपालतापनी', 'Gopalatapani', AV, V],
  [96, 'krishna', 'कृष्ण', 'Krishna', AV, V],
  [97, 'yajnavalkya', 'याज्ञवल्क्य', 'Yajnavalkya', SYV, SN],
  [98, 'varaha', 'वराह', 'Varaha', KYV, Y],
  [99, 'shatyayaniya', 'शाट्यायनीय', 'Shatyayaniya', SYV, SN],
  [100, 'hayagriva', 'हयग्रीव', 'Hayagriva', AV, V],
  [101, 'dattatreya', 'दत्तात्रेय', 'Dattatreya', AV, V],
  [102, 'garuda', 'गारुड', 'Garuda', AV, V],
  [103, 'kalisantarana', 'कलिसन्तरण', 'Kalisantarana', KYV, V],
  [104, 'jabali', 'जाबालि', 'Jabali', SV, SH],
  [105, 'saubhagyalakshmi', 'सौभाग्यलक्ष्मी', 'Saubhagyalakshmi', RV, SK],
  [106, 'sarasvatirahasya', 'सरस्वतीरहस्य', 'Sarasvatirahasya', KYV, SK],
  [107, 'bahvricha', 'बह्वृच', 'Bahvricha', RV, SK],
  [108, 'muktika', 'मुक्तिका', 'Muktika', SYV, SA],
];

export const upanishadRegistry: readonly UpanishadMeta[] = ROWS.map(
  ([muktika, slug, nameHi, nameEn, veda, category]) => ({ muktika, slug, nameHi, nameEn, veda, category })
);

const byMuktika: ReadonlyMap<number, UpanishadMeta> = new Map(upanishadRegistry.map((u) => [u.muktika, u]));
const bySlug: ReadonlyMap<string, UpanishadMeta> = new Map(upanishadRegistry.map((u) => [u.slug, u]));

export function getUpanishadMeta(muktika: number): UpanishadMeta | undefined {
  return byMuktika.get(muktika);
}

export function getUpanishadMetaBySlug(slug: string): UpanishadMeta | undefined {
  return bySlug.get(slug);
}

/** Section title as the reader shows it — `ईशावास्य उपनिषद्` / `Isha Upanishad`. */
export function upanishadTitleHiOf(meta: UpanishadMeta): string {
  return `${meta.nameHi} उपनिषद्`;
}
export function upanishadTitleEnOf(meta: UpanishadMeta): string {
  return `${meta.nameEn} Upanishad`;
}

(function assertRegistryInvariants() {
  if (upanishadRegistry.length !== 108) {
    throw new Error(`upanishad registry: expected 108 texts, got ${upanishadRegistry.length}`);
  }
  upanishadRegistry.forEach((u, i) => {
    if (u.muktika !== i + 1) throw new Error(`upanishad registry: row ${i} has muktika ${u.muktika}`);
    if (!/^[a-z-]+$/.test(u.slug)) throw new Error(`upanishad registry: bad slug '${u.slug}'`);
  });
  if (bySlug.size !== 108) throw new Error('upanishad registry: duplicate slug');
})();
