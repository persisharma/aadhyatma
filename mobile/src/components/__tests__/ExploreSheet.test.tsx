import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import { ThemeProvider } from '@/theme/ThemeContext';
import ExploreSheet from '@/components/explore/ExploreSheet';
import { EXPLORE_SECTIONS } from '@/data/discovery/sections';
let mockLang = 'en', mockFactor = 1;
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: mockLang }) }));
jest.mock('@/contexts/FontScaleContext', () => ({ useFontScale: () => ({ factor: mockFactor }) }));
jest.mock('@/utils/useReducedMotion', () => ({ useReducedMotion: () => true }));
jest.mock('@/components/AppIcon', () => 'AppIcon');
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: require('react-native').View }));
let tree: TestRenderer.ReactTestRenderer;
afterEach(() => { if (tree)
    act(() => tree.unmount()); });
it.each(['hi', 'en', 'gu', 'kn'].flatMap(lang => [1, 1.15].map(factor => ({ lang, factor }))))('renders all sixteen sheets in $lang at $factor with reachable actions', ({ lang, factor }) => {
    mockLang = lang;
    mockFactor = factor;
    for (const section of EXPLORE_SECTIONS) {
        const open = jest.fn(), dismiss = jest.fn();
        act(() => { tree = TestRenderer.create(<ThemeProvider><ExploreSheet section={section} onOpen={open} onDismiss={dismiss} onDisable={jest.fn()}/></ThemeProvider>); });
        expect(tree.root.findByProps({ testID: 'explore-heading' })).toBeTruthy();
        act(() => tree.root.findByProps({ testID: 'explore-open' }).props.onPress());
        expect(open).toHaveBeenCalled();
        act(() => tree.root.findByProps({ testID: 'explore-not-now' }).props.onPress());
        expect(dismiss).toHaveBeenCalledTimes(1);
        act(() => tree.unmount());
    }
});
it('only previews the sender until an explicit open action', () => {
    mockLang = 'en';
    const open = jest.fn();
    act(() => { tree = TestRenderer.create(<ExploreSheet section={EXPLORE_SECTIONS.find(s => s.id === 'suvichar')!} onOpen={open} onDismiss={jest.fn()} onDisable={jest.fn()}/>); });
    act(() => tree.root.findByType(TextInput).props.onChangeText('  Prashant  '));
    expect(open).not.toHaveBeenCalled();
    expect(tree.root.findByProps({ testID: 'explore-greeting-signature' }).props.children).toBe('Prashant');
    act(() => tree.root.findByProps({ testID: 'explore-open' }).props.onPress());
    expect(open).toHaveBeenCalledWith('Prashant');
});
