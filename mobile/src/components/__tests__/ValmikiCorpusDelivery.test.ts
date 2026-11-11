import fs from 'node:fs';
import path from 'node:path';

/**
 * mobile/corpusDelivery.js + mobile/metro.config.js — an OTA from the latest
 * branch must not ask an older store build for anything it does not have. The
 * Valmiki corpus is read from asset files only by a bundle built for a runtime
 * whose binary embeds them; every older runtime keeps it in the JS bundle.
 * docs/engineering/android-low-end-performance-native-2026-11.md §5.
 */
const root = path.resolve(__dirname, '../../..');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const delivery = require('../../../corpusDelivery.js');
const CORPUS_INDEX = path.join(root, 'src', 'data', 'valmiki-ramayan', 'index.ts');

describe('which delivery a bundle gets', () => {
  test('every runtime that shipped without the parts keeps the corpus in the bundle', () => {
    // 1.5.6 builds exist without the part files; nothing at or below it may be asked for them.
    for (const version of ['1.0.0', '1.4.9', '1.5.0', '1.5.5', '1.5.6']) {
      expect(delivery.valmikiCorpusDelivery(version, {})).toBe('bundle');
    }
    expect(delivery.valmikiCorpusDelivery(delivery.VALMIKI_ASSETS_SINCE_VERSION, {})).toBe('assets');
  });

  test('the first embedding version and everything after it read the asset files', () => {
    for (const version of ['1.5.7', '1.5.10', '1.6', '1.6.0', '2.0.0', '10.0.0']) {
      expect(delivery.valmikiCorpusDelivery(version, {})).toBe('assets');
    }
  });

  test('versions compare as numbers, not as text', () => {
    // "1.5.10" sorts before "1.5.7" as a string.
    expect(delivery.valmikiCorpusDelivery('1.5.10', {})).toBe('assets');
    expect(delivery.valmikiCorpusDelivery('1.5', {})).toBe('bundle');
    expect(delivery.valmikiCorpusDelivery('1.10', {})).toBe('assets');
  });

  test('a version that cannot be read gets the delivery that works on every binary', () => {
    for (const version of ['', 'latest', '1.5.x', '1.5.7-beta', undefined, null, 157]) {
      expect(delivery.valmikiCorpusDelivery(version, {})).toBe('bundle');
    }
  });

  test('one bundling run can be forced either way, and a typo fails loudly', () => {
    const env = (value: string) => ({ [delivery.OVERRIDE_ENV]: value });
    expect(delivery.valmikiCorpusDelivery('1.5.6', env('assets'))).toBe('assets');
    expect(delivery.valmikiCorpusDelivery('9.9.9', env('bundle'))).toBe('bundle');
    expect(delivery.valmikiCorpusDelivery('1.5.6', env(''))).toBe('bundle');
    expect(() => delivery.valmikiCorpusDelivery('1.5.6', env('asset'))).toThrow(/must be "assets" or "bundle"/);
  });

  test('the publish log says which one and why', () => {
    expect(delivery.describeValmikiCorpusDelivery('1.5.6', {})).toMatch(/in the JS bundle .*1\.5\.6 predates/);
    expect(delivery.describeValmikiCorpusDelivery('1.5.7', {})).toMatch(/asset files .*1\.5\.7 embeds/);
  });
});

