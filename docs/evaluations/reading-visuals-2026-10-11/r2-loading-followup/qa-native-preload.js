// QA-only observer; production index/cache/screens are unchanged.
const fs = require('expo-file-system/src/legacy/FileSystem');
const original = fs.createDownloadResumable;
const auditPath = fs.documentDirectory + 'r2-qa-audit.json';
const events = [];
const started = performance.now();
let writes = Promise.resolve();
const record = (event) => {
  events.push({ atMs: performance.now() - started, ...event });
  const payload = JSON.stringify({ scope: 'QA-only native FileSystem boundary observer', events });
  writes = writes.then(() => fs.writeAsStringAsync(auditPath, payload)).catch(() => {});
};
fs.createDownloadResumable = function(url, ...args) {
  const identity = String(url).split('/').pop();
  const id = events.length;
  record({ kind: 'createDownload', id, identity, url });
  let native;
  return {
    async downloadAsync() {
      const unavailable = await fs.getInfoAsync(fs.documentDirectory + 'r2-qa-offline.flag');
      const actualUrl = unavailable.exists ? 'https://127.0.0.1:9/' + identity : url;
      record({ kind: 'nativeStart', id, identity, actualUrl });
      native = original(actualUrl, ...args);
      try {
        const result = await native.downloadAsync();
        record({ kind: 'nativeComplete', id, identity, status: result?.status });
        return result;
      } catch (error) {
        record({ kind: 'nativeError', id, identity, message: String(error) }); throw error;
      }
    },
    async cancelAsync() { return native?.cancelAsync(); }
  };
};
// JS responsiveness only, not iOS main-thread/frame-time measurement.
let last = performance.now();
setInterval(() => {
  const now = performance.now(); const delay = Math.max(0, now - last - 50); last = now;
  if (delay > 50) record({ kind: 'jsStall', delayMs: delay });
}, 50);
record({ kind: 'qaBootstrap' });
require('../index.ts');
