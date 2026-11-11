import React from 'react';
import { Image } from 'react-native';
import { storybookSources } from './storybookSources';
import { moreIconSources } from './MoreIcon';
import { PAINTED_ICON_DECODE } from './paintedIconDecode';

// Shared subjects reuse the actual More source rather than a second drawing.
export const featureIconSources = {
  routine: storybookSources.practice,
  'daily-bhakti': storybookSources.stotram,
  'daan-punya': moreIconSources.daan,
  sankalp: storybookSources.japam,
  'pitru-smaran': moreIconSources.remembrance,
  'puja-vidhi': storybookSources.vrat,
  jijnasa: moreIconSources.question,
  theerth: storybookSources.theerth,
  'home-widgets': moreIconSources.widgets,
} as const;

export type FeatureIconName = keyof typeof featureIconSources;

/** The Discover card owns accessibility and its action. */
export default function FeatureIcon({ name }: { name: FeatureIconName }) {
  return <Image source={featureIconSources[name]} style={{ width: 32, height: 32 }} {...PAINTED_ICON_DECODE}
    resizeMode="contain" fadeDuration={0} accessible={false} accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants" testID={`feature-icon-${name}`} />;
}
