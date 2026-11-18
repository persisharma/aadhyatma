import { library } from './texts';
import { getReadingLink } from './readingLinks';

export function getPracticeHymn(id: string) {
  const link = getReadingLink(id);
  if (link) return { id, nameHi: link.titleHi, nameEn: link.titleEn, sub: link.detailHi, subEn: link.detailEn };
  return library.find(
    (entry) => entry.id === id && entry.category === 'stotram' && entry.status === 'active' && !entry.hidden,
  );
}
