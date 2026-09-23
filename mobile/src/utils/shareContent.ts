/**
 * Builders from each content surface's data to what the share provider takes
 * (PRD-45, design.md §39.4). Pure — screens call these inside their share handler,
 * so the mapping for every surface lives in one tested place rather than inline.
 *
 * Verse-shaped content (a Daan principle, a Vidhi mantra) maps onto the existing
 * verse card. Long prose (kathas, Theerth readings) becomes `ShareableProse` with one
 * or more scopes; the provider paginates it into a series.
 *
 * Deliberately absent: the Pitru surfaces (design.md §63 and §74 lock "no share
 * surface" for Pitru Smaran and its परिचय layer) and the personal-tithi Vidhi (the
 * tila-tarpana guide shares that register).
 */

import type { DaanKathaEntry, DaanPrincipleEntry } from '@/data/daan/types';
import type { KathaContentEntry } from '@/panchang/types';
import type { TempleEntry } from '@/data/theerth/temples';
import { getTheerthBackground } from '@/data/backgrounds';
import type {
  ShareableProse,
  ShareableProseBlock,
  ShareableProseScope,
  ShareableVerse,
} from '@/utils/shareVerse';

const para = (hi: string, en: string): ShareableProseBlock => ({ kind: 'para', hi, en });
const heading = (hi: string, en: string): ShareableProseBlock => ({ kind: 'heading', hi, en });

/** Split a single prose field on blank lines/newlines into paragraphs, pairing hi with en. */
function paragraphs(hi: string, en: string): ShareableProseBlock[] {
  const his = hi.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  const ens = en.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  // Paragraph counts can differ between languages; pair by index only when they match.
  if (his.length === ens.length) return his.map((h, i) => para(h, ens[i]));
  return [para(his.join(' '), ens.join(' '))];
}

/** Pair two paragraph arrays; the shorter language falls back to one joined block. */
function pairParagraphs(his: readonly string[], ens: readonly string[]): ShareableProseBlock[] {
  if (his.length === ens.length) return his.map((h, i) => para(h, ens[i]));
  return [para(his.join(' '), ens.join(' '))];
}

// ─── Verse-shaped ───────────────────────────────────────────────────────────

/** A दान-पुण्य principle: its shloka (or, for a teaching row, its title) + meaning. */
export function daanPrincipleShareable(entry: DaanPrincipleEntry): ShareableVerse {
  const linesHi = entry.verseLines ? [...entry.verseLines] : [entry.titleHi];
  const linesEn = entry.verseLines
    ? [...(entry.iastLines ?? entry.verseLines)]
    : [entry.titleEn || entry.titleHi];
  return {
    sourceId: 'daan-punya',
    sectionNameHi: 'दान-पुण्य',
    sectionNameEn: 'Daan Punya',
    verseLabelHi: entry.citeHi,
    verseLabelEn: entry.citeEn || entry.citeHi,
    linesHi,
    linesEn,
    meaningHi: entry.meaningHi,
    meaningEn: entry.meaningEn,
  };
}

/** A Vidhi step's verified mantra, with its instruction as the meaning. */
export function vidhiMantraShareable(
  vidhi: { id: string; titleHi: string; titleEn: string },
  step: {
    titleHi: string;
    titleEn: string;
    instructionHi: string;
    instructionEn: string;
    mantra: { devanagari: string; iast: string };
  }
): ShareableVerse {
  const lines = (s: string) => s.split('\n').map((l) => l.trim()).filter(Boolean);
  return {
    sourceId: vidhi.id,
    sectionNameHi: vidhi.titleHi,
    sectionNameEn: vidhi.titleEn,
    verseLabelHi: `मन्त्र · ${step.titleHi}`,
    verseLabelEn: `Mantra · ${step.titleEn}`,
    linesHi: lines(step.mantra.devanagari),
    linesEn: lines(step.mantra.iast),
    meaningHi: step.instructionHi,
    meaningEn: step.instructionEn,
  };
}

// ─── Prose ──────────────────────────────────────────────────────────────────

/**
 * A vrat katha, opened on one section. Two scopes when the katha has more than one
 * section: "this part" (default — it usually fits a short carousel) and "the whole
 * katha" (section titles become in-flow headings).
 */
