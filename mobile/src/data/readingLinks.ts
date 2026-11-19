/** Discovery doors into existing canonical texts. No duplicate verses or progress IDs. */
export const readingLinks = [
  { id: 'ganesh-atharvashirsha', titleHi: 'गणेश अथर्वशीर्ष', titleEn: 'Ganesh Atharvashirsha',
    detailHi: 'गणेश स्तोत्र · अध्याय २', detailEn: 'Ganesh Stotram · Chapter 2',
    deity: 'ganesha', sourceId: 'ganesh-stotram', chapter: 2, verseIndex: 0 },
  { id: 'durga-saptashati-core', titleHi: 'दुर्गा सप्तशती · सभी १३ अध्याय', titleEn: 'Durga Saptashati · All 13 Chapters',
    detailHi: '७०० पाठांश · कवच, अर्गला और कीलक सहित', detailEn: '700 text units · with Kavach, Argala and Kilak',
    deity: 'durga', sourceId: 'durga-saptashati-core', chapter: 0, verseIndex: 0 },
] as const;

export function getReadingLink(id: string) {
  return readingLinks.find((link) => link.id === id);
}
