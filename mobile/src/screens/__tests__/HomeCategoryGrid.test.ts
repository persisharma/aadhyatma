import fs from 'node:fs';
import path from 'node:path';

describe('Home category grid', () => {
  const source = fs.readFileSync(path.resolve(__dirname, '..', 'HomeScreen.tsx'), 'utf8');

  test('closes with a full-width Daan-Punya card and no duplicate Sadhana tile', () => {
    expect(source).not.toContain('const nityaSadhnaTile');
    expect(source).not.toContain('result.push(nityaSadhnaTile)');
    expect(source).toMatch(/const daanTile: TileItem = \{[\s\S]*?fullWidth: true,[\s\S]*?DaanPunya/);
    expect(source).toContain(
      'style={{ width: tile.fullWidth ? tileWidth * 3 + 2 * gridGap : tileWidth }}'
    );
  });
});
