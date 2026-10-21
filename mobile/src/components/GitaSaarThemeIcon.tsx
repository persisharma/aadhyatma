import React from 'react';
import { View } from 'react-native';
import AppIcon, { type AppIconName } from './AppIcon';
import { useTheme } from '@/theme/ThemeContext';

/** Stable theme IDs keep the visual vocabulary independent of reading order. */
export const gitaSaarThemeIcons: Readonly<Record<string, AppIconName>> = {
  'true-prema': 'heart',
  'bhay-chinta': 'shield',
  shok: 'remembrance',
  krodh: 'courage',
  karma: 'prosperity',
  guna: 'theme',
  man: 'peace',
  sanshay: 'question',
  sharanagati: 'devotion',
  sthitaprajna: 'insight',
  'kamna-santosh': 'auspicious',
  safalta: 'victory',
  atma: 'sun',
  akela: 'family',
  daivi: 'star',
  dhyan: 'morning',
};

export default function GitaSaarThemeIcon({ themeId }: { themeId: string }) {
  const { colors } = useTheme();
  return <View testID={`gita-saar-theme-icon-${themeId}`}>
    <AppIcon name={gitaSaarThemeIcons[themeId] ?? 'auspicious'} size={28} color={colors.saffronDeep} />
  </View>;
}
