/** Editorial gate for the collection: author identity alone never qualifies a poem. */
export const dohaThemes = ['bhakti', 'suvichar'] as const;
export type DohaTheme = typeof dohaThemes[number];

export function hasAllowedDohaThemes(value: unknown): value is DohaTheme[] {
  return Array.isArray(value) && value.length > 0 &&
    value.every(theme => theme === 'bhakti' || theme === 'suvichar') &&
    new Set(value).size === value.length;
}
