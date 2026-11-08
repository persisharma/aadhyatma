import { chromium } from '../kundali/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
const output = path.resolve('visual-output/brand');
await fs.mkdir(output, { recursive: true });
const server = spawn('node', ['visual/kundali/node_modules/vite/bin/vite.js', '--config', 'visual/brand/vite.config.mjs'], { stdio: 'inherit' });
let browser;
const results = [];
const manifest = JSON.parse(await fs.readFile('assets/branding/wordmarks/manifest.json', 'utf8'));
try {
  const base = 'http://127.0.0.1:4184/visual/brand/index.html';
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(base)).ok) break; } catch {}
    if (i === 99) throw Error('Header fixture did not start');
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  browser = await chromium.launch({ args: ['--no-sandbox'] });
  for (const width of [320, 360, 390, 393, 430, 768]) for (const lang of ['hi', 'en', 'gu', 'kn']) for (const size of ['M', 'L']) {
    const page = await browser.newPage({ viewport: { width, height: 300 }, deviceScaleFactor: 3 });
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(`${base}?lang=${lang}&size=${size}`);
    try { await page.waitForSelector('html[data-ready="true"]'); }
    catch (error) {
      await fs.writeFile(path.join(output, 'startup-errors.json'), JSON.stringify({ errors, html: await page.content() }, null, 2));
      await page.screenshot({ path: path.join(output, 'startup-failure.png') });
      throw new Error(`Header fixture failed to mount: ${errors.join('\n')}`, { cause: error });
    }
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth > 0));
    const crest = await page.getByTestId('home-wordmark-crest').boundingBox();
    const frame = await page.getByTestId('home-wordmark-artwork-frame').boundingBox();
    const settings = await page.getByTestId('settings-fixture').boundingBox();
    assert.equal(frame.width, lang === 'hi' ? 97 : 124);
    // Chromium reports transformed DOMRect heights with float rounding
    // (e.g. 36.0000019073); keep the 36pt contract within 0.00001pt.
    assert.ok(Math.abs(frame.height - 36) < 0.00001);
    const kind = lang === 'hi' ? 'hi' : 'en', metrics = manifest.names[kind];
    const artwork = await page.getByTestId(`vedansh-wordmark-${kind}`).boundingBox();
    const om = await page.getByTestId('home-wordmark-om-left').boundingBox();
    const sourceScale = artwork.width / metrics.width;
    const inkHeight = (metrics.homeFrame.letteringBottom - metrics.homeFrame.letteringTop) * sourceScale;
    const inkCenter = artwork.y + (metrics.homeFrame.letteringTop + metrics.homeFrame.letteringBottom) / 2 * sourceScale;
    assert.ok(Math.abs(inkHeight - om.height) < .05, 'Lettering height differs from the Om circle');
    assert.ok(Math.abs(inkCenter - (om.y + om.height / 2)) < .05, 'Lettering is vertically misaligned');
    assert.equal(crest.height, 42);
    assert.ok(crest.x >= 16 && crest.x + crest.width <= settings.x + .5, 'Branding overlaps Settings or the page gutter');
    const key = `${lang}-${size}-${width}`;
    for (const textScale of [1, 2]) {
      if (textScale === 2) await page.getByTestId('home-wordmark-tagline').evaluate(node => { node.style.fontSize = '28px'; node.style.lineHeight = '44px'; });
      const tagline = await page.getByTestId('home-wordmark-tagline').boundingBox();
      const fixture = await page.getByTestId('header-fixture').boundingBox();
      assert.ok(tagline.x >= 15.5 && tagline.x + tagline.width <= width - 15.5, 'Companion text overflows');
      assert.ok(tagline.y + tagline.height <= fixture.y + fixture.height + .5, 'Companion text clips vertically');
      if (width === 390 && ['hi', 'en'].includes(lang)) await page.screenshot({ path: path.join(output, `${key}-text${textScale}.png`) });
      results.push({ width, lang, size, textScale, crest, frame, artwork, om, inkHeight, inkCenter, settings, tagline });
    }
    assert.deepEqual(errors, []);
    await page.close();
  }
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify({ status: 'PASS', cases: results.length, native: false, note: 'Production HomeWordmark rendered through RN Web. TextScale=2 is a browser stress test, not native OS text verification.', results }, null, 2));
  console.log(`PASS ${results.length} production header browser cases; native checks remain separate.`);
} finally { await browser?.close(); server.kill(); }
