// Lightweight library metadata. Books load only when the native shelf opens.

export type Comic = {
  id: string;
  title: { hi: string; en: string; gu: string; kn: string };
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
    episodeCount: 29,
  },
];

export function comicById(id: string): Comic | undefined {
  return comics.find(c => c.id === id);
}
