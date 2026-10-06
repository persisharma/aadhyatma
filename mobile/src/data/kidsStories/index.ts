import type { Lang } from '@/data/gita/language';
import type { DeityIconKey } from '@/data/deities';
import content from './krishna-janma.json';

export type StoryText = Record<Lang, string>;
export type StoryDeityId = 'krishna' | 'ganesha' | 'hanuman';
export type StoryDeity = {
  id: StoryDeityId;
  name: StoryText;
  iconKey: DeityIconKey;
};

export const storyDeities: readonly StoryDeity[] = [
  { id: 'krishna', iconKey: 'bansuriPeacockFeather', name: { hi: 'कृष्ण', en: 'Krishna', gu: 'કૃષ્ણ', kn: 'ಕೃಷ್ಣ' } },
  { id: 'ganesha', iconKey: 'modak', name: { hi: 'गणेश', en: 'Ganesha', gu: 'ગણેશ', kn: 'ಗಣೇಶ' } },
  { id: 'hanuman', iconKey: 'gada', name: { hi: 'हनुमान', en: 'Hanuman', gu: 'હનુમાન', kn: 'ಹನುಮಾನ್' } },
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
  coverArt: string;
  title: StoryText;
  description: StoryText;
  sourceNote: StoryText;
  takeaway: StoryText;
  pages: StoryPage[];
};

export const kidsStories: readonly KidsStory[] = [content as KidsStory];
export const getKidsStory = (id: string) => kidsStories.find(story => story.id === id);
export const storiesForDeity = (deityId: StoryDeityId) => kidsStories.filter(story => story.deityId === deityId);
/** Catalog teasers only; these have no reader route until sourced story text and art ship. */
export const plannedStories: readonly { id: string; deityId: StoryDeityId; title: StoryText }[] = [
  { id: 'kaliya-nag', deityId: 'krishna', title: { hi: 'कालिया नाग', en: 'Kaliya Nag', gu: 'કાલિય નાગ', kn: 'ಕಾಳಿಯ ನಾಗ' } },
];
/** Missing translations fall back to authored English, never re-scripted Hindi. */
export const storyText = (text: Partial<StoryText>, lang: Lang): string => text[lang]?.trim() || text.en || text.hi || '';
export function storyPageIndex(story: KidsStory, pageId?: string): number {
  return Math.max(0, story.pages.findIndex(page => page.id === pageId));
}
