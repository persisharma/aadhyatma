import fs from 'fs';
import path from 'path';

// RULEBOOK §3 "List thumbnails are painted art": a card thumbnail shows the
// Storybook painting for its deity or category (DeityIcon / CategoryIcon /
// StoryIcon), never a Devanagari letter in a tile. Subjects with no painting
// yet are listed in docs/icon-briefs/ and are the only allowed exceptions.
const LETTER_TILE_EXCEPTIONS = new Set([
  // Not icons: the first syllable is the subject of a name search, and a date tile is data.
  'screens/NamkaranScreen.tsx',
  'screens/NamkaranResultScreen.tsx',
  'screens/NamkaranRashiScreen.tsx',
  'screens/AbujhDaysScreen.tsx',
]);

const root = path.join(__dirname, '../..');
function sources(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(item => {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) return item.name === '__tests__' ? [] : sources(full);
    return item.name.endsWith('.tsx') ? [full] : [];
  });
}

test('no card renders a data letter-thumb (`.thumb`) or the thumb type size as text', () => {
  const offenders: string[] = [];
  for (const file of [...sources(path.join(root, 'screens')), ...sources(path.join(root, 'components'))]) {
    const relative = path.relative(root, file);
    if (LETTER_TILE_EXCEPTIONS.has(relative)) continue;
    const source = fs.readFileSync(file, 'utf8').replace(
      // Only the rendered civil date is data; other CardThumb text remains guarded.
      /<CardThumb>\s*<Text\b[^>]*>\s*\{d\.getDate\(\)\}\s*<\/Text>\s*<\/CardThumb>/g,
      '<CardThumb />',
    );
    if (/<Text\b[^>]*>\s*\{\s*[\w.?]+\.thumb\s*\}\s*<\/Text>/s.test(source)) offenders.push(`${relative}: renders .thumb as text`);
    if (/typography\.thumb\.fontSize/.test(source)) offenders.push(`${relative}: sizes a letter tile`);
    if (/\.charAt\(0\)\s*\}\s*<\/Text>/.test(source)) offenders.push(`${relative}: renders a first letter`);
    if (/<CardThumb>\s*<Text\b/.test(source)) offenders.push(`${relative}: puts text in a CardThumb`);
  }
  expect(offenders).toEqual([]);
});

test('the screens converted from letter tiles render painted art', () => {
  for (const file of ['screens/SadhanaProgramListScreen.tsx', 'screens/VidhiCatalogScreen.tsx', 'screens/RoutineAddItemsScreen.tsx']) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    expect(source).toContain("from '@/components/DeityIcon'");
  }
});
