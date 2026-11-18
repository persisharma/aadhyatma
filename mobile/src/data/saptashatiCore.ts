/** Traditional numbered units include speaker announcements and short refrains. */
export const saptashatiChapterIds = [
  'durga-saptashati-chapter-1',
  'durga-saptashati-chapter-2',
  'durga-saptashati-chapter-3',
  'durga-saptashati-chapter-4',
  'durga-saptashati-chapter-5',
  'durga-saptashati-chapter-6',
  'durga-saptashati-chapter-7',
  'durga-saptashati-chapter-8',
  'durga-saptashati-chapter-9',
  'durga-saptashati-chapter-10',
  'durga-saptashati-chapter-11',
  'durga-saptashati-chapter-12',
  'durga-saptashati-chapter-13',
] as const;
export const saptashatiChapterCounts = [104, 69, 44, 42, 129, 24, 27, 63, 41, 32, 55, 41, 29] as const;
export const saptashatiPreliminaryIds = ['durga-devi-kavacham', 'durga-argala-stotram', 'durga-kilak-stotram'] as const;
export const saptashatiCoreIds = [...saptashatiPreliminaryIds, ...saptashatiChapterIds] as const;
