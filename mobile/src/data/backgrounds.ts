import { backgroundImages } from '@assets/backgrounds';
import { chalisaImages } from '@assets/chalisa';
import { gitaImages } from '@assets/gita';
import { shivaStrotamImages } from '@assets/shiva-strotam';
import { aartiIdByIndex } from './aarti';
import { categories } from './categories';
import { deities } from './deities';
import { japamMantras } from './japam';
import { library, type ContentCategory, type Deity } from './texts';

type BackgroundImage = number;

type ReaderBackgroundVerse = {
  id?: string;
  stanza?: number;
};

const categoryBackgrounds: Record<ContentCategory, BackgroundImage> = {
  granth: backgroundImages.category_granth_open_scripture,
  stotram: backgroundImages.category_stotram_hymn_scroll,
  chalisa: backgroundImages.category_chalisa_booklet_mala,
  japam: backgroundImages.category_japam_mala,
  aarti: backgroundImages.category_aarti_diya,
  // Theerth has no faded-sketch background of its own yet — the CategoryList
  // re-uses the granth scripture image as a neutral parchment plate while
  // PRD-07 Phase 4 commissions a dedicated kshetra sketch. Replace once
  // the asset lands.
  theerth: backgroundImages.category_granth_open_scripture,
  sanskar: backgroundImages.source_gayatri_savitri_sun,
  // Kavacham is `status: 'coming'` (PRD-A) — its tile never opens a CategoryList,
  // so this entry only satisfies the Record<ContentCategory> type. Reuses the
  // neutral scripture plate (same precedent as theerth above); replace with a
  // dedicated kavach/armour sketch when the section flips to `active`.
  kavacham: backgroundImages.category_granth_open_scripture,
  // Ashtakam reuses the hymn-scroll plate (Stotram-family form). Per-text reader
  // backgrounds resolve by source id below (Lingashtakam → Shiva sketch).
  ashtakam: backgroundImages.category_stotram_hymn_scroll,
  suktam: backgroundImages.category_stotram_hymn_scroll,
  // No `stuti` key — स्तुति folded into `stotram` (not a category). Its texts
  // resolve per-id reader backgrounds via sourceBackgrounds below.
};

const deityBackgrounds: Record<Deity, BackgroundImage> = {
  rama: backgroundImages.deity_rama_darbar,
  krishna: backgroundImages.deity_krishna_bansuri,
  vishnu: backgroundImages.deity_krishna_bansuri,
  shiva: shivaStrotamImages.shiva,
  hanuman: chalisaImages.hanuman_sea,
  durga: backgroundImages.deity_durga_lion,
  ganesha: backgroundImages.deity_ganesha_modak,
  savitr: shivaStrotamImages.shiva,
  saraswati: backgroundImages.deity_saraswati_veena,
  // PRD-A deity expansion (§A.4.2) — reuse the closest existing plate; flagged for
  // dedicated art later (same precedent as theerth/kavacham). Lakshmi → Narayana
  // (her consort's) plate.
  lakshmi: backgroundImages.source_vishnu_narayana,
  surya: backgroundImages.source_gayatri_savitri_sun,
  radha: backgroundImages.deity_krishna_bansuri,
  kartikeya: shivaStrotamImages.shiva,
  kubera: backgroundImages.source_vishnu_narayana,
  ganga: shivaStrotamImages.shiva,
  parvati: backgroundImages.deity_durga_lion,
  narasimha: backgroundImages.source_vishnu_narayana,
  dattatreya: shivaStrotamImages.shiva,
  shani: backgroundImages.source_gayatri_savitri_sun,
  kali: backgroundImages.deity_durga_lion,
  navagraha: backgroundImages.source_gayatri_savitri_sun,
};

