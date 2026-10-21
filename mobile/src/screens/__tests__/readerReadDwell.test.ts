import fs from 'fs';
import path from 'path';

/**
 * Read coverage is only as complete as the set of readers that feed it. The
 * reader bodies are copy-pasted (wiki: readers → Gotchas), so a reader
 * scaffolded without the dwell hook would silently never mark a verse read —
 * the same failure mode readerReadAloud.test.tsx guards for read-aloud. Every
 * screen that saves a reading position must also run the dwell rule, for the
 * same source id.
 */
const SCREENS_DIR = path.resolve(__dirname, '..');

const readers = fs
  .readdirSync(SCREENS_DIR)
  .filter((f) => f.endsWith('.tsx'))
  .map((f) => ({ file: f, src: fs.readFileSync(path.join(SCREENS_DIR, f), 'utf8') }))
  .filter(({ src }) => /\bsetProgress\(/.test(src));

test('the scan finds the reader screens', () => {
  expect(readers.length).toBeGreaterThanOrEqual(22);
});

test.each(readers.map((r) => [r.file, r.src]))('%s marks verses read via useReadDwell', (_file, src) => {
  expect(src).toMatch(/\buseReadDwell\(/);
  const progressSource = /setProgress\(\{\s*sourceId(?::\s*([^,\s]+))?/.exec(src);
  const dwellSource = /useReadDwell\(([^,]+),/.exec(src);
  expect(progressSource).not.toBeNull();
  expect(dwellSource).not.toBeNull();
  // `sourceId,` shorthand in setProgress means the variable is literally `sourceId`.
  expect(dwellSource![1].trim()).toBe(progressSource![1] ?? 'sourceId');
});
