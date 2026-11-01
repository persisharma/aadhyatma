import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { AppState, InteractionManager, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ExploreLaunch from '@/components/explore/ExploreLaunch';
// This suite exercises Explore's own policy. The shared host/store arbitration
// and persisted daily slot are exercised together in LaunchSurfaces.integration.
jest.mock('@/components/launchAskStore', () => ({ useLaunchAsks: () => ({ ready: true, selectionComplete: true, taken: false, record: { lastDay: null } }), localDay: () => '2026-10-25', claimLaunchAsk: () => true }));
import { EXPLORE_SECTIONS } from '@/data/discovery/sections';
import { EXPLORE_KEY, HOUR, initialExploreState } from '@/data/discovery/policy';
import { exploreSnapshot, updateExplore } from '@/data/discovery/store';
const mockNow = new Date(2026, 9, 25, 8).getTime();
let mockHigher = false, mockUrl: string | null = null, mockRoute = { name: 'Home', params: undefined as object | undefined };
let mockRouteListener: (() => void) | undefined;
const mockDispatch = jest.fn();
const mockStorage = new Map([[EXPLORE_KEY, JSON.stringify(initialExploreState(mockNow - 48 * HOUR))]]);
jest.mock('@react-native-async-storage/async-storage', () => ({ getItem: jest.fn(async (key: string) => mockStorage.get(key) ?? null), setItem: jest.fn(async (key: string, value: string) => { mockStorage.set(key, value); }), multiGet: jest.fn(async () => []) }));
jest.mock('@react-navigation/native', () => ({ CommonActions: { navigate: (payload: object) => ({ type: 'NAVIGATE', payload }) } }));
jest.mock('@/notifications/deepLink', () => ({ navigationRef: { isReady: () => true, getCurrentRoute: () => mockRoute, dispatch: (a: unknown) => mockDispatch(a), addListener: (_name: string, fn: () => void) => { mockRouteListener = fn; return () => { mockRouteListener = undefined; }; } } }));
jest.mock('@/contexts/TourContext', () => ({ useTour: () => ({ isLoading: false, shouldShowFirstLaunchTour: mockHigher, shouldShowOnboardingSetup: false, shouldShowWhatsNew: false }) }));
jest.mock('@/contexts/NotificationPreferencesContext', () => ({ useNotificationPreferences: () => ({ isLoading: false, shouldShowOptIn: false }) }));
jest.mock('@/contexts/RatingPromptContext', () => ({ useRatingPrompt: () => ({ visible: false }) }));
jest.mock('expo-updates', () => ({ isEnabled: false, useUpdates: () => ({ isUpdatePending: false }) }));
jest.mock('expo-notifications', () => ({ getLastNotificationResponseAsync: jest.fn(async () => null), addNotificationResponseReceivedListener: () => ({ remove: jest.fn() }) }));
jest.mock('expo-sensors', () => ({ Magnetometer: { isAvailableAsync: jest.fn(async () => true) } }));
jest.mock('react-native/Libraries/Linking/Linking', () => ({ __esModule: true, default: { getInitialURL: jest.fn(async () => mockUrl), addEventListener: () => ({ remove: jest.fn() }) } }));
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: 'en' }) }));
jest.mock('@/utils/useReducedMotion', () => ({ useReducedMotion: () => true }));
jest.mock('@/components/AppIcon', () => 'AppIcon');
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: require('react-native').View }));
let tree: TestRenderer.ReactTestRenderer;
async function flush() { await act(async () => { for (let i = 0; i < 12; i++)
    await Promise.resolve(); }); }
async function tick() { await flush(); for (let i = 0; i < 12; i++) {
    await act(async () => { await jest.advanceTimersByTimeAsync(250); });
    await flush();
} }
async function mount() { await act(async () => { tree = TestRenderer.create(<ExploreLaunch />); }); await tick(); }
function unmount() { act(() => tree.unmount()); }
function visible() { return tree.root.findAllByProps({ testID: 'explore-heading' }).length > 0; }
function press(id: string) { act(() => tree.root.findByProps({ testID: id }).props.onPress()); }
function tomorrow(hours: number) { jest.setSystemTime(mockNow + hours * HOUR + 60000); }
afterEach(() => { if (tree)
    unmount(); jest.restoreAllMocks(); jest.useRealTimers(); });
