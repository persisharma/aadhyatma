// Browser component evidence only; does not execute native capture or OS sharing.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const root = fileURLToPath(new URL('../../../', import.meta.url));
const require = createRequire(join(process.env.BHAKTI_PREVIEW_DEPS, 'package.json'));
const { chromium } = require('playwright');
const output = join(root, 'tmp/bhakti-flute-preview');
const browser = await chromium.launch({ headless: true });
const cells = [], errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 600, height: 1200 }, deviceScaleFactor: 2 });
  page.on('pageerror', e => errors.push(String(e)));
  await page.route('https://preview.local/**', async route => {
    const name = decodeURIComponent(new URL(route.request().url()).pathname.slice(1) || 'index.html');
    const path = join(output, name);
    if (!path.startsWith(output + '/')) return route.abort();
    await route.fulfill({ body: readFileSync(path), contentType: name.endsWith('.js') ? 'text/javascript' : name.endsWith('.html') ? 'text/html' : name.endsWith('.webp') ? 'image/webp' : 'font/ttf' });
  });
  async function check(query, screenshot) {
    await page.goto(`https://preview.local/?${query}`);
    await page.evaluate(() => document.fonts.ready);
    if (!query.includes('reader=1')) await page.waitForSelector('#capture[data-ready="true"]', { timeout: 15000 });
    await page.waitForFunction(() => {
      const imgs = [...document.querySelectorAll('#capture img')];
      return imgs.length >= 4 && imgs.every(i => i.complete && i.naturalWidth > 0);
    });
    const result = await page.evaluate(() => {
      const card = document.querySelector('#capture'), header = card.querySelector('[data-testid="devotional-header-brand"]');
      const footer = card.querySelector('[data-testid="devotional-footer-brand"]');
      return { height: card.getBoundingClientRect().height, overflow: card.scrollWidth > card.clientWidth + 1,
        headerLogos: header.querySelectorAll('img').length, footerSuffix: footer.textContent,
        headerBounds: header.getBoundingClientRect().toJSON(), footerBounds: footer.getBoundingClientRect().toJSON() };
    });
    if (result.overflow || result.headerLogos !== 1 || result.footerSuffix !== '.app') throw new Error(JSON.stringify({ query, ...result }));
    if (screenshot) await page.locator('#capture').screenshot({ path: join(output, screenshot), quality: 88 });
    cells.push({ query, ...result });
  }
  const subjects = Object.keys(JSON.parse(readFileSync(join(root, 'mobile/src/data/devotionalShareManifest.json'))).assets);
  for (const art of subjects) await check(`art=${art}&lang=hi`, `${art}-hi.jpg`);
  for (const lang of ['hi', 'en', 'gu', 'kn']) {
    await check(`lang=${lang}`, `hanuman-${lang}.jpg`);
    for (const size of ['M', 'L']) for (const width of [288, 358])
      await check(`lang=${lang}&size=${size}&width=${width}&reader=1`, `reader-${lang}-${size}-${width}.jpg`);
  }
  if (errors.length) throw new Error(errors.join('\n'));
  writeFileSync(join(root, 'docs/evaluations/daily-bhakti-flute-branding/browser-matrix.json'), JSON.stringify({ platform: 'React Native Web production-component preview; NOT native capture/device acceptance', cells, errors }, null, 2) + '\n');
  console.log(`${cells.length} component cells passed; native export/OS handoff and device performance remain pending.`);
} finally { await browser.close(); }
