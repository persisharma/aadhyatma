// Deterministic assembler for the vrat-katha build loop.
//
// Reads authored katha JSON files from .context/vrat-content/generated/<id>.json
// and splices them into src/panchang/kathaContent.ts (replace if the id already
// exists, else insert at the top of KATHA_CONTENT). For ekadashi/new tasks it
// also wires src/panchang/festivals.ts (KATHA_CATALOG entry, rule.kathaId,
// EKADASHI_KATHA_BY_NAME). All operations are idempotent.
//
// Apply-time validation mirrors the gate test, so bad content is rejected
// (reported, not applied) and the build stays green.
//
// Usage (from mobile/):
//   npx tsx scripts/vrat-apply-kathas.mts --list        # parse + list ids, no writes
//   npx tsx scripts/vrat-apply-kathas.mts [id ...]      # apply all generated, or only the given ids

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';

const KATHA_FILE = 'src/panchang/kathaContent.ts';
const FEST_FILE = 'src/panchang/festivals.ts';
const ROOT = '../.context/vrat-content';
const GEN = `${ROOT}/generated`;

const PINNED_IDS: Record<string, string[]> = {
  'satyanarayana-vrat-katha': ['adhyay-1', 'adhyay-2', 'adhyay-3', 'adhyay-4', 'adhyay-5'],
  'ganesha-chaturthi-vrat-katha': ['vow-and-question', 'satrajit-and-syamantaka', 'krishna-clears-blame', 'second-accusation', 'moon-curse-origin', 'chandra-seeks-forgiveness', 'krishna-observes-vow'],
  'sankashti-chaturthi-vrat-katha': ['monthly-cycle', 'bhalachandra', 'vikata', 'ganadhipa', 'lambodara', 'heramba'],
  'pradosha-vrat-katha': ['ravi', 'soma', 'bhauma', 'budha', 'brihaspati', 'shukra', 'shani', 'pradosha-message'],
};

// ---- string-aware scanner: split top-level entries of an array literal ----
function skipToken(src: string, i: number): number {
  const c = src[i];
  if (c === "'" || c === '"' || c === '`') {
    i++;
    while (i < src.length) {
      if (src[i] === '\\') { i += 2; continue; }
      if (src[i] === c) return i + 1;
      i++;
    }
    return i;
  }
  if (c === '/' && src[i + 1] === '/') { const n = src.indexOf('\n', i); return n < 0 ? src.length : n; }
  if (c === '/' && src[i + 1] === '*') { const n = src.indexOf('*/', i); return n < 0 ? src.length : n + 2; }
  return i + 1;
}

// Find char index just after the `[` that opens `export const <NAME> ... = [`.
function arrayOpen(src: string, name: string): number {
  const re = new RegExp(`export const ${name}\\b[^=]*=\\s*\\[`);
  const m = re.exec(src);
  if (!m) throw new Error(`array ${name} not found`);
  return m.index + m[0].length;
}

// Given index just inside `[`, return index of the matching top-level `]`.
function matchArrayClose(src: string, openInside: number): number {
  let depth = 1, i = openInside;
  while (i < src.length) {
    const c = src[i];
    if (c === "'" || c === '"' || c === '`' || (c === '/' && (src[i + 1] === '/' || src[i + 1] === '*'))) { i = skipToken(src, i); continue; }
    if (c === '[' || c === '{' || c === '(') depth++;
    else if (c === ']' || c === '}' || c === ')') { depth--; if (depth === 0) return i; }
    i++;
  }
  throw new Error('unbalanced array');
}

// Parse top-level `fullContent(...)` / `summaryContent(...)` entries of KATHA_CONTENT.
function scanEntries(src: string): { id: string; start: number; end: number }[] {
  const open = arrayOpen(src, 'KATHA_CONTENT');
  const close = matchArrayClose(src, open);
  const out: { id: string; start: number; end: number }[] = [];
  let i = open;
  while (i < close) {
    const c = src[i];
    if (c === ' ' || c === '\n' || c === '\r' || c === '\t' || c === ',') { i++; continue; }
    if (c === "'" || c === '"' || c === '`' || (c === '/' && (src[i + 1] === '/' || src[i + 1] === '*'))) { i = skipToken(src, i); continue; }
    const m = /^(fullContent|summaryContent)\s*\(/.exec(src.slice(i, i + 24));
    if (!m) { i++; continue; }
    const callStart = i;
    let j = i + m[0].length - 1; // at '('
    let depth = 0;
    while (j < close) {
      const cc = src[j];
      if (cc === "'" || cc === '"' || cc === '`' || (cc === '/' && (src[j + 1] === '/' || src[j + 1] === '*'))) { j = skipToken(src, j); continue; }
      if (cc === '(' || cc === '[' || cc === '{') depth++;
      else if (cc === ')' || cc === ']' || cc === '}') { depth--; if (depth === 0) { j++; break; } }
      j++;
    }
    const text = src.slice(callStart, j);
    const idm = /\bid:\s*'((?:[^'\\]|\\.)*)'/.exec(text);
    out.push({ id: idm ? idm[1] : `?@${callStart}`, start: callStart, end: j });
    i = j;
  }
  return out;
}

