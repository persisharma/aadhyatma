import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { TextInput, View as mockView } from 'react-native';
import type { ObservanceRule } from '@/panchang/types';
import ObservanceListScreen from '../ObservanceListScreen';

const mockRules = [
  { id: 'ekadashi', nameHi: 'एकादशी', nameEn: 'Ekadashi', deityEn: 'Lord Vishnu', category: 'vrat' },
  { id: 'gangaur', nameHi: 'गणगौर', nameEn: 'Gangaur', deityEn: 'Maa Parvati', category: 'vrat' },
] as ObservanceRule[];
jest.mock('@/panchang/vratCatalog', () => ({
  getRulesForCategory: () => mockRules,
  getNextOccurrence: (id: string) => ({ date: new Date(2026, id === 'ekadashi' ? 9 : 10, 29) }),
}));
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: 'en' }) }));
jest.mock('@/panchang/usePanchang', () => ({ usePanchangCalendarSystem: () => ['purnimant'] }));
jest.mock('@react-navigation/native', () => ({ useIsFocused: () => true }));
jest.mock('@/components/tour/tourTargets', () => ({ useTourTarget: () => undefined }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: mockView }));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: mockView }));
const mockShare = jest.fn();
jest.mock('@/utils/shareVerse', () => ({ useShare: () => ({ share: mockShare, busy: false }) }));
jest.mock('@/utils/listingShare', () => ({ buildListingShare: (value: unknown) => value }));
jest.mock('@/contexts/VratFollowContext', () => ({
  useVratFollows: () => {
    const [ids, setIds] = mockReact.useState<string[]>([]);
    return {
      isFollowing: (id: string) => ids.includes(id),
      follow: (id: string) => setIds(prev => [...prev, id]),
      unfollow: (id: string) => setIds(prev => prev.filter(value => value !== id)),
    };
  },
}));

let tree: TestRenderer.ReactTestRenderer;
const navigation = { navigate: jest.fn(), goBack: jest.fn() };
function press(label: string) {
  const button = tree.root.findAll(node => node.props.accessibilityRole === 'button').find(node => node.props.accessibilityLabel === label);
  expect(button).toBeDefined();
  act(() => button!.props.onPress());
}
function cards() {
  return [...new Set(tree.root.findAll(node => node.props.accessibilityRole === 'button' && /^observance-card-/.test(node.props.testID ?? '')).map(node => node.props.testID))];
}
beforeEach(() => {
  jest.clearAllMocks();
  act(() => { tree = TestRenderer.create(<ObservanceListScreen navigation={navigation as never} route={{ params: { category: 'vrat' } } as never} />); });
});
afterEach(() => act(() => tree.unmount()));

test('saving from the list never opens detail and the saved filter updates immediately', () => {
  press('Follow Ekadashi');
  expect(navigation.navigate).not.toHaveBeenCalled();
  press('Show saved observances');
  expect(cards()).toEqual(['observance-card-ekadashi']);
  press('Ekadashi');
  expect(navigation.navigate).toHaveBeenCalledWith('ObservanceDetail', { ruleId: 'ekadashi' });
  press('Unfollow Ekadashi');
  expect(cards()).toEqual([]);
  press('Area: all');
  expect(cards()).toHaveLength(2);
});

test('search, region and saved filters compose and sharing uses the visible results', () => {
  press('Follow Ekadashi');
  press('Follow Gangaur');
  press('Show saved observances');
  const regional = tree.root.findAll(node => node.props.accessibilityRole === 'button').find(node => /^Area: Rajasthan/.test(node.props.accessibilityLabel ?? ''))!;
  act(() => regional.props.onPress());
  expect(cards()).toEqual(['observance-card-gangaur']);
  act(() => tree.root.findByType(TextInput).props.onChangeText('Vishnu'));
  expect(cards()).toEqual([]);
  act(() => tree.root.findByType(TextInput).props.onChangeText('Gangaur'));
  expect(cards()).toEqual(['observance-card-gangaur']);
  press('Share observance listing');
  expect(mockShare).toHaveBeenCalledWith(expect.objectContaining({ items: [expect.objectContaining({ titleEn: 'Gangaur' })] }), 'en');
});
