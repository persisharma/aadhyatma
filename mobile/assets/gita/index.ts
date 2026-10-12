import { backgroundAsset, type RemoteBackground } from '@/data/backgroundAsset';

export type GitaImageKey = 'krishna_arjuna_vishvarupa';

export const gitaImages: Record<GitaImageKey, RemoteBackground> = {
  krishna_arjuna_vishvarupa: backgroundAsset('gita--krishna_arjuna_vishvarupa'),
};
