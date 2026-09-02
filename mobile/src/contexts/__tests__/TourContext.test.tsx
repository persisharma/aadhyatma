import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TourProvider, useTour } from '@/contexts/TourContext';
import { APP_TOUR_VERSION } from '@/data/tour/whatsNew';

const TOUR_COMPLETED_KEY = '@vedansh/tour-completed-v';
const WHATS_NEW_SEEN_KEY = '@vedansh/whats-new-seen-v';
const SETUP_COMPLETED_KEY = '@vedansh/onboarding-setup-v';
// A deliberate-action key present ⇒ the store looks like a returning user
// (see NewContentContext.UPGRADER_SIGNAL_KEYS). Seed it to simulate an upgrade.
const UPGRADER_SIGNAL_KEY = '@vedansh/bookmarks';

// Simulate a returning user: some prior app usage exists in storage.
async function seedReturningUser() {
  await AsyncStorage.setItem(UPGRADER_SIGNAL_KEY, '[]');
}

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

  test('returning user on the debut release → What\'s New, NOT the full tour', async () => {
    // No tour keys yet, but prior app usage exists → treat as an update, not a
    // fresh install. Per "install → tour, update → new-features-only".
    await seedReturningUser();

    await mountAndLoad();

    expect(ctx.shouldShowFirstLaunchTour).toBe(false);
    expect(ctx.shouldShowWhatsNew).toBe(true);
    expect(ctx.whatsNewEntry?.version).toBe(APP_TOUR_VERSION);
  });

  test('genuine fresh install (no prior usage) → tour, never What\'s New', async () => {
    // Nothing in storage at all → nobody has used the app → full tour.
    await mountAndLoad();
    expect(ctx.shouldShowFirstLaunchTour).toBe(true);
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
    // All three onboarding keys cleared.
    expect(await AsyncStorage.getItem(TOUR_COMPLETED_KEY)).toBeNull();
    expect(await AsyncStorage.getItem(WHATS_NEW_SEEN_KEY)).toBeNull();
    expect(await AsyncStorage.getItem(SETUP_COMPLETED_KEY)).toBeNull();
  });

  test('what\'s-new never shows while the first-launch tour is pending', async () => {
    // Nothing stored → first launch. Even though a whatsNew entry exists for
    // this version, the tour takes precedence and what's-new stays suppressed.
    await mountAndLoad();
    expect(ctx.shouldShowFirstLaunchTour).toBe(true);
    expect(ctx.shouldShowWhatsNew).toBe(false);
  });
});

describe('post-tour language/size setup gating', () => {
  test('fresh install: suppressed while the tour is up, shown the moment it closes', async () => {
    await mountAndLoad();
    expect(ctx.shouldShowFirstLaunchTour).toBe(true);
    expect(ctx.shouldShowOnboardingSetup).toBe(false);

    await act(async () => {
      await ctx.markTourCompleted();
    });

    expect(ctx.shouldShowFirstLaunchTour).toBe(false);
    expect(ctx.shouldShowOnboardingSetup).toBe(true);
    // Completing the tour must NOT retroactively complete the setup step.
    expect(await AsyncStorage.getItem(SETUP_COMPLETED_KEY)).toBeNull();
  });

  test('completing setup records the key and clears the prompt', async () => {
    await mountAndLoad();
    await act(async () => {
      await ctx.markTourCompleted();
    });
    expect(ctx.shouldShowOnboardingSetup).toBe(true);

    await act(async () => {
      await ctx.markOnboardingSetupCompleted();
    });

    expect(ctx.shouldShowOnboardingSetup).toBe(false);
    expect(await AsyncStorage.getItem(SETUP_COMPLETED_KEY)).toBe(APP_TOUR_VERSION);
  });

  test('a returning user never gets the setup sheet', async () => {
    // Prior usage exists → they already have a reading language; the What's New
    // sheet is their surface, not a first-run picker.
    await seedReturningUser();
    await mountAndLoad();

    expect(ctx.shouldShowOnboardingSetup).toBe(false);
    expect(ctx.shouldShowWhatsNew).toBe(true);
  });

  test('a fresh install that already completed setup is not asked again', async () => {
    await AsyncStorage.setItem(TOUR_COMPLETED_KEY, APP_TOUR_VERSION);
    await AsyncStorage.setItem(WHATS_NEW_SEEN_KEY, APP_TOUR_VERSION);
    await AsyncStorage.setItem(SETUP_COMPLETED_KEY, APP_TOUR_VERSION);

    await mountAndLoad();

    expect(ctx.shouldShowFirstLaunchTour).toBe(false);
    expect(ctx.shouldShowOnboardingSetup).toBe(false);
  });

  test('resetTour re-arms the setup sheet too, and it fires after the replayed tour', async () => {
    // A returning user (would otherwise never see the setup sheet) replays the
    // tour from More → Show App Tour.
    await seedReturningUser();
    await AsyncStorage.setItem(SETUP_COMPLETED_KEY, APP_TOUR_VERSION);
    await mountAndLoad();
    expect(ctx.shouldShowOnboardingSetup).toBe(false);

    await act(async () => {
      await ctx.resetTour();
    });
    // Tour first — the sheet waits its turn.
    expect(ctx.shouldShowFirstLaunchTour).toBe(true);
    expect(ctx.shouldShowOnboardingSetup).toBe(false);
    expect(await AsyncStorage.getItem(SETUP_COMPLETED_KEY)).toBeNull();

    await act(async () => {
      await ctx.markTourCompleted();
    });

    expect(ctx.shouldShowOnboardingSetup).toBe(true);
  });

  test('storage-read failure still runs the full first-run sequence', async () => {
    const spy = jest
      .spyOn(AsyncStorage, 'multiGet')
      .mockRejectedValueOnce(new Error('storage unavailable'));

    await mountAndLoad();
    expect(ctx.shouldShowFirstLaunchTour).toBe(true);
    await act(async () => {
      await ctx.markTourCompleted();
    });
    expect(ctx.shouldShowOnboardingSetup).toBe(true);

    spy.mockRestore();
  });
});
