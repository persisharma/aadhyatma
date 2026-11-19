import React from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';

/** A View owns layout; source pixel dimensions must never size a native card.
 * Keep both percentage dimensions on the Image: absoluteFill alone does not
 * override the width/height React Native injects for bundled artwork.
 */
export default function FramedPainting({ source, small = false, fill = false, testID }: {
  source: ImageSourcePropType;
  small?: boolean;
  /** Fill the parent's box instead of a fixed shape (the parent owns the size). */
  fill?: boolean;
  testID: string;
}) {
  return <View testID={testID} style={[styles.frame, fill ? styles.fill : small ? styles.thumbnail : styles.landscape]}
    accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    <Image testID={`${testID}-image`} source={source} resizeMode="cover" accessible={false} style={styles.image} />
  </View>;
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', flexShrink: 0 },
  landscape: { width: '100%', aspectRatio: 1.5, borderRadius: 16 },
  thumbnail: { width: 81, height: 54, borderRadius: 10 },
  // Pinned to all four edges, not percentage sizes: a percentage height inside a
  // box whose height comes from stretching is unresolved, and the bundled image's
  // own 640 pt height then sizes the card.
  fill: { ...StyleSheet.absoluteFillObject },
  image: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
});
