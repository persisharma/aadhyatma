import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Pitru Smaran standing discovery', () => {
  test('Home always registers a zero-state DISCOVER card that opens the ledger', () => {
    const source = fs.readFileSync(path.resolve(__dirname, '..', 'HomeScreen.tsx'), 'utf8');
    expect(source).toMatch(/key: 'pitru-smaran'/);
    expect(source).toMatch(/moreTabTarget\('PitruSmaranList'\)/);
    expect(source).toMatch(/Save a tithi once and know its shraddha date every year/);
  });

  test('the Panchang ledger invitation cannot be dismissed while empty', () => {
    const source = fs.readFileSync(path.resolve(__dirname, '..', 'PanchangScreen.tsx'), 'utf8');
    expect(source).toMatch(/Pitru Smaran\. \$\{entries\.length > 0/);
    expect(source).not.toMatch(/pitru-ledger-invitation-dismissed|Dismiss Pitru Smaran invitation/);
  });
});
