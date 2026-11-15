import fs from 'node:fs';
import path from 'node:path';

/**
 * Android store builds embed every font the app registers, so none is loaded at
 * runtime behind the launch gate (`App.tsx` `useFonts`).
 *
 * How that works, and therefore what has to stay true:
 *
 *   - the `expo-font` config plugin copies each listed file to the binary's
 *     `assets/fonts/`;
 *   - at startup `expo-font` reports a family for every file there, named by
 *     its FILE NAME (minus an optional `_bold` / `_italic` / `_bold_italic`
 *     suffix and the extension);
 *   - `useFonts` asks whether every family in its map is already loaded, and if
 *     so returns `true` on the first render without loading anything.
 *
 * So the gate only disappears if the embedded list and the `useFonts` map name
 * exactly the same families. One font added to `App.tsx` and not here would put
 * the whole runtime load back for that build — silently.
 */
const root = path.resolve(__dirname, '../../..');
const { expo } = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));

const fontPlugin = (expo.plugins as unknown[]).find(
  (plugin): plugin is [string, { android?: { fonts?: string[] }; fonts?: string[]; ios?: { fonts?: string[] } }] =>
    Array.isArray(plugin) && plugin[0] === 'expo-font'
);
const embedded: string[] = fontPlugin?.[1].android?.fonts ?? [];

/** expo-font's own rule for the family a file in `assets/fonts/` registers (FontLoaderModule.kt). */
const familyOf = (file: string) => /^(.+?)(_bold|_italic|_bold_italic)?\.(ttf|otf)$/.exec(path.basename(file))?.[1];

/** The families `App.tsx` hands to `useFonts`. */
function registeredFamilies(): string[] {
  const app = fs.readFileSync(path.join(root, 'App.tsx'), 'utf8');
  const map = /useFonts\(\{([\s\S]*?)\}\)/.exec(app);
  if (!map) throw new Error('App.tsx no longer calls useFonts({...})');
  return map[1]
    .split('\n')
    .map((line) => /^\s*([A-Za-z0-9_]+)\s*[:,]/.exec(line)?.[1])
    .filter((name): name is string => !!name);
}

test('the embedded list is Android-only: iOS names families differently', () => {
  // On iOS an embedded font is addressed by its PostScript name, not its file
  // name, so embedding there would not satisfy `useFonts` and is out of scope.
  expect(fontPlugin).toBeDefined();
  expect(fontPlugin![1].fonts).toBeUndefined();
  expect(fontPlugin![1].ios).toBeUndefined();
});

test('every embedded font file exists', () => {
  expect(embedded.length).toBeGreaterThan(0);
  for (const file of embedded) expect(fs.existsSync(path.join(root, file))).toBe(true);
});

test('the embedded families are exactly the families useFonts registers', () => {
  const families = embedded.map(familyOf);
  expect(families.every(Boolean)).toBe(true);
  expect(new Set(families).size).toBe(families.length);
  expect([...families].sort()).toEqual(registeredFamilies().sort());
});

test('no file name ends in a suffix Android would strip from the family name', () => {
  for (const file of embedded) {
    expect(familyOf(file)).toBe(path.basename(file).replace(/\.(ttf|otf)$/, ''));
  }
});
