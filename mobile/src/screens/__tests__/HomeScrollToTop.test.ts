import fs from 'node:fs';
import path from 'node:path';

// Reselecting the Home tab while Home is showing scrolls the page back to the
// top (design.md §18). React Navigation's useScrollToTop does the work; this
// pins that Home hands it the page ScrollView, not an inner horizontal row.
it('scrolls the Home page to the top when the Home tab is reselected', () => {
  const source = fs.readFileSync(path.resolve(__dirname, '../HomeScreen.tsx'), 'utf8');
  expect(source).toMatch(/import \{[^}]*\buseScrollToTop\b[^}]*\} from '@react-navigation\/native'/);
  expect(source).toMatch(/useScrollToTop\(homeScrollRef\)/);
  expect(source).toMatch(/<ScrollView\s+ref=\{homeScrollRef\}/);
});
