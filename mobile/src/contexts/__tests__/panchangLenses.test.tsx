import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';

import {
  __resetCalendarSystemStoreForTests,
  useObservanceLenses,
  useObservanceLensesHydrated,
} from '@/panchang/usePanchang';

let resolveStored: (value: string | null) => void = () => undefined;
const mockSetItem = jest.fn(() => Promise.resolve());
jest.mock('@react-native-async-storage/async-storage', () => ({
  multiGet: jest.fn(
    (keys: string[]) => new Promise<[string, string | null][]>((resolve) => {
      resolveStored = (value) => resolve(keys.map((key) => [
        key,
        key === '@vedansh:panchang-lenses' ? value : null,
      ]));
    })
  ),
  setItem: (...args: unknown[]) => mockSetItem(...(args as [])),
}));
jest.mock('expo-location', () => ({}));

let latestSet: ReturnType<typeof useObservanceLenses>[1] | null = null;

function Probe({ id }: { id: string }) {
  const [lenses, setLenses] = useObservanceLenses();
  const hydrated = useObservanceLensesHydrated();
  latestSet = setLenses;
  return <Text>{`${id}:${lenses.join(',')}:${hydrated}`}</Text>;
}

function textOf(tree: TestRenderer.ReactTestRenderer): string {
  return tree.root.findAllByType(Text).map((node) => node.props.children).join(' ');
}

beforeEach(() => {
  __resetCalendarSystemStoreForTests();
  mockSetItem.mockClear();
  latestSet = null;
});

test('lens changes propagate, canonicalize, and persist once', () => {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<><Probe id="a" /><Probe id="b" /></>); });
  act(() => latestSet!(['tamil', 'jain', 'tamil']));
  expect(textOf(tree)).toBe('a:jain,tamil:false b:jain,tamil:false');
  expect(mockSetItem).toHaveBeenCalledWith('@vedansh:panchang-lenses', 'jain,tamil');
});

test('persisted lenses hydrate every subscriber and mark the gate settled', async () => {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<Probe id="a" />); });
  await act(async () => resolveStored('tamil,jain,tamil'));
  expect(textOf(tree)).toBe('a:jain,tamil:true');
});

test('late hydration cannot overwrite an explicit in-session lens choice', async () => {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<Probe id="a" />); });
  act(() => latestSet!(['gujarat']));
  await act(async () => resolveStored('jain'));
  expect(textOf(tree)).toBe('a:gujarat:true');
});
