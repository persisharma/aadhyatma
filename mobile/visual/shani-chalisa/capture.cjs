// Captures the production reader through the explicit web adapter, not a native app.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, 'dist');
const output = path.join(__dirname, 'captures');
fs.mkdirSync(output, { recursive: true });
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const file = path.resolve(root, '.' + (pathname.endsWith('/') ? pathname + 'index.html' : pathname));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  try {
    const type = file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : file.endsWith('.html') ? 'text/html' : 'application/octet-stream';
    res.setHeader('Content-Type', type);
    res.end(fs.readFileSync(file));
  } catch { res.writeHead(404).end(); }
});
(async () => {
  await new Promise(resolve => server.listen(8766, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true });
  try {
    for (const lang of ['hi', 'en', 'gu', 'kn']) {
      for (const size of ['M', 'L']) {
        for (const page of [0, 2, 42]) {
          const tab = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
          const errors = [];
          tab.on('pageerror', e => errors.push(e.message));
          await tab.goto(`http://127.0.0.1:8766/?lang=${lang}&size=${size}&page=${page}&width=390&cdn=1`, { waitUntil: 'networkidle' });
          await tab.evaluate(() => document.fonts.ready);
          await tab.evaluate(async () => { await Promise.all(Array.from(document.images).map(image => image.complete ? Promise.resolve() : new Promise(resolve => { image.onload = resolve; image.onerror = resolve; }))); });
          await tab.waitForTimeout(800);
          if (errors.length) throw new Error(errors.join('\n'));
          await tab.getByText('ACTUAL READER CODE', { exact: false }).waitFor();
          await tab.screenshot({ path: path.join(output, `${lang}-${size}-${page}.png`) });
          fs.writeFileSync(path.join(output, `${lang}-${size}-${page}.txt`), await tab.locator('body').innerText());
          await tab.close();
        }
      }
    }
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
