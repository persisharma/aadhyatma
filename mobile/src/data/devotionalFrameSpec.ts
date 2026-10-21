import { devotionalPlateArt } from './devotionalShareArt';
import type { DevotionalArt } from '@/utils/devotionalShareLayout';
/** Measured coordinates in the approved 1080×1456 masters. */
export const devotionalFrameSpecs = {
  vishnu: { hero: 530, sourceEnd: 610, verseEnd: 778, meaningTop: 850, meaningBottom: 1070, commentTop: 1120, sourceFont: 20, sourceTop: 10, meaningPad: 82 },
  shiva: { hero: 550, sourceEnd: 650, verseEnd: 785, meaningTop: 855, meaningBottom: 1075, commentTop: 1124, sourceFont: 20, sourceTop: 14, meaningPad: 95 },
  hanuman: { hero: 550, sourceEnd: 640, verseEnd: 790, meaningTop: 860, meaningBottom: 1078, commentTop: 1128, sourceFont: 20, sourceTop: 8, meaningPad: 98 },
  krishna: { hero: 600, sourceEnd: 704, verseEnd: 848, meaningTop: 912, meaningBottom: 1094, commentTop: 1150, sourceFont: 28, sourceTop: 0, meaningPad: 80 },
  durga: { hero: 610, sourceEnd: 721, verseEnd: 868, meaningTop: 934, meaningBottom: 1141, commentTop: 1190, sourceFont: 28, sourceTop: 20, meaningPad: 75 },
  saraswati: { hero: 590, sourceEnd: 682, verseEnd: 805, meaningTop: 878, meaningBottom: 1080, commentTop: 1132, sourceFont: 24, sourceTop: 0, meaningPad: 75 },
  ganesha: { hero: 560, sourceEnd: 683, verseEnd: 815, meaningTop: 886, meaningBottom: 1106, commentTop: 1164, sourceFont: 28, sourceTop: 20, meaningPad: 96 },
  rama: { hero: 630, sourceEnd: 727, verseEnd: 852, meaningTop: 922, meaningBottom: 1136, commentTop: 1188, sourceFont: 28, sourceTop: 0, meaningPad: 96 },
  surya: { hero: 640, sourceEnd: 752, verseEnd: 878, meaningTop: 939, meaningBottom: 1137, commentTop: 1192, sourceFont: 28, sourceTop: 13, meaningPad: 96 },
} as const;
export function devotionalFrameSpec(art: DevotionalArt) { return devotionalFrameSpecs[devotionalPlateArt(art)]; }
export const devotionalFrameCanvas = { width: 1080, height: 1456, footerTop: 1296 } as const;
