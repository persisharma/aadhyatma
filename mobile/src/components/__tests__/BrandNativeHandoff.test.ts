import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';

const root = path.resolve(__dirname, '../../../..');
const document = JSON.parse(fs.readFileSync(path.join(root, 'mobile/src/branding/approvedParticleDocument.json'), 'utf8'));

test('all native splash configuration uses the transparent placeholder and matching ivory', () => {
  const { PNG } = jest.requireActual('pngjs');
  const { expo } = JSON.parse(fs.readFileSync(path.join(root, 'mobile/app.json'), 'utf8'));
  const config = expo.plugins.find((entry: unknown) => Array.isArray(entry) && entry[0] === 'expo-splash-screen')[1];
  for (const splash of [expo.splash, config]) {
    expect(splash.image).toBe('./assets/splash-blank.png');
    expect(splash.backgroundColor).toBe('#FFF1D5');
  }
  // This must be explicit; an omitted image can fall back to the app icon.
  const bytes = fs.readFileSync(path.join(root, 'mobile/assets/splash-blank.png'));
  const image = PNG.sync.read(bytes);
  for (let i = 3; i < image.data.length; i += 4) expect(image.data[i]).toBe(0);
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'mobile/assets/branding/app-icon-manifest.json'), 'utf8'));
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(manifest.files['splash-blank.png'].sha256);
});

test('generated bridge holds frame zero until native start, then completes once', () => {
  const messages: string[] = [];
  const canvas = { style: { visibility: 'hidden' } };
  const animation = { ready: false, elapsed: 3350, renderAt: jest.fn((ms: number) => { animation.elapsed = ms; }) };
  const button = { click: jest.fn(() => { animation.elapsed = 0; }) };
  let poll!: () => void;
  let pagehide!: () => void;
  const clear = jest.fn();
  const window = {
    __vedanshStart: undefined as undefined | (() => void),
    ReactNativeWebView: { postMessage: (value: string) => messages.push(JSON.parse(value).type) },
    addEventListener: (_event: string, callback: () => void) => { pagehide = callback; },
  };
  const scripts = [...document.html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  vm.runInNewContext(scripts[scripts.length - 1][1], {
    window, document: { getElementById: () => ({ vpAnimation: animation, querySelector: (selector: string) => selector === 'canvas' ? canvas : button }) },
    setInterval: (callback: () => void) => { poll = callback; return 9; }, clearInterval: clear,
  });
  window.__vedanshStart!(); expect(button.click).not.toHaveBeenCalled();
  poll(); expect(messages).toEqual([]);
  animation.ready = true; poll();
  expect(animation.renderAt).toHaveBeenCalledWith(0);
  expect(messages).toEqual(['brand-ready']);
  // Time can pass under the native splash without playing or completing.
  animation.elapsed = 3350; poll(); poll();
  expect(messages).toEqual(['brand-ready']); expect(canvas.style.visibility).toBe('hidden');
  window.__vedanshStart!(); window.__vedanshStart!();
  expect(canvas.style.visibility).toBe('visible'); expect(button.click).toHaveBeenCalledTimes(1);
  poll(); expect(messages).toEqual(['brand-ready']);
  animation.elapsed = 3350; poll();
  expect(messages).toEqual(['brand-ready', 'brand-complete']); expect(clear).toHaveBeenCalledWith(9);
  pagehide(); expect(clear).toHaveBeenCalledTimes(2);
});
