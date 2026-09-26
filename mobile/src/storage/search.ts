import { runSearch } from '../data/searchIndex';
export type { SearchResults } from '../data/searchIndex';
export async function searchLibrary(query: string) { return runSearch(query); }
