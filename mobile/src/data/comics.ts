// Hosted comic readers surfaced in-app via a WebView (see ComicReaderScreen).
// The reader bundle (index.html + reader.js/css + book.json + page art) lives on the
// R2 CDN; the app only points a WebView at `url`. Keeping this data-driven leaves room
// for more comics without touching the screen.

export type Comic = {
  id: string;
  title: { hi: string; en: string; gu: string; kn: string };
  /** Full https URL of the reader's index.html on the CDN. */
  url: string;
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
    url: 'https://cdn.vedansh.app/comics/balakanda-v1/index.html',
  },
];

export function comicById(id: string): Comic | undefined {
  return comics.find(c => c.id === id);
}
