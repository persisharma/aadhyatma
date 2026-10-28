import dailyManifest from '../devotionalShareManifest.json';
import suvicharManifest from '../suvicharManifest.json';
import sources from '../../../../docs/evaluations/mahakaal/sources.json';

afterEach(() => {
  jest.dontMock('../devotionalShareManifest.json');
  jest.dontMock('../suvicharManifest.json');
});

it.each([0, 1, 2, 3])('offers Mahakaal only with all three published frames (%i present)', count => {
  const frames = ['mandir-jharokha', 'pushp-aangan', 'bhakti-patra'] as const;
  const assets = { ...suvicharManifest.assets } as Record<string, { hash: string; ext: string }>;
  for (const frame of frames) delete assets[`mahakaal--${frame}`];
  for (const frame of frames.slice(0, count)) assets[`mahakaal--${frame}`] = { hash: sources[frame].sha256.slice(0, 16), ext: 'webp' };
  jest.doMock('../suvicharManifest.json', () => ({ prefix: 'suvichar', assets }));
  jest.isolateModules(() => {
    const { suvicharDeities } = require('../suvichar');
    const { suvicharTemplatesFor } = require('../suvicharTemplates');
    const { suvicharVaarTemplates } = require('../suvicharVaar');
    expect(suvicharDeities.some((d: { id: string }) => d.id === 'mahakaal')).toBe(count === 3);
    expect(suvicharTemplatesFor(0).filter((t: { deity: string }) => t.deity === 'mahakaal')).toHaveLength(count === 3 ? 1 : 0);
    const monday = suvicharVaarTemplates(new Date(2026, 9, 26));
    expect(monday.filter((t: { deity: string }) => t.deity === 'mahakaal').map((t: { frame: string }) => t.frame)).toEqual(count === 3 ? frames : []);
  });
});

it.each([false, true])('uses the shrine for lingam prayers only after verified publication (%s)', published => {
  const assets = { ...dailyManifest.assets } as Record<string, unknown>;
  delete assets.mahakaal;
  if (published) assets.mahakaal = { hash: sources.daily.sha256.slice(0, 16), ext: 'webp', width: 1080, height: 1456 };
  jest.doMock('../devotionalShareManifest.json', () => ({ prefix: 'devotional-share', assets }));
  jest.isolateModules(() => {
    const { devotionalArtForVerse, devotionalArtRequest } = require('../devotionalShareArt');
    for (const sourceId of ['lingashtakam', 'om-namah-shivaya']) {
      expect(devotionalArtForVerse({ sourceId, verseIndex: 0 })).toBe(published ? 'mahakaal' : 'shiva');
    }
    expect(devotionalArtForVerse({ sourceId: 'shiva-strotam', verseIndex: 0 })).toBe('shiva');
    expect(devotionalArtForVerse({ sourceId: 'bhagavad-gita', verseIndex: 0 })).toBe('krishna');
    expect(!!devotionalArtRequest('mahakaal')).toBe(published);
  });
});
