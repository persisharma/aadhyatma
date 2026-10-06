import React, { useState } from 'react';
import { Image, View, Text, type ImageSourcePropType } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

// Static Metro imports keep shared illustrations bundled and available offline.
const images: Record<string, ImageSourcePropType> = {
  cover: require('../../assets/kids-stories/kj-01.webp'),
  chariot: require('../../assets/kids-stories/kj-02.webp'),
  sword: require('../../assets/kids-stories/kj-03.webp'),
  prison: require('../../assets/kids-stories/kj-04.webp'),
  midnight: require('../../assets/kids-stories/kj-05.webp'),
  vishnu: require('../../assets/kids-stories/kj-06.webp'),
  escape: require('../../assets/kids-stories/kj-07.webp'),
  yamuna: require('../../assets/kids-stories/kj-08.webp'),
  gokul: require('../../assets/kids-stories/kj-09.webp'),
  devi: require('../../assets/kids-stories/kj-10.webp'),
  safe: require('../../assets/kids-stories/kj-11.webp'),
  wedding: require('../../assets/kids-stories/kj-12.webp'),
  threat: require('../../assets/kids-stories/kj-13.webp'),
  imprisoned: require('../../assets/kids-stories/kj-14.webp'),
  balarama: require('../../assets/kids-stories/kj-15.webp'),
  prayer: require('../../assets/kids-stories/kj-16.webp'),
  return: require('../../assets/kids-stories/kj-17.webp'),
};
// The art fills whatever vertical space the page layout leaves for it (`flex: 1`
// from the parent), so the caption below always stays on screen. The image is
// pinned to the TOP of that frame at its natural 4:5 height (measured from the
// frame width); when the frame is shorter than the image, the empty parchment/
// ground band at the FOOT overflows and is clipped — only the bottom is cropped,
// never the top. `Math.max` guards the rare case where the frame is taller than
// the image (short caption / big screen) so no empty band appears below it.
export default function KidsStoryArt({ art, label }: { art: string; label: string }) {
  const { colors } = useTheme();
  const [frame, setFrame] = useState({ w: 0, h: 0 });
  const naturalHeight = frame.w * (5 / 4);
  const imageHeight = Math.max(naturalHeight, frame.h);
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={label}
      onLayout={event => setFrame({ w: event.nativeEvent.layout.width, h: event.nativeEvent.layout.height })}
      style={{ flex: 1, width: '100%', minHeight: 150, overflow: 'hidden', borderRadius: 12, backgroundColor: colors.parchmentSoft }}
    >
      {images[art] ? (
        <Image accessible={false} source={images[art]} resizeMode="cover" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: frame.w ? imageHeight : '100%' }} />
      ) : (
        <Text style={{ color: colors.ink, padding: 20 }}>{label}</Text>
      )}
    </View>
  );
}
