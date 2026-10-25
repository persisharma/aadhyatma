import React from 'react';
import { Image, View, type StyleProp, type ViewStyle } from 'react-native';
import type { SuvicharPhotoFit } from '@/data/suvichar';

/** The sender photo in its round frame: the face-fitted square of the full image fills the circle, so no cropped copy is ever written. */
export default function SuvicharSenderPhoto({ uri, fit, size, ring, color, onLoad, onError, testID, style }: {
  uri: string; fit: SuvicharPhotoFit; size: number; ring: number; color: string;
  onLoad?: () => void; onError?: () => void; testID?: string; style?: StyleProp<ViewStyle>;
}) {
  const inner = size - ring * 2;
  // The fit is square in pixels, so this box keeps the image's own aspect.
  const width = inner / fit.w, height = inner / fit.h;
  return <View testID={testID} style={[{ width: size, height: size, borderRadius: size / 2, borderWidth: ring, borderColor: color, overflow: 'hidden' }, style]}>
    <Image accessible={false} source={{ uri }} onLoad={onLoad} onError={onError} style={{ position: 'absolute', width, height, left: -fit.x * width, top: -fit.y * height }} />
  </View>;
}