const sourceBackgrounds: Record<string, BackgroundImage> = {
  'hanuman-chalisa': chalisaImages.ram_hanuman,
  'bhagavad-gita': gitaImages.krishna_arjuna_vishvarupa,
  sundarkand: chalisaImages.hanuman_sea,
  'shiva-strotam': shivaStrotamImages.shiva,
  'om-namah-shivaya': shivaStrotamImages.shiva,
  'hare-krishna-mahamantra': backgroundImages.deity_krishna_bansuri,
  'gayatri-mantra': backgroundImages.source_gayatri_savitri_sun,
  'om-namo-bhagavate-vasudevaya': backgroundImages.source_vishnu_narayana,
  ramcharitmanas: backgroundImages.deity_rama_darbar,
  'valmiki-ramayan': backgroundImages.deity_rama_darbar,
  'durga-stotram': backgroundImages.deity_durga_lion,
  'ganesh-stotram': backgroundImages.deity_ganesha_modak,
  'vishnu-sahasranama': backgroundImages.source_vishnu_narayana,
  'shiv-chalisa': shivaStrotamImages.shiva,
  'durga-chalisa': backgroundImages.deity_durga_lion,
  'ganesh-chalisa': backgroundImages.deity_ganesha_modak,
  'gayatri-chalisa': backgroundImages.source_gayatri_savitri_sun,
  'ram-chalisa': backgroundImages.deity_rama_darbar,
  'krishna-chalisa': backgroundImages.deity_krishna_bansuri,
  'vishnu-chalisa': backgroundImages.source_vishnu_narayana,
  'saraswati-chalisa': backgroundImages.deity_saraswati_veena,
  'hanuman-ashtak': chalisaImages.hanuman_lankadahan,
  'bajrang-baan': chalisaImages.hanuman_lankadahan,
  'ram-stuti': backgroundImages.deity_rama_darbar,
  'ram-aarti': backgroundImages.deity_rama_darbar,
  'krishna-stotram': backgroundImages.deity_krishna_bansuri,
  'om-jai-jagdish': backgroundImages.source_vishnu_narayana,
  'hanuman-aarti': chalisaImages.hanuman_lankadahan,
  'jai-ganesh-deva': backgroundImages.deity_ganesha_modak,
  'om-jai-shiv-omkara': shivaStrotamImages.shiva,
  'jai-ambe-gauri': backgroundImages.deity_durga_lion,
  'aarti-kunj-bihari': backgroundImages.deity_krishna_bansuri,
  'prabhati-shloka': backgroundImages.category_stotram_hymn_scroll,
  'surya-namaskar': backgroundImages.source_gayatri_savitri_sun,
  'tulsi-puja': backgroundImages.deity_krishna_bansuri,
  'bhojan-mantra': backgroundImages.category_granth_open_scripture,
  'gau-seva': backgroundImages.deity_krishna_bansuri,
  'sandhya-deepam': backgroundImages.category_aarti_diya,
  'ratri-shloka': backgroundImages.deity_rama_darbar,
  'saraswati-stotram': backgroundImages.deity_saraswati_veena,
  'saraswati-aarti': backgroundImages.deity_saraswati_veena,
  'gayatri-aarti': backgroundImages.source_gayatri_savitri_sun,
  'vidyarambha-prarthana': backgroundImages.deity_saraswati_veena,
  lingashtakam: shivaStrotamImages.shiva,
  madhurashtakam: backgroundImages.deity_krishna_bansuri,
  achyutashtakam: backgroundImages.source_vishnu_narayana,
  'devi-suktam': backgroundImages.deity_durga_lion,
  'purusha-suktam': backgroundImages.source_vishnu_narayana,
  'narayana-suktam': backgroundImages.source_vishnu_narayana,
  'rama-raksha-stotra': backgroundImages.deity_rama_darbar,
  'ganesha-kavacham': backgroundImages.deity_ganesha_modak,
  'shiva-kavacham': shivaStrotamImages.shiva,
  'durga-kavach': backgroundImages.deity_durga_lion,
  'krishna-stuti': backgroundImages.deity_krishna_bansuri,
  'durga-stuti-arjuna': backgroundImages.deity_durga_lion,
  'mahalakshmi-ashtakam': backgroundImages.source_vishnu_narayana,
  'surya-ashtakam': backgroundImages.source_gayatri_savitri_sun,
  radhashtakam: backgroundImages.deity_krishna_bansuri,
  'subrahmanya-ashtakam': shivaStrotamImages.shiva,
  'kubera-stotram': backgroundImages.source_vishnu_narayana,
  gangashtakam: shivaStrotamImages.shiva,
  'bhavani-ashtakam': backgroundImages.deity_durga_lion,
  'narasimha-ashtakam': backgroundImages.source_vishnu_narayana,
  'datta-ashtakam': shivaStrotamImages.shiva,
  'shani-ashtakam': backgroundImages.source_gayatri_savitri_sun,
  'kalika-ashtakam': backgroundImages.deity_durga_lion,
  rudrashtakam: shivaStrotamImages.shiva,
  'navagraha-stotram': backgroundImages.source_gayatri_savitri_sun,
};

const hanumanChalisaOverrides: Record<string, BackgroundImage> = {
  'chaupai-09': chalisaImages.hanuman_sita,
  'chaupai-10': chalisaImages.hanuman_lankadahan,
  'chaupai-17': chalisaImages.hanuman_lankadahan,
  'chaupai-18': chalisaImages.hanuman_sea,
  'chaupai-19': chalisaImages.hanuman_sea,
  'chaupai-31': chalisaImages.hanuman_sita,
};

export function getCategoryBackground(categoryId: ContentCategory): BackgroundImage {
  return categoryBackgrounds[categoryId];
}

