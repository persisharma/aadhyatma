import { Linking, Platform, TurboModuleRegistry } from 'react-native';
import {
  DIRECT_SHARE_SETTLE_MS,
  INSTAGRAM_SOURCE_APP_ID,
  isInstagramDirectAvailable,
  isWhatsAppDirectAvailable,
  shareToInstagram,
  shareToWhatsApp,
} from '@/utils/directShare';
import { __resetMultiShareForTests } from '@/utils/multiShare';

/**
 * Direct WhatsApp / Instagram hand-off (design.md §39.11). Every helper must say "no"
 * — so the caller keeps the OS sheet — on a binary without react-native-share, when the
 * app is missing or hidden by package visibility, and when the native call fails.
 */

const mockShareSingle = jest.fn((..._args: unknown[]) => Promise.resolve({ success: true }));
let mockInstalled: Record<string, boolean> = {};
let mockRequired = 0;
jest.mock('react-native-share', () => {
  mockRequired++;
  return {
    __esModule: true,
    default: {
      open: jest.fn(),
      shareSingle: (...a: unknown[]) => mockShareSingle(...a),
      isPackageInstalled: (pkg: string) => Promise.resolve({ isInstalled: !!mockInstalled[pkg] }),
      Social: { WHATSAPP: 'whatsapp', WHATSAPPBUSINESS: 'whatsappbusiness', INSTAGRAM: 'instagram', INSTAGRAM_STORIES: 'instagramstories' },
    },
  };
});

const mockBase64 = jest.fn(() => Promise.resolve('UE5H'));
jest.mock('expo-file-system', () => ({
  File: jest.fn().mockImplementation(() => ({ base64: mockBase64 })),
}));

const osDescriptor = Object.getOwnPropertyDescriptor(Platform, 'OS')!;
function onPlatform(os: 'ios' | 'android') {
  Object.defineProperty(Platform, 'OS', { configurable: true, value: os });
}

