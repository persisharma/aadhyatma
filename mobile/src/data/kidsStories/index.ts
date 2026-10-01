import type { Lang } from '@/data/gita/language';
import content from './krishna-janma.json';

export type StoryText = Record<Lang, string>;
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
  ageMin: number;
  coverArt: string;
  title: StoryText;
  description: StoryText;
  sourceNote: StoryText;
  takeaway: StoryText;
  pages: StoryPage[];
};

export const kidsStories: readonly KidsStory[] = [content];
export const getKidsStory = (id: string) => kidsStories.find(story => story.id === id);
/** Missing translations fall back to authored English, never re-scripted Hindi. */
export const storyText = (text: Partial<StoryText>, lang: Lang): string => text[lang]?.trim() || text.en || text.hi || '';
export function storyPageIndex(story: KidsStory, pageId?: string): number {
  return Math.max(0, story.pages.findIndex(page => page.id === pageId));
}
