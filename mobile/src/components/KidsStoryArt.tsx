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
};
// The illustrations are 4:5 but composed with a soft parchment/ground band at
// the foot. Clip that band from the bottom so the figures fill the frame: the
// 4:5 image is pinned to the top of a shorter frame and the empty foot overflows
// out. Subjects (faces, deities) always sit above this line, so nothing of
// interest is lost. Tune with BOTTOM_CROP.
const BOTTOM_CROP = 0.12;

export default function KidsStoryArt({ art, label }: { art: string; label: string }) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  // Explicit pixel heights (measured width) are deterministic; aspectRatio inside
  // the pager's ScrollView mis-sizes the image. Image keeps its full 4:5 height
  // and is pinned to the top of a shorter frame; the empty foot overflows and is
  // clipped by the frame.
  const imageHeight = width * (5 / 4);
  const frameHeight = imageHeight * (1 - BOTTOM_CROP);
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={label}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
      style={{ width: '100%', height: width ? frameHeight : undefined, aspectRatio: width ? undefined : (4 / 5) / (1 - BOTTOM_CROP), overflow: 'hidden', borderRadius: 12, backgroundColor: colors.parchmentSoft, justifyContent: 'flex-start' }}
    >
      {images[art] ? (
        <Image accessible={false} source={images[art]} resizeMode="cover" style={{ width: '100%', height: width ? imageHeight : undefined, aspectRatio: width ? undefined : 4 / 5 }} />
      ) : (
        <Text style={{ color: colors.ink, padding: 20 }}>{label}</Text>
      )}
    </View>
  );
}
