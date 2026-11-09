import type { CachedAssetRequest } from '@/utils/assetCache';

/** Real shrine photographs are separate from painted full-card masters. Never redraw the idol. */
const ramLalla = {
  width: 960, height: 1619,
  hi: 'राम लला · अयोध्या', en: 'Ram Lalla · Ayodhya',
  // Legal photo credit belongs on the exported image, independently of scripture attribution.
  credit: "Photo: Prime Minister's Office · GODL-India\npib.gov.in/photshare/150987_3_1_photoshare.aspx",
  request: {
    key: 'f02f160854115012', ext: 'jpg', subdir: 'suvichar-photos',
    // Reviewed Commons delivery rendition; the same bytes are preserved in assets/suvichar/photos.
    // Use the existing download-once cache, including its timeout, cancellation and offline reuse.
    remoteUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/90/PM_at_the_Pran_Pratishtha_ceremony_of_Shree_Ram_Janmaboomi_Temple_in_Ayodhya%2C_Uttar_Pradesh_on_January_22%2C_2024_%28cropped%29.jpg/960px-PM_at_the_Pran_Pratishtha_ceremony_of_Shree_Ram_Janmaboomi_Temple_in_Ayodhya%2C_Uttar_Pradesh_on_January_22%2C_2024_%28cropped%29.jpg',
  } satisfies CachedAssetRequest,
} as const;

export function suvicharPhotoArt(deity: string) {
  return deity === 'ram-lalla' ? ramLalla : null;
}
