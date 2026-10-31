import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TourProvider, useTour } from '../TourContext';
import { APP_TOUR_VERSION } from '@/data/tour/whatsNew';
let ctx: ReturnType<typeof useTour>, tree: TestRenderer.ReactTestRenderer;
function Capture() {
  ctx = useTour();
  return null;
}
async function mount() {
  await act(async () => {
    tree = TestRenderer.create(
      <TourProvider>
        <Capture />
      </TourProvider>,
    );
  });
}
beforeEach(async () => {
  await AsyncStorage.clear();
});
afterEach(() => {
  act(() => tree?.unmount());
});
test('fresh install starts with setup; tour and What’s New are held', async () => {
  await mount();
  expect(ctx.shouldShowOnboardingSetup).toBe(true);
  expect(ctx.shouldShowFirstLaunchTour).toBe(false);
  expect(ctx.shouldShowWhatsNew).toBe(false);
  expect(await AsyncStorage.getItem('@vedansh/onboarding-phase')).toBe('setup');
});
test('setup then tour then done, with no intervening What’s New', async () => {
  await mount();
  await act(async () => {
    await ctx.markOnboardingSetupCompleted();
  });
  expect(ctx.shouldShowOnboardingSetup).toBe(false);
  expect(ctx.shouldShowFirstLaunchTour).toBe(true);
  expect(ctx.shouldShowWhatsNew).toBe(false);
  await act(async () => {
    await ctx.markTourCompleted();
  });
  expect(ctx.shouldShowFirstLaunchTour).toBe(false);
  expect(ctx.shouldShowWhatsNew).toBe(false);
  expect(await AsyncStorage.getItem('@vedansh/onboarding-phase')).toBe('done');
});
test.each(['setup', 'tour'])(
  'a relaunch during %s survives language’s upgrader signal',
  async (phase) => {
    await AsyncStorage.multiSet([
      ['@vedansh/onboarding-phase', phase],
      ['@vedansh/language', 'gu'],
    ]);
    await mount();
    expect(ctx.shouldShowOnboardingSetup).toBe(phase === 'setup');
    expect(ctx.shouldShowFirstLaunchTour).toBe(phase === 'tour');
    expect(ctx.shouldShowWhatsNew).toBe(false);
  },
);
test('upgrader keeps What’s New and skips setup', async () => {
  await AsyncStorage.setItem('@vedansh/bookmarks', '[]');
  await mount();
  expect(ctx.shouldShowOnboardingSetup).toBe(false);
  expect(ctx.shouldShowWhatsNew).toBe(true);
});
test('replay runs only the tour and preserves completed setup', async () => {
  await AsyncStorage.multiSet([
    ['@vedansh/tour-completed-v', APP_TOUR_VERSION],
    ['@vedansh/onboarding-setup-v', APP_TOUR_VERSION],
  ]);
  await mount();
  await act(async () => {
    await ctx.resetTour();
  });
  expect(ctx.shouldShowFirstLaunchTour).toBe(true);
  expect(ctx.shouldShowOnboardingSetup).toBe(false);
  await act(async () => {
    await ctx.markTourCompleted();
  });
  expect(ctx.shouldShowOnboardingSetup).toBe(false);
  expect(await AsyncStorage.getItem('@vedansh/onboarding-setup-v')).toBe(
    APP_TOUR_VERSION,
  );
});
