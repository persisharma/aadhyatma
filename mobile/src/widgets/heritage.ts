import type { WidgetAppearance } from './appearance';
import type { WidgetBackgroundSize } from './catalog';

export const WIDGET_HERITAGE_SUBJECTS = ['prayer', 'vishnu', 'krishna', 'shiva', 'hanuman', 'rama', 'ganesha', 'durga', 'saraswati', 'surya', 'panchang'] as const;
export type WidgetHeritageSubject = typeof WIDGET_HERITAGE_SUBJECTS[number];

// Only named, reviewed illustrations are eligible. Other sources keep a neutral
// scripture vignette, never a generic Krishna image behind an unrelated prayer.
const sources: Readonly<Record<string, WidgetHeritageSubject>> = {
  'bhagavad-gita': 'krishna', 'krishna-stotram': 'krishna', 'krishna-chalisa': 'krishna', 'aarti-kunj-bihari': 'krishna', madhurashtakam: 'krishna', achyutashtakam: 'krishna', 'krishna-stuti': 'krishna', 'hare-krishna-mahamantra': 'krishna', 'krishna-beej-mantra': 'krishna',
  'vishnu-sahasranama': 'vishnu', 'vishnu-chalisa': 'vishnu', 'om-jai-jagdish': 'vishnu', 'narayana-suktam': 'vishnu', 'purusha-suktam': 'vishnu', 'om-namo-narayanaya': 'vishnu', 'om-namo-bhagavate-vasudevaya': 'vishnu',
  'shiva-strotam': 'shiva', 'mahamrityunjaya-mantra': 'shiva', 'rudra-mantra': 'shiva', 'shiv-chalisa': 'shiva', 'om-jai-shiv-omkara': 'shiva', rudrashtakam: 'shiva', 'shiva-kavacham': 'shiva',
  'hanuman-ashtak': 'hanuman', 'hanuman-chalisa': 'hanuman', 'hanuman-aarti': 'hanuman', sundarkand: 'hanuman', 'bajrang-baan': 'hanuman', 'hanuman-moola-mantra': 'hanuman', 'om-ham-hanumate-namah': 'hanuman',
  'ram-stuti': 'rama', ramcharitmanas: 'rama', 'valmiki-ramayan': 'rama', 'ram-chalisa': 'rama', 'rama-raksha-stotra': 'rama', 'shri-ram-jai-ram': 'rama', 'rama-moola-mantra': 'rama',
  'ganesh-stotram': 'ganesha', 'ganesh-chalisa': 'ganesha', 'jai-ganesh-deva': 'ganesha', 'ganapati-gam-mantra': 'ganesha', 'ganesha-kavacham': 'ganesha',
  'durga-stotram': 'durga', 'durga-chalisa': 'durga', 'jai-ambe-gauri': 'durga', 'jay-adhya-shakti': 'durga', 'bhavani-ashtakam': 'durga', 'devi-suktam': 'durga', 'durga-kavach': 'durga', 'durga-stuti-arjuna': 'durga', 'durga-beej-mantra': 'durga', 'navarna-mantra': 'durga',
  'saraswati-stotram': 'saraswati', 'saraswati-chalisa': 'saraswati', 'saraswati-aarti': 'saraswati', 'saraswati-moola-mantra': 'saraswati',
  'gayatri-mantra': 'surya', 'surya-namaskar': 'surya', 'surya-chalisa': 'surya', 'surya-ashtakam': 'surya', 'surya-beej-mantra': 'surya',
};

export function widgetVerseSubject(sourceId: string): WidgetHeritageSubject { return sources[sourceId] ?? 'prayer'; }
export function widgetHeritageName(subject: string, size: WidgetBackgroundSize, appearance: WidgetAppearance): string {
  const safe = WIDGET_HERITAGE_SUBJECTS.includes(subject as WidgetHeritageSubject) ? subject : 'prayer';
  return `vedansh_widget_bg_heritage_${safe}_${size}_${appearance}`;
}
