// Lightweight library metadata. Books load only when the native shelf opens.

export type Comic = {
  id: string;
  title: { hi: string; en: string; gu: string; kn: string };
  /** The kanda's own name, for the chapter-listing scope line. */
  kanda: { hi: string; en: string; gu: string; kn: string };
  episodeCount: number;
};

export const comics: Comic[] = [
  {
    id: 'balakanda-v1',
    title: {
      hi: 'रामायण कॉमिक · बालकाण्ड',
      en: 'Ramayana Comic · Bālakāṇḍa',
      gu: 'રામાયણ કોમિક · બાલકાંડ',
      kn: 'ರಾಮಾಯಣ ಕಾಮಿಕ್ · ಬಾಲಕಾಂಡ',
    },
    kanda: { hi: 'बालकाण्ड', en: 'Bala Kanda', gu: 'બાલકાંડ', kn: 'ಬಾಲಕಾಂಡ' },
    episodeCount: 29,
  },
  {
    id: 'ayodhyakanda-v1',
    title: {
      hi: 'रामायण कॉमिक · अयोध्याकाण्ड',
      en: 'Ramayana Comic · Ayodhyākāṇḍa',
      gu: 'રામાયણ કોમિક · અયોધ્યાકાંડ',
      kn: 'ರಾಮಾಯಣ ಕಾಮಿಕ್ · ಅಯೋಧ್ಯಾಕಾಂಡ',
    },
    kanda: { hi: 'अयोध्याकाण्ड', en: 'Ayodhya Kanda', gu: 'અયોધ્યાકાંડ', kn: 'ಅಯೋಧ್ಯಾಕಾಂಡ' },
    episodeCount: 81,
  },
];

export function comicById(id: string): Comic | undefined {
  return comics.find(c => c.id === id);
}

/** The seven kandas of the Valmiki Ramayana, in narrative order, for the comic
 * shelf. A kanda is a live comic when `comicId` resolves to an edition in
 * `comics`; the rest show a "coming soon" row until their edition ships. */
export type RamayanaKanda = {
  id: string;
  name: { hi: string; en: string; gu: string; kn: string };
  comicId?: string;
};

export const ramayanaKandas: RamayanaKanda[] = [
  { id: 'bala', name: { hi: 'बालकाण्ड', en: 'Bala Kanda', gu: 'બાલકાંડ', kn: 'ಬಾಲಕಾಂಡ' }, comicId: 'balakanda-v1' },
  { id: 'ayodhya', name: { hi: 'अयोध्याकाण्ड', en: 'Ayodhya Kanda', gu: 'અયોધ્યાકાંડ', kn: 'ಅಯೋಧ್ಯಾಕಾಂಡ' }, comicId: 'ayodhyakanda-v1' },
  { id: 'aranya', name: { hi: 'अरण्यकाण्ड', en: 'Aranya Kanda', gu: 'અરણ્યકાંડ', kn: 'ಅರಣ್ಯಕಾಂಡ' } },
  { id: 'kishkindha', name: { hi: 'किष्किन्धाकाण्ड', en: 'Kishkindha Kanda', gu: 'કિષ્કિંધાકાંડ', kn: 'ಕಿಷ್ಕಿಂಧಾಕಾಂಡ' } },
  { id: 'sundara', name: { hi: 'सुन्दरकाण्ड', en: 'Sundara Kanda', gu: 'સુંદરકાંડ', kn: 'ಸುಂದರಕಾಂಡ' } },
  { id: 'yuddha', name: { hi: 'युद्धकाण्ड', en: 'Yuddha Kanda', gu: 'યુદ્ધકાંડ', kn: 'ಯುದ್ಧಕಾಂಡ' } },
  { id: 'uttara', name: { hi: 'उत्तरकाण्ड', en: 'Uttara Kanda', gu: 'ઉત્તરકાંડ', kn: 'ಉತ್ತರಕಾಂಡ' } },
];
