import React from 'react';
import { View } from 'react-native';
import type { ContentCategory } from '@/data/texts';
import StoryIcon, { type StoryIconName } from './StoryIcon';
import AppIcon, { type AppIconName } from './AppIcon';
import LotusMark from './LotusMark';

export type PurposeIconKey =
  | 'purpose-protection'
  | 'purpose-obstacles'
  | 'purpose-courage'
  | 'purpose-peace'
  | 'purpose-insight'
  | 'purpose-devotion'
  | 'purpose-wealth'
  | 'purpose-prosperity'
  | 'purpose-health'
  | 'purpose-victory'
  | 'purpose-moksha'
  | 'purpose-auspicious'
  | 'purpose-family'
  | 'purpose-morning';


export type CategoryIconKey = ContentCategory | 'deity' | 'vrat' | 'purpose' | 'insight' | 'routine' | 'muhurat' | 'daan' | PurposeIconKey;

const artwork = {
  granth: 'granth', stotram: 'stotram', chalisa: 'chalisa', japam: 'japam',
  deity: 'deity', aarti: 'aarti', theerth: 'theerth', sanskar: 'sanskar',
  kavacham: 'kavacham', ashtakam: 'ashtakam', suktam: 'suktam',
  vrat: 'vrat', purpose: 'purpose', insight: 'kundali', muhurat: 'muhurat', daan: 'daan',
} as const satisfies Record<Exclude<CategoryIconKey, PurposeIconKey | 'routine'>, StoryIconName>;

const purposeIcons: Record<PurposeIconKey, AppIconName> = {
  'purpose-protection': 'shield', 'purpose-obstacles': 'obstacles',
  'purpose-courage': 'courage', 'purpose-peace': 'peace',
  'purpose-insight': 'insight', 'purpose-devotion': 'devotion',
  'purpose-wealth': 'wealth', 'purpose-prosperity': 'prosperity',
  'purpose-health': 'health', 'purpose-victory': 'victory',
  'purpose-moksha': 'moksha', 'purpose-auspicious': 'auspicious',
  'purpose-family': 'family', 'purpose-morning': 'morning',
};

export default function CategoryIcon({ iconKey, size = 44 }: { iconKey: CategoryIconKey; size?: number }) {
  // Compact consumers keep the existing layout box; Home opts into larger art.
  return <View style={{ width: 36, height: 32, alignItems: 'center', justifyContent: 'center' }} accessible={false}>
    {iconKey === 'routine'
      ? <LotusMark size={30} />
      : iconKey.startsWith('purpose-')
        ? <AppIcon name={purposeIcons[iconKey as PurposeIconKey]} size={30} weight="duotone" />
        : <StoryIcon name={artwork[iconKey as keyof typeof artwork]} size={size} testID={`category-icon-${iconKey}`} />}
  </View>;
}
