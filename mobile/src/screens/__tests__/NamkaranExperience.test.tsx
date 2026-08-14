import assert from 'node:assert/strict';
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { FlatList, StyleSheet, Text, View as mockView } from 'react-native';

import { GitaLanguageProvider } from '@/data/gita/language';
import ListCard from '@/components/ListCard';
import { NAKSHATRA_NAMES_HI } from '@/panchang/names';
import { calculateNamkaran, charanaSetForDay, type NamkaranResult } from '@/panchang/namkaran';

const mockNavigation = { goBack: jest.fn(), navigate: jest.fn() };
let mockComputeState: { status: 'result'; result: NamkaranResult } = {
  status: 'result',
  result: calculateNamkaran({ kind: 'manual', nakshatraIndex: 6, pada: 1 }),
};

jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ navigate: jest.fn() }) }));
jest.mock('@/panchang/useNamkaran', () => ({ useNamkaran: () => mockComputeState }));
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));
jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn(() => Promise.resolve('file://namkaran.png')) }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(() => Promise.resolve(true)), shareAsync: jest.fn(() => Promise.resolve()) }));

const NamkaranScreen = jest.requireActual<typeof import('../NamkaranScreen')>('../NamkaranScreen').default;
const NamkaranResultScreen = jest.requireActual<typeof import('../NamkaranResultScreen')>('../NamkaranResultScreen').default;

function textOf(tree: TestRenderer.ReactTestRenderer): string {
  return tree.root.findAllByType(Text).map((node) => node.props.children).flat(Infinity).join(' ');
}

async function unmountFlatListTree(tree: TestRenderer.ReactTestRenderer): Promise<void> {
  await act(async () => {
    tree.unmount();
    await new Promise((resolve) => setTimeout(resolve, 80));
  });
}

afterEach(() => {
  mockNavigation.goBack.mockClear();
  mockNavigation.navigate.mockClear();
});

test('child mode reuses BirthDetailsForm without collecting a name, city, or Kundali profile', async () => {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="en">
        <NamkaranScreen navigation={mockNavigation as any} route={{ key: 'Namkaran-test', name: 'Namkaran' } as any} />
      </GitaLanguageProvider>
    );
    await Promise.resolve();
  });
  assert.ok(tree.root.findByProps({ accessibilityLabel: 'Child birth details, time in IST' }));
  assert.equal(tree.root.findAllByProps({ accessibilityLabel: 'Child name, optional' }).length, 0);
  assert.equal(textOf(tree).includes('birth place is required'), false);
  assert.equal(textOf(tree).includes('Calculation stays on this device'), false);
  assert.equal(textOf(tree).includes('No account'), false);
  assert.equal(textOf(tree).includes('internet'), false);
  await unmountFlatListTree(tree);
});

test('manual nakshatra browse uses the Home-style 3-column launcher grid before four pada rows', async () => {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="en">
        <NamkaranScreen navigation={mockNavigation as any} route={{ key: 'Namkaran-grid', name: 'Namkaran' } as any} />
      </GitaLanguageProvider>
    );
    await Promise.resolve();
  });

  await act(async () => {
    tree.root.findByProps({ accessibilityLabel: 'Choose by nakshatra. If you know the nakshatra and pada, go straight to names.' }).props.onPress();
  });
  assert.ok(tree.root.findByProps({ testID: 'namkaran-nakshatra-grid' }));
  const nakshatraTileIds = new Set(
    tree.root
      .findAll((node) => /^namkaran-nakshatra-\d+$/.test(node.props.testID ?? ''))
      .map((node) => node.props.testID)
  );
  assert.equal(nakshatraTileIds.size, 27);
  assert.equal(tree.root.findAll((node) => node.props.launcherLabelPosition === 'tile').length, 27);

  await act(async () => {
    tree.root.findAllByProps({ accessibilityLabel: 'Punarvasu. Tap to open.' }).find((node) => typeof node.props.onPress === 'function')?.props.onPress();
  });
  assert.equal(tree.root.findAll((node) => node.type === ListCard && /^Pada [1-4]\./.test(node.props.accessibilityLabel ?? '')).length, 4);

  await act(async () => {
    tree.root.findAll((node) => node.type === ListCard && /^Pada 1\./.test(node.props.accessibilityLabel ?? ''))[0].props.onPress();
  });
  const navigationCall = mockNavigation.navigate.mock.calls.at(-1);
  assert.equal(navigationCall?.[0], 'NamkaranResult');
  assert.equal(navigationCall?.[1]?.basis.kind, 'manual');
  assert.equal(navigationCall?.[1]?.basis.nakshatraIndex, 6);
  assert.equal(navigationCall?.[1]?.basis.pada, 1);
  await unmountFlatListTree(tree);
});

