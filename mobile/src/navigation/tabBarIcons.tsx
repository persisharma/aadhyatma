import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import AppIcon from '@/components/AppIcon';
import StoryIcon from '@/components/StoryIcon';

export type TabIconProps = { color: string; size: number };
export type BhaktiIconProps = TabIconProps & { accentColor: string };

export function HomeIcon({ color, size }: TabIconProps) {
  return <AppIcon name="home" color={color} size={size} weight="fill" />;
}
export function BhaktiIcon({ color, size }: BhaktiIconProps) {
  return <StoryIcon name="nav-bhakti" size={size + 3} tintColor={color} />;
}
export function PanchangIcon({ color, size }: TabIconProps) {
  return <StoryIcon name="nav-panchang" size={size + 3} tintColor={color} />;
}
export function VratIcon({ color, size }: TabIconProps) {
  return <StoryIcon name="vrat" size={size + 3} tintColor={color} />;
}
export function MoreIcon({ color, size }: TabIconProps) {
  return <AppIcon name="more" color={color} size={size} weight="regular" />;
}

// This is the original filled note used by the audio tab before the later icon
// redraw. The filled head, vertical stem, and square flag are intentional: the
// reference icon is a classic eighth note, not a stroked approximation.
export function MusicIcon({ color, size }: TabIconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          testID="tab-music-icon-path"
          fill={color}
          d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"
        />
      </Svg>
    </View>
  );
}
