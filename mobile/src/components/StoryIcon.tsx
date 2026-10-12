import React from 'react';
import { Image, type ImageSourcePropType } from 'react-native';
import { storybookSources } from './storybookSources';

export type StoryIconName = keyof typeof storybookSources;
export default function StoryIcon({ name, size = 44, testID, tintColor }: {
  name: StoryIconName; size?: number; testID?: string; tintColor?: string;
}) {
  return <Image source={storybookSources[name] as ImageSourcePropType}
    style={{ width: size, height: size, tintColor }} resizeMode="contain" fadeDuration={0}
    accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
    testID={testID ?? `storybook-${name}`} />;
}
