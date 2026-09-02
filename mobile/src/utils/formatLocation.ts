import type { ReadingProgress } from '@/contexts/ReadingProgressContext';

export function formatLocation(progress: ReadingProgress): { hi: string; en: string } {
  const verseNum = progress.verseIndex + 1;
  switch (progress.sourceId) {
    case 'hanuman-chalisa':
    case 'shiv-chalisa':
    case 'durga-chalisa':
    case 'ganesh-chalisa':
      return { hi: `पद ${verseNum}`, en: `Verse ${verseNum}` };
    case 'bhagavad-gita':
      return {
        hi: `अध्याय ${progress.chapter} · श्लोक ${verseNum}`,
        en: `Chapter ${progress.chapter} · Verse ${verseNum}`,
      };
    case 'sundarkand':
      return {
        hi: `सर्ग ${progress.chapter} · पद ${verseNum}`,
        en: `Sarga ${progress.chapter} · Verse ${verseNum}`,
      };
    case 'shiva-strotam':
    case 'durga-stotram':
    case 'ganesh-stotram':
    case 'vishnu-sahasranama':
    case 'hanuman-ashtak':
    case 'ram-stuti':
      return {
        hi: `स्तोत्र ${progress.chapter} · पद ${verseNum}`,
        en: `Stotram ${progress.chapter} · Verse ${verseNum}`,
      };
    case 'ramcharitmanas':
      return {
        hi: `काण्ड ${progress.chapter} · पद ${verseNum}`,
        en: `Kanda ${progress.chapter} · Verse ${verseNum}`,
      };
    case 'valmiki-ramayan':
      return {
        hi: `काण्ड ${progress.chapter} · श्लोक ${verseNum}`,
        en: `Kanda ${progress.chapter} · Shloka ${verseNum}`,
      };
    case 'om-jai-jagdish':
    case 'hanuman-aarti':
    case 'sankat-mochan':
    case 'jai-ganesh-deva':
    case 'om-jai-shiv-omkara':
    case 'jai-ambe-gauri':
    case 'aarti-kunj-bihari':
      return { hi: `पद ${verseNum}`, en: `Verse ${verseNum}` };
    default:
      return { hi: `पद ${verseNum}`, en: `Verse ${verseNum}` };
  }
}
