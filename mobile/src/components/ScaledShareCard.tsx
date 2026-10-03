import React from 'react';
import { StyleSheet, View } from 'react-native';
import { proseCardMetrics } from '@/utils/shareCardPages';

/**
 * A native 540×675 share card shown at `width` for on-screen preview only (thumbnail
 * strip, page preview — design.md §39.5). The transform is fine here because this view
 * is never handed to `captureRef`; the exported card is always mounted unscaled.
 */
export default function ScaledShareCard({ width, children }: { width: number; children: React.ReactNode }) {
  const scale = width / proseCardMetrics.width;
  return (
    <View style={[styles.clip, { width, height: Math.round(proseCardMetrics.height * scale) }]}>
      <View
        pointerEvents="none"
        style={{
          width: proseCardMetrics.width,
          height: proseCardMetrics.height,
          transform: [{ scale }],
          transformOrigin: 'top left',
        }}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
});
