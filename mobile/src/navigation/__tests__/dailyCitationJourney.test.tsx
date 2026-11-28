import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { GitaLanguageProvider } from '@/data/gita/language';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { ReadingProgressProvider } from '@/contexts/ReadingProgressContext';
import { ShareProvider } from '@/utils/shareVerse';
import GitaReaderScreen from '@/screens/GitaReaderScreen';
import ReaderHeader from '@/components/ReaderHeader';
import DailyBhaktiStack from '../DailyBhaktiStack';
import type { TabParamList } from '../types';

// Keep the real nested routers and route descriptors. Replace only the native
// stack view so the test can drive link, header Back and root Back under Jest.
jest.mock('@react-navigation/native-stack', () => {
  const React = require('react');
  const { createNavigatorFactory, useNavigationBuilder, StackRouter } = require('@react-navigation/native');
  function Stack(props: object) {
    const { state, descriptors, NavigationContent } = useNavigationBuilder(StackRouter, props);
    return React.createElement(NavigationContent, null, state.routes.map((route: { key: string }) =>
      React.createElement(React.Fragment, { key: route.key }, descriptors[route.key].render())));
  }
  return { createNativeStackNavigator: createNavigatorFactory(Stack) };
});
// Jest's CommonJS runtime cannot evaluate Metro's dynamic imports.
jest.mock('../lazyScreen', () => ({
  lazyScreen: (name: string) => name === 'GitaReader' ? require('@/screens/GitaReaderScreen').default : () => null,
}));
jest.mock('@/screens/HomeScreen', () => () => null);
jest.mock('@/components/DailyBhaktiNudge', () => () => null);
jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn() }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(async () => false) }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: require('react-native').View }));

const Root = createNativeStackNavigator<TabParamList>();
const identity = { sourceId: 'bhagavad-gita', chapter: 2, verseIndex: 46 };

test('a Daily Bhakti citation opens its reader and both Back actions restore the mounted card', async () => {
  const ref = createNavigationContainerRef<TabParamList>();
  await AsyncStorage.setItem('@vedansh/font-scale', 'L');
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(<SafeAreaInsetsContext.Provider value={{ top: 0, right: 0, bottom: 0, left: 0 }}>
      <GitaLanguageProvider initialLang="hi"><FontScaleProvider><ReadingProgressProvider><ShareProvider>
        <NavigationContainer ref={ref}><Root.Navigator>
          <Root.Screen name="DailyBhaktiTab" initialParams={identity} component={DailyBhaktiStack} />
        </Root.Navigator></NavigationContainer>
      </ShareProvider></ReadingProgressProvider></FontScaleProvider></GitaLanguageProvider>
    </SafeAreaInsetsContext.Provider>);
  });
  const card = tree.root.findByProps({ testID: 'daily-bhakti-card' });
  const open = () => act(async () => tree.root.findByProps({ testID: 'daily-bhakti-source-link' }).props.onPress());
  for (const back of ['header', 'system']) {
    await open();
    expect(ref.getCurrentRoute()).toMatchObject({ name: 'GitaReader', params: { chapter: 2, initialIndex: 46 } });
    expect(tree.root.findByType(GitaReaderScreen)).toBeDefined();
    act(() => back === 'header' ? tree.root.findByType(ReaderHeader).props.onBack() : ref.goBack());
    expect(ref.getCurrentRoute()?.name).toBe('DailyCard');
    expect(tree.root.findByProps({ testID: 'daily-bhakti-card' })).toBe(card);
  }
  await open();
  act(() => ref.navigate('DailyBhaktiTab', { ...identity, verseIndex: 11 }));
  expect(ref.getCurrentRoute()?.name).toBe('DailyCard');
  expect(tree.root.findByProps({ testID: 'daily-bhakti-source-link' }).props.accessibilityLabel).toContain('2.12');
  act(() => tree.unmount());
});
