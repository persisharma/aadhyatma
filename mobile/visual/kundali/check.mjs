import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const output = path.resolve('visual-output/kundali');
await fs.mkdir(output, { recursive: true });
const server = spawn('node', ['visual/kundali/node_modules/vite/bin/vite.js', '--config', 'visual/kundali/vite.config.mjs'], { stdio: 'inherit' });
const base = 'http://127.0.0.1:4173/visual/kundali/index.html';
for (let i = 0; i < 100; i++) {
  try { if ((await fetch(base)).ok) break; } catch {}
  if (i === 99) throw Error('Preview server did not start');
  await new Promise(resolve => setTimeout(resolve, 300));
}
const browser = await chromium.launch();
const results = [];
const viewports = [
  { width: 320, height: 568 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 844, height: 390 },
];
try {
  for (const { width, height } of viewports) for (const lang of ['hi', 'en', 'gu', 'kn']) for (const size of ['M', 'L']) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const view of ['grahas', 'chart']) {
      await page.goto(`${base}?lang=${lang}&size=${size}&view=${view}`);
      await page.waitForFunction(() => document.documentElement.dataset.ready === 'true');
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() => [...document.images].every(img => img.complete && img.naturalWidth > 0));
      assert.equal(errors.length, 0, errors.join('\n'));
      const usedFonts = await page.evaluate(() => [...document.fonts].filter(face => face.status === 'loaded').map(face => face.family));
      assert.ok(usedFonts.length > 0, 'No app fonts loaded');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Horizontal page overflow');
      if (view === 'grahas') {
        const columns = [];
        for (let row = 1; row <= 3; row++) {
          const group = page.getByTestId(`kundali-graha-row-${row}`);
          const boxes = await group.getByRole('button').evaluateAll(elements => elements.map(element => { const r = element.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width }; }));
          assert.equal(boxes.length, 3); assert.ok(boxes.every(box => Math.abs(box.y - boxes[0].y) < 1));
          assert.ok(boxes[0].x < boxes[1].x && boxes[1].x < boxes[2].x); columns.push(boxes);
        }
        await page.screenshot({ path: path.join(output, `${lang}-${size}-${width}-grahas.png`), fullPage: true });
        await page.getByTestId('kundali-graha-saturn').click();
        await page.getByRole('button', { name: 'Done with Kundali explanation', exact: true }).waitFor();
        // Modal is mounted before its slide-in finishes. Measure the settled sheet.
        await page.waitForFunction(() => {
          const button = document.querySelector('[aria-label="Done with Kundali explanation"]');
          if (!button) return false;
          const box = button.getBoundingClientRect();
          return box.width > 0 && box.height > 0 && box.x >= 0 && box.y >= 0 && box.right <= innerWidth + 1 && box.bottom <= innerHeight + 1;
        }).catch(async error => {
          await page.screenshot({ path: path.join(output, `${lang}-${size}-${width}-sheet-failure.png`), fullPage: false });
          await fs.writeFile(path.join(output, `${lang}-${size}-${width}-failure.html`), await page.content());
          throw error;
        });
        await page.evaluate(() => document.fonts.ready);
        const done = await page.getByRole('button', { name: 'Done with Kundali explanation', exact: true }).boundingBox();
        assert.ok(done && done.x >= 0 && done.y >= 0 && done.x + done.width <= width + 1 && done.y + done.height <= height + 1, 'Sheet Done button is outside the viewport');
        await page.screenshot({ path: path.join(output, `${lang}-${size}-${width}-sheet.png`), fullPage: false });
        await page.getByRole('button', { name: 'Done with Kundali explanation', exact: true }).click();
        results.push({ width, height, lang, size, view, columns: 3, rows: 3, fonts: usedFonts });
      } else {
        const labels = await page.locator('svg text').allTextContents();
        const paintedLabels = await page.locator('svg text').evaluateAll(elements => elements.map(element => {
          const box = element.getBBox();
          const style = getComputedStyle(element);
          return { text: element.textContent, width: box.width, height: box.height, fontSize: style.fontSize, display: style.display, visibility: style.visibility, outerHTML: element.outerHTML };
        }));
        await fs.writeFile(path.join(output, `${lang}-${size}-${width}-chart-labels.json`), JSON.stringify(paintedLabels, null, 2));
        await fs.writeFile(path.join(output, `${lang}-${size}-${width}-chart.html`), await page.content());
        await page.screenshot({ path: path.join(output, `${lang}-${size}-${width}-chart.png`), fullPage: true });
        assert.equal(paintedLabels.length, 36, 'Every house needs house, sign and graha labels');
        assert.ok(paintedLabels.every(label => label.width > 0 && label.height > 0 && parseFloat(label.fontSize) > 0), `Chart text exists but is not painted: ${JSON.stringify(paintedLabels.filter(label => !label.width || !label.height || !parseFloat(label.fontSize)))}`);
        if (lang === 'en') { assert.ok(labels.some(label => label.trim() === 'Su Me')); assert.ok(labels.some(label => label.trim() === 'Mo Ra')); }
        assert.ok(!labels.some(label => /\d+ grahas/.test(label)), 'Count replaced graha abbreviations');
        await page.screenshot({ path: path.join(output, `${lang}-${size}-${width}-chart.png`), fullPage: true });
        results.push({ width, height, lang, size, view, chartAbbreviations: true, paintedLabels, fonts: usedFonts });
      }
    }
    await page.close();
  }
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
  console.log(`PASS: ${results.length} actual-component browser cases; 3×3 grid, short forms, fonts and wrapping`);
} finally { await browser.close(); server.kill(); }
