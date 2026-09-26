import fs from 'node:fs';
import path from 'node:path';
import { fingerprint } from './fingerprint.js';
const root = path.resolve(import.meta.dirname, '../../src/data');
const docs = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (p.endsWith('.json')) {
      const data = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (!Array.isArray(data.verses)) continue;
      const key = path.relative(root, p);
      const family = key.split('/')[0];
      const sourceId = family === 'gita' ? 'bhagavad-gita' :
        ['aarti', 'ashtakam', 'sanskar', 'kavacham', 'stuti', 'suktam'].includes(family)
          ? path.basename(p, '.json') : family;
      docs.push({key, sourceId, verses: data.verses.map(v => ({id: v.id, hash: fingerprint(v)}))});
    }
  }
}
walk(root);
docs.sort((a,b) => a.key.localeCompare(b.key));
fs.writeFileSync(path.join(import.meta.dirname, 'oracle.generated.json'), JSON.stringify(docs));
console.log(`${docs.length} documents, ${docs.reduce((n,d) => n+d.verses.length,0)} source-derived verse oracles`);

const app = fs.readFileSync(path.join(import.meta.dirname, '../../App.tsx'), 'utf8');
const imports = app.match(/^import .* from '@expo-google-fonts\/.*;$/gm).join('\n');
const fonts = app.match(/useFonts\(\{([\s\S]*?)\}\)/)[1];
fs.writeFileSync(path.join(import.meta.dirname, 'fonts.generated.js'), `${imports}\nexport const fonts = {${fonts}};\n`);