test('manual nakshatra grid renders the complete Hindi names inside unclipped two-line tiles', async () => {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="hi">
        <NamkaranScreen navigation={mockNavigation as any} route={{ key: 'Namkaran-grid-hi', name: 'Namkaran' } as any} />
      </GitaLanguageProvider>
    );
    await Promise.resolve();
  });
  await act(async () => {
    tree.root.findByProps({ accessibilityLabel: 'Choose by nakshatra. If you know the nakshatra and pada, go straight to names.' }).props.onPress();
  });

  const rendered = textOf(tree);
  assert.ok(rendered.includes('अश्विनी'));
  assert.ok(rendered.includes('पूर्वाभाद्रपद'));
  assert.ok(rendered.includes('उत्तराभाद्रपद'));
  assert.ok(rendered.includes('रेवती'));
  assert.equal(tree.root.findAll((node) => node.props.launcherLabelPosition === 'tile' && node.props.launcherLabelLines === 2).length, 27);
  await unmountFlatListTree(tree);
});

// Regression: the in-tile labels used `adjustsFontSizeToFit`, and on iOS that
// shrank scattered tiles (हस्त / चित्रा / स्वाती) to a few points — well past
// the 0.8 `minimumFontScale` — while their identically sized neighbours stayed
// full size. All 27 tiles must now carry one fixed, capped size.
test('every nakshatra tile label renders at one fixed size, not platform auto-shrink', async () => {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="hi">
        <NamkaranScreen navigation={mockNavigation as any} route={{ key: 'Namkaran-grid-size', name: 'Namkaran' } as any} />
      </GitaLanguageProvider>
    );
    await Promise.resolve();
  });
  await act(async () => {
    tree.root.findByProps({ accessibilityLabel: 'Choose by nakshatra. If you know the nakshatra and pada, go straight to names.' }).props.onPress();
  });

  const labels = tree.root
    .findAllByType(Text)
    .filter((node) => NAKSHATRA_NAMES_HI.includes(node.props.children as string));
  assert.equal(labels.length, 27);
  for (const label of labels) {
    assert.equal(label.props.adjustsFontSizeToFit, undefined);
    assert.equal(label.props.minimumFontScale, undefined);
    assert.equal(label.props.numberOfLines, 2);
    assert.equal(label.props.maxFontSizeMultiplier, 1.25);
  }
  const sizes = new Set(labels.map((label) => StyleSheet.flatten(label.props.style).fontSize));
  assert.deepEqual([...sizes], [13]);
  await unmountFlatListTree(tree);
});

test('all-108 browse is a nakshatra-grouped grid of tappable pada cells, not a flat list', async () => {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="en">
        <NamkaranScreen navigation={mockNavigation as any} route={{ key: 'Namkaran-all', name: 'Namkaran' } as any} />
      </GitaLanguageProvider>
    );
    await Promise.resolve();
  });

  await act(async () => {
    tree.root.findByProps({ accessibilityLabel: 'Browse all 108. Choose any sound from the complete nakshatra-pada index.' }).props.onPress();
  });
  assert.ok(tree.root.findByProps({ testID: 'namkaran-all-grid' }));
  const groupIds = new Set(tree.root.findAll((node) => /^namkaran-all-group-\d+$/.test(node.props.testID ?? '')).map((node) => node.props.testID));
  assert.equal(groupIds.size, 27);
  const cellLabels = new Set(
    tree.root
      .findAll((node) => typeof node.props.accessibilityLabel === 'string' && / pada [1-4], /.test(node.props.accessibilityLabel) && node.props.accessibilityLabel.endsWith('Tap to open.'))
      .map((node) => node.props.accessibilityLabel)
  );
  assert.equal(cellLabels.size, 108);

  await act(async () => {
    tree.root.findAll((node) => typeof node.props.accessibilityLabel === 'string' && node.props.accessibilityLabel.startsWith('Ashwini pada 1,') && typeof node.props.onPress === 'function')[0].props.onPress();
  });
  const navigationCall = mockNavigation.navigate.mock.calls.at(-1);
  assert.equal(navigationCall?.[0], 'NamkaranResult');
  assert.equal(navigationCall?.[1]?.basis.kind, 'manual');
  assert.equal(navigationCall?.[1]?.basis.nakshatraIndex, 0);
  assert.equal(navigationCall?.[1]?.basis.pada, 1);
  await unmountFlatListTree(tree);
});

