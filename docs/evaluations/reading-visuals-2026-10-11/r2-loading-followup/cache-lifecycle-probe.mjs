import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../../..');
const require = createRequire(path.join(repo, 'mobile/package.json'));
const ts = require('typescript');
const sourcePath = path.join(repo, 'mobile/src/utils/backgroundAssetCache.ts');
const manifest = JSON.parse(fs.readFileSync(path.join(repo, 'mobile/src/data/readerIllustrationManifest.json'), 'utf8'));
const asset = manifest.assets['hanuman-sea'];
const source = fs.readFileSync(path.join(repo, 'mobile/assets/reader-illustrations/hanuman-sea.webp'));
const fullHash = crypto.createHash('sha256').update(source).digest('hex');
assert.equal(asset.hash, fullHash.slice(0, 16));
const request = {
  key: asset.hash, ext: asset.ext, subdir: manifest.prefix,
  remoteUrl: `https://cdn.vedansh.app/${manifest.prefix}/${asset.hash}.${asset.ext}`,
};
const mode = process.argv[2];
const directory = process.argv[3];

if (!mode) {
  const cacheRoot = path.join(repo, 'scripts/.cache/r2-loading-followup');
  fs.mkdirSync(cacheRoot, { recursive: true });
  const work = fs.mkdtempSync(path.join(cacheRoot, 'lifecycle-'));
  const phases = {};
  for (const phase of ['cold', 'offline-restart']) {
    const child = spawnSync(process.execPath, [fileURLToPath(import.meta.url), phase, work], { encoding: 'utf8', timeout: 25000 });
    assert.equal(child.status, 0, child.stderr || child.stdout);
    phases[phase] = JSON.parse(child.stdout);
  }
  assert.equal(phases.cold.networkRequests, 1);
  assert.equal(phases['offline-restart'].networkRequests, 0);
  assert.deepEqual(phases.cold.file, phases['offline-restart'].file);
  const result = {
    verifiedAt: new Date().toISOString(),
    scope: 'Actual app cache module, real host HTTPS and async filesystem adapter in two separate Node processes; not native/device proof',
    cacheSourceSha256: crypto.createHash('sha256').update(fs.readFileSync(sourcePath)).digest('hex'),
    downloadedSourceSha256: fullHash, phases,
    nativeDownloadEvidence: false, physicalDevicePerformance: false,
  };
  fs.writeFileSync(path.join(here, 'cache-lifecycle.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result, null, 2));
} else {
  const filePath = uri => fileURLToPath(uri);
  let networkRequests = 0;
  const adapter = {
    documentDirectory: pathToFileURL(directory + path.sep).href,
    async getInfoAsync(uri) {
      try { const info = await fs.promises.stat(filePath(uri)); return { exists: true, size: info.size, isDirectory: info.isDirectory() }; }
      catch (error) { if (error.code === 'ENOENT') return { exists: false }; throw error; }
    },
    async makeDirectoryAsync(uri) { await fs.promises.mkdir(filePath(uri), { recursive: true }); },
    async deleteAsync(uri) { await fs.promises.rm(filePath(uri), { force: true }); },
    async moveAsync({ from, to }) { await fs.promises.rename(filePath(from), filePath(to)); },
    createDownloadResumable(url, uri) {
      networkRequests++;
      // Offline restart forbids every attempted download, rather than serving a fake success.
      assert.equal(mode, 'cold', 'A persisted offline image attempted network access');
      const controller = new AbortController();
      return {
        async downloadAsync() {
          const response = await fetch(url, { signal: controller.signal });
          await fs.promises.writeFile(filePath(uri), Buffer.from(await response.arrayBuffer()));
          return { status: response.status, uri };
        },
        async cancelAsync() { controller.abort(); },
      };
    },
  };
  const compiled = ts.transpileModule(fs.readFileSync(sourcePath, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(compiled, {
    exports: module.exports, module,
    require: name => { assert.equal(name, 'expo-file-system/legacy'); return adapter; },
    setTimeout, clearTimeout, Promise, Map, Set, Error,
  }, { filename: sourcePath });
  const releases = [];
  const observe = value => new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Cache callback timed out')), 15000);
    releases.push(module.exports.subscribeBackgroundAsset(value, uri => {
      clearTimeout(timer); uri ? resolve(uri) : reject(new Error('Unexpected fallback'));
    }));
  });
  const started = performance.now();
  const locations = await Promise.all([
    observe(request), observe(request),
    observe({ ...request, subdir: 'reading-backgrounds', remoteUrl: `https://unavailable.invalid/${asset.hash}.${asset.ext}` }),
  ]);
  assert.equal(new Set(locations).size, 1);
  releases.forEach(release => release());
  const file = filePath(locations[0]);
  const data = await fs.promises.readFile(file);
  assert.equal(crypto.createHash('sha256').update(data).digest('hex'), fullHash);
  assert.equal(data.length, source.length);
  const stat = await fs.promises.stat(file, { bigint: true });
  assert.deepEqual((await fs.promises.readdir(path.dirname(file))).filter(name => name.endsWith('.part')), []);
  console.log(JSON.stringify({
    mode, pid: process.pid, networkRequests, subscribers: 3,
    elapsedMs: performance.now() - started,
    file: { sha256: fullHash, bytes: data.length, mtimeNs: String(stat.mtimeNs), inode: String(stat.ino) },
    source: mode === 'cold' ? 'Real host R2 download with default TLS validation' : 'Disk only; all download attempts prohibited',
  }));
}
