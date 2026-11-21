// Approved 3:2 paintings; this module is only evaluated inside the lazy learning flow.
export const sanatanArtwork: Record<string,number> = {
  'basics':require('@assets/sanatan-parichay/basics.webp'),
  'deity':require('@assets/sanatan-parichay/deity.webp'),
  'thirty':require('@assets/sanatan-parichay/thirty.webp'),
  'dikpal':require('@assets/sanatan-parichay/dikpal.webp'),
  'graha':require('@assets/sanatan-parichay/graha.webp'),
  'symbols':require('@assets/sanatan-parichay/symbols.webp'),
  'forms':require('@assets/sanatan-parichay/forms.webp'),
  'plants':require('@assets/sanatan-parichay/plants.webp'),
  'elements':require('@assets/sanatan-parichay/elements.webp'),
  'time':require('@assets/sanatan-parichay/time.webp'),
  'texts':require('@assets/sanatan-parichay/texts.webp'),
  'temples':require('@assets/sanatan-parichay/temples.webp'),
  'rishis':require('@assets/sanatan-parichay/rishis.webp'),
};
/**
 * Where each painting's subject sits (0–1 across its width), for the 4:5 hub
 * thumbnail (`ListingThumbImage`). Omitted paintings are centred.
 */
export const sanatanThumbFocus: Readonly<Record<string,number>> = {
  basics: 0.55, symbols: 0.55, temples: 0.57, texts: 0.46,
};
