/**
 * Felt & announced sector change (PRD-24 Phase 2 §A4/US-04): one selection tick
 * per dik change throttled to ≥400 ms, one VoiceOver announcement throttled to
 * ≥1.5 s, and total silence when inactive (manual mode / Hold) — including the
 * re-arm edge: resuming must not fire for the dik the dial froze on.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { AccessibilityInfo, Text } from 'react-native';
import * as Haptics from 'expo-haptics';

import type { DishaDirection } from '@/panchang/eventMuhurat';
import { useDikFeedback } from '../useDikFeedback';

const selectionSpy = Haptics.selectionAsync as jest.Mock;
const announceSpy = jest
  .spyOn(AccessibilityInfo, 'announceForAccessibility')
  .mockImplementation(() => undefined);

function Probe({ dik, active }: { dik: DishaDirection | null; active: boolean }) {
  useDikFeedback(dik, active, 'hi');
  return <Text>probe</Text>;
}

let now = 0;
beforeEach(() => {
  jest.clearAllMocks();
  now = 100_000;
  jest.spyOn(Date, 'now').mockImplementation(() => now);
});
afterEach(() => {
  (Date.now as jest.Mock).mockRestore();
});

function render(dik: DishaDirection | null, active = true) {
  let renderer!: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(<Probe dik={dik} active={active} />);
  });
  return renderer;
}

test('a dik change fires one haptic tick and one localized announcement', () => {
  const r = render('east');
  act(() => r.update(<Probe dik="southeast" active />));
  expect(selectionSpy).toHaveBeenCalledTimes(1);
  expect(announceSpy).toHaveBeenCalledTimes(1);
  expect(announceSpy).toHaveBeenCalledWith('आग्नेय');
  act(() => r.unmount());
});

test('haptics throttle at 400 ms, announcements at 1.5 s — a sweep cannot rattle', () => {
  const r = render('east');
  act(() => r.update(<Probe dik="southeast" active />)); // fires both
  now += 300;
  act(() => r.update(<Probe dik="south" active />)); // inside both windows
  expect(selectionSpy).toHaveBeenCalledTimes(1);
  expect(announceSpy).toHaveBeenCalledTimes(1);
  now += 200; // 500 ms since the tick — haptic re-arms, announcement not yet
  act(() => r.update(<Probe dik="southwest" active />));
  expect(selectionSpy).toHaveBeenCalledTimes(2);
  expect(announceSpy).toHaveBeenCalledTimes(1);
  now += 1600; // past the announcement window
  act(() => r.update(<Probe dik="west" active />));
  expect(announceSpy).toHaveBeenCalledTimes(2);
  act(() => r.unmount());
});

test('inactive (manual mode / Hold) is fully silent', () => {
  const r = render('east', false);
  act(() => r.update(<Probe dik="south" active={false} />));
  act(() => r.update(<Probe dik="west" active={false} />));
  expect(selectionSpy).not.toHaveBeenCalled();
  expect(announceSpy).not.toHaveBeenCalled();
  act(() => r.unmount());
});

test('resuming from Hold does not fire for the frozen dik — only the next change', () => {
  const r = render('east');
  act(() => r.update(<Probe dik="east" active={false} />)); // Hold
  act(() => r.update(<Probe dik="east" active />)); // resume on the same dik
  expect(selectionSpy).not.toHaveBeenCalled();
  now += 2000;
  act(() => r.update(<Probe dik="north" active />)); // a real change
  expect(selectionSpy).toHaveBeenCalledTimes(1);
  act(() => r.unmount());
});