describe('the one request Metro answers differently', () => {
  test('only the corpus module asking for ./corpusSource, and only for an in-bundle delivery', () => {
    expect(delivery.corpusSourceRequest('bundle', CORPUS_INDEX, './corpusSource')).toBe('./corpusSource.inbundle');
    expect(delivery.corpusSourceRequest('bundle', CORPUS_INDEX.replace(/\//g, '\\'), './corpusSource')).toBe('./corpusSource.inbundle');
    // The asset delivery is the file as written.
    expect(delivery.corpusSourceRequest('assets', CORPUS_INDEX, './corpusSource')).toBe('./corpusSource');
    // Another module, or another request from the corpus module, is never touched.
    expect(delivery.corpusSourceRequest('bundle', path.join(root, 'src/data/gita/index.ts'), './corpusSource')).toBe('./corpusSource');
    expect(delivery.corpusSourceRequest('bundle', CORPUS_INDEX, './parts')).toBe('./parts');
    expect(delivery.corpusSourceRequest('bundle', undefined, './corpusSource')).toBe('./corpusSource');
  });

  const metroConfigFor = (forced: 'assets' | 'bundle', resolveBefore?: jest.Mock) => {
    let config: { resolver: { assetExts: string[]; resolveRequest: (...args: unknown[]) => unknown }; valmikiCorpusDelivery: string };
    // The override is read by name; this is the name `corpusDelivery.js` exports.
    expect(delivery.OVERRIDE_ENV).toBe('VALMIKI_CORPUS_DELIVERY');
    const before = process.env.VALMIKI_CORPUS_DELIVERY;
    process.env.VALMIKI_CORPUS_DELIVERY = forced;
    try {
      jest.isolateModules(() => {
        jest.doMock('expo/metro-config', () => ({
          getDefaultConfig: () => ({ resolver: { assetExts: ['png'], resolveRequest: resolveBefore } }),
        }));
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        config = require('../../../metro.config.js');
      });
    } finally {
      if (before === undefined) delete process.env.VALMIKI_CORPUS_DELIVERY;
      else process.env.VALMIKI_CORPUS_DELIVERY = before;
      jest.dontMock('expo/metro-config');
    }
    return config!;
  };
  const context = () => ({ originModulePath: CORPUS_INDEX, resolveRequest: jest.fn(() => 'resolved') });

  test('metro.config.js sends that request to the in-bundle source for an older runtime', () => {
    const config = metroConfigFor('bundle');
    expect(config.valmikiCorpusDelivery).toBe('bundle');
    const ctx = context();
    expect(config.resolver.resolveRequest(ctx, './corpusSource', 'android')).toBe('resolved');
    expect(ctx.resolveRequest).toHaveBeenCalledWith(ctx, './corpusSource.inbundle', 'android');
    // Everything else resolves exactly as it would without this config.
    config.resolver.resolveRequest(ctx, './parts', 'ios');
    expect(ctx.resolveRequest).toHaveBeenLastCalledWith(ctx, './parts', 'ios');
  });

  test('…and leaves it alone for a runtime that embeds the parts', () => {
    const config = metroConfigFor('assets');
    const ctx = context();
    config.resolver.resolveRequest(ctx, './corpusSource', 'android');
    expect(ctx.resolveRequest).toHaveBeenCalledWith(ctx, './corpusSource', 'android');
  });

  test('a resolver the Expo defaults already set is kept in the chain', () => {
    const expoResolver = jest.fn(() => 'from-expo');
    const config = metroConfigFor('bundle', expoResolver);
    const ctx = context();
    expect(config.resolver.resolveRequest(ctx, './corpusSource', 'android')).toBe('from-expo');
    expect(expoResolver).toHaveBeenCalledWith(ctx, './corpusSource.inbundle', 'android');
    expect(ctx.resolveRequest).not.toHaveBeenCalled();
  });

  test('the part files stay registered as assets either way', () => {
    expect(metroConfigFor('bundle').resolver.assetExts).toEqual(['png', 'txt']);
    expect(metroConfigFor('assets').resolver.assetExts).toEqual(['png', 'txt']);
  });
});

describe('the two sources are interchangeable', () => {
  const source = (name: string) => fs.readFileSync(path.join(root, 'src/data/valmiki-ramayan', name), 'utf8');
  const exportsOf = (text: string) => [...text.matchAll(/^export (?:const|function|type) (\w+)/gm)].map((match) => match[1]);

  test('the in-bundle source exports every runtime name the asset source does', () => {
    const runtime = (names: string[]) => names.filter((name) => !/^Kanda/.test(name)).sort();
    expect(runtime(exportsOf(source('corpusSource.inbundle.ts')))).toEqual(runtime(exportsOf(source('corpusSource.ts'))));
    expect(runtime(exportsOf(source('corpusSource.ts')))).toEqual(['readKandaParts', 'valmikiCorpusDelivery']);
  });

  test('the in-bundle source pulls in neither the asset handles nor the native reader', () => {
    const text = source('corpusSource.inbundle.ts');
    expect(text).not.toMatch(/from '\.\/parts'|from '\.\/partReader'|require\('\.\/parts|require\('\.\/partReader|expo-asset/);
    // Its only import of the asset source is a type, which is erased.
    expect(text.match(/from '\.\/corpusSource'/g)).toHaveLength(1);
    expect(text).toMatch(/import type \{[^}]+\} from '\.\/corpusSource'/);
  });

  test('the publish script reports the delivery before it publishes', () => {
    const push = fs.readFileSync(path.join(root, '..', 'push.sh'), 'utf8');
    expect(push).toMatch(/describeValmikiCorpusDelivery/);
    expect(push.indexOf('describeValmikiCorpusDelivery')).toBeLessThan(push.indexOf('exec npx eas-cli update'));
  });
});
