// ONE-TIME: split the monolithic src/panchang/kathaContent.ts into per-katha
// files. Produces:
//   src/panchang/kathaContent/_helpers.ts        (exported fullContent/summaryContent)
//   src/panchang/kathaContent/entries/<id>.ts    (one default-export per katha)
//   src/panchang/kathaContent/index.ts           (generated barrel -> KATHA_CONTENT)
// and rewrites src/panchang/kathaContent.ts into a thin barrel that keeps the
// public API (KATHA_CONTENT, KATHA_CONTENT_BY_ID, getKathaContent) + invariants.
//
// Run from mobile/:  npx tsx scripts/vrat-split.mts

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const FILE = 'src/panchang/kathaContent.ts';
const DIR = 'src/panchang/kathaContent';
const ENTRIES = `${DIR}/entries`;

function skipToken(src: string, i: number): number {
  const c = src[i];
  if (c === "'" || c === '"' || c === '`') {
    i++;
    while (i < src.length) { if (src[i] === '\\') { i += 2; continue; } if (src[i] === c) return i + 1; i++; }
    return i;
  }
  if (c === '/' && src[i + 1] === '/') { const n = src.indexOf('\n', i); return n < 0 ? src.length : n; }
  if (c === '/' && src[i + 1] === '*') { const n = src.indexOf('*/', i); return n < 0 ? src.length : n + 2; }
  return i + 1;
}
function arrayOpen(src: string, name: string): number {
  const m = new RegExp(`export const ${name}\\b[^=]*=\\s*\\[`).exec(src);
  if (!m) throw new Error(`array ${name} not found`);
  return m.index + m[0].length;
}
function matchClose(src: string, inside: number): number {
  let depth = 1, i = inside;
  while (i < src.length) {
    const c = src[i];
    if (c === "'" || c === '"' || c === '`' || (c === '/' && (src[i + 1] === '/' || src[i + 1] === '*'))) { i = skipToken(src, i); continue; }
    if (c === '[' || c === '{' || c === '(') depth++;
    else if (c === ']' || c === '}' || c === ')') { depth--; if (depth === 0) return i; }
    i++;
  }
  throw new Error('unbalanced');
}
function scanEntries(src: string) {
  const open = arrayOpen(src, 'KATHA_CONTENT');
  const close = matchClose(src, open);
  const out: { id: string; text: string }[] = [];
  let i = open;
  while (i < close) {
    const c = src[i];
    if (c === ' ' || c === '\n' || c === '\r' || c === '\t' || c === ',') { i++; continue; }
    if (c === "'" || c === '"' || c === '`' || (c === '/' && (src[i + 1] === '/' || src[i + 1] === '*'))) { i = skipToken(src, i); continue; }
    const m = /^(fullContent|summaryContent)\s*\(/.exec(src.slice(i, i + 24));
    if (!m) { i++; continue; }
    const start = i;
    let j = i + m[0].length - 1, depth = 0;
    while (j < close) {
      const cc = src[j];
      if (cc === "'" || cc === '"' || cc === '`' || (cc === '/' && (src[j + 1] === '/' || src[j + 1] === '*'))) { j = skipToken(src, j); continue; }
      if (cc === '(' || cc === '[' || cc === '{') depth++;
      else if (cc === ')' || cc === ']' || cc === '}') { depth--; if (depth === 0) { j++; break; } }
      j++;
    }
    const text = src.slice(start, j);
    const idm = /\bid:\s*'((?:[^'\\]|\\.)*)'/.exec(text);
    if (!idm) throw new Error(`entry without id at ${start}`);
    out.push({ id: idm[1], text });
    i = j;
  }
  return out;
}

const src = readFileSync(FILE, 'utf8');
const headerEnd = src.search(/export const KATHA_CONTENT\b/);
let header = src.slice(0, headerEnd).trimEnd() + '\n';
// export the constructors so per-katha files can use them
header = header.replace(/\nfunction fullContent\(/, '\nexport function fullContent(').replace(/\nfunction summaryContent\(/, '\nexport function summaryContent(');
// fix relative imports now that _helpers.ts lives one level deeper
header = header.replace(/from '\.\/types'/g, "from '../types'");

const tailStart = src.search(/export const KATHA_CONTENT_BY_ID\b/);
const tail = src.slice(tailStart).trimEnd() + '\n';

const entries = scanEntries(src);

mkdirSync(ENTRIES, { recursive: true });
writeFileSync(`${DIR}/_helpers.ts`, header);

for (const e of entries) {
  const ctor = e.text.startsWith('summaryContent') ? 'summaryContent' : 'fullContent';
  writeFileSync(`${ENTRIES}/${e.id}.ts`, `import { ${ctor} } from '../_helpers';\n\nexport default ${e.text};\n`);
}

const imports = entries.map((e, i) => `import e${i} from './entries/${e.id}';`).join('\n');
const arr = entries.map((_, i) => `  e${i},`).join('\n');
writeFileSync(`${DIR}/index.ts`, `import type { KathaContentEntry } from '../types';\n${imports}\n\nexport const KATHA_CONTENT: readonly KathaContentEntry[] = [\n${arr}\n];\n`);

const barrel = `import type { KathaContentEntry } from './types';\nimport { KATHA_CONTENT } from './kathaContent/index';\n\nexport { KATHA_CONTENT };\n\n${tail}`;
writeFileSync(FILE, barrel);

console.log(`split complete: ${entries.length} entries -> ${ENTRIES}/`);
console.log(`_helpers.ts, index.ts, kathaContent.ts (barrel) written`);