describe('directShare', () => {
  const get = jest.spyOn(TurboModuleRegistry, 'get');
  const canOpen = jest.spyOn(Linking, 'canOpenURL');

  beforeEach(() => {
    __resetMultiShareForTests();
    get.mockReturnValue({} as never);
    canOpen.mockResolvedValue(true);
    mockShareSingle.mockClear();
    mockShareSingle.mockImplementation(() => Promise.resolve({ success: true }));
    mockBase64.mockClear();
    mockInstalled = {};
    mockRequired = 0;
  });

  afterEach(() => Object.defineProperty(Platform, 'OS', osDescriptor));

  test('a binary without the module never requires it and never lands directly', async () => {
    onPlatform('android');
    get.mockReturnValue(null);
    mockInstalled = { 'com.whatsapp': true, 'com.instagram.android': true };
    expect(await isWhatsAppDirectAvailable()).toBe(false);
    expect(await shareToWhatsApp(['file:///a.png'], 'caption')).toBe(false);
    expect(await shareToInstagram('file:///a.png', 'story')).toBe(false);
    expect(mockRequired).toBe(0);
    expect(mockShareSingle).not.toHaveBeenCalled();
  });

  test('Android WhatsApp: image and caption straight into WhatsApp', async () => {
    onPlatform('android');
    mockInstalled = { 'com.whatsapp': true };
    expect(await isWhatsAppDirectAvailable()).toBe(true);
    expect(await shareToWhatsApp(['file:///a.png', 'file:///b.png'], 'Read on Vedansh: https://vedansh.app/get')).toBe(true);
    expect(mockShareSingle).toHaveBeenCalledWith({
      social: 'whatsapp',
      urls: ['file:///a.png', 'file:///b.png'],
      type: 'image/png',
      message: 'Read on Vedansh: https://vedansh.app/get',
      failOnCancel: false,
    });
  });

  test('Android with only WhatsApp Business opens WhatsApp Business', async () => {
    onPlatform('android');
    mockInstalled = { 'com.whatsapp.w4b': true };
    expect(await shareToWhatsApp(['file:///a.png'], 'm')).toBe(true);
    expect(mockShareSingle.mock.calls[0][0]).toMatchObject({ social: 'whatsappbusiness' });
  });

  test('WhatsApp missing or hidden (no <queries> in an older binary): no direct share', async () => {
    onPlatform('android');
    expect(await isWhatsAppDirectAvailable()).toBe(false);
    expect(await shareToWhatsApp(['file:///a.png'], 'm')).toBe(false);
    expect(mockShareSingle).not.toHaveBeenCalled();
  });

  test('iOS has no direct WhatsApp image hand-off; the OS sheet keeps it', async () => {
    onPlatform('ios');
    expect(await isWhatsAppDirectAvailable()).toBe(false);
    expect(await shareToWhatsApp(['file:///a.png'], 'm')).toBe(false);
    expect(mockShareSingle).not.toHaveBeenCalled();
  });

  test('a refused native hand-off reports failure so the caller opens the OS sheet', async () => {
    onPlatform('android');
    mockInstalled = { 'com.whatsapp': true, 'com.instagram.android': true };
    mockShareSingle.mockImplementation(() => Promise.reject(new Error('ActivityNotFound')));
    expect(await shareToWhatsApp(['file:///a.png'], 'm')).toBe(false);
    expect(await shareToInstagram('file:///a.png', 'post')).toBe(false);
  });

  test('Instagram story carries the Meta app id and the card paper for letterbox bands', async () => {
    onPlatform('android');
    mockInstalled = { 'com.instagram.android': true };
    expect(await shareToInstagram('file:///story.png', 'story')).toBe(true);
    expect(mockShareSingle).toHaveBeenCalledWith({
      social: 'instagramstories',
      appId: INSTAGRAM_SOURCE_APP_ID,
      backgroundImage: 'file:///story.png',
      backgroundTopColor: '#F3E7C9',
      backgroundBottomColor: '#F3E7C9',
    });
  });

  test('Android Instagram post hands the PNG file to Instagram', async () => {
    onPlatform('android');
    mockInstalled = { 'com.instagram.android': true };
    expect(await shareToInstagram('file:///post.png', 'post')).toBe(true);
    expect(mockShareSingle).toHaveBeenCalledWith({ social: 'instagram', url: 'file:///post.png', type: 'image/png' });
    expect(mockBase64).not.toHaveBeenCalled();
  });

  test('iOS Instagram post sends a data URL (the only form iOS routes to the Photos + library path)', async () => {
    onPlatform('ios');
    expect(await shareToInstagram('file:///post.png', 'post')).toBe(true);
    expect(canOpen).toHaveBeenCalledWith('instagram://app');
    expect(mockShareSingle).toHaveBeenCalledWith({ social: 'instagram', url: 'data:image/png;base64,UE5H', type: 'image/png' });
  });

  test('iOS probes the story scheme, and an unlisted/absent scheme keeps the OS sheet', async () => {
    onPlatform('ios');
    canOpen.mockResolvedValue(false);
    expect(await isInstagramDirectAvailable('story')).toBe(false);
    expect(canOpen).toHaveBeenCalledWith('instagram-stories://share');
    expect(await shareToInstagram('file:///story.png', 'story')).toBe(false);
    expect(mockShareSingle).not.toHaveBeenCalled();
  });

  test('a hand-off that never settles releases the share lock after the guard', async () => {
    jest.useFakeTimers();
    try {
      onPlatform('android');
      mockInstalled = { 'com.instagram.android': true };
      mockShareSingle.mockImplementation(() => new Promise(() => {}));
      let result: boolean | undefined;
      void shareToInstagram('file:///post.png', 'post').then((r) => { result = r; });
      await jest.advanceTimersByTimeAsync(DIRECT_SHARE_SETTLE_MS - 1);
      expect(result).toBeUndefined();
      await jest.advanceTimersByTimeAsync(1);
      // Handled (it may still land), so the caller must not also open the OS sheet.
      expect(result).toBe(true);
    } finally {
      jest.useRealTimers();
    }
  });

  test('the Stories app id is the verified Vedansh Meta app', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { META_APP_ID } = require('../../../plugins/metaTrackingConfig');
    expect(INSTAGRAM_SOURCE_APP_ID).toBe(META_APP_ID);
  });
});

describe('withShareTargetApps config plugin', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const plugin = require('../../../plugins/withShareTargetApps');

  test('iOS: adds the Instagram probe schemes and keeps existing ones', () => {
    const plist = plugin.addQuerySchemes({ LSApplicationQueriesSchemes: ['fbapi', 'instagram'], CFBundleName: 'Vedansh' });
    expect(plist.LSApplicationQueriesSchemes).toEqual(['fbapi', 'instagram', 'instagram-stories']);
    expect(plist.CFBundleName).toBe('Vedansh');
    expect(plugin.addQuerySchemes({}).LSApplicationQueriesSchemes).toEqual(['instagram', 'instagram-stories']);
  });

  test('Android: names WhatsApp, WhatsApp Business and Instagram once, keeping existing queries', () => {
    const existing = {
      manifest: {
        $: { package: 'com.prashantsharma.vedansh' },
        queries: [{ intent: [{ action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }] }], package: [{ $: { 'android:name': 'com.whatsapp' } }] }],
      },
    };
    const out = plugin.addPackageQueries(existing);
    const names = out.manifest.queries[0].package.map((p: { $: Record<string, string> }) => p.$['android:name']);
    expect(names).toEqual(['com.whatsapp', 'com.whatsapp.w4b', 'com.instagram.android']);
    expect(out.manifest.queries[0].intent).toEqual(existing.manifest.queries[0].intent);
    expect(plugin.addPackageQueries(out)).toEqual(out);
    const fresh = plugin.addPackageQueries({ manifest: { $: {} } });
    expect(fresh.manifest.queries[0].package).toHaveLength(3);
  });

  test('is registered in app.json', () => {
    const app = require('../../../app.json');
    expect(app.expo.plugins).toContain('./plugins/withShareTargetApps.js');
  });
});
