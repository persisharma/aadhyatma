import type { Lang } from '@/data/gita/language';
import { storyText, type KidsStory } from '@/data/kidsStories';
import { pick } from '@/utils/localize';
import { MAX_SHARE_PAGES, paginateProse, type ProsePage } from '@/utils/shareCardPages';
import type { ShareableProse, ShareableProseScope } from '@/utils/shareVerse';

const languages: Lang[] = ['hi', 'en', 'gu', 'kn'];
const shelf = { hi: 'बच्चों की चित्र-कथाएँ', en: 'Stories for Kids', gu: 'બાળકોની ચિત્રવાર્તાઓ', kn: 'ಮಕ್ಕಳ ಚಿತ್ರಕಥೆಗಳು' };
type Unit = { scene: number | null; pages: Record<Lang, ProsePage[]> };
const translated = <T,>(fn: (lang: Lang) => T): Record<Lang, T> => Object.fromEntries(languages.map(lang => [lang, fn(lang)])) as Record<Lang, T>;

/** Complete artwork and fixed-size narration alternate; no scene, ending or source is dropped. */
export function kidsStoryShareable(story: KidsStory, pageIndex = 0): ShareableProse {
  const units: Unit[] = story.pages.map((page, i) => ({
    scene: i + 1,
    pages: translated(lang => [
      { title: storyText(page.title, lang), blocks: [], usedDp: 0,
        illustration: { art: page.art, label: storyText(page.title, lang) } },
      ...paginateProse({
        title: storyText(page.title, lang), lang,
        blocks: [
          { kind: 'para', text: storyText(page.text, lang) },
          ...(page.dialogue ? [{ kind: 'para' as const, text: `${storyText(page.dialogue.speaker, lang)}: ${storyText(page.dialogue.text, lang)}` }] : []),
        ],
      }).pages,
    ]),
  }));
  const ending: Unit = { scene: null, pages: translated(lang => paginateProse({
    title: pick(lang, { hi: 'कथा की सीख और स्रोत', en: 'Takeaway & source', gu: 'વાર્તાની શીખ અને સ્રોત', kn: 'ಕಥೆಯ ಪಾಠ ಮತ್ತು ಮೂಲ' }), lang,
    blocks: [{ kind: 'para', text: storyText(story.takeaway, lang) }, { kind: 'para', text: storyText(story.sourceNote, lang) }],
  }).pages) };
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
    kind: 'prose', sourceId: `kids-story-${story.id}`, background: null,
    sectionNameHi: shelf.hi, sectionNameEn: shelf.en, sectionName: shelf,
    tagNameHi: story.title.hi, tagNameEn: story.title.en,
    sheetTitle: { hi: 'चित्र-कथा साझा करें', en: 'Share picture story', gu: 'ચિત્રવાર્તા શેર કરો', kn: 'ಚಿತ್ರಕಥೆ ಹಂಚಿಕೊಳ್ಳಿ' },
    scopes: [...parts.map((group, i) => scope(`part-${i + 1}`, group, i + 1)), scope(`scene-${current + 1}`, [units[current], ...(current === units.length - 1 ? [ending] : [])])],
  };
}