// ---- rendering ----
const esc = (s: string) => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '') + "'";
const inlineArr = (a: string[]) => '[' + a.map(esc).join(', ') + ']';

function renderEntry(k: any): string {
  const L: string[] = [];
  L.push('fullContent({');
  L.push(`    id: ${esc(k.id)},`);
  L.push(`    titleHi: ${esc(k.titleHi)},`);
  L.push(`    titleEn: ${esc(k.titleEn)},`);
  if (k.sourceUrls && k.sourceUrls.length) L.push(`    sourceUrls: ${inlineArr(k.sourceUrls)},`);
  L.push('    sections: [');
  for (const s of k.sections) {
    L.push('      {');
    L.push(`        id: ${esc(s.id)},`);
    L.push(`        titleHi: ${esc(s.titleHi)},`);
    L.push(`        titleEn: ${esc(s.titleEn)},`);
    L.push('        bodyHi: [');
    for (const p of s.bodyHi) L.push(`          ${esc(p)},`);
    L.push('        ],');
    L.push('        bodyEn: [');
    for (const p of s.bodyEn) L.push(`          ${esc(p)},`);
    L.push('        ],');
    L.push('      },');
  }
  L.push('    ],');
  L.push('  })');
  return L.join('\n');
}

// ---- validation (mirror gate test) ----
function validate(k: any): string[] {
  const errs: string[] = [];
  if (!k || typeof k.id !== 'string') return ['missing id'];
  for (const f of ['titleHi', 'titleEn']) if (!k[f] || typeof k[f] !== 'string') errs.push(`bad ${f}`);
  if (!Array.isArray(k.sections) || k.sections.length < 4) errs.push(`needs >=4 sections (has ${k.sections?.length})`);
  let hiP = 0, enP = 0, hi = 0, en = 0;
  for (const s of k.sections ?? []) {
    if (s.id === 'katha' || s.id === 'mahatva') errs.push(`placeholder section id ${s.id}`);
    if (/summary/i.test(s.titleEn ?? '') || (s.titleHi ?? '').includes('सार')) errs.push('summary-labeled section');
    if (!Array.isArray(s.bodyHi) || !Array.isArray(s.bodyEn)) { errs.push(`section ${s.id} bad bodies`); continue; }
    if (s.bodyHi.some((p: string) => !p) || s.bodyEn.some((p: string) => !p)) errs.push(`section ${s.id} empty paragraph`);
    if (s.bodyHi.length !== s.bodyEn.length) errs.push(`section ${s.id} Hi/En paragraph count mismatch`);
    hiP += s.bodyHi.length; enP += s.bodyEn.length;
    hi += s.bodyHi.join('').length; en += s.bodyEn.join('').length;
  }
  if (hiP < 6) errs.push(`Hi paras ${hiP} < 6`);
  if (enP < 6) errs.push(`En paras ${enP} < 6`);
  if (hi < 900) errs.push(`Hi chars ${hi} < 900`);
  if (en < 1100) errs.push(`En chars ${en} < 1100`);
  const pinned = PINNED_IDS[k.id];
  if (pinned) {
    const got = k.sections.map((s: any) => s.id);
    if (JSON.stringify(got) !== JSON.stringify(pinned)) errs.push(`pinned section ids mismatch: ${JSON.stringify(got)}`);
  }
  return errs;
}

