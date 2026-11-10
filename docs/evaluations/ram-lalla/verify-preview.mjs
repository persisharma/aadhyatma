// Run preview.mjs first. Uses request interception so the review needs no listening server.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { join, resolve } from 'node:path';
const root = fileURLToPath(new URL('../../../', import.meta.url));
const require = createRequire(join(process.env.RAM_LALLA_PREVIEW_DEPS, 'package.json'));
const { chromium } = require('playwright');
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 600, height: 1200 }, deviceScaleFactor: 2 });
  const errors = [], cells = [], output = resolve(root, 'tmp/ram-lalla-preview');
  page.on('pageerror', e => errors.push(String(e)));
  await page.route('https://preview.local/**', async route => {
    const name = decodeURIComponent(new URL(route.request().url()).pathname.slice(1) || 'index.html');
    const path = join(output, name);
    if (!path.startsWith(output + '/')) return route.abort();
    await route.fulfill({ body: readFileSync(path), contentType: name.endsWith('.js') ? 'text/javascript' : name.endsWith('.html') ? 'text/html' : name.endsWith('.jpg') ? 'image/jpeg' : name.endsWith('.webp') ? 'image/webp' : 'font/ttf' });
  });
  for (const frame of ['mandir-jharokha', 'pushp-aangan', 'bhakti-patra']) for (const lang of ['hi', 'en', 'gu', 'kn']) for (const width of [320, 540]) {
    await page.goto(`https://preview.local/?frame=${frame}&lang=${lang}&width=${width}`);
    await page.waitForSelector('#capture[data-ready="true"]', { timeout: 15000 });
    await page.evaluate(() => document.fonts.ready);
    const result = await page.evaluate(() => {
      const card = document.querySelector('#capture');
      return { height: card.getBoundingClientRect().height, overflow: card.scrollWidth > card.clientWidth + 1,
        images: [...card.querySelectorAll('img')].every(i => i.complete && i.naturalWidth > 0) };
    });
    if (result.overflow || !result.images) throw new Error(JSON.stringify({ frame, lang, width, ...result }));
    if (lang === 'hi' && width === 540) await page.locator('#capture').screenshot({ path: join(root, `docs/evaluations/ram-lalla/${frame}-hi.jpg`), quality: 86 });
    cells.push({ frame, lang, width, ...result });
  }
  if (errors.length) throw new Error(errors.join('\n'));
  writeFileSync(join(root, 'docs/evaluations/ram-lalla/browser-matrix.json'), JSON.stringify({ platform: 'React Native Web component preview; not native capture', cells, errors }, null, 2) + '\n');
  console.log(`${cells.length} browser component cells passed; native verification remains pending.`);
} finally { await browser.close(); }
