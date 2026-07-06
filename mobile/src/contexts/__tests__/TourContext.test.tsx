import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TourProvider, useTour } from '@/contexts/TourContext';
import { APP_TOUR_VERSION } from '@/data/tour/whatsNew';

const TOUR_COMPLETED_KEY = '@vedansh/tour-completed-v';
const WHATS_NEW_SEEN_KEY = '@vedansh/whats-new-seen-v';

let ctx: ReturnType<typeof useTour>;
function Capture() {
  ctx = useTour();
  return null;
}

// Mount and flush the AsyncStorage-read effect that runs on boot.
async function mountAndLoad() {
  await act(async () => {
    TestRenderer.create(
      <TourProvider>
        <Capture />
      </TourProvider>
    );
  });
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('TourContext gating', () => {
  test('fresh install → show tour, not what\'s-new', async () => {
    await mountAndLoad();

    expect(ctx.isLoading).toBe(false);
    expect(ctx.shouldShowFirstLaunchTour).toBe(true);
    // A brand-new user must NOT also be hit with the what's-new sheet.
    expect(ctx.shouldShowWhatsNew).toBe(false);
  });

  test('completing the tour records both keys and clears both prompts', async () => {
    await mountAndLoad();

    await act(async () => {
      await ctx.markTourCompleted();
    });

    expect(ctx.shouldShowFirstLaunchTour).toBe(false);
    expect(ctx.shouldShowWhatsNew).toBe(false);
    expect(await AsyncStorage.getItem(TOUR_COMPLETED_KEY)).toBe(APP_TOUR_VERSION);
    expect(await AsyncStorage.getItem(WHATS_NEW_SEEN_KEY)).toBe(APP_TOUR_VERSION);
  });

  test('returning user on a bumped version → what\'s-new, not the tour', async () => {
    // Tour was completed on an older release; what's-new for the current
    // version has never been shown.
    await AsyncStorage.setItem(TOUR_COMPLETED_KEY, '0.0.1');
    await AsyncStorage.setItem(WHATS_NEW_SEEN_KEY, '0.0.1');

    await mountAndLoad();

    expect(ctx.shouldShowFirstLaunchTour).toBe(false);
    // There is a whatsNew entry defined for the current APP_TOUR_VERSION.
    expect(ctx.shouldShowWhatsNew).toBe(true);
    expect(ctx.whatsNewEntry?.version).toBe(APP_TOUR_VERSION);
  });

  test('returning user who already saw this version\'s what\'s-new sees nothing', async () => {
    await AsyncStorage.setItem(TOUR_COMPLETED_KEY, APP_TOUR_VERSION);
    await AsyncStorage.setItem(WHATS_NEW_SEEN_KEY, APP_TOUR_VERSION);

    await mountAndLoad();

    expect(ctx.shouldShowFirstLaunchTour).toBe(false);
    expect(ctx.shouldShowWhatsNew).toBe(false);
  });

  test('dismissing what\'s-new marks it seen for the current version', async () => {
    await AsyncStorage.setItem(TOUR_COMPLETED_KEY, '0.0.1');
    await AsyncStorage.setItem(WHATS_NEW_SEEN_KEY, '0.0.1');
    await mountAndLoad();
    expect(ctx.shouldShowWhatsNew).toBe(true);

    await act(async () => {
      await ctx.markWhatsNewSeen();
    });

    expect(ctx.shouldShowWhatsNew).toBe(false);
    expect(await AsyncStorage.getItem(WHATS_NEW_SEEN_KEY)).toBe(APP_TOUR_VERSION);
    // markWhatsNewSeen must NOT retroactively mark the tour complete.
    expect(await AsyncStorage.getItem(TOUR_COMPLETED_KEY)).toBe('0.0.1');
  });

  test('resetTour re-arms the first-launch tour', async () => {
    await AsyncStorage.setItem(TOUR_COMPLETED_KEY, APP_TOUR_VERSION);
    await AsyncStorage.setItem(WHATS_NEW_SEEN_KEY, APP_TOUR_VERSION);
    await mountAndLoad();
    expect(ctx.shouldShowFirstLaunchTour).toBe(false);

    await act(async () => {
      await ctx.resetTour();
    });

    expect(ctx.shouldShowFirstLaunchTour).toBe(true);
    // Both keys cleared.
    expect(await AsyncStorage.getItem(TOUR_COMPLETED_KEY)).toBeNull();
    expect(await AsyncStorage.getItem(WHATS_NEW_SEEN_KEY)).toBeNull();
  });

  test('what\'s-new never shows while the first-launch tour is pending', async () => {
    // Nothing stored → first launch. Even though a whatsNew entry exists for
    // this version, the tour takes precedence and what's-new stays suppressed.
    await mountAndLoad();
    expect(ctx.shouldShowFirstLaunchTour).toBe(true);
    expect(ctx.shouldShowWhatsNew).toBe(false);
  });
});
