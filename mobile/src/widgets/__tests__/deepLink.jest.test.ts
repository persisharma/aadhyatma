jest.mock('@react-navigation/native', () => ({
  CommonActions: {
    navigate: (options: unknown) => ({ type: 'NAVIGATE', payload: options }),
  },
}));
jest.mock('@/notifications/deepLink', () => ({ navigationRef: { isReady: jest.fn(() => true), dispatch: jest.fn() } }));

import { handleWidgetDeepLink, parseWidgetDeepLink, retryWidgetDeepLink } from '../deepLink';
import { navigationRef } from '@/notifications/deepLink';

const mockDispatch = navigationRef.dispatch as jest.Mock;
const mockIsReady = navigationRef.isReady as jest.Mock;

describe('widget cold/warm URL routing', () => {
  beforeEach(() => { mockDispatch.mockClear(); mockIsReady.mockReturnValue(true); });

  test('parses exact verse identity and rejects malformed fields', () => {
    expect(parseWidgetDeepLink('vedansh://widget/verse?sourceId=bhagavad-gita&chapter=1&verseIndex=0')).toEqual({ kind: 'verse', sourceId: 'bhagavad-gita', chapter: 1, verseIndex: 0 });
    expect(parseWidgetDeepLink('vedansh://widget/verse?sourceId=x&verseIndex=-1')).toBeNull();
    expect(parseWidgetDeepLink('https://example.com/widget/verse')).toBeNull();
  });

  test('routes represented Panchang date through the lazy nested stack', () => {
    expect(handleWidgetDeepLink('vedansh://widget/panchang?date=2030-01-15')).toBe(true);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch.mock.calls[0][0].payload).toMatchObject({ name: 'PanchangTab', params: { screen: 'PanchangHome', initial: false } });
    expect(mockDispatch.mock.calls[0][0].payload.params.params.dateMs).toBeGreaterThan(0);
  });

  test('routes known mantra exactly and unknown/missing mantra to the Japam library', () => {
    handleWidgetDeepLink('vedansh://widget/japam?mantraId=om-namah-shivaya');
    expect(mockDispatch.mock.calls[0][0].payload.params.screen).toBe('JapamCounter');
    handleWidgetDeepLink('vedansh://widget/japam?mantraId=removed');
    expect(mockDispatch.mock.calls[1][0].payload.params.screen).toBe('CategoryList');
  });

  test('returns false without consuming a cold link before navigation is ready', () => {
    mockIsReady.mockReturnValue(false);
    expect(handleWidgetDeepLink('vedansh://widget/japam')).toBe(false);
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  test('retries a cold initial URL until navigation becomes ready', () => {
    jest.useFakeTimers();
    mockIsReady.mockReturnValue(false);
    const cancel = retryWidgetDeepLink('vedansh://widget/panchang?date=2030-01-15', 5, 10);
    expect(mockDispatch).not.toHaveBeenCalled();
    mockIsReady.mockReturnValue(true);
    jest.advanceTimersByTime(10);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    cancel();
    jest.useRealTimers();
  });
});
