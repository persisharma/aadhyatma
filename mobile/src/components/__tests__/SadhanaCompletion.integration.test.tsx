/**
 * Integration coverage for Sadhana Program (संकल्प) day-completion — the path a
 * user hits when they read the day's unit to the end. Unlike the pure
 * progress.test.ts (resolver only) and SankalpTodayCard.test.tsx (view only),
 * this mounts the REAL SadhanaCompletionOverlay over the real Sadhana +
 * ReadingProgress + UserActivity providers and drives it exactly as the app
 * does: enroll, then persist reading progress at the unit's last verse-page.
 *
 * It guards the "routine completes but sankalp doesn't" class of bug: the
 * routine's done-state is derived live, but a sankalp day only advances when the
 * overlay's effect calls commitDay — so this asserts commit actually fires and
 * persists, for both a `consecutive` program and a calendar-gated `weekday`
 * program on its eligible day.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { UserActivityProvider } from '@/contexts/UserActivityContext';
import { ReadingProgressProvider, useReadingProgress } from '@/contexts/ReadingProgressContext';
import { SadhanaProvider, useSadhana } from '@/contexts/SadhanaContext';
import SadhanaCompletionOverlay from '@/components/SadhanaCompletionOverlay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { library } from '@/data/texts';

jest.mock('@react-native-async-storage/async-storage', () => {
  const store: Record<string, string> = {};
  return {
    getItem: jest.fn((k: string) => Promise.resolve(store[k] ?? null)),
    setItem: jest.fn((k: string, v: string) => {
      store[k] = v;
      return Promise.resolve();
    }),
    removeItem: jest.fn((k: string) => {
      delete store[k];
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      for (const k of Object.keys(store)) delete store[k];
      return Promise.resolve();
    }),
  };
});
jest.mock('@/panchang/usePanchang', () => ({ usePanchangCalendarSystem: () => ['purnimant', () => {}] }));
jest.mock('expo-haptics', () => ({
  notificationAsync: () => Promise.resolve(),
  NotificationFeedbackType: { Success: 'success' },
}));
jest.mock('@/components/RoutineCelebration', () => () => null);
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: 'en' }) }));
// Force "today is the sankalp's eligible day": the schedule resolver reads the
// next occurrence of the anchor rule, so return one dated today. Consecutive
// programs never consult this, so the mock is inert for them.
jest.mock('@/panchang/vratCatalog', () => ({
  getNextOccurrences: () => [{ date: new Date(), rule: { id: 'sawan-somwar-vrat' } }],
}));

const verseCount = (id: string): number => {
  const c = library.find((e) => e.id === id)?.verseCount;
  if (!c) throw new Error(`no verseCount for ${id}`);
  return c;
};

type Cap = {
  setProgress: (e: { sourceId: string; verseIndex: number; updatedAt: number }) => void;
  enroll: (id: string) => void;
  enrollmentFor: (id: string) => { completedDays: Record<number, unknown> } | undefined;
};
let cap: Cap;

function Harness() {
  const { setProgress } = useReadingProgress();
  const { enroll, enrollmentFor } = useSadhana();
  cap = { setProgress, enroll, enrollmentFor };
  return null;
}

async function mountAppTree() {
  await act(async () => {
    TestRenderer.create(
      <UserActivityProvider>
        <ReadingProgressProvider>
          <SadhanaProvider>
            <Harness />
            <SadhanaCompletionOverlay />
          </SadhanaProvider>
        </ReadingProgressProvider>
      </UserActivityProvider>
    );
    await Promise.resolve();
  });
}

async function enroll(programId: string) {
  await act(async () => {
    cap.enroll(programId);
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function readTo(sourceId: string, verseIndex: number) {
  await act(async () => {
    cap.setProgress({ sourceId, verseIndex, updatedAt: Date.now() });
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

const committedDays = (programId: string) => Object.keys(cap.enrollmentFor(programId)!.completedDays);

beforeEach(async () => {
  // The mocked AsyncStorage store is module-scoped, so wipe it between tests to
  // stop a prior enrollment / last-page progress from leaking into the next.
  await (AsyncStorage as unknown as { clear: () => Promise<void> }).clear();
});

describe('SadhanaCompletionOverlay commits a day on reaching the last verse-page', () => {
  it('consecutive program (Hanuman Chalisa — 41 Days) auto-commits day 1', async () => {
    await mountAppTree();
    await enroll('hanuman-41');
    await readTo('hanuman-chalisa', verseCount('hanuman-chalisa') - 1);
    expect(committedDays('hanuman-41')).toEqual(['1']);
  });

  it('does NOT commit when only partway through', async () => {
    await mountAppTree();
    await enroll('hanuman-41');
    await readTo('hanuman-chalisa', 0);
    expect(committedDays('hanuman-41')).toEqual([]);
  });

  it('calendar-gated weekday sankalp commits on its eligible day', async () => {
    await mountAppTree();
    await enroll('shravan-somvar');
    await readTo('shiv-chalisa', verseCount('shiv-chalisa') - 1);
    expect(committedDays('shravan-somvar')).toEqual(['1']);
  });
});
