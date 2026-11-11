import React from 'react';
import { Image, View } from 'react-native';
import { suvicharPhotoArt } from '@/data/suvicharPhotoArt';

type Props = {
  portrait: NonNullable<ReturnType<typeof suvicharPhotoArt>>;
  uri: string; width: number; height: number; testID?: string;
  onLoad?: () => void; onError: () => void;
};

/** Clip the same approved, text-free region in cards and selectors without changing source pixels. */
export default function SuvicharPortraitImage({ portrait, uri, width, height, testID, onLoad, onError }: Props) {
  const { crop } = portrait;
  const scale = Math.min(width / (portrait.width * crop.w), height / (portrait.height * crop.h));
  const imageWidth = portrait.width * scale, imageHeight = portrait.height * scale;
  return <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
    <View testID={testID ? `${testID}-crop` : undefined} style={{ width: imageWidth * crop.w, height: imageHeight * crop.h, overflow: 'hidden' }}>
      <Image testID={testID} accessible={false} source={{ uri }} resizeMode="stretch"
        style={{ position: 'absolute', width: imageWidth, height: imageHeight, left: -imageWidth * crop.x, top: -imageHeight * crop.y }}
        onLoad={onLoad} onError={onError} />
    </View>
  </View>;
}
