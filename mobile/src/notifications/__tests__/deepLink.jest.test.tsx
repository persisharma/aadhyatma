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

  test('forwards the verse identity to the Daily Bhakti tab without opening a reader', () => {
    readySpy.mockReturnValue(true);

    handleNotificationResponse(responseWithData(dailyVerse));

    const action = dispatchSpy.mock.calls[0][0];
    // Regression guard: the destination stays the Daily Bhakti TAB, not a reader
    // screen — opening a reader would fire its setProgress effect and clobber the
    // user's bookmark. The verse identity rides along as tab params so Daily
    // Bhakti can show the exact (stable) verse the user tapped.
    expect(action.payload?.name).toBe('DailyBhaktiTab');
    expect(action.payload?.params).toMatchObject({
      sourceId: dailyVerse.sourceId,
      verseIndex: dailyVerse.verseIndex,
    });
  });

  test('a vrat-reminder tap opens the observance detail inside the Panchang tab', () => {
    readySpy.mockReturnValue(true);

    const vrat = { type: 'vrat-reminder', ruleId: 'nirjala-ekadashi', occurrenceDateKey: '2026-06-20', kind: 'dayOf' };
    expect(handleNotificationResponse(responseWithData(vrat))).toBe(true);
    expect(dispatchSpy).toHaveBeenCalledTimes(1);

    const action = dispatchSpy.mock.calls[0][0];
    expect(action).toMatchObject({
      type: 'NAVIGATE',
      payload: {
        name: 'PanchangTab',
        params: { screen: 'ObservanceDetail', params: { ruleId: 'nirjala-ekadashi' } },
      },
    });
  });

  test('a muhurat-reminder tap opens the followed day inside the Panchang tab', () => {
    readySpy.mockReturnValue(true);

    const dateMs = new Date(2026, 7, 17).getTime();
    const muhurat = {
      type: 'muhurat-reminder',
      occasionId: 'vahan',
      dateKey: '2026-08-17',
      dateMs,
      kind: 'dayOf',
    };
    expect(handleNotificationResponse(responseWithData(muhurat))).toBe(true);
    expect(dispatchSpy).toHaveBeenCalledTimes(1);

    // The date rides the payload: an advance notice is read on a different day
    // than the one it points at, so "today" is the wrong thing to re-derive.
    const action = dispatchSpy.mock.calls[0][0];
    expect(action).toMatchObject({
      type: 'NAVIGATE',
      payload: {
        name: 'PanchangTab',
        params: { screen: 'MuhuratDayDetail', params: { occasionId: 'vahan', dateMs } },
      },
    });
  });

  test('ignores a muhurat-reminder for an occasion no longer in EVENT_RULES', () => {
    readySpy.mockReturnValue(true);

    // A notice armed months ago must not open a screen for a retired occasion.
    const stale = {
      type: 'muhurat-reminder',
      occasionId: 'vivah',
      dateKey: '2026-08-17',
      dateMs: new Date(2026, 7, 17).getTime(),
      kind: 'dayOf',
    };
    expect(handleNotificationResponse(responseWithData(stale))).toBe(false);
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  test('ignores a muhurat-reminder payload missing its date', () => {
    readySpy.mockReturnValue(true);

    expect(
      handleNotificationResponse(responseWithData({ type: 'muhurat-reminder', occasionId: 'vahan' }))
    ).toBe(false);
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  test('ignores a vrat-reminder payload missing ruleId', () => {
    readySpy.mockReturnValue(true);

    expect(handleNotificationResponse(responseWithData({ type: 'vrat-reminder' }))).toBe(false);
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  test('a festive-reminder tap lands on the Home screen, not a reader', () => {
    readySpy.mockReturnValue(true);

    const festive = {
      type: 'festive-reminder',
      ruleId: 'hanuman-jayanti',
      sourceId: 'hanuman-chalisa',
      occurrenceDateKey: '2026-04-02',
    };
    expect(handleNotificationResponse(responseWithData(festive))).toBe(true);
    expect(dispatchSpy).toHaveBeenCalledTimes(1);

    const action = dispatchSpy.mock.calls[0][0];
    // The reading the message named is one tap away in Home's FOR TODAY row,
    // which leads with the festival's content on a festival day. Landing here
    // instead of in a reader keeps the resume position safe (same reason
    // daily-verse stays on a tab) and lets Home recompute today from today.
    // `screen: 'Home'` is explicit — focusing the tab alone would restore
    // whatever screen the Home stack was left on.
    expect(action).toMatchObject({
      type: 'NAVIGATE',
      payload: { name: 'HomeTab', params: { screen: 'Home' } },
    });
  });

  test('a festive-reminder lands on Home regardless of the content it named', () => {
    readySpy.mockReturnValue(true);

    // Including content an OTA update has since retired: the payload's sourceId
    // no longer drives routing, so a stale one cannot strand the user.
    for (const sourceId of ['bhagavad-gita', 'retired-by-an-ota-update']) {
      dispatchSpy.mockClear();
      const festive = {
        type: 'festive-reminder',
        ruleId: 'janmashtami',
        sourceId,
        occurrenceDateKey: '2026-09-04',
      };
      expect(handleNotificationResponse(responseWithData(festive))).toBe(true);
      expect(dispatchSpy.mock.calls[0][0]).toMatchObject({
        payload: { name: 'HomeTab', params: { screen: 'Home' } },
      });
    }
  });

  test('a festive-reminder without a sourceId still routes', () => {
    readySpy.mockReturnValue(true);

    expect(
      handleNotificationResponse(
        responseWithData({ type: 'festive-reminder', ruleId: 'diwali' })
      )
    ).toBe(true);
    expect(dispatchSpy.mock.calls[0][0]).toMatchObject({
      payload: { name: 'HomeTab', params: { screen: 'Home' } },
    });
  });

  test('ignores a festive-reminder payload missing ruleId', () => {
    readySpy.mockReturnValue(true);

    for (const data of [
      { type: 'festive-reminder' },
      { type: 'festive-reminder', sourceId: 'mahalakshmi-ashtakam' },
    ]) {
      expect(handleNotificationResponse(responseWithData(data))).toBe(false);
    }
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  test('a personal Pitru Smaran reminder opens that person detail', () => {
    readySpy.mockReturnValue(true);
    expect(handleNotificationResponse(responseWithData({ type: 'pitru-smaran-reminder', entryId: 'father' }))).toBe(true);
    expect(dispatchSpy.mock.calls[0][0]).toMatchObject({
      payload: {
        name: 'MoreTab',
        params: { screen: 'PitruSmaranDetail', params: { entryId: 'father' }, initial: false },
      },
    });
  });

  test("a routine-reminder tap opens Today's Practice on the Home tab", () => {
    readySpy.mockReturnValue(true);

    const routine = { type: 'routine-reminder', routineId: 'r1', dateKey: '2026-08-22' };
    expect(handleNotificationResponse(responseWithData(routine))).toBe(true);
    expect(dispatchSpy).toHaveBeenCalledTimes(1);

    // Byte-for-byte the sadhana-reminder landing: RoutineToday, never a reader,
    // so a lock-screen tap can't run a reader's setProgress effect and clobber
    // the resume position.
    expect(dispatchSpy.mock.calls[0][0]).toMatchObject({
      type: 'NAVIGATE',
      payload: { name: 'HomeTab', params: { screen: 'RoutineToday' } },
    });
  });

  test('a routine-reminder routes on type alone — a stale notice for a deleted routine still lands safely', () => {
    readySpy.mockReturnValue(true);

    // routineId rides along as a record but must not gate routing: RoutineToday
    // is safe to land on regardless of whether the routine still exists.
    expect(handleNotificationResponse(responseWithData({ type: 'routine-reminder' }))).toBe(true);
    expect(dispatchSpy.mock.calls[0][0]).toMatchObject({
      payload: { name: 'HomeTab', params: { screen: 'RoutineToday' } },
    });
  });

  test('ignores payloads that merely resemble a routine reminder', () => {
    readySpy.mockReturnValue(true);

    for (const data of [
      { type: 'routine' },
      { type: 'routine-reminder-v2', routineId: 'r1' },
      { routineId: 'r1', dateKey: '2026-08-22' },
    ]) {
      expect(handleNotificationResponse(responseWithData(data))).toBe(false);
    }
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  test('a public Pitru Paksha reminder opens the fortnight overview', () => {
    readySpy.mockReturnValue(true);
    expect(handleNotificationResponse(responseWithData({ type: 'pitru-paksha-reminder', year: 2026 }))).toBe(true);
    expect(dispatchSpy.mock.calls[0][0]).toMatchObject({
      payload: { name: 'MoreTab', params: { screen: 'PitruPakshaOverview', initial: false } },
    });
  });
});