export function vratKathaShareable(katha: KathaContentEntry, sectionIndex: number): ShareableProse {
  const total = katha.sections.length;
  const idx = Math.max(0, Math.min(total - 1, sectionIndex));
  const section = katha.sections[idx];
  const scopes: ShareableProseScope[] = [
    {
      id: `section-${section.id}`,
      labelHi: 'यह प्रसंग',
      labelEn: 'This part',
      headerHi: total > 1 ? `${katha.titleHi} · प्रसंग ${idx + 1}/${total}` : katha.titleHi,
      headerEn: total > 1 ? `${katha.titleEn} · Part ${idx + 1}/${total}` : katha.titleEn,
      titleHi: section.titleHi,
      titleEn: section.titleEn,
      blocks: pairParagraphs(section.bodyHi, section.bodyEn),
    },
  ];
  if (total > 1) {
    scopes.push({
      id: 'whole',
      labelHi: 'पूरी कथा',
      labelEn: 'Whole katha',
      headerHi: katha.titleHi,
      headerEn: katha.titleEn,
      titleHi: katha.titleHi,
      titleEn: katha.titleEn,
      blocks: katha.sections.flatMap((s) => [
        heading(s.titleHi, s.titleEn),
        ...pairParagraphs(s.bodyHi, s.bodyEn),
      ]),
    });
  }
  return {
    kind: 'prose',
    sourceId: `katha-${katha.id}`,
    background: null,
    sectionNameHi: 'व्रत कथा',
    sectionNameEn: 'Vrat Katha',
    tagNameHi: katha.titleHi,
    tagNameEn: katha.titleEn,
    scopes,
  };
}

/** A दान teaching-katha: the story, then its शिक्षा and source line. One scope. */
export function daanKathaShareable(katha: DaanKathaEntry): ShareableProse {
  return {
    kind: 'prose',
    sourceId: 'daan-punya',
    background: null,
    sectionNameHi: 'दान-पुण्य',
    sectionNameEn: 'Daan Punya',
    tagNameHi: katha.titleHi,
    tagNameEn: katha.titleEn,
    scopes: [
      {
        id: 'whole',
        labelHi: 'पूरी कथा',
        labelEn: 'Whole katha',
        headerHi: 'कथा',
        headerEn: 'Katha',
        titleHi: katha.titleHi,
        titleEn: katha.titleEn,
        blocks: [
          ...katha.sections.flatMap((s) => pairParagraphs(s.paragraphsHi, s.paragraphsEn)),
          heading('शिक्षा', 'The teaching'),
          para(katha.teachingHi, katha.teachingEn),
          para(`स्रोत: ${katha.canonHi}`, `Source: ${katha.canonEn || katha.canonHi}`),
        ],
      },
    ],
  };
}

/**
 * A Theerth temple's reading. "Significance & origin" is the default scope; when the
 * temple carries the extended §12.6 reading, "Full reading" adds every section.
 */
export function theerthShareable(temple: TempleEntry): ShareableProse {
  const core: ShareableProseBlock[] = [
    heading('महिमा', 'Significance'),
    ...paragraphs(temple.significanceHi, temple.significanceEn),
    heading('उद्भव कथा', 'Origin Story'),
    ...paragraphs(temple.originStoryHi, temple.originStoryEn),
  ];
  const header = { headerHi: `${temple.nameHi} · ${temple.cityHi}`, headerEn: `${temple.nameEn} · ${temple.cityEn}` };
  const scopes: ShareableProseScope[] = [
    {
      id: 'core',
      labelHi: 'महिमा व कथा',
      labelEn: 'Significance & story',
      ...header,
      titleHi: temple.nameHi,
      titleEn: temple.nameEn,
      blocks: core,
    },
  ];
  const sections = temple.sections ?? [];
  if (sections.length) {
    scopes.push({
      id: 'full',
      labelHi: 'पूरा परिचय',
      labelEn: 'Full reading',
      ...header,
      titleHi: temple.nameHi,
      titleEn: temple.nameEn,
      blocks: [
        ...core,
        ...sections.flatMap((s) => [heading(s.titleHi, s.titleEn), ...paragraphs(s.bodyHi, s.bodyEn)]),
      ],
    });
  }
  return {
    kind: 'prose',
    sourceId: `theerth-${temple.id}`,
    background: getTheerthBackground(temple.id, temple.deity),
    sectionNameHi: 'तीर्थ',
    sectionNameEn: 'Theerth',
    tagNameHi: temple.nameHi,
    tagNameEn: temple.nameEn,
    sheetTitle: { hi: 'तीर्थ साझा करें', en: 'Share this theerth', gu: 'તીર્થ શેર કરો', kn: 'ತೀರ್ಥ ಹಂಚಿಕೊಳ್ಳಿ' },
    scopes,
  };
}

