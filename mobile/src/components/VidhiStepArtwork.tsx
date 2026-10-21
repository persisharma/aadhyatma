import React from 'react';
import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { getVidhiStepVisual, getVidhiStepVisualSequence } from '@/data/vidhi/stepVisuals';
import { vidhiArtworkAsset, vidhiArtworkAspectRatio } from '@/data/vidhiArtworkAsset';
import CachedArtwork from './CachedArtwork';

/** Full paintings come from R2 and share the persistent reading-art cache. */
export default function VidhiStepArtwork({ vidhiId, stepId, compact = false, style, renderCaption }: {
  vidhiId: string;
  stepId: string;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
  renderCaption?: (index: number) => React.ReactNode;
}) {
  const visual = getVidhiStepVisual(vidhiId, stepId);
  const visuals = compact ? (visual ? [visual] : []) : getVidhiStepVisualSequence(vidhiId, stepId);
  return (
    <>
      {visuals.map((key, index) => (
        <React.Fragment key={key}>
          <View
            testID={`vidhi-step-art-${stepId}${index > 0 ? `-${index}` : ''}`}
            style={[compact ? styles.thumbnail : [styles.scene, { aspectRatio: vidhiArtworkAspectRatio(key) }], style]}
          >
            <CachedArtwork
              source={vidhiArtworkAsset(key)}
              style={StyleSheet.absoluteFill}
              resizeMode="contain"
            />
          </View>
          {/* Captions never depend on a successful image fetch or decode. */}
          {renderCaption?.(index)}
        </React.Fragment>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  scene: { width: '100%', marginVertical: 12 },
  thumbnail: { width: 78, height: 66, flexShrink: 0 },
});
