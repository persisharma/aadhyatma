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
 */
import { requireOptionalNativeModule } from 'expo-modules-core';
import { Directory, File, Paths } from 'expo-file-system';
import { isSenderPhotoName } from '@/data/suvichar';

type Picker = typeof import('expo-image-picker');
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

/** Opens the system picker with a square crop; resolves the stored file name, or null when cancelled. */
export async function pickSenderPhoto(): Promise<string | null> {
  const picker = load();
  if (!picker) return null;
  const result = await picker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], shape: 'oval', quality: 0.8 });
  const asset = result.canceled ? undefined : result.assets[0];
  if (!asset) return null;
  const ext = /\.(jpe?g|png|heic|webp)$/i.exec(asset.uri)?.[1]?.toLowerCase() ?? 'jpg';
  const dir = new Directory(Paths.document, DIR);
  if (!dir.exists) dir.create({ intermediates: true });
  // A new name per pick, so the image cache never shows the previous photo.
  const name = `sender-${Date.now()}.${ext}`;
  new File(asset.uri).copy(new File(dir, name));
  return name;
}

export function deleteSenderPhoto(name: string): void {
  if (!isSenderPhotoName(name)) return;
  try { const file = new File(new Directory(Paths.document, DIR), name); if (file.exists) file.delete(); } catch { /* already gone */ }
}
