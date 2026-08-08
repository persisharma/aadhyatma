import assert from 'node:assert/strict';
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';

import { GitaLanguageProvider } from '@/data/gita/language';

const mockNavigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
  setParams: jest.fn(),
};

const mockTakePicture = jest.fn(() =>
  Promise.resolve({ uri: 'file:///cache/palm-temp.jpg' })
);
const mockRequestPermission = jest.fn(() =>
  Promise.resolve({ granted: true })
);
let mockPermission: { granted: boolean } | null = { granted: true };

const mockDeleteAsync = jest.fn(
  (_uri: string, _options?: { idempotent?: boolean }) => Promise.resolve()
);
let mockSuggestions: Record<string, string> | null = null;

jest.mock('expo-camera', () => ({
  CameraView: mockReact.forwardRef(
    (
      props: React.PropsWithChildren<Record<string, unknown>>,
      ref: React.Ref<unknown>
    ) => {
      mockReact.useImperativeHandle(ref, () => ({
        takePictureAsync: mockTakePicture,
      }));
      return mockReact.createElement(mockView, props, props.children);
    }
  ),
  useCameraPermissions: () => [mockPermission, mockRequestPermission],
}));

jest.mock('expo-file-system/legacy', () => ({
  deleteAsync: (uri: string, options?: { idempotent?: boolean }) =>
    mockDeleteAsync(uri, options),
}));

jest.mock('@/panchang/palmSuggestions', () => ({
  palmSuggestionProvider: () => Promise.resolve(mockSuggestions),
}));

const HastRekhaCameraScreen = jest.requireActual<
  typeof import('../HastRekhaCameraScreen')
>('../HastRekhaCameraScreen').default;

function render(): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="en">
        <HastRekhaCameraScreen
          navigation={mockNavigation as any}
          route={{ key: 'HastRekhaCamera-test', name: 'HastRekhaCamera' } as any}
        />
      </GitaLanguageProvider>
    );
  });
  return tree;
}

function textOf(tree: TestRenderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((node) => node.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');
}

async function press(
  tree: TestRenderer.ReactTestRenderer,
  props: Record<string, unknown>
): Promise<void> {
  await act(async () => {
    tree.root.findByProps(props).props.onPress();
  });
}

async function captureAndConfirmAll(
  tree: TestRenderer.ReactTestRenderer
): Promise<void> {
  await press(tree, { accessibilityLabel: 'Capture palm photo' });
  await press(tree, { testID: 'hastrekha-cam-heart-curved' });
  await press(tree, { testID: 'hastrekha-cam-head-long' });
  await press(tree, { testID: 'hastrekha-cam-life-broad' });
  await press(tree, { testID: 'hastrekha-cam-fate-defined' });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockPermission = { granted: true };
  mockSuggestions = null;
});

test('denied permission explains on-device privacy and offers the manual fallback', async () => {
  mockPermission = { granted: false };
  const tree = render();

  const text = textOf(tree);
  assert.ok(text.includes('never saved, never uploaded'));
  assert.ok(tree.root.findByProps({ accessibilityLabel: 'Allow camera access' }));

  await press(tree, { accessibilityLabel: 'Choose manually instead' });
  assert.equal(mockNavigation.goBack.mock.calls.length, 1);
});

test('capture shows the framing guidance, then the review confirms all four lines and hands back a prefill', async () => {
  const tree = render();

  assert.ok(textOf(tree).includes('never saved, never uploaded'));
  assert.ok(tree.root.findByProps({ accessibilityLabel: 'Capture palm photo' }));

  await captureAndConfirmAll(tree);
  assert.equal(mockTakePicture.mock.calls.length, 1);
  assert.ok(textOf(tree).includes('The guides are indicative'));

  await press(tree, { accessibilityLabel: 'Use these line choices' });
  const [routeName, params] = mockNavigation.navigate.mock.calls[0];
  assert.equal(routeName, 'HastRekha');
  assert.deepEqual(
    { ...params.prefill },
    { heart: 'curved', head: 'long', life: 'broad', fate: 'defined' }
  );
  // The temp photo is discarded on confirm — it must never outlive the flow.
  const [deletedUri, deleteOpts] = mockDeleteAsync.mock.calls[0];
  assert.equal(deletedUri, 'file:///cache/palm-temp.jpg');
  assert.equal(deleteOpts?.idempotent, true);
});

test('confirm stays disabled until every line is chosen', async () => {
  const tree = render();
  await press(tree, { accessibilityLabel: 'Capture palm photo' });
  await press(tree, { testID: 'hastrekha-cam-heart-curved' });

  const confirm = tree.root.findByProps({
    accessibilityLabel: 'Use these line choices',
  });
  assert.equal(confirm.props.accessibilityState.disabled, true);
  await act(async () => {
    confirm.props.onPress?.();
  });
  assert.equal(mockNavigation.navigate.mock.calls.length, 0);
});

test('retake deletes the temp photo and returns to the live preview', async () => {
  const tree = render();
  await press(tree, { accessibilityLabel: 'Capture palm photo' });

  await press(tree, { accessibilityLabel: 'Retake photo' });
  const [retakeUri] = mockDeleteAsync.mock.calls[0];
  assert.equal(retakeUri, 'file:///cache/palm-temp.jpg');
  assert.ok(tree.root.findByProps({ accessibilityLabel: 'Capture palm photo' }));
});

test('provider suggestions pre-select options but the user can still override', async () => {
  mockSuggestions = { heart: 'chained' };
  const tree = render();
  await press(tree, { accessibilityLabel: 'Capture palm photo' });

  assert.equal(
    tree.root.findByProps({ testID: 'hastrekha-cam-heart-chained' }).props
      .accessibilityState.selected,
    true
  );
  await press(tree, { testID: 'hastrekha-cam-heart-curved' });
  assert.equal(
    tree.root.findByProps({ testID: 'hastrekha-cam-heart-curved' }).props
      .accessibilityState.selected,
    true
  );
});

test('a failed capture surfaces a retry message instead of a broken review', async () => {
  mockTakePicture.mockImplementationOnce(() => Promise.reject(new Error('nope')));
  const tree = render();
  await press(tree, { accessibilityLabel: 'Capture palm photo' });

  assert.ok(textOf(tree).includes('couldn’t be taken'));
  assert.ok(tree.root.findByProps({ accessibilityLabel: 'Capture palm photo' }));
});