/**
 * A festival / vrat day (design.md §39.4, Phase 3): name + date, then what the app
 * already carries for it — the fast's rule, the bhog offerings, and the katha's
 * opening paragraph — each only when present. No authored greeting copy: every line
 * here is verified content the detail screen itself renders.
 */
export function observanceShareable(params: {
  rule: { id: string; nameHi: string; nameEn: string; deityHi?: string; deityEn?: string };
  date: { hi: string; en: string } | null;
  katha?: KathaContentEntry | null;
  upvas?: {
    fastTypeNoteHi: string;
    fastTypeNoteEn: string;
    window: { textHi: string; textEn: string };
  } | null;
  bhog?: { offerings: readonly { textHi: string; textEn: string }[] } | null;
}): ShareableProse {
  const { rule, date, katha, upvas, bhog } = params;
  const blocks: ShareableProseBlock[] = [];
  if (rule.deityHi) blocks.push(para(rule.deityHi, rule.deityEn || rule.deityHi));
  if (upvas) {
    blocks.push(heading('व्रत', 'The fast'));
    blocks.push(
      para(
        `${upvas.fastTypeNoteHi} · ${upvas.window.textHi}`,
        `${upvas.fastTypeNoteEn || upvas.fastTypeNoteHi} · ${upvas.window.textEn || upvas.window.textHi}`
      )
    );
  }
  if (bhog && bhog.offerings.length) {
    blocks.push(heading('भोग', 'Offerings'));
    blocks.push(
      para(
        bhog.offerings.map((o) => o.textHi).join(' · '),
        bhog.offerings.map((o) => o.textEn || o.textHi).join(' · ')
      )
    );
  }
  const opening = katha?.sections[0];
  if (katha && opening && opening.bodyHi.length) {
    blocks.push(heading(katha.titleHi, katha.titleEn));
    blocks.push(para(opening.bodyHi[0], opening.bodyEn[0] ?? opening.bodyHi[0]));
  }
  if (!blocks.length) blocks.push(para(rule.nameHi, rule.nameEn));
  return {
    kind: 'prose',
    sourceId: `observance-${rule.id}`,
    background: null,
    sectionNameHi: 'पर्व',
    sectionNameEn: 'Parv',
    tagNameHi: rule.nameHi,
    tagNameEn: rule.nameEn,
    sheetTitle: { hi: 'पर्व साझा करें', en: 'Share this day', gu: 'પર્વ શેર કરો', kn: 'ಪರ್ವ ಹಂಚಿಕೊಳ್ಳಿ' },
    scopes: [
      {
        id: 'day',
        labelHi: 'यह पर्व',
        labelEn: 'This day',
        headerHi: date ? date.hi : rule.nameHi,
        headerEn: date ? date.en : rule.nameEn,
        titleHi: rule.nameHi,
        titleEn: rule.nameEn,
        blocks,
      },
    ],
  };
}

/** An Ask Vedansh answer: headline, sub-line, each label/value line, and its note. */
export function askAnswerShareable(answer: {
  intentId: string;
  tag: { hi: string; en: string };
  headline: { hi: string; en: string };
  sub?: { hi: string; en: string };
  lines: readonly { label: { hi: string; en: string }; value: { hi: string; en: string } }[];
  note?: { hi: string; en: string };
}): ShareableProse {
  const blocks: ShareableProseBlock[] = [];
  if (answer.sub) blocks.push(para(answer.sub.hi, answer.sub.en));
  for (const line of answer.lines) {
    blocks.push(para(`${line.label.hi} — ${line.value.hi}`, `${line.label.en} — ${line.value.en}`));
  }
  if (answer.note) blocks.push(para(answer.note.hi, answer.note.en));
  return {
    kind: 'prose',
    sourceId: `ask-${answer.intentId}`,
    background: null,
    sectionNameHi: 'जिज्ञासा',
    sectionNameEn: 'Ask Vedansh',
    tagNameHi: answer.headline.hi,
    tagNameEn: answer.headline.en,
    sheetTitle: { hi: 'उत्तर साझा करें', en: 'Share this answer', gu: 'ઉત્તર શેર કરો', kn: 'ಉತ್ತರ ಹಂಚಿಕೊಳ್ಳಿ' },
    scopes: [
      {
        id: 'answer',
        labelHi: 'उत्तर',
        labelEn: 'Answer',
        headerHi: answer.tag.hi,
        headerEn: answer.tag.en,
        titleHi: answer.headline.hi,
        titleEn: answer.headline.en,
        blocks: blocks.length ? blocks : [para(answer.headline.hi, answer.headline.en)],
      },
    ],
  };
}
