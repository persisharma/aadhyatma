export type ChalisaImageKey =
  | 'ram_hanuman'
  | 'hanuman_sita'
  | 'hanuman_sea'
  | 'hanuman_lankadahan';

export const chalisaImages: Record<ChalisaImageKey, number> = {
  ram_hanuman: require('./Ram_hanuman.png'),
  hanuman_sita: require('./Hanuman_sita.png'),
  hanuman_sea: require('./Hanuman_sea.png'),
  hanuman_lankadahan: require('./hanuman_lankadahan.png'),
};
