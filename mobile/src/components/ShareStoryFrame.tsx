import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import BackgroundLayer from './BackgroundLayer';
import { placeStoryCard, storyCanvas } from '@/utils/shareStoryLayout';

type Props = {
  /** The plate behind the card, full-bleed. */
  background: number | null;
  /** A native 540×675 card; placed unscaled inside the Story/Reel safe band. */
  children: React.ReactNode;
};

/**
 * The 1080×1920 Story/Reel canvas (design.md §39.3) around any 540×675 card. The verse
 * card uses it through `ShareStoryCanvas`; the prose card (§39.4) mounts it directly.
 * Geometry is `placeStoryCard` at scale 1 — no transform on the captured view.
 */
export default function ShareStoryFrame({ background, children }: Props) {
  const { colors } = useTheme();
  const place = placeStoryCard(540, 675);
  return (
    <View
      collapsable={false}
      style={[
        styles.canvas,
        { width: storyCanvas.width, height: storyCanvas.height, backgroundColor: colors.parchment },
      ]}
    >
      <BackgroundLayer source={background} />
      <View style={{ position: 'absolute', left: place.left, top: place.top }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: { overflow: 'hidden' },
});
