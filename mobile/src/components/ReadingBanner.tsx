import React from 'react';
import { Image, StyleSheet, View, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';
import { backgroundAspectRatio } from '@/data/backgroundAsset';
import { resolveReaderIllustration, type ReadingImage } from '@/data/readerIllustrationAsset';
import CachedArtwork from './CachedArtwork';
import frames from './readingBannerFrames.json';

/** Dedicated illustrations use their complete canvas in a stable short banner. */
export default function ReadingBanner({ source, style, testID, fallback }: {
  source: ReadingImage;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  fallback?: React.ReactNode;
}) {
  const artwork = resolveReaderIllustration(source);
  const dedicated = typeof artwork !== 'number' && artwork.kind === 'reader-illustration';
  const frameRatio = 2;
  const bundled = typeof source === 'number' ? Image.resolveAssetSource(source) : undefined;
  const sourceRatio = backgroundAspectRatio(typeof source !== 'number' && source.kind === 'reader-illustration' ? undefined : source)
    ?? (bundled?.width && bundled?.height ? bundled.width / bundled.height : frameRatio);
  const focal: { y?: number; fit?: string } | undefined = typeof source === 'number' ? undefined : frames[source.stem as keyof typeof frames];
  // These complete compositions would lose essential figures in a landscape crop.
  const contain = dedicated || focal?.fit === 'contain';
  const scaleX = Math.max(1, sourceRatio / frameRatio);
  const scaleY = Math.max(1, frameRatio / sourceRatio);
  const imageStyle: ImageStyle = {
    width: `${scaleX * 100}%`, height: `${scaleY * 100}%`,
    left: `${(1 - scaleX) * 50}%`, top: `${(1 - scaleY) * (focal?.y ?? 0.25) * 100}%`,
    right: 'auto', bottom: 'auto',
  };
  return (
    <View testID={testID} style={[styles.frame, style]}>
      <CachedArtwork source={artwork} style={StyleSheet.absoluteFill} imageStyle={contain ? undefined : imageStyle} resizeMode={contain ? 'contain' : 'cover'} fallback={dedicated || !contain ? fallback : undefined} />
    </View>
  );
}

// Keep the same composition on wider screens, rather than cropping into a thin strip.
const styles = StyleSheet.create({ frame: { width: '100%', maxWidth: 360, alignSelf: 'center', aspectRatio: 2, maxHeight: 180, overflow: 'hidden' } });