test('exact manual result has one hero, a FlatList, filters, shortlist, and exact share', async () => {
  mockComputeState = { status: 'result', result: calculateNamkaran({ kind: 'manual', nakshatraIndex: 6, pada: 1 }) };
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="en">
        <NamkaranResultScreen
          navigation={mockNavigation as any}
          route={{ key: 'NamkaranResult-test', name: 'NamkaranResult', params: { basis: { kind: 'manual', nakshatraIndex: 6, pada: 1 } } } as any}
        />
      </GitaLanguageProvider>
    );
    await Promise.resolve();
    await Promise.resolve();
  });
  assert.ok(tree.root.findByProps({ accessibilityLabel: 'के, Ke. Punarvasu, pada 1.' }));
  assert.ok(tree.root.findByType(FlatList));
  assert.ok(tree.root.findByProps({ accessibilityLabel: 'Filter names: boy' }));
  const shortlistControl = tree.root.findByProps({ accessibilityLabel: 'Add Keshav to shortlist' });
  assert.ok(shortlistControl);
  // The shortlist control must remain a sibling overlay, never a nested button
  // inside the ListCard pressable (iOS otherwise swallows it).
  assert.equal(typeof shortlistControl.parent?.props.onPress, 'undefined');
  assert.ok(tree.root.findByProps({ accessibilityLabel: 'Preview privacy-safe Namkaran share card' }));
  assert.ok(tree.root.findByProps({ accessibilityLabel: 'How this namakshar was derived' }));
  assert.ok(tree.root.findByProps({ accessibilityLabel: 'Nine rashi sounds' }));
  assert.ok(!textOf(tree).includes('CONTENT REVIEW PENDING'));
  assert.ok(!textOf(tree).includes('namakshar-v1'));
  await unmountFlatListTree(tree);
});

// Regression (August 2026): the result screen's micro labels shipped with Inter
// plus Latin tracking, so in Hindi "नाम देखें" / "कैसे निकला?" / "राशि अनुसार अक्षर"
// fell back to an unpredictable face with every cluster prised apart, and the
// header ended flush against the first name card so the two collided visually.
test('result-screen section labels are script-aware and clear the first name row', async () => {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="hi">
        <NamkaranResultScreen navigation={mockNavigation as any} route={{ key: 'NamkaranResult-labels', name: 'NamkaranResult', params: { basis: { kind: 'manual', nakshatraIndex: 6, pada: 1 } } } as any} />
      </GitaLanguageProvider>
    );
    await Promise.resolve();
  });

  const labels = tree.root
    .findAllByType(Text)
    .map((node) => ({ text: [node.props.children].flat(Infinity).filter((part) => typeof part === 'string').join(''), style: StyleSheet.flatten(node.props.style) ?? {} }))
    .filter(({ text }) => ['नाम देखें', 'कैसे निकला?', 'राशि अनुसार अक्षर'].includes(text));
  assert.equal(labels.length, 3);
  for (const { text, style } of labels) {
    assert.equal(style.letterSpacing, 0, `${text} must not carry Latin tracking`);
    assert.ok(!/^Inter/.test(style.fontFamily ?? ''), `${text} must name a face that has Devanagari`);
    assert.ok(style.lineHeight / style.fontSize >= 1.4, `${text} needs the 10 pt floor's leading`);
  }

  const headerStyle = StyleSheet.flatten(tree.root.findByProps({ testID: 'namkaran-name-list' }).props.ListHeaderComponent.props.style);
  assert.ok(headerStyle.paddingBottom >= 12, 'the header must clear the first name row, whose card carries an upward shadow');
  await unmountFlatListTree(tree);
});

