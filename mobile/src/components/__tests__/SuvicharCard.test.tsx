import React from 'react';
import { Image, Text } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import SuvicharCard from '../SuvicharCard';
import { suvicharBrandSlot, suvicharFooterBand, suvicharHeroFraction } from '@/data/suvichar';
import { subscribeBackgroundAsset } from '@/utils/backgroundAssetCache';
jest.mock('@/data/suvichar', () => ({ ...jest.requireActual('@/data/suvichar'), suvicharArtRequest: (deity: string) => deity === 'annapurna' ? null : ({ key: 'test', ext: 'webp', remoteUrl: 'https://cdn.vedansh.app/suvichar/test.webp' }) }));
jest.mock('@/utils/backgroundAssetCache', () => ({ subscribeBackgroundAsset: jest.fn((_: unknown, cb: (uri: string) => void) => { cb('file:///test.webp'); return () => undefined; }), evictBackgroundAsset: jest.fn() }));
let tree: ReactTestRenderer;
afterEach(() => { if (tree) act(() => tree.unmount()); });
function mount(ready: jest.Mock, name = 'शर्मा परिवार', message = 'श्रद्धा रखिए।') {
  act(() => { tree = create(<SuvicharCard deity="krishna" frame="mandir-jharokha" name={name} message={message} lang="hi" width={360} onReady={ready} />); });
}
// mandir-jharokha at 360 wide: fixed painting and footer slices around the measured body.
const fixed = 360 * 1.25 * (suvicharHeroFraction('krishna', 'mandir-jharokha') + 1 - suvicharFooterBand('mandir-jharokha').start);
function layout(body = 250, root = fixed + 250) {
  act(() => tree.root.findByProps({ testID: 'suvichar-card-body' }).props.onLayout({ nativeEvent: { layout: { height: body } } }));
  act(() => tree.root.findByProps({ testID: 'suvichar-card' }).props.onLayout({ nativeEvent: { layout: { height: root } } }));
}
it('waits for the three art slices and the brand mark to decode, and a matching final measured height', () => {
  const ready = jest.fn(); mount(ready); layout();
  const images = tree.root.findAllByType(Image);
  expect(images).toHaveLength(4);
  for (const image of images.slice(0, 3)) { act(() => image.props.onLoad()); expect(ready).toHaveBeenLastCalledWith(false); }
  act(() => images[3].props.onLoad()); expect(ready).toHaveBeenLastCalledWith(true);
  layout(800, fixed + 250); expect(ready).toHaveBeenLastCalledWith(false);
  layout(800, fixed + 800); expect(ready).toHaveBeenLastCalledWith(true);
});

it('keeps the link line inside the painted footer strip, unstretched, whatever the message length', () => {
  const band = suvicharFooterBand('mandir-jharokha');
  mount(jest.fn(), 'शर्मा परिवार', 'श्रद्धा और सेवा। '.repeat(20)); layout(900);
  const footer = tree.root.findByProps({ testID: 'suvichar-card-footer' });
  expect(footer.props.style.height).toBeCloseTo(450 * (1 - band.start));
  const art = footer.findByType(Image).props.style;
  expect(art.height).toBe(450); expect(art.top).toBeCloseTo(-450 * band.start);
  const line = footer.findAllByType(Text).map(t => [t.props.children].flat().join(''));
  expect(line).toEqual(['vedansh.app/get']);
  expect(tree.root.findByProps({ testID: 'suvichar-card-download' })).toBeTruthy();
  expect(tree.root.findByProps({ testID: 'suvichar-card-divider' })).toBeTruthy();
});

it('centres the same app-icon lockup in each frame’s painted top space', () => {
  mount(jest.fn());
  const slot = suvicharBrandSlot('mandir-jharokha');
  const brand = tree.root.findByProps({ testID: 'suvichar-card-brand' });
  expect(brand.props.style.top).toBeCloseTo(450 * slot.top); expect(brand.props.style.height).toBeCloseTo(450 * (slot.bottom - slot.top));
  const badge = brand.findByProps({ testID: 'suvichar-card-badge' });
  expect(badge.findAllByType(Text).map(t => t.props.children)).toEqual(['वेदांश']); expect(badge.findAllByType(Image)).toHaveLength(1);
  act(() => tree.update(<SuvicharCard deity="krishna" frame="bhakti-patra" name="" message="श्रद्धा रखिए।" lang="hi" width={360} onReady={jest.fn()} />));
  expect(tree.root.findByProps({ testID: 'suvichar-card-badge' }).findAllByType(Text).map(t => t.props.children)).toEqual(['वेदांश']);
});
it('refuses capture after native image decode failure', () => {
  const ready = jest.fn(); mount(ready); layout();
  act(() => tree.root.findAllByType(Image).forEach(image => image.props.onLoad()));
  expect(ready).toHaveBeenLastCalledWith(true);
  act(() => tree.root.findAllByType(Image)[0].props.onError());
  expect(ready).toHaveBeenLastCalledWith(false);
});
it('keeps complete editable content and omits an empty sender line', () => {
  const message = 'श्रद्धा और सेवा। '.repeat(20); mount(jest.fn(), '', message);
  expect(tree.root.findAllByProps({ testID: 'suvichar-card-sender' })).toHaveLength(0);
  expect(tree.root.findByProps({ testID: 'suvichar-card-message' }).props.children).toBe(message);
  expect(tree.root.findByProps({ testID: 'suvichar-card-message' }).props.numberOfLines).toBeUndefined();
});

