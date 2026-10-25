/**
 * The Suvichar sender photo (design.md §82 *Sender photo*): a square crop the user picks
 * from their own library, copied into app documents so it survives the picker's temporary
 * cache. It never leaves the device except inside a card the user chooses to share.
 *
 * `expo-image-picker` is a native module — a store build. Its JS entry calls
 * `requireNativeModule('ExponentImagePicker')` at import time, which throws on a binary that
 * predates it, so it is probed and lazily required (the same stale-binary honesty as
 * `multiShare.ts`): an OTA on such a binary simply hides the photo control.
 *
 * Preferences store only the file name, never the absolute URI: the iOS container path
 * changes across app updates, so the URI is resolved against `Paths.document` at render time.
 *
 * Faces are fitted automatically, never by a manual crop: the local `SuvicharFace` module
 * (modules/suvichar-face: Apple Vision / Android FaceDetector, on-device) returns face boxes and
 * `suvicharPhotoFit` turns them into the square the round frame shows. The file is not re-encoded.
 */
import { requireOptionalNativeModule } from 'expo-modules-core';
import { Directory, File, Paths } from 'expo-file-system';
import { isSenderPhotoName, suvicharPhotoFit, type SuvicharFaceBox, type SuvicharPhotoFit } from '@/data/suvichar';

type Picker = typeof import('expo-image-picker');
type FaceModule = { detect(uri: string): Promise<{ width: number; height: number; faces: SuvicharFaceBox[] }> };
const DIR = 'suvichar';

let cached: Picker | null | undefined;
function load(): Picker | null {
  if (cached !== undefined) return cached;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cached = requireOptionalNativeModule('ExponentImagePicker') ? require('expo-image-picker') as Picker : null;
  } catch { cached = null; }
  return cached;
}

/** True when this binary can open the photo library. */
export function isSenderPhotoAvailable(): boolean { return load() !== null; }

export function senderPhotoUri(name: string): string | null {
  return isSenderPhotoName(name) ? new File(new Directory(Paths.document, DIR), name).uri : null;
}

/** A detector failure or a binary without it falls back to a centred square; a photo is never refused for its faces. */
async function fitFaces(uri: string, width: number, height: number): Promise<SuvicharPhotoFit> {
  try {
    const detector = requireOptionalNativeModule<FaceModule>('SuvicharFace');
    if (detector) { const found = await detector.detect(uri); return suvicharPhotoFit(found.width, found.height, found.faces); }
  } catch { /* centred square below */ }
  return suvicharPhotoFit(width, height, []);
}

/** Opens the system picker; resolves the stored file name and its face fit, or null when cancelled. */
export async function pickSenderPhoto(): Promise<{ name: string; fit: SuvicharPhotoFit } | null> {
  const picker = load();
  if (!picker) return null;
  const result = await picker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
  const asset = result.canceled ? undefined : result.assets[0];
  if (!asset) return null;
  const ext = /\.(jpe?g|png|heic|webp)$/i.exec(asset.uri)?.[1]?.toLowerCase() ?? 'jpg';
  const dir = new Directory(Paths.document, DIR);
  if (!dir.exists) dir.create({ intermediates: true });
  // A new name per pick, so the image cache never shows the previous photo.
  const name = `sender-${Date.now()}.${ext}`;
  const file = new File(dir, name);
  new File(asset.uri).copy(file);
  return { name, fit: await fitFaces(file.uri, asset.width, asset.height) };
}

export function deleteSenderPhoto(name: string): void {
  if (!isSenderPhotoName(name)) return;
  try { const file = new File(new Directory(Paths.document, DIR), name); if (file.exists) file.delete(); } catch { /* already gone */ }
}
