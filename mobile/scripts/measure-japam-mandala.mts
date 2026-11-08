/** Optional offline verification helper; the app does not import a rasterizer. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { japamMantras, findJapamMantra } from '../src/data/japam';
import { verseLinesByLang } from '../src/utils/localize';
import { ringWords, ringSeparator } from '../src/components/japamMantraRingLayout';
import { layoutMandala, mandalaClusters } from '../src/components/japamMandalaLayout';

const require = createRequire(import.meta.url);
const canvasRequire = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? createRequire(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, 'package.json')) : require;
const { createCanvas, GlobalFonts } = canvasRequire('@napi-rs/canvas');
const faces = {
  hi: '@expo-google-fonts/noto-serif-devanagari/500Medium/NotoSerifDevanagari_500Medium.ttf',
  en: '@expo-google-fonts/cormorant-garamond/400Regular_Italic/CormorantGaramond_400Regular_Italic.ttf',
  gu: '@expo-google-fonts/noto-serif-gujarati/500Medium/NotoSerifGujarati_500Medium.ttf',
  kn: '@expo-google-fonts/noto-serif-kannada/500Medium/NotoSerifKannada_500Medium.ttf',
};
const fonts = Object.fromEntries(Object.entries(faces).map(([lang, file]) => {
  const resolved = require.resolve(file);
  GlobalFonts.registerFromPath(resolved, `Mandala-${lang}`);
  return [lang, { file, sha256: crypto.createHash('sha256').update(fs.readFileSync(resolved)).digest('hex') }];
}));
const slokas = Array.from({ length: 16 }, (_, i) => findJapamMantra(`sloka.shiva-strotam.4.${i + 1}`)).filter(item => item !== null);
const ctx = createCanvas(10, 10).getContext('2d');
const cases = [...japamMantras, ...slokas].flatMap(mantra => (['hi', 'en', 'gu', 'kn'] as const).map(lang => {
  const lines = [...verseLinesByLang(lang, mantra.lines, mantra.linesEn)];
  const text = lines.join(' ');
  ctx.font = `20px Mandala-${lang}`;
  const widths = Object.fromEntries([...new Set([...ringWords(text).flatMap(mandalaClusters), ringSeparator(text)])].map(word => [word, +ctx.measureText(word).width.toFixed(4)]));
  return { id: mantra.id, lang, lines, widths };
}));
const report = cases.flatMap(row => [280, 296, 340].map(size => ({ id: row.id, lang: row.lang, size, layout: layoutMandala(row.lines.join(' '), size, row.widths) })));
const fixture = path.resolve('src/components/__tests__/fixtures/japamMandalaWidths.json');
fs.mkdirSync(path.dirname(fixture), { recursive: true });
fs.writeFileSync(fixture, JSON.stringify({ fontSize: 20, fonts, cases }, null, 2) + '\n');
console.log(JSON.stringify({ cases: report.length, noBands: report.filter(row => !row.layout?.bands.length).map(({ id, lang, size }) => ({ id, lang, size })), gayatri: report.filter(row => row.id === 'gayatri-mantra').map(row => ({ lang: row.lang, size: row.size, bands: row.layout?.bands.length, pages: row.layout?.bands[0]?.pages.length })) }, null, 2));