it('reuses the artwork request while a sender is edited and remeasures the card', () => {
  jest.mocked(subscribeBackgroundAsset).mockClear();
  const ready = jest.fn(); mount(ready); layout();
  act(() => tree.root.findAllByType(Image).forEach(image => image.props.onLoad()));
  expect(ready).toHaveBeenLastCalledWith(true);
  act(() => tree.update(<SuvicharCard deity="krishna" frame="mandir-jharokha" name="New family" message="श्रद्धा रखिए।" lang="hi" width={360} onReady={ready} />));
  expect(ready).toHaveBeenLastCalledWith(false);
  expect(subscribeBackgroundAsset).toHaveBeenCalledTimes(1);
});

it('shows a weekday title in place of the label, and re-measures when the title changes', () => {
  const ready = jest.fn();
  act(() => { tree = create(<SuvicharCard deity="hanuman" frame="mandir-jharokha" name="" message="श्रद्धा रखिए।" title="शुभ मंगलवार" lang="hi" width={360} onReady={ready} />); });
  const title = tree.root.findByProps({ testID: 'suvichar-card-title' });
  expect(title.props.children).toBe('शुभ मंगलवार');
  expect(title.props.style[0].fontSize).toBe(26); expect(title.props.style[0].lineHeight).toBeCloseTo(26 * 1.65);
  const texts = tree.root.findAllByType(Text).map(t => [t.props.children].flat().join(''));
  expect(texts).not.toContain('आज का सुविचार');
  layout(); act(() => tree.root.findAllByType(Image).forEach(image => image.props.onLoad()));
  expect(ready).toHaveBeenLastCalledWith(true);
  act(() => tree.update(<SuvicharCard deity="hanuman" frame="mandir-jharokha" name="" message="श्रद्धा रखिए।" title="शुभ बुधवार" lang="hi" width={360} onReady={ready} />));
  expect(ready).toHaveBeenLastCalledWith(false);
});

it('prints the source label on the capture surface and invalidates readiness when attribution changes', () => {
  const ready=jest.fn();
  act(() => {tree=create(<SuvicharCard deity="krishna" frame="mandir-jharokha" name="" message="कर्तव्य निभाएँ।" attribution="गीता 2.47 · भावार्थ" lang="hi" width={360} onReady={ready}/>)});
  expect(tree.root.findByProps({testID:'suvichar-card-source'}).props.children).toBe('गीता 2.47 · भावार्थ');
  layout();act(() => tree.root.findAllByType(Image).forEach(i=>i.props.onLoad()));expect(ready).toHaveBeenLastCalledWith(true);
  act(() => tree.update(<SuvicharCard deity="krishna" frame="mandir-jharokha" name="" message="कर्तव्य निभाएँ।" attribution="गीता 2.48 · भावार्थ" lang="hi" width={360} onReady={ready}/>));
  expect(ready).toHaveBeenLastCalledWith(false);
});

it('makes only the explicit Annapurna text card shareable without borrowing a deity master', () => {
  const ready=jest.fn();
  act(() => { tree=create(<SuvicharCard deity="annapurna" frame="mandir-jharokha" name="" message="ज्ञान और वैराग्य की भिक्षा माँगिए।" attribution="अन्नपूर्णास्तोत्र 11 · प्रार्थना-भाव" lang="hi" width={360} onReady={ready}/>); });
  expect(tree.root.findAllByType(Image)).toHaveLength(1); // Real brand mark only.
  act(() => tree.root.findByProps({testID:'suvichar-card-body'}).props.onLayout({nativeEvent:{layout:{height:354.6}}}));
  act(() => tree.root.findByProps({testID:'suvichar-card'}).props.onLayout({nativeEvent:{layout:{height:450}}}));
  expect(ready).toHaveBeenLastCalledWith(false);
  act(() => tree.root.findByType(Image).props.onLoad());
  expect(ready).toHaveBeenLastCalledWith(true);
});
