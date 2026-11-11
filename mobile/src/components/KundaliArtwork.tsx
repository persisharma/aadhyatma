import React from 'react';
import { Image, type ImageSourcePropType } from 'react-native';
import type { Graha } from '@/panchang/kundali';
import { PAINTED_ICON_DECODE } from './paintedIconDecode';

export type KundaliArtworkName = Graha | 'lagna' | 'nakshatra';
export const KUNDALI_ARTWORK: Record<KundaliArtworkName, ImageSourcePropType> = {
  sun: require('../../assets/icons/kundali/sun.png'),
  moon: require('../../assets/icons/kundali/moon.png'),
  mars: require('../../assets/icons/kundali/mars.png'),
  mercury: require('../../assets/icons/kundali/mercury.png'),
  jupiter: require('../../assets/icons/kundali/jupiter.png'),
  venus: require('../../assets/icons/kundali/venus.png'),
  saturn: require('../../assets/icons/kundali/saturn.png'),
  rahu: require('../../assets/icons/kundali/rahu.png'),
  ketu: require('../../assets/icons/kundali/ketu.png'),
  lagna: require('../../assets/icons/kundali/lagna.png'),
  nakshatra: require('../../assets/icons/kundali/nakshatra.png'),
};

export default function KundaliArtwork({ name, size = 64 }: { name: KundaliArtworkName; size?: number }) {
  return <Image source={KUNDALI_ARTWORK[name]} accessible={false} resizeMode="contain" {...PAINTED_ICON_DECODE} style={{ width: size, height: size }} />;
}
