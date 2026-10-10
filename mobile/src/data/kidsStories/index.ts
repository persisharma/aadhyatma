import type { Lang } from '@/data/gita/language';
import type { DeityIconKey } from '@/data/deities';
import content from './krishna-janma.json';
import putana from './putana.json';
import kaliyaNag from './kaliya-nag.json';
import ganeshaBirth from './ganesha-birth.json';
import hanumanSun from './hanuman-sun.json';
import durgaMahishasura from './durga-mahishasura.json';
import durgaRaktabeej from './durga-raktabeej.json';
import durgaNavaratri from './durga-navaratri.json';
import durgaShailaputri from './durga-shailaputri.json';
import durgaBrahmacharini from './durga-brahmacharini.json';
import durgaKushmanda from './durga-kushmanda.json';
import durgaKalaratri from './durga-kalaratri.json';
import durgaSiddhidatri from './durga-siddhidatri.json';
import durgaChandraghanta from './durga-chandraghanta.json';
import durgaSkandamata from './durga-skandamata.json';
import durgaMahagauri from './durga-mahagauri.json';
import durgaShumbhaNishumbha from './durga-shumbha-nishumbha.json';
import durgaSurathaSamadhi from './durga-suratha-samadhi.json';
import durgaShakambhari from './durga-shakambhari.json';

export type StoryText = Record<Lang, string>;
export type StoryDeityId = 'krishna' | 'ganesha' | 'hanuman' | 'durga';
export type StoryDeity = {
  id: StoryDeityId;
  name: StoryText;
  iconKey: DeityIconKey;
};

export const storyDeities: readonly StoryDeity[] = [
  { id: 'krishna', iconKey: 'bansuriPeacockFeather', name: { hi: 'कृष्ण', en: 'Krishna', gu: 'કૃષ્ણ', kn: 'ಕೃಷ್ಣ' } },
  { id: 'ganesha', iconKey: 'modak', name: { hi: 'गणेश', en: 'Ganesha', gu: 'ગણેશ', kn: 'ಗಣೇಶ' } },
  { id: 'hanuman', iconKey: 'gada', name: { hi: 'हनुमान', en: 'Hanuman', gu: 'હનુમાન', kn: 'ಹನುಮಾನ್' } },
  { id: 'durga', iconKey: 'lotus', name: { hi: 'माँ दुर्गा', en: 'Maa Durga', gu: 'મા દુર્ગા', kn: 'ದುರ್ಗಾ ಮಾತೆ' } },
];
export const getStoryDeity = (id: StoryDeityId) => storyDeities.find(deity => deity.id === id);
export type StoryPage = {
  id: string;
  /** Language-independent artwork key; never selected using lang. */
  art: string;
  source: string;
  title: StoryText;
  text: StoryText;
  dialogue?: { speaker: StoryText; text: StoryText };
  /** Add only when a real recording exists for that locale. */
  audio?: Partial<Record<Lang, string>>;
};
export type KidsStory = {
  id: string;
  deityId: StoryDeityId;
  ageMin: number;
  /** Form profiles and festival context are labelled separately from narrative stories. */
  kind?: 'story' | 'introduction';
  coverArt: string;
  title: StoryText;
  description: StoryText;
  sourceNote: StoryText;
  /** Publication provenance for authored retellings; legacy records may omit it. */
  source?: {
    baseText: string;
    retrievedOn: string;
    referenceUrls: string[];
    notes: string;
  };
  takeaway: StoryText;
  pages: StoryPage[];
};

export const kidsStories: readonly KidsStory[] = [
  content as KidsStory, putana as KidsStory, kaliyaNag as KidsStory,
  ganeshaBirth as KidsStory, hanumanSun as KidsStory,
  durgaNavaratri as KidsStory, durgaShailaputri as KidsStory, durgaBrahmacharini as KidsStory,
  durgaKushmanda as KidsStory, durgaMahishasura as KidsStory, durgaKalaratri as KidsStory,
  durgaSiddhidatri as KidsStory, durgaRaktabeej as KidsStory,
  durgaChandraghanta as KidsStory, durgaSkandamata as KidsStory, durgaMahagauri as KidsStory, durgaShumbhaNishumbha as KidsStory, durgaSurathaSamadhi as KidsStory, durgaShakambhari as KidsStory,
];

export type NavadurgaReading = { id: string; day: number; name: StoryText; storyId: string };
/** Katyayani opens the complete Mahishasura story, without a duplicate retelling. */
export const navadurgaReadings: readonly NavadurgaReading[] = [
  { id: 'shailaputri', day: 1, name: { hi: 'शैलपुत्री', en: 'Shailaputri', gu: 'શૈલપુત્રી', kn: 'ಶೈಲಪುತ್ರಿ' }, storyId: 'durga-shailaputri' },
  { id: 'brahmacharini', day: 2, name: { hi: 'ब्रह्मचारिणी', en: 'Brahmacharini', gu: 'બ્રહ્મચારિણી', kn: 'ಬ್ರಹ್ಮಚಾರಿಣಿ' }, storyId: 'durga-brahmacharini' },
  { id: 'chandraghanta', day: 3, name: { hi: 'चंद्रघंटा', en: 'Chandraghanta', gu: 'ચંદ્રઘંટા', kn: 'ಚಂದ್ರಘಂಟಾ' }, storyId: 'durga-chandraghanta' },
  { id: 'kushmanda', day: 4, name: { hi: 'कूष्मांडा', en: 'Kushmanda', gu: 'કૂષ્માંડા', kn: 'ಕೂಷ್ಮಾಂಡಾ' }, storyId: 'durga-kushmanda' },
  { id: 'skandamata', day: 5, name: { hi: 'स्कंदमाता', en: 'Skandamata', gu: 'સ્કંદમાતા', kn: 'ಸ್ಕંદಮಾತಾ' }, storyId: 'durga-skandamata' },
  { id: 'katyayani', day: 6, name: { hi: 'कात्यायनी', en: 'Katyayani', gu: 'કાત્યાયની', kn: 'ಕಾತ್ಯಾಯನಿ' }, storyId: 'durga-mahishasura' },
  { id: 'kalaratri', day: 7, name: { hi: 'कालरात्रि', en: 'Kalaratri', gu: 'કાલરાત્રિ', kn: 'ಕಾಲರಾತ್ರಿ' }, storyId: 'durga-kalaratri' },
  { id: 'mahagauri', day: 8, name: { hi: 'महागौरी', en: 'Mahagauri', gu: 'મહાગૌરી', kn: 'ಮಹಾಗೌರಿ' }, storyId: 'durga-mahagauri' },
  { id: 'siddhidatri', day: 9, name: { hi: 'सिद्धिदात्री', en: 'Siddhidatri', gu: 'સિદ્ધિદાત્રી', kn: 'ಸಿದ್ಧಿದಾತ್ರಿ' }, storyId: 'durga-siddhidatri' },
];
export const getKidsStory = (id: string) => kidsStories.find(story => story.id === id);
export const storiesForDeity = (deityId: StoryDeityId) => kidsStories.filter(story => story.deityId === deityId);
/** Catalog teasers only; these have no reader route until sourced story text and art ship. */
export const plannedStories: readonly { id: string; deityId: StoryDeityId; title: StoryText }[] = [];
/** Missing translations fall back to authored English, never re-scripted Hindi. */
export const storyText = (text: Partial<StoryText>, lang: Lang): string => text[lang]?.trim() || text.en || text.hi || '';
export function storyPageIndex(story: KidsStory, pageId?: string): number {
  return Math.max(0, story.pages.findIndex(page => page.id === pageId));
}
