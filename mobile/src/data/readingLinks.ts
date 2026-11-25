/** Discovery doors into existing canonical texts. No duplicate verses or progress IDs. */
export const readingLinks = [
  { id: 'ganesh-atharvashirsha', titleHi: 'गणेश अथर्वशीर्ष', titleEn: 'Ganesh Atharvashirsha',
    detailHi: 'गणेश स्तोत्र · अध्याय २', detailEn: 'Ganesh Stotram · Chapter 2',
    deity: 'ganesha', sourceId: 'ganesh-stotram', chapter: 2, verseIndex: 0 },
  // दुर्गा सप्तशती is now a first-class `granth` library entry (durga-saptashati-core),
  // so it no longer needs a Stotram-tab reading-link shortcut (it would also double the
  // search section). It opens from the Granth catalogue and Durga's deity page, like the Gita.
] as const;

export function getReadingLink(id: string) {
  return readingLinks.find((link) => link.id === id);
}
