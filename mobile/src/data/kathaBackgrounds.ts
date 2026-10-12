import { backgroundImages } from '@assets/backgrounds';
import { getDeityBackground, type BackgroundImage } from './backgrounds';

// These are thematic plates, not invented depictions of individual story events.
// Traditions without an appropriate commissioned plate use the neutral manuscript.
const themes: Record<string, BackgroundImage> = {};
function theme(deity: Parameters<typeof getDeityBackground>[0], ids: string[]): void {
  for (const id of ids) themes[id] = getDeityBackground(deity);
}
theme('vishnu', ['satyanarayana-vrat-katha', 'anant-chaturdashi-vrat-katha', 'dwadashi-vrat-katha',
  'akshaya-tritiya-vrat-katha', 'kartika-mahatmya', 'narada-jayanti-vrat-katha']);
theme('ganesha', ['sankashti-chaturthi-vrat-katha', 'sakat-chauth-vrat-katha', 'ganesh-jayanti-katha',
  'ganesha-chaturthi-vrat-katha', 'durva-ashtami-vrat-katha']);
theme('shiva', ['maha-shivaratri-vrat-katha', 'pradosha-vrat-katha', 'shravana-mahatmya']);
theme('parvati', ['hartalika-teej-katha', 'gangaur-vrat-katha', 'mangala-gauri-vrat-katha', 'jayaparvati-vrat-katha']);
theme('durga', ['navratri-start-katha', 'masik-durgashtami-katha']);
theme('krishna', ['janmashtami-katha', 'masik-krishna-janmashtami-katha', 'govardhan-puja-katha',
  'gita-jayanti-katha', 'sharad-purnima-vrat-katha', 'narak-chaturdashi-katha']);
theme('rama', ['rama-navami-vrat-katha', 'dussehra-katha', 'vivah-panchami-katha', 'sita-navami-vrat-katha']);
theme('ganga', ['ganga-dussehra-katha', 'ganga-saptami-vrat-katha', 'mauni-amavasya-katha']);
theme('lakshmi', ['diwali-legends', 'mahalakshmi-vrat-katha', 'varalakshmi-vrat-katha', 'kojagara-puja-katha']);
theme('surya', ['chhath-puja-katha']);
theme('hanuman', ['hanuman-jayanti-vrat-katha']);
theme('saraswati', ['vasant-panchami-katha']);
theme('narasimha', ['narasimha-jayanti-vrat-katha', 'holi-legends']);
theme('kartikeya', ['skanda-sashti-katha']);
theme('dattatreya', ['dattatreya-jayanti-katha']);

export function getKathaBackground(id: string): BackgroundImage {
  if (id.includes('ekadashi')) return getDeityBackground('vishnu');
  return themes[id] ?? backgroundImages.category_granth_open_scripture;
}

export function getPitruReadingBackground(id?: string): BackgroundImage {
  if (id === 'bhagirath-sagar') return getDeityBackground('ganga');
  if (id === 'rama-jalanjali' || id === 'jatayu-antim-sanskar' || id === 'bharat-dwadashah') {
    return getDeityBackground('rama');
  }
  return backgroundImages.category_granth_open_scripture;
}
