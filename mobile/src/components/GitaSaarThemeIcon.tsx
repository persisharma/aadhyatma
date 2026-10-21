import React from 'react';
import { View } from 'react-native';
import StoryIcon, { type StoryIconName } from './StoryIcon';

/** Stable theme IDs keep the visual vocabulary independent of reading order. */
export const gitaSaarThemeIcons: Readonly<Record<string, StoryIconName>> = {
  'true-prema': 'radha',
  'bhay-chinta': 'kavacham',
  shok: 'aarti',
  krodh: 'shiva',
  karma: 'practice',
  guna: 'purpose',
  man: 'japam',
  sanshay: 'granth',
  sharanagati: 'krishna',
  sthitaprajna: 'suktam',
  'kamna-santosh': 'daan',
  safalta: 'muhurat',
  atma: 'deity',
  akela: 'sanskar',
  daivi: 'purpose',
  dhyan: 'ashtakam',
};

export default function GitaSaarThemeIcon({ themeId }: { themeId: string }) {
  return <View testID={`gita-saar-theme-icon-${themeId}`}>
    <StoryIcon name={gitaSaarThemeIcons[themeId] ?? 'granth'} size={48} />
  </View>;
}