// ---- festivals.ts wiring (idempotent) ----
function wireFestivals(spec: any): string[] {
  let src = readFileSync(FEST_FILE, 'utf8');
  const notes: string[] = [];
  const w = spec.wire;
  if (!w) return notes;
  // 1) KATHA_CATALOG entry
  if (w.catalog && !new RegExp(`id: '${spec.targetKathaId}'`).test(src)) {
    const open = arrayOpen(src, 'KATHA_CATALOG');
    const close = matchArrayClose(src, open);
    const c = w.catalog;
    const kindPart = c.kind ? `kind: '${c.kind}', ` : '';
    const rel = '[' + c.relatedRuleIds.map((r: string) => `'${r}'`).join(', ') + ']';
    const line = `  katha({ id: '${spec.targetKathaId}', nameHi: '${c.nameHi}', nameEn: '${c.nameEn}', ${kindPart}sourceUrl: '${c.sourceUrl}', relatedRuleIds: ${rel} }),\n`;
    src = src.slice(0, close).replace(/\s*$/, '\n') + line + src.slice(close);
    notes.push('catalog+');
  }
  // 2) rule.kathaId for 'new'
  if (w.setRuleKathaId) {
    const rid = w.setRuleKathaId;
    const lines = src.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const ln = lines[i];
      if (new RegExp(`id: '${rid}'`).test(ln) && /\b(festival|createRule|vrat|upavas|ekadashi)\(/.test(ln) && !/kathaId:/.test(ln)) {
        lines[i] = ln.replace(/\s*\}\)(,?)\s*$/, `, kathaId: '${spec.targetKathaId}' })$1`);
        notes.push('rule.kathaId+');
        break;
      }
    }
    src = lines.join('\n');
  }
  // 3) EKADASHI_KATHA_BY_NAME
  if (w.ekadashiName && !new RegExp(`'${w.ekadashiName}':`).test(src)) {
    src = src.replace(/(const EKADASHI_KATHA_BY_NAME[^{]*\{[\s\S]*?)(\n\};)/, `$1\n  '${w.ekadashiName}': '${spec.targetKathaId}',$2`);
    notes.push('ekadashi-map+');
  }
  writeFileSync(FEST_FILE, src);
  return notes;
}

// ---- main ----
const arg = process.argv.slice(2);
if (arg[0] === '--list') {
  const src = readFileSync(KATHA_FILE, 'utf8');
  const e = scanEntries(src);
  console.log(`KATHA_CONTENT entries: ${e.length}`);
  console.log(e.map((x) => x.id).join('\n'));
  process.exit(0);
}

const onlyIds = new Set(arg);
const specs: any[] = existsSync(`${ROOT}/remaining.json`) ? JSON.parse(readFileSync(`${ROOT}/remaining.json`, 'utf8')) : [];
const specById = new Map(specs.map((s) => [s.targetKathaId, s]));

const files = existsSync(GEN) ? readdirSync(GEN).filter((f) => f.endsWith('.json')) : [];
let applied = 0; const skipped: string[] = []; const failed: Record<string, string[]> = {};

for (const f of files) {
  const id = f.replace(/\.json$/, '');
  if (onlyIds.size && !onlyIds.has(id)) continue;
  let k: any;
  try { k = JSON.parse(readFileSync(`${GEN}/${f}`, 'utf8')); } catch (e: any) { failed[id] = [`bad json: ${e.message}`]; continue; }
  if (k.id !== id) { failed[id] = [`id mismatch: file ${id} vs entry ${k.id}`]; continue; }
  const errs = validate(k);
  if (errs.length) { failed[id] = errs; continue; }

  // splice into kathaContent.ts
  let src = readFileSync(KATHA_FILE, 'utf8');
  const entries = scanEntries(src);
  const existing = entries.find((e) => e.id === k.id);
  const rendered = renderEntry(k);
  if (existing) {
    src = src.slice(0, existing.start) + rendered + src.slice(existing.end);
  } else {
    const open = arrayOpen(src, 'KATHA_CONTENT');
    const nl = src.indexOf('\n', open) + 1;
    src = src.slice(0, nl) + '  ' + rendered + ',\n' + src.slice(nl);
  }
  writeFileSync(KATHA_FILE, src);

  const spec = specById.get(id);
  const notes = spec ? wireFestivals(spec) : [];
  applied++;
  console.log(`applied ${id}${existing ? ' (replace)' : ' (insert)'}${notes.length ? ' [' + notes.join(',') + ']' : ''}`);
}

if (Object.keys(failed).length) {
  console.log('--- FAILED (not applied) ---');
  for (const [id, errs] of Object.entries(failed)) console.log(`  ${id}: ${errs.join('; ')}`);
}
console.log(`\nsummary: applied=${applied} failed=${Object.keys(failed).length} scanned=${files.length}`);
if (Object.keys(failed).length) process.exit(1);
