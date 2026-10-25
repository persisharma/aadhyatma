import React from 'react';
import { StyleSheet, View } from 'react-native';

import type { DeityIconKey } from '@/data/deities';

import StoryIcon from './StoryIcon';
import { deityArtwork } from './deityArtwork';

type Props = {
  /** Undefined renders the painted deity seal — never a text glyph (RULEBOOK §3). */
  iconKey?: DeityIconKey;
  /** Rendered glyph size in dp. Defaults to 36 (the catalog-card avatar size). */
  size?: number;
};

/**
 * The size the bundled illustrations are drawn at; other sizes transform-scale.
 * Note the layout box stays 36×36 at every `size` (transforms don't affect
 * layout) — fine for the fixed, centered avatar containers that consume this.
 */
const BASE_SIZE = 36;

export default function DeityIcon({ iconKey, size = BASE_SIZE }: Props) {
  const scale = size / BASE_SIZE;
  return (
    <Scaled scale={scale}>
      <View style={styles.canvas} testID={`deity-glyph-${iconKey ?? 'fallback'}`} accessible={false}>
        <StoryIcon name={iconKey ? deityArtwork[iconKey] : 'deity'} size={BASE_SIZE} />
      </View>
    </Scaled>
  );
}

/** Scales the fixed-size illustrations. Renders children directly at 1× so the
 *  common catalog-card case keeps its exact layout. */
function Scaled({ scale, children }: { scale: number; children: React.ReactNode }) {
  if (scale === 1) return <>{children}</>;
  return <View style={{ transform: [{ scale }] }} accessible={false}>{children}</View>;
}

const styles = StyleSheet.create({
  canvas: {
    width: BASE_SIZE,
    height: BASE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
