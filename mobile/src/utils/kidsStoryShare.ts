import type { Lang } from '@/data/gita/language';
import { storyText, type KidsStory } from '@/data/kidsStories';
import { SMART_LINK } from '@/data/shareLinks';
import { kidsStoryArtRetainedHeight } from '@/utils/kidsStoryArtFrame';
import { pick } from '@/utils/localize';
import { MAX_SHARE_PAGES, bodyWidthFor, paginateProse, pictureCardMetrics, type ProseBlockInput, type ProsePage } from '@/utils/shareCardPages';
import type { ShareableProse, ShareableProseScope } from '@/utils/shareVerse';

const languages: Lang[] = ['hi', 'en', 'gu', 'kn'];
const shelf = { hi: 'बच्चों की चित्र-कथाएँ', en: 'Stories for Kids', gu: 'બાળકોની ચિત્રવાર્તાઓ', kn: 'ಮಕ್ಕಳ ಚಿತ್ರಕಥೆಗಳು' };
type Unit = { scene: number | null; pages: Record<Lang, ProsePage[]> };
const translated = <T,>(fn: (lang: Lang) => T): Record<Lang, T> => Object.fromEntries(languages.map(lang => [lang, fn(lang)])) as Record<Lang, T>;
const layout = 'picture' as const;
const endingTitle = { hi: 'कथा की सीख और स्रोत', en: 'Takeaway & source', gu: 'વાર્તાની શીખ અને સ્રોત', kn: 'ಕಥೆಯ ಪಾಠ ಮತ್ತು ಮೂಲ' };
/** The app link on the last card: a PNG cannot be tapped, so the URL is printed and the share message carries it too. */
const appLink = { hi: 'पूरी चित्र-कथा Vedansh ऐप में पढ़ें', en: 'Read the whole picture story in the Vedansh app', gu: 'આખી ચિત્રવાર્તા Vedansh ઍપમાં વાંચો', kn: 'ಸಂಪೂರ್ಣ ಚಿತ್ರಕಥೆ Vedansh ಆ್ಯಪ್‌ನಲ್ಲಿ ಓದಿ' };

/**
 * One picture card: the complete art at the body's full width when the caption leaves
 * room for it, narrower (never under `illustrationMinHeight`) when it does not; the
 * title and caption sit in the reader's box below. A caption longer than that
 * continues on a plain card.
 */
function illustrated(art: string, label: string, title: string, lang: Lang, blocks: ProseBlockInput[], minHeight: number): ProsePage[] {
  const { illustrationGap } = pictureCardMetrics;
  const { pages, budgetDp } = paginateProse({ title, lang, blocks, layout, firstPageReservedDp: minHeight + illustrationGap });
  const [first, ...rest] = pages;
  const fullWidth = bodyWidthFor(layout) * 1.25 * kidsStoryArtRetainedHeight(art);
  const heightDp = Math.max(minHeight, Math.min(fullWidth, budgetDp - illustrationGap - first.usedDp));
  return [{ ...first, illustration: { art, label, heightDp } }, ...rest];
}

/**
 * The series looks like the reader: one 9:16 picture card per scene (art, title,
 * narration, dialogue in its tinted box), then a closing card with the cover art, the
 * takeaway, the source note and the app link. No scene, ending or source is dropped.
 */
export function kidsStoryShareable(story: KidsStory, pageIndex = 0): ShareableProse {
  const units: Unit[] = story.pages.map((page, i) => ({
    scene: i + 1,
    pages: translated(lang => illustrated(page.art, storyText(page.title, lang), storyText(page.title, lang), lang, [
      { kind: 'para', text: storyText(page.text, lang) },
      ...(page.dialogue ? [{ kind: 'quote' as const, speaker: storyText(page.dialogue.speaker, lang), text: storyText(page.dialogue.text, lang) }] : []),
    ], pictureCardMetrics.illustrationMinHeight)),
  }));
  const ending: Unit = { scene: null, pages: translated(lang => illustrated(story.coverArt, storyText(story.title, lang), pick(lang, endingTitle), lang, [
    { kind: 'para', text: storyText(story.takeaway, lang) },
    { kind: 'para', text: storyText(story.sourceNote, lang) },
    { kind: 'link', text: pick(lang, appLink), url: SMART_LINK },
  ], pictureCardMetrics.coverMinHeight)) };
  const parts: Unit[][] = [];
  for (const unit of [...units, ending]) {
    const last = parts[parts.length - 1];
    if (!last || languages.some(lang => last.reduce((n, u) => n + u.pages[lang].length, 0) + unit.pages[lang].length > MAX_SHARE_PAGES)) parts.push([unit]);
    else last.push(unit);
  }
  const scope = (id: string, group: Unit[], part?: number): ShareableProseScope => ({
    id, labelHi: '', labelEn: '', headerHi: story.title.hi, headerEn: story.title.en, blocks: [],
    prepared: translated(lang => {
      const label = part === undefined
        ? pick(lang, { hi: 'यह पृष्ठ', en: 'This scene', gu: 'આ પાનું', kn: 'ಈ ಪುಟ' })
        : parts.length === 1
          ? pick(lang, { hi: 'पूरी चित्र-कथा', en: 'Whole picture story', gu: 'આખી ચિત્રવાર્તા', kn: 'ಸಂಪೂರ್ಣ ಚಿತ್ರಕಥೆ' })
          : pick(lang, { hi: `भाग ${part}/${parts.length}`, en: `Part ${part}/${parts.length}`, gu: `ભાગ ${part}/${parts.length}`, kn: `ಭಾಗ ${part}/${parts.length}` });
      const scenes = group.flatMap(u => u.scene === null ? [] : [u.scene]);
      const range = scenes.length ? `${scenes[0]}–${scenes[scenes.length - 1]}/${story.pages.length}` : '';
      return {
        label: `${label}${part !== undefined && range ? ` · ${range}` : ''}`,
        header: `${part === undefined ? `${scenes[0]}/${story.pages.length}` : `${part}/${parts.length}`} · ${storyText(story.title, lang)}`,
        firstLine: storyText(story.title, lang), pages: group.flatMap(u => u.pages[lang]),
      };
    }),
  });
  const current = Math.max(0, Math.min(units.length - 1, pageIndex));
  return {
    kind: 'prose', layout, sourceId: `kids-story-${story.id}`, background: null,
    sectionNameHi: shelf.hi, sectionNameEn: shelf.en, sectionName: shelf,
    tagNameHi: story.title.hi, tagNameEn: story.title.en,
    sheetTitle: { hi: 'चित्र-कथा साझा करें', en: 'Share picture story', gu: 'ચિત્રવાર્તા શેર કરો', kn: 'ಚಿತ್ರಕಥೆ ಹಂಚಿಕೊಳ್ಳಿ' },
    scopes: [...parts.map((group, i) => scope(`part-${i + 1}`, group, i + 1)), scope(`scene-${current + 1}`, [units[current], ...(current === units.length - 1 ? [ending] : [])])],
  };
}
