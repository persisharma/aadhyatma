import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { ScrollView, TextInput } from 'react-native';
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
        act(() => { tree = TestRenderer.create(<ThemeProvider><ExploreSheet section={section} onOpen={open} onDismiss={dismiss}/></ThemeProvider>); });
        expect(tree.root.findByProps({ testID: 'explore-heading' })).toBeTruthy();
        expect(tree.root.findAllByProps({ testID: 'explore-reset-history' })).toHaveLength(0);
        act(() => tree.root.findByProps({ testID: 'explore-open' }).props.onPress());
        expect(open).toHaveBeenCalled();
        act(() => tree.root.findByProps({ testID: 'explore-not-now' }).props.onPress());
        expect(dismiss).toHaveBeenCalledTimes(1);
        act(() => tree.unmount());
    }
});
it.each(['hi', 'en', 'gu', 'kn'].flatMap(lang => [1, 1.15].map(factor => ({ lang, factor }))))('keeps replay reset and status in the scrolling body in $lang at $factor', ({ lang, factor }) => {
    mockLang = lang;
    mockFactor = factor;
    const reset = jest.fn();
    act(() => { tree = TestRenderer.create(<ThemeProvider><ExploreSheet section={EXPLORE_SECTIONS[0]} onOpen={jest.fn()} onDismiss={jest.fn()} onReset={reset} resetting resetMessage="Reset status"/></ThemeProvider>); });
    const scroll = tree.root.findByType(ScrollView);
    const button = scroll.findByProps({ testID: 'explore-reset-history' });
    expect(button.props.disabled).toBe(true);
    expect(button.props.accessibilityState).toEqual({ disabled: true, busy: true });
    expect(scroll.findByProps({ testID: 'explore-reset-status' }).props.children).toBe('Reset status');
    expect(scroll.findByProps({ testID: 'explore-reset-status' }).props.accessibilityLiveRegion).toBe('polite');
});
it('only previews the sender until an explicit open action', () => {
    mockLang = 'en';
    const open = jest.fn();
    act(() => { tree = TestRenderer.create(<ExploreSheet section={EXPLORE_SECTIONS.find(s => s.id === 'suvichar')!} onOpen={open} onDismiss={jest.fn()}/>); });
    act(() => tree.root.findByType(TextInput).props.onChangeText('  Prashant  '));
    expect(open).not.toHaveBeenCalled();
    expect(tree.root.findByProps({ testID: 'explore-greeting-signature' }).props.children).toBe('Prashant');
    act(() => tree.root.findByProps({ testID: 'explore-open' }).props.onPress());
    expect(open).toHaveBeenCalledWith('Prashant');
});


