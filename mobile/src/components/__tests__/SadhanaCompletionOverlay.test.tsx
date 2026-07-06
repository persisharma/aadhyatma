import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import SadhanaCompletionOverlay from '@/components/SadhanaCompletionOverlay';

const mockCommitDay = jest.fn();
const mockMarkCelebrated = jest.fn();
const mockWasCelebrated = jest.fn(() => false);
const mockMarkDayCelebrated = jest.fn();
const mockWasDayCelebrated = jest.fn(() => false);
const mockNotificationAsync = jest.fn((_type?: unknown) => Promise.resolve());
let mockIsLoading = false;
let mockCards: any[] = [];

jest.mock('expo-haptics', () => ({
  NotificationFeedbackType: { Success: 'success' },
  notificationAsync: (type?: unknown) => mockNotificationAsync(type),
}));

jest.mock('@/data/gita/language', () => ({
  useGitaLanguage: () => ({ lang: 'en' }),
}));

jest.mock('@/contexts/SadhanaContext', () => ({
  useSadhana: () => ({
    commitDay: mockCommitDay,
    markCelebrated: mockMarkCelebrated,
    wasCelebrated: mockWasCelebrated,
    markDayCelebrated: mockMarkDayCelebrated,
    wasDayCelebrated: mockWasDayCelebrated,
    isLoading: mockIsLoading,
  }),
}));

jest.mock('@/data/sadhana/useSadhanaToday', () => ({
  useSadhanaToday: () => mockCards,
}));

jest.mock('@/components/RoutineCelebration', () => ({
  __esModule: true,
  default: ({ caption }: { caption: string }) => {
    const { Text: MockText } = require('react-native');
    return <MockText>{caption}</MockText>;
  },
}));

function renderOverlay(): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<SadhanaCompletionOverlay />);
  });
  return tree;
}

beforeEach(() => {
  mockCommitDay.mockClear();
  mockMarkCelebrated.mockClear();
  mockWasCelebrated.mockClear();
  mockMarkDayCelebrated.mockClear();
  mockWasDayCelebrated.mockClear();
  mockNotificationAsync.mockClear();
  mockIsLoading = false;
  mockCards = [];
});

describe('SadhanaCompletionOverlay', () => {
  it('commits an active sankalp day and plays the daily completion shower from the app root', () => {
    mockCards = [
      {
        program: { id: 'hanuman-41' },
        status: { kind: 'active', dayIndex: 2, totalDays: 41, items: [] },
        allItemsDoneToday: true,
        autoVia: 'read-to-end',
      },
    ];

    const tree = renderOverlay();
    const text = tree.root.findAllByType(Text).map((n) => n.props.children).join(' ');

    expect(mockCommitDay).toHaveBeenCalledWith('hanuman-41', 2, 'read-to-end');
    expect(text).toContain('Sankalp day complete');
    expect(mockMarkDayCelebrated).toHaveBeenCalledWith('hanuman-41', 2);
    expect(mockNotificationAsync).toHaveBeenCalledWith('success');
  });

  it('does not replay a daily completion shower after that sankalp day was celebrated', () => {
    mockWasDayCelebrated.mockReturnValue(true);
    mockCards = [
      {
        program: { id: 'hanuman-41' },
        status: { kind: 'active', dayIndex: 2, totalDays: 41, items: [] },
        allItemsDoneToday: true,
        autoVia: 'read-to-end',
      },
    ];

    const tree = renderOverlay();

    expect(mockCommitDay).toHaveBeenCalledWith('hanuman-41', 2, 'read-to-end');
    expect(tree.root.findAllByType(Text)).toHaveLength(0);
    expect(mockMarkDayCelebrated).not.toHaveBeenCalled();
  });

  it('plays and records a once-only sankalp completion celebration after hydration', () => {
    mockCards = [
      {
        program: { id: 'gita-18' },
        status: { kind: 'completed', totalDays: 18, completedOn: '2026-07-20' },
        allItemsDoneToday: false,
        autoVia: 'read-to-end',
      },
    ];

    const tree = renderOverlay();
    const text = tree.root.findAllByType(Text).map((n) => n.props.children).join(' ');

    expect(text).toContain('Sankalp complete');
    expect(mockMarkCelebrated).toHaveBeenCalledWith('gita-18');
    expect(mockNotificationAsync).toHaveBeenCalledWith('success');
  });

  it('does not replay completion while SadhanaContext is still loading', () => {
    mockIsLoading = true;
    mockCards = [
      {
        program: { id: 'gita-18' },
        status: { kind: 'completed', totalDays: 18, completedOn: '2026-07-20' },
        allItemsDoneToday: false,
        autoVia: 'read-to-end',
      },
    ];

    const tree = renderOverlay();

    expect(tree.root.findAllByType(Text)).toHaveLength(0);
    expect(mockMarkCelebrated).not.toHaveBeenCalled();
    expect(mockNotificationAsync).not.toHaveBeenCalled();
  });
});