it('integrates launch arbitration, persistence, navigation, six-hour/daily limits, decline pause, opt-out and the Suvichar draft', async () => {
    jest.useFakeTimers({ now: mockNow });
    Object.defineProperty(AppState, 'currentState', { configurable: true, writable: true, value: 'active' });
    jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove: jest.fn() });
        jest.spyOn(InteractionManager, 'runAfterInteractions').mockImplementation(fn => { if(typeof fn==='function')fn(); return { cancel: jest.fn(), then: jest.fn(), done: jest.fn() }; });
    mockHigher = true;
    await mount();
    mockRoute = { name: 'GitaSaarReader', params: { chapter: 1 } };
    act(() => mockRouteListener?.());
    await flush();
    expect(exploreSnapshot().state.visited).toContain('gita');
    mockRoute = { name: 'Home', params: undefined };
    act(() => mockRouteListener?.());
    await flush();
    expect(visible()).toBe(false);
    expect(exploreSnapshot().state.shown).toEqual([]);
    unmount();
    mockHigher = false;
    await mount();
    expect(visible()).toBe(true);
    expect(exploreSnapshot().state.last).toBe('routine');
    press('explore-open');
    await flush();
    expect(mockDispatch).toHaveBeenLastCalledWith({ type: 'NAVIGATE', payload: { name: 'HomeTab', params: { screen: 'RoutineToday', params: undefined, initial: false } } });
    expect(exploreSnapshot().state.visited).toContain('routine');
    unmount();
    await mount();
    expect(visible()).toBe(false);
    unmount();
    tomorrow(6);
    await mount();
    expect(exploreSnapshot().state.last).toBe('japam');
    press('explore-not-now');
    await flush();
    expect(exploreSnapshot().state.streak).toBe(1);
    unmount();
    tomorrow(12);
    await mount();
    expect(visible()).toBe(false);
    unmount();
    tomorrow(24);
    await mount();
    expect(visible()).toBe(true);
    press('explore-not-now');
    await flush();
    expect(exploreSnapshot().state.streak).toBe(2);
    unmount();
    tomorrow(48);
    await mount();
    expect(visible()).toBe(false);
    unmount();
    tomorrow(24 * 9);
    await mount();
    expect(visible()).toBe(true);
    press('explore-disable');
    await flush();
    expect(exploreSnapshot().state.enabled).toBe(false);
    unmount();
    tomorrow(24 * 10);
    await mount();
    expect(visible()).toBe(false);
    unmount();
    await updateExplore(s => ({ ...s, enabled: true, shown: [], declined: {}, sleepUntil: 0, streak: 0, visited: EXPLORE_SECTIONS.filter(x => x.id !== 'suvichar').map(x => x.id) }));
    mockUrl = 'vedansh://widget/verse';
    await mount();
    expect(visible()).toBe(false);
    expect(exploreSnapshot().state.shown).toEqual([]);
    unmount();
    mockUrl = null;
    await mount();
    expect(visible()).toBe(true);
    expect(exploreSnapshot().state.last).toBe('suvichar');
    const writes = jest.mocked(AsyncStorage.setItem).mock.calls.length;
    act(() => tree.root.findByType(TextInput).props.onChangeText('  Prashant  '));
    await flush();
    expect(jest.mocked(AsyncStorage.setItem).mock.calls.length).toBe(writes);
    expect(tree.root.findByProps({ testID: 'explore-greeting-signature' }).props.children).toBe('Prashant');
    press('explore-open');
    await flush();
    expect(mockDispatch.mock.calls.at(-1)?.[0].payload.params).toMatchObject({ screen: 'Suvichar', params: { exploreDraft: { name: 'Prashant', deity: 'ram-darbar' } }, initial: false });
    jest.mocked(AsyncStorage.setItem).mockRejectedValueOnce(new Error('disk full'));
    let saved = true;
    await act(async () => { saved = await updateExplore(s => ({ ...s, enabled: false })); });
    expect(saved).toBe(false);
    expect(exploreSnapshot().ready).toBe(false);
});
