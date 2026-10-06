import type { DeityIconKey } from '@/data/deities';
import type { StoryIconName } from './StoryIcon';

// Keep all 21 symbolic attributes. Adding a deity requires bundled art.
export const deityArtwork = {
  bowArrow: 'rama',
  bansuriPeacockFeather: 'krishna',
  chakra: 'vishnu',
  trishul: 'shiva',
  gada: 'hanuman',
  lotus: 'durga',
  modak: 'ganesha',
  surya: 'gayatri',
  veena: 'saraswati',
  lakshmi: 'lakshmi',
  suryadev: 'surya',
  radha: 'radha',
  kartikeya: 'kartikeya',
  kubera: 'kubera',
  ganga: 'ganga',
  parvati: 'parvati',
  narasimha: 'narasimha',
  dattatreya: 'stotram',
  shani: 'shani',
  kali: 'kali',
  navagraha: 'navagraha',
} as const satisfies Record<DeityIconKey, StoryIconName>;
