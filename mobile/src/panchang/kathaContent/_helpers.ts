import type { KathaContentEntry, KathaContentSection } from '../types';

type SectionDraft = {
  id: string;
  titleHi: string;
  titleEn: string;
  bodyHi: string[];
  bodyEn: string[];
};

type FullKathaDraft = {
  id: string;
  titleHi: string;
  titleEn: string;
  sourceUrls?: string[];
  sections: SectionDraft[];
};

type SummaryKathaDraft = {
  id: string;
  titleHi: string;
  titleEn: string;
  themeHi: string;
  themeEn: string;
  practiceHi: string;
  practiceEn: string;
};

const sourceNoteHi = 'यह ऐप-लिखित, स्रोत-सूचित पुनर्कथन है; बाहरी स्रोत का मूल पाठ कॉपी नहीं किया गया है।';
const sourceNoteEn = 'This is an app-authored, source-informed retelling; external source story text is not copied.';

function section(draft: SectionDraft): KathaContentSection {
  return {
    id: draft.id,
    titleHi: draft.titleHi,
    titleEn: draft.titleEn,
    bodyHi: draft.bodyHi,
    bodyEn: draft.bodyEn,
  };
}

export function fullContent(draft: FullKathaDraft): KathaContentEntry {
  return {
    id: draft.id,
    titleHi: draft.titleHi,
    titleEn: draft.titleEn,
    contentStatus: 'original-content-ready',
    languageAvailability: 'bilingual',
    sourceUrls: draft.sourceUrls,
    sourceNoteHi,
    sourceNoteEn,
    sections: draft.sections.map(section),
  };
}

export function summaryContent(draft: SummaryKathaDraft): KathaContentEntry {
  return fullContent({
    id: draft.id,
    titleHi: draft.titleHi,
    titleEn: draft.titleEn,
    sections: [
      {
        id: 'katha',
        titleHi: 'कथा सार',
        titleEn: 'Story Summary',
        bodyHi: [draft.themeHi],
        bodyEn: [draft.themeEn],
      },
      {
        id: 'mahatva',
        titleHi: 'व्रत महत्त्व',
        titleEn: 'Observance Meaning',
        bodyHi: [draft.practiceHi],
        bodyEn: [draft.practiceEn],
      },
    ],
  });
}
