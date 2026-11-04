import React from 'react';
import { Switch } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ShareBrandControls from '../ShareBrandControls';
import { SHARE_BRAND_KEY } from '@/data/shareBrand';
import { getShareBrand, hydrateShareBrand, resetShareBrandForTests } from '@/utils/shareBrandStore';

const flush = async () => { await act(async () => { await new Promise(r => setTimeout(r, 0)); }); };

beforeEach(async () => {
  await AsyncStorage.clear();
  resetShareBrandForTests();
});

async function mount(busy = false) {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => { tree = TestRenderer.create(<ShareBrandControls lang="hi" busy={busy} />); });
  await flush();
  return tree;
}
const byId = (tree: TestRenderer.ReactTestRenderer, id: string) => tree.root.findAllByProps({ testID: id }).filter(n => typeof n.type !== 'string');

it('switching on without a name opens the profile instead of printing an empty brand', async () => {
  const tree = await mount();
  const toggle = tree.root.findByType(Switch);
  expect(toggle.props.value).toBe(false);
  await act(async () => { toggle.props.onValueChange(true); });
  expect(tree.root.findByType(Switch).props.value).toBe(false);
  expect(byId(tree, 'share-brand-name').length).toBeGreaterThan(0);
  expect(getShareBrand().on).toBe(false);
  act(() => tree.unmount());
});

it('saving a name switches branding on, persists it and shows the summary', async () => {
  const tree = await mount();
  await act(async () => { tree.root.findByType(Switch).props.onValueChange(true); });
  await act(async () => { byId(tree, 'share-brand-name')[0].props.onChangeText('पं. रमेश शर्मा'); });
  await act(async () => { byId(tree, 'share-brand-title')[0].props.onChangeText('ज्योतिषाचार्य'); });
  await act(async () => { byId(tree, 'share-brand-save')[0].props.onPress(); });
  await flush();
  expect(getShareBrand()).toEqual({ on: true, name: 'पं. रमेश शर्मा', title: 'ज्योतिषाचार्य', contact: '' });
  expect(JSON.parse((await AsyncStorage.getItem(SHARE_BRAND_KEY))!)).toEqual(getShareBrand());
  expect(tree.root.findByType(Switch).props.value).toBe(true);
  expect(byId(tree, 'share-brand-summary').length).toBeGreaterThan(0);
  act(() => tree.unmount());
});

it('clearing the name switches branding off (the plain card returns)', async () => {
  await AsyncStorage.setItem(SHARE_BRAND_KEY, JSON.stringify({ on: true, name: 'पं. रमेश', title: '', contact: '' }));
  const tree = await mount();
  expect(tree.root.findByType(Switch).props.value).toBe(true);
  await act(async () => { byId(tree, 'share-brand-summary')[0].props.onPress(); });
  await act(async () => { byId(tree, 'share-brand-name')[0].props.onChangeText('  '); });
  await act(async () => { byId(tree, 'share-brand-save')[0].props.onPress(); });
  await flush();
  expect(getShareBrand().on).toBe(false);
  act(() => tree.unmount());
});

it('is disabled while a capture runs', async () => {
  const tree = await mount(true);
  expect(tree.root.findByType(Switch).props.disabled).toBe(true);
  act(() => tree.unmount());
});

it('a first-time profile starts from the Suvichar sender name but stays off', async () => {
  await AsyncStorage.setItem('@vedansh/suvichar/v1', JSON.stringify({ name: 'रमेश शर्मा' }));
  await hydrateShareBrand();
  expect(getShareBrand()).toEqual({ on: false, name: 'रमेश शर्मा', title: '', contact: '' });
});

it('a saved profile is never overwritten by the Suvichar name', async () => {
  await AsyncStorage.setItem(SHARE_BRAND_KEY, JSON.stringify({ on: false, name: '', title: '', contact: '' }));
  await AsyncStorage.setItem('@vedansh/suvichar/v1', JSON.stringify({ name: 'रमेश शर्मा' }));
  await hydrateShareBrand();
  expect(getShareBrand().name).toBe('');
});
