import React from 'react';
import { VratFollowProvider } from '@/contexts/VratFollowContext';
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
jest.mock('@/contexts/NotificationPreferencesContext', () => ({ useNotificationPreferences: () => ({ permissionStatus: 'granted' }) }));
const mockShare = jest.fn();
jest.mock('@/utils/shareVerse', () => ({ useShare: () => ({ share: mockShare, busy: false }) }));
jest.mock('@/utils/listingShare', () => ({ buildListingShare: (value: unknown) => value }));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (key: string) => key === '@vedansh/vrat-reminder-default' ? JSON.stringify({ advanceDays: 1, dayOf: true }) : null),
  setItem: jest.fn(async () => undefined),
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
beforeEach(async () => {
  jest.clearAllMocks();
  await act(async () => { tree = TestRenderer.create(<VratFollowProvider><ObservanceListScreen navigation={navigation as never} route={{ params: { category: 'vrat' } } as never} /></VratFollowProvider>); });
});
afterEach(() => act(() => tree.unmount()));

test('saving from the list never opens detail and the saved filter updates immediately', () => {
  press('Save and remind Ekadashi');
  expect(navigation.navigate).not.toHaveBeenCalled();
  press('Show saved observances');
  expect(cards()).toEqual(['observance-card-ekadashi']);
  press('Ekadashi');
  expect(navigation.navigate).toHaveBeenCalledWith('ObservanceDetail', { ruleId: 'ekadashi' });
  press('Remove saved Ekadashi');
  expect(cards()).toEqual([]);
  press('Area: all');
  expect(cards()).toHaveLength(2);
});

test('search, region and saved filters compose and sharing uses the visible results', () => {
  press('Save and remind Ekadashi');
  press('Save and remind Gangaur');
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
