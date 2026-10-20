import type { DevotionalArt } from '@/utils/devotionalShareLayout';

/** Approved Design 2 footers. Prayer uses the neutral temple courtyard. */
export function devotionalFooterAsset(art: DevotionalArt): number {
  switch (art) {
    case 'krishna': return require('@assets/devotional-share/footers/krishna.webp');
    case 'shiva': return require('@assets/devotional-share/footers/shiva.webp');
    case 'durga': return require('@assets/devotional-share/footers/durga.webp');
    case 'saraswati': return require('@assets/devotional-share/footers/saraswati.webp');
    case 'ganesha': return require('@assets/devotional-share/footers/ganesha.webp');
    case 'vishnu': return require('@assets/devotional-share/footers/vishnu.webp');
    case 'hanuman': return require('@assets/devotional-share/footers/hanuman.webp');
    case 'rama': return require('@assets/devotional-share/footers/rama.webp');
    case 'surya': return require('@assets/devotional-share/footers/surya.webp');
    default: return require('@assets/devotional-share/footers/ganesha.webp');
  }
}

/** Exact source ornament pixels; one decoded atlas per deity. */
export function devotionalOrnamentAsset(art: DevotionalArt): number {
  switch (art) {
    case 'krishna': return require('@assets/devotional-share/ornaments/krishna.webp');
    case 'shiva': return require('@assets/devotional-share/ornaments/shiva.webp');
    case 'durga': return require('@assets/devotional-share/ornaments/durga.webp');
    case 'saraswati': return require('@assets/devotional-share/ornaments/saraswati.webp');
    case 'ganesha': return require('@assets/devotional-share/ornaments/ganesha.webp');
    case 'vishnu': return require('@assets/devotional-share/ornaments/vishnu.webp');
    case 'hanuman': return require('@assets/devotional-share/ornaments/hanuman.webp');
    case 'rama': return require('@assets/devotional-share/ornaments/rama.webp');
    case 'surya': return require('@assets/devotional-share/ornaments/surya.webp');
    default: return require('@assets/devotional-share/ornaments/ganesha.webp');
  }
}