test('name detail carries both meanings and allows copying only the candidate name', async () => {
  mockComputeState = { status: 'result', result: calculateNamkaran({ kind: 'manual', nakshatraIndex: 6, pada: 1 }) };
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="en">
        <NamkaranResultScreen
          navigation={mockNavigation as any}
          route={{ key: 'NamkaranResult-detail', name: 'NamkaranResult', params: { basis: { kind: 'manual', nakshatraIndex: 6, pada: 1 } } } as any}
        />
      </GitaLanguageProvider>
    );
    await Promise.resolve();
    await Promise.resolve();
  });
  await act(async () => {
    tree.root.findByProps({ accessibilityLabel: 'Open name Keshav. A name of Vishnu-Krishna' }).props.onPress();
  });
  assert.ok(textOf(tree).includes('भगवान विष्णु-कृष्ण का एक नाम'));
  assert.ok(textOf(tree).includes('A name of Vishnu-Krishna'));
  assert.ok(tree.root.findByProps({ accessibilityLabel: 'Copy Keshav name' }));
  await unmountFlatListTree(tree);
});

test('an empty filter combination is recoverable instead of a dead-end', async () => {
  mockComputeState = { status: 'result', result: calculateNamkaran({ kind: 'manual', nakshatraIndex: 6, pada: 1 }) };
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="en">
        <NamkaranResultScreen
          navigation={mockNavigation as any}
          route={{ key: 'NamkaranResult-empty-filter', name: 'NamkaranResult', params: { basis: { kind: 'manual', nakshatraIndex: 6, pada: 1 } } } as any}
        />
      </GitaLanguageProvider>
    );
    await Promise.resolve();
    await Promise.resolve();
  });
  await act(async () => {
    tree.root.findByProps({ accessibilityLabel: 'Filter names: boy' }).props.onPress();
    tree.root.findByProps({ accessibilityLabel: 'Filter name length: 2' }).props.onPress();
  });
  assert.ok(textOf(tree).includes('No names match the selected filters.'));
  assert.ok(tree.root.findByProps({ accessibilityLabel: 'Show all available Namkaran names' }));
  await act(async () => {
    tree.root.findByProps({ accessibilityLabel: 'Show all available Namkaran names' }).props.onPress();
  });
  assert.ok(tree.root.findByProps({ accessibilityLabel: 'Add Keshav to shortlist' }));
  await unmountFlatListTree(tree);
});

test('the approved Ashwini-Chu prototype route has a real name row', async () => {
  mockComputeState = { status: 'result', result: calculateNamkaran({ kind: 'manual', nakshatraIndex: 0, pada: 1 }) };
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="en">
        <NamkaranResultScreen
          navigation={mockNavigation as any}
          route={{ key: 'NamkaranResult-ashwini', name: 'NamkaranResult', params: { basis: { kind: 'manual', nakshatraIndex: 0, pada: 1 } } } as any}
        />
      </GitaLanguageProvider>
    );
    await Promise.resolve();
    await Promise.resolve();
  });
  assert.ok(tree.root.findByProps({ accessibilityLabel: 'Open name Chudamani. Crest-jewel; the finest of its kind' }));
  assert.equal(textOf(tree).includes('Names for this sound are not yet available.'), false);
  await unmountFlatListTree(tree);
});

test('unknown-time result is uniform candidate rows with no hero or exact share', async () => {
  const start = Date.parse('2026-08-12T18:30:00.000Z');
  const candidates = charanaSetForDay('2026-08-13', (date) => (358 + ((date.getTime() - start) / 86_400_000) * 15) % 360);
  mockComputeState = { status: 'result', result: { kind: 'range', candidates, conventionVersion: 1 } };
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="en">
        <NamkaranResultScreen
          navigation={mockNavigation as any}
          route={{ key: 'NamkaranResult-range', name: 'NamkaranResult', params: { basis: { kind: 'birth', date: '2026-08-13', time: null } } } as any}
        />
      </GitaLanguageProvider>
    );
    await Promise.resolve();
    await Promise.resolve();
  });
  assert.ok(textOf(tree).includes('Possible namakshar'));
  assert.equal(tree.root.findAll((node) => node.type === ListCard && node.props.testID === 'namkaran-candidate-row').length, candidates.length);
  assert.equal(tree.root.findAllByProps({ accessibilityLabel: 'Preview privacy-safe Namkaran share card' }).length, 0);
  assert.equal(tree.root.findAll((node) => typeof node.props.accessibilityLabel === 'string' && node.props.accessibilityLabel.includes('Ke. Punarvasu')).length, 0);
  await unmountFlatListTree(tree);
});
