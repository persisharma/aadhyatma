import manifest from './suvicharPortraitManifest.json';
import { assetBaseUrl, remoteAssetRequest } from './assetManifest';

/** Legacy API name: standalone generated portraits also reuse reviewed paper/footer slices. */
const ramLalla = {
  kind: 'generated', width: 1122, height: 1402,
  hi: 'श्री राम लला', en: 'Shri Ram Lalla', credit: '',
  // Measured on the approved card: exclude its baked lettering, message and sender.
  crop: { x: .025, y: .082, w: .95, h: .482 },
  request: remoteAssetRequest(manifest, 'ram-lalla', assetBaseUrl())!,
} as const;

export function suvicharPhotoArt(deity: string) {
  return deity === 'ram-lalla' ? ramLalla : null;
}
