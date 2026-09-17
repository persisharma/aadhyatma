/**
 * पाठ — the library index (TRD-42 §5.3).
 *
 * What is worth pinning here is not "the screen renders". It is that the three
 * browse axes Home gave up — देवता, उद्देश्य and the form grid — all landed
 * here with nothing dropped on the way, that the counts come from the real
 * library rather than a hand-kept list, and that Back goes to Home rather than
 * stranding the user on a screen with no tab of its own.
 */
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';

import LibraryScreen from '@/screens/LibraryScreen';
import { categories } from '@/data/categories';
import { deities } from '@/data/deities';
import { purposes } from '@/data/purposes';
import { libraryCounts } from '@/data/libraryCounts';

const mockHasNewInCategory = jest.fn(() => false);

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: 'hi' }) }));
jest.mock('@/contexts/NewContentContext', () => ({
  useNewContent: () => ({ hasNewInCategory: mockHasNewInCategory }),
}));

const navigation = { navigate: jest.fn(), goBack: jest.fn() };

function render(): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<LibraryScreen navigation={navigation as never} route={{ key: 'l', name: 'Library' } as never} />);
  });
  return tree;
}

/** Every distinct a11y label on a button, in mount order. */
function buttonLabels(tree: TestRenderer.ReactTestRenderer): string[] {
  return [
    ...new Set(
      tree.root
        .findAll((n) => typeof n.props?.accessibilityLabel === 'string' && n.props?.accessibilityRole === 'button')
        .map((n) => n.props.accessibilityLabel as string)
    ),
  ];
}

function textOf(tree: TestRenderer.ReactTestRenderer): string[] {
  return tree.root
    .findAllByType(Text)
    .map((n) => (Array.isArray(n.props.children) ? n.props.children.join('') : String(n.props.children ?? '')));
}

beforeEach(() => {
  navigation.navigate.mockClear();
  navigation.goBack.mockClear();
  mockHasNewInCategory.mockClear();
});

describe('LibraryScreen', () => {
  it('carries all three browse axes Home gave up', () => {
    const tree = render();
    const labels = buttonLabels(tree);
    // देवता: the rail is capped at 8 avatars, so the overflow chip must exist
    // and must name the full count — otherwise the other deities are unreachable.
    expect(labels.filter((l) => deities.some((d) => l.startsWith(`${d.nameEn}.`)))).toHaveLength(8);
    expect(labels).toContain(`All ${deities.length} deities`);
    // उद्देश्य: every purpose, no cap.
    purposes.forEach((p) => expect(labels).toContain(`${p.nameEn}. Tap to open.`));
    // प्रकार: every category from the registry, plus the संग्रह tile.
    // CategoryCard's a11y label is always the full `nameEn` — `shortNameEn`
    // only shortens the visible caption.
    categories.forEach((c) => {
      expect(labels.some((l) => l.startsWith(`${c.nameEn}.`))).toBe(true);
    });
    expect(labels.some((l) => l.startsWith('Wishlist.'))).toBe(true);
    act(() => tree.unmount());
  });

  it('prints each active category count from the real library', () => {
    // The number under a tile is derived, never authored: an added text must
    // change it with no edit here.
    const tree = render();
    const rendered = textOf(tree);
    const counts = libraryCounts();
    const chalisa = counts.chalisa;
    expect(chalisa).toBeGreaterThan(0);
    expect(rendered).toContain(String(chalisa));
    // A `coming` category shows SOON, not a misleading 0.
    categories
      .filter((c) => c.status !== 'active')
      .forEach((c) => expect(counts[c.id]).toBeUndefined());
    act(() => tree.unmount());
  });

  it('opens a category, and sends तीर्थ to the map instead of a text list', () => {
    const tree = render();
    const press = (label: string) => {
      const node = tree.root.find(
        (n) => n.props?.accessibilityLabel === label && typeof n.props?.onPress === 'function'
      );
      act(() => node.props.onPress());
    };
    press(buttonLabels(tree).find((l) => l.startsWith('Chalisa.'))!);
    expect(navigation.navigate).toHaveBeenCalledWith('CategoryList', { categoryId: 'chalisa' });
    // तीर्थ is a place registry, not a text registry — CategoryList would find
    // nothing for it.
    press(buttonLabels(tree).find((l) => l.startsWith('Pilgrimage.'))!);
    expect(navigation.navigate).toHaveBeenCalledWith('TheerthMap', {});
    act(() => tree.unmount());
  });

  it('back returns to Home', () => {
    // Library has no tab of its own: it is pushed from the पाठ door, so its
    // only way out is the header. Losing this strands the user.
    const tree = render();
    const back = tree.root.find(
      (n) => n.props?.accessibilityLabel === 'Back' && typeof n.props?.onPress === 'function'
    );
    act(() => back.props.onPress());
    expect(navigation.goBack).toHaveBeenCalled();
    act(() => tree.unmount());
  });

  it('keeps the NEW badge on categories — content novelty did not move', () => {
    // नया tracks *features*; the per-category badge tracks *texts*. The badge
    // followed the grid here rather than being retired with Home's version.
    const tree = render();
    const asked = mockHasNewInCategory.mock.calls.map((args) => (args as unknown as string[])[0]);
    categories
      .filter((c) => c.status === 'active')
      .forEach((c) => expect(asked).toContain(c.id));
    act(() => tree.unmount());
  });

  it('search leads, because a named text is faster to type than to browse', () => {
    const tree = render();
    const labels = buttonLabels(tree);
    // Header "Back" is chrome; search must lead the scroll's own content.
    expect(labels.indexOf('Search the library')).toBeGreaterThan(-1);
    expect(labels.indexOf('Search the library')).toBeLessThan(
      labels.findIndex((l) => l.startsWith(`${deities[0].nameEn}.`))
    );
    act(() => tree.unmount());
  });
});
