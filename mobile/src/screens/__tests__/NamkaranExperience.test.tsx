import assert from 'node:assert/strict';
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { FlatList, Text, View as mockView } from 'react-native';

import { GitaLanguageProvider } from '@/data/gita/language';
import ListCard from '@/components/ListCard';
import {
  calculateNamkaran,
  charanaSetForDay,
  distinctRashiIndices,
  rashiSyllables,
  type NamkaranResult,
} from '@/panchang/namkaran';

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
const NamkaranRashiScreen = jest.requireActual<typeof import('../NamkaranRashiScreen')>('../NamkaranRashiScreen').default;

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
  assert.ok(tree.root.findByProps({ accessibilityLabel: 'Open Mithuna rashi naming detail' }));
  assert.ok(!textOf(tree).includes('CONTENT REVIEW PENDING'));
  assert.ok(!textOf(tree).includes('namakshar-v1'));
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

test('rashi is a peer browse door — twelve launcher tiles that land on the rashi detail', async () => {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="en">
        <NamkaranScreen navigation={mockNavigation as any} route={{ key: 'Namkaran-rashi', name: 'Namkaran' } as any} />
      </GitaLanguageProvider>
    );
    await Promise.resolve();
  });

  await act(async () => {
    tree.root.findByProps({ accessibilityLabel: 'Choose by rashi. Know the Moon rashi? See its nine charanas and their sounds.' }).props.onPress();
  });
  assert.ok(tree.root.findByProps({ testID: 'namkaran-rashi-grid' }));
  const rashiTileIds = new Set(
    tree.root
      .findAll((node) => /^namkaran-rashi-\d+$/.test(node.props.testID ?? ''))
      .map((node) => node.props.testID)
  );
  assert.equal(rashiTileIds.size, 12);

  await act(async () => {
    tree.root.findAllByProps({ accessibilityLabel: 'Makara. Tap to open.' }).find((node) => typeof node.props.onPress === 'function')?.props.onPress();
  });
  const call = mockNavigation.navigate.mock.calls.at(-1);
  assert.equal(call?.[0], 'NamkaranRashi');
  assert.equal(call?.[1]?.rashiIndex, 9);
  // The rashi door must never write or request birth details.
  assert.equal(mockNavigation.navigate.mock.calls.some((entry) => entry[1]?.basis?.kind === 'birth'), false);
  await unmountFlatListTree(tree);
});

test('the rashi cross-check is nine tappable charanas, not a flattened syllable strip', async () => {
  // Makara holds Shravana's dual ज/ख charanas: nine charanas, thirteen
  // syllables. Flattening would render thirteen cells and break the 3×3 grid.
  mockComputeState = { status: 'result', result: calculateNamkaran({ kind: 'manual', nakshatraIndex: 20, pada: 2 }) };
  assert.equal(rashiSyllables(9).length, 13);
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="en">
        <NamkaranResultScreen
          navigation={mockNavigation as any}
          route={{ key: 'NamkaranResult-makara', name: 'NamkaranResult', params: { basis: { kind: 'manual', nakshatraIndex: 20, pada: 2 } } } as any}
        />
      </GitaLanguageProvider>
    );
    await Promise.resolve();
    await Promise.resolve();
  });
  const cellIds = new Set(
    tree.root
      .findAll((node) => /^namkaran-rashi-sound-\d+$/.test(node.props.testID ?? ''))
      .map((node) => node.props.testID as string)
  );
  assert.equal(cellIds.size, 9);
  assert.equal(new Set(tree.root.findAll((node) => /^namkaran-rashi-card-\d+$/.test(node.props.testID ?? '')).map((node) => node.props.testID as string)).size, 1);

  await act(async () => {
    tree.root.findByProps({ testID: 'namkaran-rashi-sound-84' }).props.onPress();
  });
  const cellCall = mockNavigation.navigate.mock.calls.at(-1);
  assert.equal(cellCall?.[0], 'NamkaranResult');
  assert.deepEqual(cellCall?.[1]?.basis, { kind: 'manual', nakshatraIndex: 21, pada: 1 });

  await act(async () => {
    tree.root.findByProps({ accessibilityLabel: 'Open Makara rashi naming detail' }).props.onPress();
  });
  const detailCall = mockNavigation.navigate.mock.calls.at(-1);
  assert.equal(detailCall?.[0], 'NamkaranRashi');
  assert.equal(detailCall?.[1]?.rashiIndex, 9);
  await unmountFlatListTree(tree);
});

