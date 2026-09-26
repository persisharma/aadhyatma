/** Shared by the native async adapter and real SQLite parity tests. */
export function librarySearchQuery(query: string, kind: string) {
  // Trigrams accelerate substring matching without changing the existing ranking.
  // Short queries keep exact substring semantics through an asynchronous scan.
  const indexed = [...query].length >= 3 && !query.includes('\0');
  const candidate = indexed ? 'AND e.ordinal IN (SELECT rowid FROM search_fts WHERE search_fts MATCH ?)' : '';
  const sql = `SELECT data, e.fields AS fields, MIN(CASE WHEN f.value = ? THEN 0
    WHEN substr(f.value,1,length(?)) = ? THEN 1 ELSE 2 END) AS rank
    FROM search_entries e, json_each(e.fields) f
    WHERE e.kind = ? ${candidate} AND instr(f.value, ?) > 0
    GROUP BY e.ordinal ORDER BY rank,e.ordinal LIMIT ?`;
  const params: (string | number)[] = [query, query, query, kind];
  if (indexed) {
    const chars = [...query];
    const grams = new Set(chars.slice(0,-2).map((_,i) => chars.slice(i,i+3).join('')));
    params.push([...grams].map((gram) => '"' + gram.replace(/"/g, '""') + '"').join(' AND '));
  }
  params.push(query, kind === 'verse' ? 51 : 1000);
  return { sql, params };
}
