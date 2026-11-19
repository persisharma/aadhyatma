import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Pitru Smaran standing discovery', () => {
  test('All features includes the family remembrance ledger before the first entry', () => {
    const source = fs.readFileSync(path.resolve(__dirname, '..', 'ReadingLibraryScreen.tsx'), 'utf8');
    expect(source).toContain('Family remembrance');
    expect(source).toMatch(/moreTabTarget\('PitruSmaranList'\)/);
  });

  test('the Panchang ledger invitation cannot be dismissed while empty', () => {
    const source = fs.readFileSync(path.resolve(__dirname, '..', 'PanchangScreen.tsx'), 'utf8');
    expect(source).toMatch(/Pitru Smaran\. \$\{entries\.length > 0/);
    expect(source).not.toMatch(/pitru-ledger-invitation-dismissed|Dismiss Pitru Smaran invitation/);
  });
});
