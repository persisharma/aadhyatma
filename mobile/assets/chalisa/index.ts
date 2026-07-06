export type ChalisaImageKey =
  | 'ram_hanuman'
  | 'hanuman_sita'
  | 'hanuman_sea'
  | 'hanuman_lankadahan';

export const chalisaImages: Record<ChalisaImageKey, number> = {
  ram_hanuman: require('./Ram_hanuman.webp'),
  hanuman_sita: require('./Hanuman_sita.webp'),
  hanuman_sea: require('./Hanuman_sea.webp'),
  hanuman_lankadahan: require('./hanuman_lankadahan.webp'),
};
