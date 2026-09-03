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
import { navigationRef, handleNotificationResponse, startTargetFromNotification } from '../deepLink';
import { buildInitialNavigationState, startTargetToNavigateAction } from '@/navigation/startTarget';

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

let dispatchSpy: jest.SpyInstance;
let readySpy: jest.SpyInstance;

beforeEach(() => {
  dispatchSpy = jest.spyOn(navigationRef, 'dispatch').mockImplementation(() => {});
  readySpy = jest.spyOn(navigationRef, 'isReady');
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('handleNotificationResponse', () => {
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

// The cold-start resolver is the SAME table the warm handler dispatches from:
// whatever a tap navigates to after mount, the launching tap must reach without
// mounting Home first.
describe('startTargetFromNotification', () => {
  test('a launching daily-verse tap opens the Daily Bhakti tab with the baked verse', () => {
    expect(startTargetFromNotification(responseWithData(dailyVerse))).toEqual({
      tab: 'DailyBhaktiTab',
      params: { sourceId: 'hanuman-chalisa', verseIndex: 3 },
    });
    expect(
      startTargetFromNotification(responseWithData({ ...dailyVerse, sourceId: 'gita', chapter: 2 }))
    ).toEqual({ tab: 'DailyBhaktiTab', params: { sourceId: 'gita', verseIndex: 3, chapter: 2 } });
  });

  test('every other family resolves straight to its own screen', () => {
    const dateMs = new Date(2026, 7, 17).getTime();
    const cases: [unknown, unknown][] = [
      [{ type: 'vrat-reminder', ruleId: 'nirjala-ekadashi' }, { tab: 'PanchangTab', screen: 'ObservanceDetail', params: { ruleId: 'nirjala-ekadashi' } }],
      [{ type: 'muhurat-reminder', occasionId: 'vahan', dateMs }, { tab: 'PanchangTab', screen: 'MuhuratDayDetail', params: { occasionId: 'vahan', dateMs } }],
      [{ type: 'festive-reminder', ruleId: 'diwali' }, { tab: 'HomeTab', screen: 'Home' }],
      [{ type: 'sadhana-reminder', programId: 'p1' }, { tab: 'HomeTab', screen: 'RoutineToday' }],
      [{ type: 'routine-reminder', routineId: 'gone', dateKey: '2026-09-03' }, { tab: 'HomeTab', screen: 'RoutineToday' }],
      [{ type: 'pitru-smaran-reminder', entryId: 'e1' }, { tab: 'MoreTab', screen: 'PitruSmaranDetail', params: { entryId: 'e1' } }],
      [{ type: 'janma-tithi-reminder', personId: 'p9' }, { tab: 'MoreTab', screen: 'JanmaTithiDetail', params: { personId: 'p9' } }],
      [{ type: 'pitru-paksha-reminder', year: 2026 }, { tab: 'MoreTab', screen: 'PitruPakshaOverview' }],
      [{ type: 'japam-alarm', alarmId: 'a1', mantraId: 'om-namah-shivaya' }, { tab: 'HomeTab', screen: 'JapamCounter', params: { mantraId: 'om-namah-shivaya', autoPlay: true } }],
    ];
    for (const [payload, expected] of cases) {
      expect(startTargetFromNotification(responseWithData(payload))).toEqual(expected);
    }
  });

  test('cold and warm paths agree: the launch target dispatches what the warm handler dispatches', () => {
    readySpy.mockReturnValue(true);
    for (const data of [
      dailyVerse,
      { type: 'vrat-reminder', ruleId: 'nirjala-ekadashi' },
      { type: 'festive-reminder', ruleId: 'diwali' },
      { type: 'routine-reminder' },
      { type: 'pitru-smaran-reminder', entryId: 'e1' },
      { type: 'japam-alarm', alarmId: 'a1', mantraId: 'om-namah-shivaya' },
    ]) {
      dispatchSpy.mockClear();
      handleNotificationResponse(responseWithData(data));
      expect(dispatchSpy.mock.calls[0][0].payload).toEqual(
        startTargetToNavigateAction(startTargetFromNotification(responseWithData(data))!)
      );
    }
  });

  test('a stale japam mantra and anything unrecognised leave the default launch alone', () => {
    for (const data of [
      undefined,
      null,
      {},
      { type: 'daily-verse' },
      { type: 'other' },
      { type: 'japam-alarm', alarmId: 'a1', mantraId: 'no-such-mantra' },
    ]) {
      expect(startTargetFromNotification(responseWithData(data))).toBeNull();
    }
    expect(startTargetFromNotification(null)).toBeNull();
    expect(startTargetFromNotification(undefined)).toBeNull();
  });
});

// A cold start seeds the NavigationContainer's initialState. Two things must
// hold for every family, and both were real bugs:
//   1. the stack's root sits BENEATH a deeper target, so back works and the
//      stack's hub stays reachable;
//   2. the target appears exactly ONCE. Expressed as a tab's initialParams the
//      nested target lived in route.params all session and was re-consumed on
//      every return to that tab, pushing a second (third, fourth) copy — on the
//      Panchang tab, whose root is the app's heaviest screen, until it froze.
describe('cold-start navigation state', () => {
  const STACK_ROOTS: Record<string, string> = { HomeTab: 'Home', PanchangTab: 'PanchangHome', MoreTab: 'MoreHome' };
  const payloads: unknown[] = [
    { ...dailyVerse },
    { type: 'vrat-reminder', ruleId: 'nirjala-ekadashi' },
    { type: 'muhurat-reminder', occasionId: 'vahan', dateMs: Date.now() },
    { type: 'festive-reminder', ruleId: 'diwali' },
    { type: 'sadhana-reminder', programId: 'p1' },
    { type: 'routine-reminder' },
    { type: 'pitru-smaran-reminder', entryId: 'e1' },
    { type: 'janma-tithi-reminder', personId: 'p9' },
    { type: 'pitru-paksha-reminder' },
    { type: 'japam-alarm', alarmId: 'a1', mantraId: 'om-namah-shivaya' },
  ];

  test.each(payloads.map((p) => [(p as { type: string }).type, p]))('%s', (_type, payload) => {
    const target = startTargetFromNotification(responseWithData(payload))!;
    expect(target).not.toBeNull();
    const state = buildInitialNavigationState(target);

    // Exactly one tab route, and it is the tab the target named.
    expect(state.routes).toHaveLength(1);
    const tabRoute = state.routes[0] as { name: string; params?: object; state?: { index?: number; routes: { name: string }[] } };
    expect(tabRoute.name).toBe(target.tab);

    if (!target.screen) {
      // A plain tab (Daily Bhakti) carries its params directly, no nested stack.
      expect(tabRoute.state).toBeUndefined();
      expect(tabRoute.params).toEqual(target.params);
      return;
    }

    const routes = tabRoute.state!.routes.map((r) => r.name);
    // The target appears once — never a duplicate of itself or of the root.
    expect(routes.filter((n) => n === target.screen)).toHaveLength(1);
    expect(new Set(routes).size).toBe(routes.length);
    // The focused route is the target.
    expect(routes[tabRoute.state!.index!]).toBe(target.screen);
    // A deeper target keeps its stack root beneath it; a root target stands alone.
    const root = STACK_ROOTS[target.tab];
    expect(routes).toEqual(target.screen === root ? [target.screen] : [root, target.screen]);
  });
});
