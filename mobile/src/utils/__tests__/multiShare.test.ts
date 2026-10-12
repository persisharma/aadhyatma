import { TurboModuleRegistry } from 'react-native';
import { __resetMultiShareForTests, isMultiShareAvailable, shareFiles } from '@/utils/multiShare';

/**
 * The multi-image share module is a store-build dependency (PRD-45 Phase 2). On a
 * binary without it, the probe must say "unavailable" and never require the package —
 * its codegen spec throws at import on such a binary.
 */

const mockOpen = jest.fn((..._args: unknown[]) => Promise.resolve({ success: true }));
let mockRequired = 0;
jest.mock('react-native-share', () => {
  mockRequired++;
  return { __esModule: true, default: { open: (...a: unknown[]) => mockOpen(...a) } };
});

describe('multiShare', () => {
  const get = jest.spyOn(TurboModuleRegistry, 'get');
  beforeEach(() => {
    __resetMultiShareForTests();
    mockOpen.mockClear();
    mockRequired = 0;
  });

  test('absent native module: unavailable, and the package is never required', async () => {
    get.mockReturnValue(null);
    expect(isMultiShareAvailable()).toBe(false);
    expect(await shareFiles(['file:///a.png'])).toBe(false);
    expect(mockRequired).toBe(0);
    expect(mockOpen).not.toHaveBeenCalled();
  });

  test('present: opens one sheet with every file as PNG, dismissal does not throw', async () => {
    get.mockReturnValue({} as never);
    expect(isMultiShareAvailable()).toBe(true);
    expect(await shareFiles(['file:///a.png', 'file:///b.png'], { message: 'm', title: 't' })).toBe(true);
    expect(mockOpen).toHaveBeenCalledWith(
      expect.objectContaining({ urls: ['file:///a.png', 'file:///b.png'], type: 'image/png', failOnCancel: false, message: 'm' })
    );
  });

  test('no files: nothing opens', async () => {
    get.mockReturnValue({} as never);
    expect(await shareFiles([])).toBe(false);
    expect(mockOpen).not.toHaveBeenCalled();
  });
});
