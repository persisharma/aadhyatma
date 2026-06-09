// Jest suite (note the `.jest.test.tsx` suffix — see jest.config.js): deepLink
// imports @react-navigation/native + expo-notifications, so it can't run as a
// bare tsx node:assert script like its sibling scheduler.test.ts.
//
// The jest.mock() calls below are hoisted above this import by babel-jest, so
// deepLink sees the stubs:
//   • expo-notifications is referenced only as a type — stub the runtime module
//     so importing it under Jest doesn't load native code.
//   • @react-navigation/native ships ESM the react-native Jest preset doesn't
//     transform; deepLink only needs CommonActions.navigate (to build the
//     action) and createNavigationContainerRef (the dispatch target).
import { navigationRef, handleNotificationResponse } from '../deepLink';

jest.mock('expo-notifications', () => ({}));
jest.mock('@react-navigation/native', () => ({
  CommonActions: {
    navigate: (options: { name: string }) => ({ type: 'NAVIGATE', payload: options }),
  },
  createNavigationContainerRef: () => ({
    isReady: () => false,
    dispatch: (_action: unknown) => {},
  }),
}));

type ResponseLike = Parameters<typeof handleNotificationResponse>[0];

function responseWithData(data: unknown): ResponseLike {
  return { notification: { request: { content: { data } } } } as unknown as ResponseLike;
}

const dailyVerse = {
  type: 'daily-verse',
  dateKey: '2026-06-08',
  sourceId: 'hanuman-chalisa',
  verseIndex: 3,
};

describe('handleNotificationResponse', () => {
  let dispatchSpy: jest.SpyInstance;
  let readySpy: jest.SpyInstance;

  beforeEach(() => {
    dispatchSpy = jest.spyOn(navigationRef, 'dispatch').mockImplementation(() => {});
    readySpy = jest.spyOn(navigationRef, 'isReady');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('no-ops (returns false, no dispatch) when navigation is not ready', () => {
    readySpy.mockReturnValue(false);

    expect(handleNotificationResponse(responseWithData(dailyVerse))).toBe(false);
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  test('ignores payloads that are not daily-verse reminders', () => {
    readySpy.mockReturnValue(true);

    for (const data of [undefined, null, {}, { type: 'other' }, { type: 'daily-verse' }]) {
      expect(handleNotificationResponse(responseWithData(data))).toBe(false);
    }
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  test('a daily-verse tap lands on the Daily Bhakti tab and reports handled', () => {
    readySpy.mockReturnValue(true);

    expect(handleNotificationResponse(responseWithData(dailyVerse))).toBe(true);
    expect(dispatchSpy).toHaveBeenCalledTimes(1);

    const action = dispatchSpy.mock.calls[0][0];
    expect(action).toMatchObject({ type: 'NAVIGATE', payload: { name: 'DailyBhaktiTab' } });
  });

  test('regression guard: never deep-links into a reader (which would overwrite saved progress)', () => {
    readySpy.mockReturnValue(true);

    handleNotificationResponse(responseWithData(dailyVerse));

    const action = dispatchSpy.mock.calls[0][0];
    // The target is the tab, not the reader for the payload's sourceId — opening
    // a reader would fire its setProgress effect and clobber the user's bookmark.
    expect(action.payload?.name).toBe('DailyBhaktiTab');
    expect(JSON.stringify(action)).not.toContain(dailyVerse.sourceId);
  });
});
