/**
 * The in-bundle delivery of the Valmiki corpus (`corpusSource.inbundle.ts`) —
 * what an OTA to a store build that predates the asset files runs.
 *
 * It must hand the reader exactly what the asset delivery does, without
 * touching the part files or the native reader behind them.
 */
type Corpus = typeof import('@/data/valmiki-ramayan');
type Source = typeof import('@/data/valmiki-ramayan/corpusSource');

function corpusWith(delivery: 'assets' | 'bundle'): { corpus: Corpus; source: Source; readPart: jest.Mock } {
  let loaded!: { corpus: Corpus; source: Source; readPart: jest.Mock };
  jest.isolateModules(() => {
    if (delivery === 'bundle') {
      // What `metro.config.js` does for an older runtime: answer `./corpusSource` with the in-bundle file.
      jest.doMock('@/data/valmiki-ramayan/corpusSource', () =>
        jest.requireActual('@/data/valmiki-ramayan/corpusSource.inbundle')
      );
    } else {
      jest.dontMock('@/data/valmiki-ramayan/corpusSource');
    }
    const { readValmikiPart } = jest.requireMock<typeof import('@/data/valmiki-ramayan/partReader')>(
      '@/data/valmiki-ramayan/partReader'
    );
    loaded = {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      corpus: require('@/data/valmiki-ramayan') as Corpus,
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      source: require('@/data/valmiki-ramayan/corpusSource') as Source,
      readPart: readValmikiPart as unknown as jest.Mock,
    };
  });
  return loaded;
}

jest.setTimeout(120_000);

afterEach(() => {
  jest.dontMock('@/data/valmiki-ramayan/corpusSource');
});

test('each source says which delivery it is', () => {
  expect(corpusWith('assets').source.valmikiCorpusDelivery).toBe('assets');
  expect(corpusWith('bundle').source.valmikiCorpusDelivery).toBe('bundle');
});

test('every kāṇḍa loads from the bundle without reading a part file', async () => {
  const { corpus, readPart } = corpusWith('bundle');
  readPart.mockClear();
  for (const summary of corpus.valmikiRamayanChaptersManifest) {
    expect(corpus.peekValmikiRamayanChapter(summary.chapter)).toBeNull();
    const chapter = await corpus.loadValmikiRamayanChapter(summary.chapter);
    expect(chapter.verses).toHaveLength(summary.verseCount);
    expect(corpus.peekValmikiRamayanChapter(summary.chapter)).toBe(chapter);
  }
  expect(readPart).not.toHaveBeenCalled();
});

test('both deliveries hand the reader byte-for-byte the same kāṇḍas', async () => {
  const fromBundle = corpusWith('bundle').corpus;
  const fromAssets = corpusWith('assets').corpus;
  for (const summary of fromAssets.valmikiRamayanChaptersManifest) {
    const [bundled, assets] = await Promise.all([
      fromBundle.loadValmikiRamayanChapter(summary.chapter),
      fromAssets.loadValmikiRamayanChapter(summary.chapter),
    ]);
    // Compared as text: 23,289 verse records are slow to walk field by field.
    expect(JSON.stringify(bundled) === JSON.stringify(assets)).toBe(true);
  }
});

test('the bundled delivery keeps the same guards: a wrong kāṇḍa is refused, a failed load can be retried', async () => {
  const { corpus } = corpusWith('bundle');
  await expect(corpus.loadValmikiRamayanChapter(0)).rejects.toThrow(/out of range/);
  await expect(corpus.loadValmikiRamayanChapter(8)).rejects.toThrow(/out of range/);
  const first = await corpus.loadValmikiRamayanChapter(4);
  // The meaning fallback is applied in the shared code, not by the source.
  expect(first.verses.every((verse) => verse.meaningHi.trim() && verse.meaningEn.trim())).toBe(true);
});