test('an unknown-time day that crosses a rashi boundary shows every rashi it touched', async () => {
  const start = Date.parse('2026-08-12T18:30:00.000Z');
  const candidates = charanaSetForDay('2026-08-13', (date) => (28 + ((date.getTime() - start) / 86_400_000) * 15) % 360);
  assert.deepEqual(distinctRashiIndices(candidates), [0, 1]);
  mockComputeState = { status: 'result', result: { kind: 'range', candidates, conventionVersion: 1 } };
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="en">
        <NamkaranResultScreen
          navigation={mockNavigation as any}
          route={{ key: 'NamkaranResult-cross', name: 'NamkaranResult', params: { basis: { kind: 'birth', date: '2026-08-13', time: null } } } as any}
        />
      </GitaLanguageProvider>
    );
    await Promise.resolve();
    await Promise.resolve();
  });
  const cardIds = [...new Set(
    tree.root
      .findAll((node) => /^namkaran-rashi-card-\d+$/.test(node.props.testID ?? ''))
      .map((node) => node.props.testID as string)
  )];
  assert.deepEqual(cardIds, ['namkaran-rashi-card-0', 'namkaran-rashi-card-1']);
  assert.ok(textOf(tree).includes('The Moon also changed rashi during this day'));
  // Still no hero and no exact share — showing both rashis must not smuggle a rank back in.
  assert.equal(tree.root.findAllByProps({ accessibilityLabel: 'Preview privacy-safe Namkaran share card' }).length, 0);
  await unmountFlatListTree(tree);
});

test('the rashi detail lists nine charanas grouped by nakshatra and opens each one', async () => {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="en">
        <NamkaranRashiScreen
          navigation={mockNavigation as any}
          route={{ key: 'NamkaranRashi-mesha', name: 'NamkaranRashi', params: { rashiIndex: 0 } } as any}
        />
      </GitaLanguageProvider>
    );
    await Promise.resolve();
    await Promise.resolve();
  });
  assert.ok(tree.root.findByProps({ testID: 'namkaran-rashi-summary' }));
  const rowIds = new Set(
    tree.root
      .findAll((node) => /^namkaran-rashi-charana-\d+$/.test(node.props.testID ?? ''))
      .map((node) => node.props.testID as string)
  );
  assert.equal(rowIds.size, 9);
  // Mesha spans Ashwini, Bharani, and Krittika pada 1 — the grouping is by nakshatra.
  const groupIds = new Set(tree.root.findAll((node) => /^namkaran-rashi-group-\d+$/.test(node.props.testID ?? '')).map((node) => node.props.testID));
  assert.deepEqual([...groupIds].sort(), ['namkaran-rashi-group-1', 'namkaran-rashi-group-2', 'namkaran-rashi-group-3']);
  assert.equal(textOf(tree).includes('9 charanas · 9 sounds'), true);

  await act(async () => {
    tree.root.findByProps({ testID: 'namkaran-rashi-charana-0' }).props.onPress();
  });
  const call = mockNavigation.navigate.mock.calls.at(-1);
  assert.equal(call?.[0], 'NamkaranResult');
  assert.deepEqual(call?.[1]?.basis, { kind: 'manual', nakshatraIndex: 0, pada: 1 });
  // The detail is convention data only — it must not surface birth fields or review state.
  assert.equal(textOf(tree).includes('namakshar-v1'), false);
  assert.equal(textOf(tree).includes('DRAFT'), false);
  await unmountFlatListTree(tree);
});
