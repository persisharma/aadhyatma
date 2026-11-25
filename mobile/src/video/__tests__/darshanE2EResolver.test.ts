// Pin the deterministic native fixture to explicit development resolution only.
jest.mock('expo/metro-config', () => ({ getDefaultConfig: () => ({ resolver: { assetExts: [] } }) }));
const config = require('../../../metro.config');
const resolve = config.resolver.resolveRequest;
const original = process.env.VEDANSH_DARSHAN_E2E;
afterEach(() => { if (original === undefined) delete process.env.VEDANSH_DARSHAN_E2E; else process.env.VEDANSH_DARSHAN_E2E = original; });
it.each([false, true])('ordinary bundles retain source/frame resolution (dev=%s)', dev => {
  delete process.env.VEDANSH_DARSHAN_E2E;
  const resolveRequest = jest.fn(() => 'original');
  for (const module of ['./ChannelYouTubeFrame', '@/video/darshanSource']) {
    expect(resolve({ dev, originModulePath: '/app/components/video/DockedYouTubePlayer.tsx', resolveRequest }, module, 'ios')).toBe('original');
  }
});
it('even an enabled fixture flag cannot replace production resolution', () => {
  process.env.VEDANSH_DARSHAN_E2E = '1';
  const resolveRequest = jest.fn(() => 'production');
  expect(resolve({ dev: false, originModulePath: '/app/components/video/DockedYouTubePlayer.tsx', resolveRequest }, './ChannelYouTubeFrame', 'android')).toBe('production');
});
it('explicit development runs use local deterministic source and frame fixtures', () => {
  process.env.VEDANSH_DARSHAN_E2E = '1';
  const context = { dev: true, originModulePath: '/app/components/video/DockedYouTubePlayer.tsx', resolveRequest: jest.fn() };
  expect(resolve(context, './ChannelYouTubeFrame', 'android').filePath).toMatch(/fixtures\/darshan-error-frame\.tsx$/);
  expect(resolve(context, '@/video/darshanSource', 'ios').filePath).toMatch(/fixtures\/darshan-source\.ts$/);
  expect(context.resolveRequest).not.toHaveBeenCalled();
});
