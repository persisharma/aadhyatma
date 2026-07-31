import assert from 'node:assert/strict';

type ChapterSummary = { verseCount: number };

const cases = [
  {
    id: 'durga-stotram',
    expectedTotal: 33,
    load: async () => {
      const mod = await import('./durga-stotram');
      return {
        manifest: mod.durgaStotramChaptersManifest,
        total: mod.durgaStotramTotal,
      };
    },
  },
  {
    id: 'ganesh-stotram',
    expectedTotal: 28,
    load: async () => {
      const mod = await import('./ganesh-stotram');
      return {
        manifest: mod.ganeshStotramChaptersManifest,
        total: mod.ganeshStotramTotal,
      };
    },
  },
  {
    id: 'ram-stuti',
    expectedTotal: 9,
    load: async () => {
      const mod = await import('./ram-stuti');
      return {
        manifest: mod.ramStutiChaptersManifest,
        total: mod.ramStutiTotal,
      };
    },
  },
  {
    id: 'hanuman-ashtak',
    expectedTotal: 9,
    load: async () => {
      const mod = await import('./hanuman-ashtak');
      return {
        manifest: mod.hanumanAshtakChaptersManifest,
        total: mod.hanumanAshtakTotal,
      };
    },
  },
  {
    id: 'vishnu-sahasranama',
    expectedTotal: 79,
    load: async () => {
      const mod = await import('./vishnu-sahasranama');
      return {
        manifest: mod.vishnuSahasranamaChaptersManifest,
        total: mod.vishnuSahasranamaTotal,
      };
    },
  },
  {
    id: 'valmiki-ramayan',
    expectedTotal: 27,
    load: async () => {
      const mod = await import('./valmiki-ramayan');
      return {
        manifest: mod.valmikiRamayanChaptersManifest,
        total: mod.valmikiRamayanTotal,
      };
    },
  },
  {
    id: 'shiva-strotam',
    expectedTotal: 23,
    load: async () => {
      const mod = await import('./shiva-strotam');
      return {
        manifest: mod.shivaStrotamChaptersManifest,
        total: mod.shivaStrotamTotal,
      };
    },
  },
];

(async () => {
  for (const content of cases) {
    const { manifest, total } = await content.load();
    const manifestTotal = (manifest as readonly ChapterSummary[]).reduce(
      (sum, chapter) => sum + chapter.verseCount,
      0
    );

    assert.equal(total, manifestTotal, `${content.id} total should match manifest`);
    assert.equal(total, content.expectedTotal, `${content.id} expected total changed`);
  }
})().catch((error) => {
  throw error;
});
