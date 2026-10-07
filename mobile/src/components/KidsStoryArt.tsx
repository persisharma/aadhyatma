import React, { useState } from 'react';
import { Image, View, Text } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { assetBaseUrl, remoteAssetRequest, type RemoteAssetManifest } from '@/data/assetManifest';
import kidsStoryManifestJson from '@/data/kidsStoryAssetManifest.json';
import { useCachedAsset } from '@/utils/useCachedAsset';

const kidsStoryManifest = kidsStoryManifestJson as RemoteAssetManifest;

// The art is served from the CDN (R2) and cached on-device after the first view
// — see `assetCache`. This map is the only app-side knowledge of the bundle: it
// turns a story's `art` label into the manifest stem the uploaded file carries.
const ART_STEMS: Record<string, string> = {
  cover: 'kj-01', chariot: 'kj-02', sword: 'kj-03', prison: 'kj-04', midnight: 'kj-05',
  vishnu: 'kj-06', escape: 'kj-07', yamuna: 'kj-08', gokul: 'kj-09', devi: 'kj-10',
  safe: 'kj-11', wedding: 'kj-12', threat: 'kj-13', imprisoned: 'kj-14', balarama: 'kj-15',
  prayer: 'kj-16', return: 'kj-17',
  pt01: 'pt-01', pt02: 'pt-02', pt03: 'pt-03', pt04: 'pt-04', pt05: 'pt-05', pt06: 'pt-06',
  ka01: 'ka-01', ka02: 'ka-02', ka03: 'ka-03', ka04: 'ka-04', ka05: 'ka-05', ka06: 'ka-06', ka07: 'ka-07',
  gb01: 'gb-01', gb02: 'gb-02', gb03: 'gb-03', gb04: 'gb-04', gb05: 'gb-05', gb06: 'gb-06', gb07: 'gb-07',
  hs01: 'hs-01', hs02: 'hs-02', hs03: 'hs-03', hs04: 'hs-04', hs05: 'hs-05', hs06: 'hs-06',
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
  const stem = ART_STEMS[art];
  const request = stem ? remoteAssetRequest(kidsStoryManifest, stem, assetBaseUrl()) : null;
  const uri = useCachedAsset(request);
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={label}
      onLayout={event => setFrame({ w: event.nativeEvent.layout.width, h: event.nativeEvent.layout.height })}
      style={{ flex: 1, width: '100%', minHeight: 150, overflow: 'hidden', borderRadius: 12, backgroundColor: colors.parchmentSoft }}
    >
      {uri ? (
        <Image accessible={false} source={{ uri }} resizeMode="cover" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: frame.w ? imageHeight : '100%' }} />
      ) : (
        <Text style={{ color: colors.ink, padding: 20 }}>{label}</Text>
      )}
    </View>
  );
}
