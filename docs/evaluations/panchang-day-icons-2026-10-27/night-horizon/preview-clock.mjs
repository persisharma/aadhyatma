// Dedicated native debug simulator only. Run `restore` immediately after captures.
// This file is not imported by the app or its production entry point.
const target = process.argv[2];
if (target !== 'restore' && !Number.isFinite(Date.parse(target))) throw new Error('Pass an ISO timestamp or restore');
const pages = await (await fetch('http://localhost:8106/json/list')).json();
const page = pages.find(page => page.title.includes('Vedansh-Panchang-556'));
if (!page) throw new Error('Dedicated Panchang debug inspector is unavailable');
const expression = target === 'restore' ? `
  if (globalThis.__panchangPreviewRealDate) globalThis.Date = globalThis.__panchangPreviewRealDate;
  Date.now = globalThis.__panchangPreviewRealNow || globalThis.__panchangRealNow || Date.now;
  delete globalThis.__panchangPreviewRealDate;
  delete globalThis.__panchangPreviewRealNow;
  delete globalThis.__panchangPreviewAt;
  delete globalThis.__panchangRealNow;
  new Date(Date.now()).toString();
` : `
  globalThis.__panchangPreviewRealDate = globalThis.__panchangPreviewRealDate || Date;
  globalThis.__panchangPreviewRealNow = globalThis.__panchangPreviewRealNow || globalThis.__panchangRealNow || Date.now;
  globalThis.__panchangPreviewAt = ${Date.parse(target)};
  (() => {
    const RealDate = globalThis.__panchangPreviewRealDate;
    function PreviewDate(...args) {
      if (new.target) return new RealDate(...(args.length ? args : [globalThis.__panchangPreviewAt]));
      return new RealDate(globalThis.__panchangPreviewAt).toString();
    }
    Object.setPrototypeOf(PreviewDate, RealDate);
    PreviewDate.prototype = RealDate.prototype;
    PreviewDate.now = () => globalThis.__panchangPreviewAt;
    globalThis.Date = PreviewDate;
  })();
  new Date(Date.now()).toString();
`;
const ws = new WebSocket(page.webSocketDebuggerUrl);
const timeout = setTimeout(() => { ws.close(); process.exitCode = 1; }, 10000);
ws.onopen = () => ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression, returnByValue: true } }));
ws.onmessage = event => {
  const result = JSON.parse(event.data);
  if (result.id !== 1) return;
  console.log(JSON.stringify(result));
  if (result.error || result.result?.exceptionDetails) process.exitCode = 1;
  clearTimeout(timeout);
  ws.close();
};
ws.onerror = () => { clearTimeout(timeout); process.exitCode = 1; };
