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
  pt00: require('../../assets/kids-stories/pt-00.webp'),
  pt01: require('../../assets/kids-stories/pt-01.webp'),
  pt02: require('../../assets/kids-stories/pt-02.webp'),
  pt03: require('../../assets/kids-stories/pt-03.webp'),
  pt04: require('../../assets/kids-stories/pt-04.webp'),
  pt05: require('../../assets/kids-stories/pt-05.webp'),
  pt06: require('../../assets/kids-stories/pt-06.webp'),
  pt07: require('../../assets/kids-stories/pt-07.webp'),
  pt08: require('../../assets/kids-stories/pt-08.webp'),
  pt09: require('../../assets/kids-stories/pt-09.webp'),
  ka00: require('../../assets/kids-stories/ka-00.webp'),
  ka01: require('../../assets/kids-stories/ka-01.webp'),
  ka02: require('../../assets/kids-stories/ka-02.webp'),
  ka03: require('../../assets/kids-stories/ka-03.webp'),
  ka04: require('../../assets/kids-stories/ka-04.webp'),
  ka05: require('../../assets/kids-stories/ka-05.webp'),
  ka06: require('../../assets/kids-stories/ka-06.webp'),
  ka07: require('../../assets/kids-stories/ka-07.webp'),
  gb00: require('../../assets/kids-stories/gb-00.webp'),
  gb01: require('../../assets/kids-stories/gb-01.webp'),
  gb02: require('../../assets/kids-stories/gb-02.webp'),
  gb03: require('../../assets/kids-stories/gb-03.webp'),
  gb04: require('../../assets/kids-stories/gb-04.webp'),
  gb05: require('../../assets/kids-stories/gb-05.webp'),
  gb06: require('../../assets/kids-stories/gb-06.webp'),
  gb07: require('../../assets/kids-stories/gb-07.webp'),
  gb08: require('../../assets/kids-stories/gb-08.webp'),
  gb09: require('../../assets/kids-stories/gb-09.webp'),
  gb10: require('../../assets/kids-stories/gb-10.webp'),
  hs00: require('../../assets/kids-stories/hs-00.webp'),
  hs01: require('../../assets/kids-stories/hs-01.webp'),
  hs02: require('../../assets/kids-stories/hs-02.webp'),
  hs03: require('../../assets/kids-stories/hs-03.webp'),
  hs04: require('../../assets/kids-stories/hs-04.webp'),
  hs05: require('../../assets/kids-stories/hs-05.webp'),
  hs06: require('../../assets/kids-stories/hs-06.webp'),
  hs07: require('../../assets/kids-stories/hs-07.webp'),
  hs08: require('../../assets/kids-stories/hs-08.webp'),
  hs09: require('../../assets/kids-stories/hs-09.webp'),
};
// Trim only a visually reviewed empty bottom band. Every other scene retains
// the whole illustration; caption length must never determine the art crop.
const visibleHeight: Record<string, number> = { hs09: 0.84 };
export default function KidsStoryArt({ art, label }: { art: string; label: string }) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const retainedHeight = visibleHeight[art] ?? 1;
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={label}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
      style={{ width: '100%', aspectRatio: 4 / (5 * retainedHeight), flexShrink: 0, overflow: 'hidden', borderRadius: 12, backgroundColor: colors.parchmentSoft }}
    >
      {images[art] ? (
        <Image accessible={false} source={images[art]} resizeMode="contain" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: width ? width * (5 / 4) : '100%' }} />
      ) : (
        <Text style={{ color: colors.ink, padding: 20 }}>{label}</Text>
      )}
    </View>
  );
}
