import fs from 'node:fs';
import path from 'node:path';

describe('Home category grid', () => {
  const source = fs.readFileSync(path.resolve(__dirname, '..', 'HomeScreen.tsx'), 'utf8');

  test('closes with a full-width Daan-Punya card and no duplicate Sadhana tile', () => {
    expect(source).not.toContain('const nityaSadhnaTile');
    expect(source).not.toContain('result.push(nityaSadhnaTile)');
    expect(source).toMatch(/const daanTile: TileItem = \{[\s\S]*?fullWidth: true,[\s\S]*?DaanPunya/);
    expect(source).toContain(
      'style={{ width: tile.fullWidth ? gridWidth : tileWidth }}'
    );
  });
});

describe('Home "और जानें" row', () => {
  const source = fs.readFileSync(path.resolve(__dirname, '..', 'HomeScreen.tsx'), 'utf8');
  const list = source.slice(source.indexOf('const spotlights'), source.indexOf('const shuffleSeed'));

  test('offers every discovery card, not a fixed pair', () => {
    const keys = [...list.matchAll(/key: '([a-z-]+)'/g)].map(match => match[1]);
    expect(keys).toEqual(['darshan', 'puja-vidhi', 'routine', 'daily-bhakti', 'daan-punya', 'sankalp',
      'pitru-smaran', 'jijnasa', 'theerth', 'home-widgets']);
    expect(source).toContain('testID="home-discover-carousel"');
    expect(source).toContain('testID={`home-discover-${item.key}`}');
  });

  test('reshuffles the cards once per app open and keeps the order while Home stays mounted', () => {
    expect(source).toContain('const shuffleSeed = React.useMemo(() => Date.now(), []);');
    expect(source).toContain('const orderedSpotlights = shuffleBySeed(spotlights, shuffleSeed);');
    expect(source).toContain('{orderedSpotlights.map(');
  });
});
