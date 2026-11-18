/** Discovery doors into existing canonical texts. No duplicate verses or progress IDs. */
import { valmikiSargaStarts } from './valmiki-ramayan/sargaStarts';

export const readingLinks = [
  { id: 'aditya-hridayam', titleHi: 'आदित्य हृदयम्', titleEn: 'Aditya Hridayam',
    detailHi: 'वाल्मीकि रामायण · युद्धकाण्ड १०७', detailEn: 'Valmiki Ramayan · Yuddha Kanda 107',
    deity: 'surya', sourceId: 'valmiki-ramayan', chapter: 6, verseIndex: valmikiSargaStarts[6][106] },
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
