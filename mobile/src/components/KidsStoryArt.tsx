import React, { useState } from 'react';
import { Image, View, Text } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { assetBaseUrl, remoteAssetRequest, type RemoteAssetManifest } from '@/data/assetManifest';
import kidsStoryManifestJson from '@/data/kidsStoryAssetManifest.json';
import { useCachedAsset } from '@/utils/useCachedAsset';
import { kidsStoryArtRetainedHeight } from '@/utils/kidsStoryArtFrame';

export { kidsStoryArtRetainedHeight };

const kidsStoryManifest = kidsStoryManifestJson as RemoteAssetManifest;

// The art is served from the CDN (R2) and cached on-device after the first view
// — see `assetCache`. This map is the only app-side knowledge of the bundle: it
// turns a story's `art` label into the manifest stem the uploaded file carries.
const ART_STEMS: Record<string, string> = {
  cover: 'kj-01', chariot: 'kj-02', sword: 'kj-03', prison: 'kj-04', midnight: 'kj-05',
  vishnu: 'kj-06', escape: 'kj-07', yamuna: 'kj-08', gokul: 'kj-09', devi: 'kj-10',
  safe: 'kj-11', wedding: 'kj-12', threat: 'kj-13', imprisoned: 'kj-14', balarama: 'kj-15',
  prayer: 'kj-16', return: 'kj-17',
  pt00: 'pt-00', pt01: 'pt-01', pt02: 'pt-02', pt03: 'pt-03', pt04: 'pt-04', pt05: 'pt-05', pt06: 'pt-06',
  pt07: 'pt-07', pt08: 'pt-08', pt09: 'pt-09',
  ka00: 'ka-00', ka01: 'ka-01', ka02: 'ka-02', ka03: 'ka-03', ka04: 'ka-04', ka05: 'ka-05', ka06: 'ka-06', ka07: 'ka-07',
  gb00: 'gb-00', gb01: 'gb-01', gb02: 'gb-02', gb03: 'gb-03', gb04: 'gb-04', gb05: 'gb-05', gb06: 'gb-06', gb07: 'gb-07',
  gb08: 'gb-08', gb09: 'gb-09', gb10: 'gb-10',
  hs00: 'hs-00', hs01: 'hs-01', hs02: 'hs-02', hs03: 'hs-03', hs04: 'hs-04', hs05: 'hs-05', hs06: 'hs-06',
  hs07: 'hs-07', hs08: 'hs-08', hs09: 'hs-09',
  br01: 'br-01', br02: 'br-02', br03: 'br-03', br04: 'br-04', br05: 'br-05', br06: 'br-06', br07: 'br-07',
  cg01: 'cg-01', cg02: 'cg-02', cg03: 'cg-03', cg04: 'cg-04', cg05: 'cg-05', dm01: 'dm-01', dm02: 'dm-02',
  dm03: 'dm-03', dm04: 'dm-04', dm05: 'dm-05', dm06: 'dm-06', dm07: 'dm-07', dm08: 'dm-08', dm09: 'dm-09',
  dm10: 'dm-10', dm11: 'dm-11', dm12: 'dm-12', kr01: 'kr-01', kr02: 'kr-02', ku01: 'ku-01', ku02: 'ku-02',
  ku03: 'ku-03', mg01: 'mg-01', mg02: 'mg-02', mg03: 'mg-03', mg04: 'mg-04', mg05: 'mg-05', mg06: 'mg-06',
  mg07: 'mg-07', nv01: 'nv-01', nv02: 'nv-02', nv03: 'nv-03', rb01: 'rb-01', rb02: 'rb-02', rb03: 'rb-03',
  rb04: 'rb-04', rb05: 'rb-05', rb06: 'rb-06', rb07: 'rb-07', sa01: 'sa-01', sa02: 'sa-02', sa03: 'sa-03',
  sa04: 'sa-04', sa05: 'sa-05', sa06: 'sa-06', sa07: 'sa-07', sa08: 'sa-08', si01: 'si-01', si02: 'si-02',
  si03: 'si-03', sk01: 'sk-01', sk02: 'sk-02', sk03: 'sk-03', sk04: 'sk-04', sk05: 'sk-05', sn01: 'sn-01',
  sn02: 'sn-02', sn03: 'sn-03', sn04: 'sn-04', sn05: 'sn-05', sn06: 'sn-06', sn07: 'sn-07', sn08: 'sn-08',
  sn09: 'sn-09', sn10: 'sn-10', sn11: 'sn-11', sn12: 'sn-12', sn13: 'sn-13', sn14: 'sn-14', sp01: 'sp-01',
  sp02: 'sp-02', sp03: 'sp-03', sp04: 'sp-04', su01: 'su-01', su02: 'su-02', su03: 'su-03', su04: 'su-04',
  su05: 'su-05', su06: 'su-06', su07: 'su-07',
};
export function kidsStoryArtRequest(art: string) {
  const stem = ART_STEMS[art];
  return stem ? remoteAssetRequest(kidsStoryManifest, stem, assetBaseUrl()) : null;
}
export default function KidsStoryArt({ art, label, resolvedUri, onLoad, onError }: {
  art: string; label: string; resolvedUri?: string; onLoad?: () => void; onError?: () => void;
}) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const retainedHeight = kidsStoryArtRetainedHeight(art);
  const cachedUri = useCachedAsset(resolvedUri ? null : kidsStoryArtRequest(art));
  const uri = resolvedUri ?? cachedUri;
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={label}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
      style={{ width: '100%', aspectRatio: 4 / (5 * retainedHeight), flexShrink: 0, overflow: 'hidden', borderRadius: 12, backgroundColor: colors.parchmentSoft }}
    >
      {uri ? (
        <Image onLoad={onLoad} onError={onError} accessible={false} source={{ uri }} resizeMode="contain" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: width ? width * (5 / 4) : '100%' }} />
      ) : (
        <Text style={{ color: colors.ink, padding: 20 }}>{label}</Text>
      )}
    </View>
  );
}
