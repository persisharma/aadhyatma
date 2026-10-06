import React from 'react';
import { Image, type ImageSourcePropType } from 'react-native';
import { storybookSources } from './storybookSources';

// More's settings illustrations share Home's painted palette and normalized
// transparent canvas. Navigation chevrons remain the shared utility glyphs.
const sources = {
  bell: require('@assets/icons/more-storybook/bell.png'),
  alarm: require('@assets/icons/more-storybook/alarm.png'),
  saved: require('@assets/icons/more-storybook/saved.png'),
  family: require('@assets/icons/more-storybook/family.png'),
  remembrance: storybookSources.ashtakam,
  regional: require('@assets/icons/more-storybook/regional.png'),
  birthday: require('@assets/icons/more-storybook/birthday.png'),
  purpose: storybookSources.purpose,
  daan: storybookSources.daan,
  language: require('@assets/icons/more-storybook/language.png'),
  textSize: require('@assets/icons/more-storybook/text-size.png'),
  voice: require('@assets/icons/more-storybook/voice.png'),
  widgets: require('@assets/icons/more-storybook/widgets.png'),
  share: require('@assets/icons/more-storybook/share.png'),
  star: require('@assets/icons/more-storybook/star.png'),
  instagram: require('@assets/icons/more-storybook/instagram.png'),
  info: require('@assets/icons/more-storybook/info.png'),
  report: require('@assets/icons/more-storybook/report.png'),
  reset: require('@assets/icons/more-storybook/reset.png'),
} as const;

export type MoreIconName = keyof typeof sources;

/** Decorative image; the settings row owns the accessible name and action. */
export default function MoreIcon({ name }: { name: MoreIconName }) {
  return (
    <Image
      source={sources[name] as ImageSourcePropType}
      style={{ width: 30, height: 30 }}
      resizeMode="contain"
      fadeDuration={0}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      testID={`more-icon-${name}`}
    />
  );
}
