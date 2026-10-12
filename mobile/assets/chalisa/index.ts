import { backgroundAsset, type RemoteBackground } from '@/data/backgroundAsset';

export type ChalisaImageKey =
  | 'ram_hanuman'
  | 'hanuman_sita'
  | 'hanuman_sea'
  | 'hanuman_lankadahan';

export const chalisaImages: Record<ChalisaImageKey, RemoteBackground> = {
  ram_hanuman: backgroundAsset('chalisa--Ram_hanuman'),
  hanuman_sita: backgroundAsset('chalisa--Hanuman_sita'),
  hanuman_sea: backgroundAsset('chalisa--Hanuman_sea'),
  hanuman_lankadahan: backgroundAsset('chalisa--hanuman_lankadahan'),
};
