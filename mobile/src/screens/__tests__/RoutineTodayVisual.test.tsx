import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Pressable as mockPressable, Text as mockText, View as mockView } from 'react-native';
import RoutineTodayScreen from '@/screens/RoutineTodayScreen';
import { deities } from '@/data/deities';
import { practiceArtwork, practiceDeityStems } from '@/data/routine/artwork';
import { readerIllustrationAsset, readerIllustrationRequest } from '@/data/readerIllustrationAsset';
import { contentByLang } from '@/utils/localize';
import type { Lang } from '@/data/gita/language';
import type { RoutineItem } from '@/data/routine/types';

const mockMark = jest.fn(), mockUndo = jest.fn(), mockRead = jest.fn(), mockNavigate = jest.fn();
let mockLang: Lang = 'en';
const item: RoutineItem = { id: 'chalisa', kind: 'section', sourceId: 'hanuman-chalisa' };
const entry = { key: 'daily:chalisa', item, display: { titleHi: 'हनुमान चालीसा', titleEn: 'Hanuman Chalisa', subHi: 'पूरा पाठ', subEn: 'Whole text' }, done: false, doneMode: null as 'manual' | 'auto' | null };
let mockToday = { entries: [entry], doneCount: 0, total: 1, hasRoutine: true };
jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ navigate: mockNavigate }) }));
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: mockLang }) }));
jest.mock('@/contexts/RoutineContext', () => ({ useRoutines: () => ({ markManualDone: mockMark, unmarkManualDone: mockUndo }) }));
jest.mock('@/contexts/UserActivityContext', () => ({ useUserActivity: () => ({ currentStreak: () => 8 }) }));
jest.mock('@/data/routine/useRoutineToday', () => ({ useRoutineToday: () => mockToday }));
jest.mock('@/data/sadhana/useSadhanaToday', () => ({ useSadhanaToday: () => [] }));
jest.mock('@/navigation/entryRoutes', () => ({ navigateToRoutineItem: (...args: unknown[]) => mockRead(...args) }));
jest.mock('@/components/SankalpTodayCard', () => () => null);
jest.mock('@/components/PracticeSeal', () => () => null);
jest.mock('@/components/AppIcon', () => () => null);
jest.mock('@/components/CachedArtwork', () => ({ __esModule: true,
  default: (props: Record<string, unknown>) => mockReact.createElement(mockView, props) }));
jest.mock('@/components/RoutineShell', () => {
  return {
    RoutineShell: ({ children }: React.PropsWithChildren) => mockReact.createElement(mockView, null, children),
    RoutineButton: ({ label, onPress }: { label: string; onPress: () => void }) => mockReact.createElement(mockPressable, { onPress }, mockReact.createElement(mockText, null, label)),
  };
});
function render() {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<RoutineTodayScreen navigation={{ navigate: mockNavigate } as never} route={{} as never} />); });
  return tree;
}
const textOf = (tree: TestRenderer.ReactTestRenderer) => tree.root.findAllByType(mockText).map(n => n.props.children).flat(Infinity).join(' ');
beforeEach(() => {
  jest.clearAllMocks(); mockLang = 'en';
  mockToday = { entries: [{ ...entry }], doneCount: 0, total: 1, hasRoutine: true };
});
it('shows readings immediately; opening and offering are separate actions', () => {
  const tree = render();
  expect(textOf(tree)).toContain('Hanuman Chalisa');
  const read = tree.root.findAll(n => typeof n.props.onPress === 'function' && n.props.accessibilityLabel?.startsWith('Hanuman Chalisa'))[0]!;
  act(() => read.props.onPress());
  expect(mockRead).toHaveBeenCalledWith(expect.anything(), item);
  expect(mockMark).not.toHaveBeenCalled();
  const offer = tree.root.findAll(n => typeof n.props.onPress === 'function' && n.props.accessibilityLabel === 'Mark offered')[0]!;
  act(() => offer.props.onPress());
  expect(mockMark).toHaveBeenCalledWith(entry.key);
  expect(mockRead).toHaveBeenCalledTimes(1);
});
it('allows manual undo and disables derived automatic offerings', () => {
  mockToday.entries = [{ ...entry, done: true, doneMode: 'manual' }];
  let tree = render();
  const undo = tree.root.findAll(n => typeof n.props.onPress === 'function' && n.props.accessibilityLabel === 'Offered — tap to undo')[0]!;
  act(() => undo.props.onPress());
  expect(mockUndo).toHaveBeenCalledWith(entry.key);
  act(() => tree.unmount());
  mockToday.entries = [{ ...entry, done: true, doneMode: 'auto' }];
  tree = render();
  const auto = tree.root.findAll(n => n.props.accessibilityLabel === 'Offered automatically by reading')[0]!;
  expect(auto.props.disabled).toBe(true);
  expect(auto.props.accessibilityState).toEqual({ checked: true, disabled: true });
});
it.each<Lang>(['hi', 'en', 'gu', 'kn'])('uses one selected-language title in %s', lang => {
  mockLang = lang;
  const text = textOf(render());
  expect(text).toContain(contentByLang(lang, entry.display.titleHi, entry.display.titleEn));
  if (lang === 'en') expect(text).not.toContain(entry.display.titleHi);
  else expect(text).not.toContain(entry.display.titleEn);
});
it('retains empty-day creation without a 0 of 0 counter', () => {
  mockToday = { entries: [], doneCount: 0, total: 0, hasRoutine: false };
  const tree = render();
  expect(textOf(tree)).not.toContain('0 of 0');
  const add = tree.root.findAll(n => typeof n.props.onPress === 'function' && n.findAllByType(mockText).some(t => t.props.children === 'Add a routine'))[0]!;
  act(() => add.props.onPress());
  expect(mockNavigate).toHaveBeenCalledWith('RoutineList');
});
it('maps all declared deities to published R2 entries and unknown items to scripture', () => {
  expect(Object.keys(practiceDeityStems)).toHaveLength(deities.length);
  for (const deity of deities) {
    const request = readerIllustrationRequest(readerIllustrationAsset(practiceDeityStems[deity.id]));
    expect(request?.remoteUrl).toMatch(/^https:\/\/[^/]+\/reader-illustrations\/[a-f0-9]+\.webp$/);
  }
  expect(practiceArtwork(item).stem).toBe('hanuman-sita');
  expect(practiceArtwork({ ...item, sourceId: 'unknown' }).stem).toBe('category-granth-open-scripture');
});
