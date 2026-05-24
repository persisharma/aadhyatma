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
};

const deityBackgrounds: Record<Deity, BackgroundImage> = {
  rama: backgroundImages.deity_rama_darbar,
  krishna: backgroundImages.deity_krishna_bansuri,
  shiva: shivaStrotamImages.shiva,
  hanuman: chalisaImages.hanuman_sea,
  durga: backgroundImages.deity_durga_lion,
  ganesha: backgroundImages.deity_ganesha_modak,
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
  'durga-stotram': backgroundImages.deity_durga_lion,
  'ganesh-stotram': backgroundImages.deity_ganesha_modak,
  'vishnu-sahasranama': backgroundImages.source_vishnu_narayana,
  'shiv-chalisa': shivaStrotamImages.shiva,
  'durga-chalisa': backgroundImages.deity_durga_lion,
  'ganesh-chalisa': backgroundImages.deity_ganesha_modak,
  'hanuman-ashtak': chalisaImages.hanuman_lankadahan,
  'bajrang-baan': chalisaImages.hanuman_lankadahan,
  'ram-stuti': backgroundImages.deity_rama_darbar,
  'krishna-stotram': backgroundImages.deity_krishna_bansuri,
  'om-jai-jagdish': backgroundImages.source_vishnu_narayana,
  'hanuman-aarti': chalisaImages.hanuman_lankadahan,
  'sankat-mochan': chalisaImages.hanuman_sita,
  'jai-ganesh-deva': backgroundImages.deity_ganesha_modak,
  'om-jai-shiv-omkara': shivaStrotamImages.shiva,
  'jai-ambe-gauri': backgroundImages.deity_durga_lion,
  'aarti-kunj-bihari': backgroundImages.deity_krishna_bansuri,
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
