import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { DeityIconKey } from '@/data/deities';

import { deityGlyphs } from './deityGlyphs';
import { cream } from './deityGlyphs/palette';

type Props = {
  iconKey?: DeityIconKey;
  fallbackText: string;
  /** Rendered glyph size in dp. Defaults to 36 (the catalog-card avatar size). */
  size?: number;
};

/**
 * The size the View-based glyphs are drawn at; other sizes transform-scale.
 * Note the layout box stays 36×36 at every `size` (transforms don't affect
 * layout) — fine for the fixed, centered avatar containers that consume this.
 */
const BASE_SIZE = 36;

export default function DeityIcon({ iconKey, fallbackText, size = BASE_SIZE }: Props) {
  const scale = size / BASE_SIZE;
  if (iconKey) {
    const Glyph = deityGlyphs[iconKey];
    return (
      <Scaled scale={scale}>
        <View style={styles.canvas} testID={`deity-glyph-${iconKey}`} accessible={false}>
          <Glyph />
        </View>
      </Scaled>
    );
  }

  return <Text style={[styles.fallback, { fontSize: size * 0.44 }]}>{fallbackText}</Text>;
}

/** Scales the fixed-size View glyphs. Renders children directly at 1× so the
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
  fallback: {
    color: cream,
    fontSize: 16,
    includeFontPadding: false,
    textAlign: 'center',
  },
});
