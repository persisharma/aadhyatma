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
    res.setHeader('Content-Type', type + (type.startsWith('text/') ? '; charset=utf-8' : ''));
    res.end(fs.readFileSync(file));
  } catch { res.writeHead(404).end(); }
});
(async () => {
  await new Promise(resolve => server.listen(8767, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
  try {
    for (const lang of ['hi', 'en', 'gu', 'kn']) {
      for (const width of [320, 390]) {
      for (const size of ['M', 'L']) {
        for (const page of [0, 21, 42]) {
          const tab = await browser.newPage({ viewport: { width, height: 844 }, deviceScaleFactor: 1 });
          const errors = [];
          tab.on('pageerror', e => errors.push(e.message));
          await tab.goto(`http://127.0.0.1:8767/?lang=${lang}&size=${size}&page=${page}&width=${width}&cdn=1`, { waitUntil: 'networkidle' });
          await tab.evaluate(() => document.fonts.ready);
          await tab.evaluate(async () => { await Promise.all(Array.from(document.images).map(image => image.complete ? Promise.resolve() : new Promise(resolve => { image.onload = resolve; image.onerror = resolve; }))); });
          await tab.waitForTimeout(800);
          if (errors.length) throw new Error(errors.join('\n'));
          await tab.getByText('ACTUAL READER CODE', { exact: false }).waitFor();
          const group = await tab.getByTestId('reader-control-group').boundingBox();
          const trailing = await tab.getByTestId('reader-control-trailing').boundingBox();
          if (!group || !trailing) throw new Error('Missing reader controls');
          const horizontalGap = trailing.x - (group.x + group.width);
          const verticalGap = trailing.y - (group.y + group.height);
          if (horizontalGap < 23 || trailing.y >= group.y + group.height) {
            if (verticalGap < 23) throw new Error(`Control hit areas overlap: ${JSON.stringify({group,trailing})}`);
          }
          if (trailing.x < 0 || trailing.x + trailing.width > width) throw new Error('Trailing control outside viewport');
          fs.writeFileSync(path.join(output, `${lang}-${size}-${width}-${page}.json`), JSON.stringify({group,trailing,horizontalGap,verticalGap}));
          await tab.screenshot({ path: path.join(output, `${lang}-${size}-${width}-${page}.png`) });
          fs.writeFileSync(path.join(output, `${lang}-${size}-${width}-${page}.txt`), await tab.locator('body').innerText());
          await tab.close();
        }
      }
    }
    }
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
