import { database } from './content.native';
import { normalize } from '../data/searchNormalize';
import { librarySearchQuery } from './searchQuery';
import type { SearchResults, SearchHit, SearchEntry, SearchSectionEntry, SearchDeityEntry, SearchVerseEntry } from '../data/searchIndex';
export type { SearchResults } from '../data/searchIndex';

export async function searchLibrary(raw: string): Promise<SearchResults> {
  const q = normalize(raw);
  if (!q) return { query: raw, sections: [], deities: [], verses: [], versesCapped: false };
  const query = async <E extends SearchEntry>(kind: string): Promise<SearchHit<E>[]> => {
    const { sql, params } = librarySearchQuery(q, kind);
    const rows = await database().getAllAsync<{data: string; fields: string; rank: number}>(sql, params);
    return rows.map(({data,fields,rank}) => {
      const fieldsNorm = JSON.parse(fields) as string[];
      return {entry: {...JSON.parse(data), fieldsNorm, norm: fieldsNorm.join(' ')} as E,rank};
    });
  };
  const [sections,deities,verses] = await Promise.all([query<SearchSectionEntry>('section'),query<SearchDeityEntry>('deity'),query<SearchVerseEntry>('verse')]);
  return { query: raw, sections, deities, verses: verses.slice(0,50), versesCapped: verses.length > 50 };
}
