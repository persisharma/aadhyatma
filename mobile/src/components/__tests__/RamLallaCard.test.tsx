import React from 'react';
import { Image } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import SuvicharCard from '../SuvicharCard';
import { parseSuvicharPreferences, suvicharArtRequest, suvicharDeities, suvicharFrames, suvicharFooterBand, suvicharHeroFraction } from '@/data/suvichar';
import { suvicharTemplatesFor } from '@/data/suvicharTemplates';
import { suvicharThoughtsFor } from '@/data/suvicharContent';
import { suvicharVaarFor } from '@/data/suvicharVaar';
import { contentByLang } from '@/utils/localize';
jest.mock('@/utils/backgroundAssetCache', () => ({
  subscribeBackgroundAsset: jest.fn((request, cb) => { cb(`file:///${request.key}.${request.ext}`); return () => undefined; }),
  evictBackgroundAsset: jest.fn(),
}));
let tree: ReactTestRenderer;
afterEach(() => { if (tree) act(() => tree.unmount()); });

it('offers Ayodhya Ram Lalla separately, with one cached photograph across all frames and Ram content', () => {
  expect(suvicharDeities.find(d => d.id === 'ram-lalla')).toMatchObject({ hi: 'राम लला · अयोध्या', en: 'Ram Lalla · Ayodhya' });
  const requests = suvicharFrames.map(f => suvicharArtRequest('ram-lalla', f.id));
  expect(requests.every(r => r && r.ext === 'jpg')).toBe(true);
  expect(new Set(requests.map(r => r?.key)).size).toBe(1);
  expect(suvicharTemplatesFor(0).some(t => t.deity === 'ram-lalla')).toBe(true);
  expect(suvicharTemplatesFor(0).find(t => t.deity === 'hanuman')?.frame).toBe('mandir-jharokha');
  expect(suvicharTemplatesFor(0).find(t => t.deity === 'shiva')?.frame).toBe('pushp-aangan');
  expect(suvicharThoughtsFor('ram-lalla').some(t => t.family === 'rama')).toBe(true);
  expect(suvicharVaarFor(new Date(2026, 10, 12))?.deities).toContain('ram-lalla');
  const favorite = { deity: 'ram-lalla', frame: 'pushp-aangan', name: 'Sharma family', message: 'जय श्रीराम' };
  expect(parseSuvicharPreferences(JSON.stringify({ ...favorite, favorites: [favorite] }))).toMatchObject({ ...favorite, favorites: [favorite] });
});

it.each(suvicharFrames.flatMap(f => (['hi', 'en', 'gu', 'kn'] as const).flatMap(lang => [320, 540].map(width => ({ frame: f.id, lang, width })))))(
  'uses the actual photo in $frame/$lang/$width, waits for decode and preserves full text', ({ frame, lang, width }) => {
    const ready = jest.fn();
    const message = contentByLang(lang, 'श्रद्धा रखिए और प्रेम बाँटिए। '.repeat(8), 'Keep faith and share kindness. '.repeat(8));
    act(() => { tree = create(<SuvicharCard deity="ram-lalla" frame={frame} message={message} name="Sharma family" lang={lang} width={width} onReady={ready} />); });
    const photo = tree.root.findByProps({ testID: 'suvichar-card-deity-photo' });
    expect(photo.props.source.uri).toMatch(/\.jpg$/);
    expect(photo.props.resizeMode).toBe('stretch'); // explicit source aspect; top aligned, crown never centre-cropped
    expect(photo.props.style.height / photo.props.style.width).toBeCloseTo(1619 / 960);
    expect(tree.root.findByProps({ testID: 'suvichar-card-message' }).props.children).toBe(message);
    expect(tree.root.findByProps({ testID: 'suvichar-card-photo-credit' }).props.children).toContain('GODL-India');
    const fixed = width * 1.25 * (suvicharHeroFraction('ram-lalla', frame) + 1 - suvicharFooterBand(frame, 'ram-lalla').start);
    act(() => tree.root.findByProps({ testID: 'suvichar-card-body' }).props.onLayout({ nativeEvent: { layout: { height: 500 } } }));
    act(() => tree.root.findByProps({ testID: 'suvichar-card' }).props.onLayout({ nativeEvent: { layout: { height: fixed + 500 } } }));
    act(() => tree.root.findAllByType(Image).filter(i => i.props.testID !== 'suvichar-card-deity-photo').forEach(i => i.props.onLoad()));
    expect(ready).toHaveBeenLastCalledWith(false);
    act(() => photo.props.onLoad()); expect(ready).toHaveBeenLastCalledWith(true);
    act(() => photo.props.onError()); expect(ready).toHaveBeenLastCalledWith(false);
  });
