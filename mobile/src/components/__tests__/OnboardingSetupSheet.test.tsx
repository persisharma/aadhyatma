import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import OnboardingSetupSheet from '@/components/OnboardingSetupSheet';
import type { Lang } from '@/data/gita/language';
import type { FontScale } from '@/theme/fontScale';

// ---- controllable mock state ----
let mockShouldShow = true;
const mockMarkSetupCompleted = jest.fn(() => Promise.resolve());

jest.mock('@/contexts/TourContext', () => ({
  useTour: () => ({
    shouldShowOnboardingSetup: mockShouldShow,
    markOnboardingSetupCompleted: mockMarkSetupCompleted,
  }),
}));

// Live language + size state, so a tap can be asserted end to end.
let mockLang: Lang = 'hi';
const mockSetLang = jest.fn((next: Lang) => {
  mockLang = next;
});
jest.mock('@/data/gita/language', () => {
  const actual = jest.requireActual('@/data/gita/language');
  return { ...actual, useGitaLanguage: () => ({ lang: mockLang, setLang: mockSetLang }) };
});

let mockScale: FontScale = 'M';
const mockSetScale = jest.fn((next: FontScale) => {
  mockScale = next;
});
jest.mock('@/contexts/FontScaleContext', () => ({
  useFontScale: () => ({ scale: mockScale, setScale: mockSetScale }),
}));

// Minimal theme stub — the sheet reads only these tokens. Verse tokens differ
// per script so the sample line's font can be asserted.
jest.mock('@/theme/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      parchmentHighlight: '#fff', parchmentSoft: '#fff', divider: '#ccc', ink: '#000',
      inkSoft: '#333', inkMuted: '#666', saffron: '#b8621b', saffronDeep: '#8a4a12',
      saffronTint: '#fdf3e7', onPrimary: '#fff', modalBackdrop: 'rgba(0,0,0,0.4)',
    },
    typography: {
      readerTitle: { fontFamily: 'Deva' },
      subtitle: { fontFamily: 'LatinItalic' },
      meaning: { fontFamily: 'Deva' },
      verse: { fontFamily: 'DevaVerse', fontSize: 20, lineHeight: 34 },
      verseLatin: { fontFamily: 'LatinVerse', fontSize: 18, lineHeight: 30 },
      verseGujarati: { fontFamily: 'GujVerse', fontSize: 20, lineHeight: 34 },
      verseKannada: { fontFamily: 'KanVerse', fontSize: 20, lineHeight: 34 },
    },
    spacing: { xxl: 24 },
    radii: { md: 14, lg: 18, pill: 999 },
  }),
}));

type PressableNode = { props: { accessibilityLabel?: string; onPress?: () => void } };

function queryA11y(tree: TestRenderer.ReactTestRenderer, label: string): PressableNode | undefined {
  return tree.root
    .findAll((n) => n.props?.accessibilityLabel === label)
    .find((n) => typeof n.props?.onPress === 'function') as unknown as PressableNode | undefined;
}

function press(tree: TestRenderer.ReactTestRenderer, label: string) {
  act(() => {
    queryA11y(tree, label)!.props.onPress!();
  });
}

function allText(tree: TestRenderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((n) => n.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function render() {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<OnboardingSetupSheet />);
  });
  return tree;
}

beforeEach(() => {
  mockShouldShow = true;
  mockLang = 'hi';
  mockScale = 'M';
  jest.clearAllMocks();
});

describe('OnboardingSetupSheet', () => {
  test('renders nothing when the gate is closed', () => {
    mockShouldShow = false;
    const tree = render();
    expect(tree.root.findAllByType(Text)).toHaveLength(0);
  });

  test('offers every reading language, each in its own script', () => {
    const tree = render();
    const text = allText(tree);
    // Native labels from LANGUAGES metadata — never a hi/en-only pair.
    expect(text).toContain('हिन्दी');
    expect(text).toContain('English');
    expect(text).toContain('ગુજરાતી');
    expect(text).toContain('ಕನ್ನಡ');
    // Constant English a11y labels keep e2e language-independent.
    ['Hindi', 'English', 'Gujarati', 'Kannada'].forEach((label) => {
      expect(queryA11y(tree, label)).toBeDefined();
    });
  });

  test('chrome is bilingual Hindi + English (no reading language exists yet)', () => {
    const tree = render();
    const text = allText(tree);
    expect(text).toContain('भाषा चुनें');
    expect(text).toContain('Choose your reading language');
    expect(text).toContain('पाठ का आकार');
    expect(text).toContain('Reading size');
    expect(text).toContain('आरंभ करें · Begin');
  });

  test('picking a language applies it immediately and re-scripts the sample', () => {
    const tree = render();
    press(tree, 'Gujarati');
    expect(mockSetLang).toHaveBeenCalledWith('gu');

    act(() => tree.update(<OnboardingSetupSheet />));
    const sample = tree.root.findAll((n) => n.props?.testID === 'onboarding-setup-sample')[0];
    expect(sample.props.style.fontFamily).toBe('GujVerse');
    expect(allText(tree)).toContain('શ્રી રામ જય રામ');
  });

  test('picking a size applies it and keeps the sheet open for comparison', () => {
    const tree = render();
    press(tree, 'Large reading size');
    expect(mockSetScale).toHaveBeenCalledWith('L');
    // Still open — only "Begin" dismisses it.
    expect(queryA11y(tree, 'Begin')).toBeDefined();
    expect(mockMarkSetupCompleted).not.toHaveBeenCalled();
  });

  test('Begin marks setup complete and hides the sheet', () => {
    const tree = render();
    press(tree, 'Begin');
    expect(mockMarkSetupCompleted).toHaveBeenCalledTimes(1);
    expect(tree.root.findAllByType(Text)).toHaveLength(0);
  });

  test('does not re-open after Begin while the gate is still flipping off', () => {
    // markOnboardingSetupCompleted is async; the gate can stay true for a render
    // or two. The rising-edge guard must keep the sheet closed.
    const tree = render();
    press(tree, 'Begin');
    act(() => tree.update(<OnboardingSetupSheet />));
    expect(tree.root.findAllByType(Text)).toHaveLength(0);
  });
});