export function getDeityBackground(deityId: Deity): BackgroundImage {
  return deityBackgrounds[deityId];
}

/**
 * Per-temple Theerth background overrides, keyed by temple id. Used for
 * shrines whose presiding-deity plate is too generic for the temple detail.
 */
const theerthBackgroundOverrides: Record<string, BackgroundImage> = {
  'khatu-shyam': backgroundImages.theerth_khatu_shyam,
  'vetrimalai-murugan': backgroundImages.theerth_vetrimalai_murugan,
  sabarimala: backgroundImages.theerth_sabarimala,
  'gogaji-gogamedi': backgroundImages.theerth_gogaji_gogamedi,
  'tejaji-kharnal': backgroundImages.theerth_tejaji_kharnal,
  'khandoba-jejuri': backgroundImages.theerth_khandoba_jejuri,
  'mahasu-devta-hanol': backgroundImages.theerth_mahasu_devta_hanol,
  ramdevra: backgroundImages.theerth_ramdevra,
  'salasar-balaji': backgroundImages.theerth_salasar_balaji,
  'karni-mata': backgroundImages.theerth_karni_mata,
  'jeen-mata': backgroundImages.theerth_jeen_mata,
};

export function getTheerthBackground(templeId: string, deityId: Deity): BackgroundImage {
  return theerthBackgroundOverrides[templeId] ?? getDeityBackground(deityId);
}

const deityBackgroundList: BackgroundImage[] = Object.values(deityBackgrounds);

/**
 * A random deity backdrop, for the "By Deity" index which isn't tied to a single
 * deity. Callers memoize per mount (useMemo []) so the pick is stable while the
 * screen is open but varies between visits — same spirit as the Home spotlight
 * shuffle.
 */
export function getRandomDeityBackground(): BackgroundImage {
  return deityBackgroundList[Math.floor(Math.random() * deityBackgroundList.length)];
}

export function getSourceBackground(sourceId: string): BackgroundImage | null {
  return sourceBackgrounds[sourceId] ?? null;
}

export function getReaderBackground(
  sourceId: string,
  verse?: ReaderBackgroundVerse
): BackgroundImage | null {
  if (sourceId === 'hanuman-chalisa') {
    return (verse?.id && hanumanChalisaOverrides[verse.id]) || chalisaImages.ram_hanuman;
  }

  if (sourceId === 'valmiki-ramayan') {
    // `verse.stanza` carries the kāṇḍa number (see `ValmikiRamayanVerse`), so the
    // plate changes per kāṇḍa and stays deterministic per verse.
    const kanda = verse?.stanza ?? 1;
    if (kanda === 4) return chalisaImages.ram_hanuman; // Kiṣkindhā — Rāma meets Hanumān
    if (kanda === 5) return chalisaImages.hanuman_sea; // Sundara — Hanumān crosses the ocean
    return backgroundImages.deity_rama_darbar;
  }

  if (sourceId === 'sundarkand') {
    const stanza = verse?.stanza ?? 1;
    if (stanza <= 4) return chalisaImages.hanuman_sea;
    if (stanza <= 11) return chalisaImages.hanuman_sita;
    if (stanza <= 18) return chalisaImages.hanuman_lankadahan;
    return chalisaImages.ram_hanuman;
  }

  return getSourceBackground(sourceId);
}

(function assertBackgroundCoverage() {
  for (const category of categories.filter((item) => item.status === 'active')) {
    if (!getCategoryBackground(category.id)) {
      throw new Error(`backgrounds: missing category background for ${category.id}`);
    }
  }

  for (const deity of deities) {
    if (!getDeityBackground(deity.id)) {
      throw new Error(`backgrounds: missing deity background for ${deity.id}`);
    }
  }

  for (const entry of library.filter((item) => item.status === 'active' && !item.hidden)) {
    // Theerth entries open TheerthMapScreen and a per-temple detail screen that
    // renders the temple's deity background (see TheerthDetailScreen), not a verse
    // reader — so they have no source/reader background entry here. Category
    // background is still enforced above.
    if (entry.category === 'theerth') continue;
    if (!getSourceBackground(entry.id)) {
      throw new Error(`backgrounds: missing source background for ${entry.id}`);
    }
    if (!getReaderBackground(entry.id, { id: 'coverage', stanza: 1 })) {
      throw new Error(`backgrounds: missing reader background for ${entry.id}`);
    }
  }

  for (const aartiId of aartiIdByIndex) {
    if (!getSourceBackground(aartiId)) {
      throw new Error(`backgrounds: missing aarti background for ${aartiId}`);
    }
  }

  for (const mantra of japamMantras) {
    if (!getSourceBackground(mantra.id)) {
      throw new Error(`backgrounds: missing japa background for ${mantra.id}`);
    }
  }
})();
