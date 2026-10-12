import { backgroundAsset, type RemoteBackground } from '@/data/backgroundAsset';

export type ShivaStrotamImageKey = 'shiva';

export const shivaStrotamImages: Record<ShivaStrotamImageKey, RemoteBackground> = {
  shiva: backgroundAsset('shiva-strotam--shiva'),
};
