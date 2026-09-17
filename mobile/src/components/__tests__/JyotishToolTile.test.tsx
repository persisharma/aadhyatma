/**
 * `JyotishToolTile` (design.md §51c) — the 2×2 door that answers for the
 * selected person.
 *
 * What is pinned here is the tile's whole reason to exist: a reading when the
 * chart can supply one, the description when it cannot, and both reaching a
 * screen reader. The guest/error fallback is the case that regressed easiest in
 * review, because it only appears when there is no chart at all.
 */
import React from 'react';
import { Text } from 'react-native';
import { act, create } from 'react-test-renderer';

import JyotishToolTile from '@/components/JyotishToolTile';
import { ThemeProvider } from '@/theme/ThemeContext';

function render(node: React.ReactElement) {
  let tree!: ReturnType<typeof create>;
  act(() => {
    tree = create(<ThemeProvider>{node}</ThemeProvider>);
  });
  return tree;
}

function textOf(tree: ReturnType<typeof create>): string {
  return tree.root
    .findAllByType(Text)
    .flatMap((node) => node.props.children)
    .filter((child): child is string => typeof child === 'string')
    .join(' | ');
}

function tileProps(tree: ReturnType<typeof create>) {
  return tree.root.findByProps({ accessibilityRole: 'button' }).props;
}

const BASE = {
  titleHi: 'गोचर',
  titleEn: 'Gochar',
  bodyHi: 'आज के नौ ग्रह आपकी कुंडली में।',
  bodyEn: 'Today’s nine grahas in your chart.',
  glyph: 'गो',
  onPress: () => {},
  accessibilityLabel: 'Open Gochar',
  lang: 'en' as const,
};

test('a tile with a reading shows the reading, not the description', () => {
  const tree = render(
    <JyotishToolTile
      {...BASE}
      value={{ hi: 'साढ़े साती · द्वितीय चरण', en: 'Sade Sati · middle phase' }}
    />
  );

  const body = textOf(tree);
  expect(body).toContain('Gochar');
  expect(body).toContain('Sade Sati · middle phase');
  // The description is what the reading REPLACES — printing both would put the
  // 98 dp of body copy §51c removed back on the landing.
  expect(body).not.toContain('Today’s nine grahas in your chart.');
  act(() => tree.unmount());
});

test('with no reading the tile falls back to its description — the guest/error state', () => {
  const tree = render(<JyotishToolTile {...BASE} value={null} />);

  const body = textOf(tree);
  expect(body).toContain('Gochar');
  expect(body).toContain('Today’s nine grahas in your chart.');
  act(() => tree.unmount());
});

test('an omitted value behaves exactly like an explicit null', () => {
  const withNull = render(<JyotishToolTile {...BASE} value={null} />);
  const omitted = render(<JyotishToolTile {...BASE} />);
  expect(textOf(omitted)).toBe(textOf(withNull));
  act(() => withNull.unmount());
  act(() => omitted.unmount());
});

test('the reading reaches a screen reader as the value, leaving the label exact', () => {
  const tree = render(
    <JyotishToolTile
      {...BASE}
      lang="hi"
      value={{ hi: 'साढ़े साती · द्वितीय चरण', en: 'Sade Sati · middle phase' }}
    />
  );

  // The label is the caller's door name verbatim — every shipped Maestro flow
  // targets it (`tapOn: "Open Gochar"`), so growing it breaks e2e silently.
  expect(tileProps(tree).accessibilityLabel).toBe('Open Gochar');
  // English value whatever the reading language, so TalkBack and Maestro agree.
  expect(tileProps(tree).accessibilityValue).toEqual({
    text: 'Sade Sati · middle phase',
  });
  act(() => tree.unmount());
});

test('with no reading the value falls back to the English description', () => {
  const tree = render(<JyotishToolTile {...BASE} lang="hi" value={null} />);
  expect(tileProps(tree).accessibilityLabel).toBe('Open Gochar');
  expect(tileProps(tree).accessibilityValue).toEqual({
    text: 'Today’s nine grahas in your chart.',
  });
  act(() => tree.unmount());
});

test('live is an emphasis, never the only signal: the words say it too', () => {
  const value = { hi: 'साढ़े साती · द्वितीय चरण', en: 'Sade Sati · middle phase' };
  const quiet = render(<JyotishToolTile {...BASE} value={value} />);
  const live = render(<JyotishToolTile {...BASE} value={value} live />);

  const flat = (tree: ReturnType<typeof create>) =>
    ([] as unknown[]).concat(...[tileProps(tree).style({ pressed: false })]).flat();
  const fill = (tree: ReturnType<typeof create>) =>
    flat(tree).find(
      (entry): entry is { backgroundColor: string } =>
        !!entry && typeof entry === 'object' && 'backgroundColor' in entry
    )?.backgroundColor;

  // The fill changes...
  expect(fill(live)).not.toBe(fill(quiet));
  // ...but §12 means the reading carries the same news in words either way.
  expect(textOf(live)).toContain('Sade Sati · middle phase');
  expect(textOf(quiet)).toContain('Sade Sati · middle phase');
  act(() => quiet.unmount());
  act(() => live.unmount());
});

test('the NEW badge is text, not a colour dot (§12)', () => {
  const tree = render(<JyotishToolTile {...BASE} badge="NEW" value={null} />);
  expect(textOf(tree)).toContain('NEW');
  act(() => tree.unmount());
});

test('every tile keeps the dense-chrome font cap so a reading cannot outgrow it', () => {
  const tree = render(
    <JyotishToolTile {...BASE} badge="NEW" value={{ hi: 'क', en: 'k' }} />
  );
  for (const node of tree.root.findAllByType(Text)) {
    expect(node.props.maxFontSizeMultiplier).toBe(1.25);
  }
  act(() => tree.unmount());
});
