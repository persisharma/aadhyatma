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

it('offers the approved generated Ram Lalla separately, from R2 across every frame and Ram content', () => {
  expect(suvicharDeities.find(d => d.id === 'ram-lalla')).toMatchObject({ hi: 'श्री राम लला', en: 'Shri Ram Lalla' });
  const requests = suvicharFrames.map(f => suvicharArtRequest('ram-lalla', f.id));
  expect(requests.every(r => r && r.ext === 'webp' && r.remoteUrl.includes('cdn.vedansh.app/suvichar-portraits/'))).toBe(true);
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
  'uses the approved front-facing art in $frame/$lang/$width, waits for decode and preserves full text', ({ frame, lang, width }) => {
    const ready = jest.fn();
    const message = contentByLang(lang, 'श्रद्धा रखिए और प्रेम बाँटिए। '.repeat(8), 'Keep faith and share kindness. '.repeat(8));
    act(() => { tree = create(<SuvicharCard deity="ram-lalla" frame={frame} message={message} name="Sharma family" lang={lang} width={width} onReady={ready} />); });
    const photo = tree.root.findAllByType(Image).find(i => i.props.testID === 'suvichar-card-deity-photo')!;
    expect(photo.props.source.uri).toMatch(/\.webp$/);
    expect(photo.props.resizeMode).toBe('stretch'); // explicit source aspect; the shared clip excludes baked message/sender text
    expect(photo.props.style.height / photo.props.style.width).toBeCloseTo(1402 / 1122);
    const clip = tree.root.findByProps({ testID: 'suvichar-card-deity-photo-crop' }).props.style;
    expect(clip.overflow).toBe('hidden');
    expect(-photo.props.style.top / photo.props.style.height).toBeCloseTo(.082);
    expect((clip.height - photo.props.style.top) / photo.props.style.height).toBeCloseTo(.564);
    expect(tree.root.findByProps({ testID: 'suvichar-card-message' }).props.children).toBe(message);
    expect(tree.root.findAllByProps({ testID: 'suvichar-card-photo-credit' })).toHaveLength(0);
    expect(tree.root.findByProps({ testID: 'suvichar-card-deity-name' }).props.children).not.toMatch(/Ayodhya|अयोध्या/);
    const fixed = width * 1.25 * (suvicharHeroFraction('ram-lalla', frame) + 1 - suvicharFooterBand(frame, 'ram-lalla').start);
    act(() => tree.root.findByProps({ testID: 'suvichar-card-body' }).props.onLayout({ nativeEvent: { layout: { height: 500 } } }));
    act(() => tree.root.findByProps({ testID: 'suvichar-card' }).props.onLayout({ nativeEvent: { layout: { height: fixed + 500 } } }));
    act(() => tree.root.findAllByType(Image).filter(i => i.props.testID !== 'suvichar-card-deity-photo').forEach(i => i.props.onLoad()));
    expect(ready).toHaveBeenLastCalledWith(false);
    act(() => photo.props.onLoad()); expect(ready).toHaveBeenLastCalledWith(true);
    act(() => photo.props.onError()); expect(ready).toHaveBeenLastCalledWith(false);
  });
