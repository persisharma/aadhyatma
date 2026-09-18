import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Pitru Smaran standing discovery', () => {
  test('Home always carries a standing door into the ledger', () => {
    // Was a DISCOVER card; became a उपकरण tile when the carousel was retired
    // (TRD-42). The guarantee is unchanged and is why it is a TOOL rather than a
    // नया card: नया clears on open, and this door has to persist for a user who
    // has never saved a tithi.
    const tools = fs.readFileSync(
      path.resolve(__dirname, '..', '..', 'data', 'home', 'tools.ts'),
      'utf8'
    );
    expect(tools).toMatch(/id: 'pitru'/);

    const row = fs.readFileSync(
      path.resolve(__dirname, '..', '..', 'components', 'ToolsRow.tsx'),
      'utf8'
    );
    expect(row).toMatch(/moreTabTarget\('PitruSmaranList'\)/);
  });

  test('the Panchang ledger invitation cannot be dismissed while empty', () => {
    const source = fs.readFileSync(path.resolve(__dirname, '..', 'PanchangScreen.tsx'), 'utf8');
    expect(source).toMatch(/Pitru Smaran\. \$\{entries\.length > 0/);
    expect(source).not.toMatch(/pitru-ledger-invitation-dismissed|Dismiss Pitru Smaran invitation/);
  });
});
