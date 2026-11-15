/**
 * Read one bundled part of the corpus as text.
 *
 * The parts are Metro assets (`./parts.ts`), so how they are reached depends on
 * how the app was launched, and `expo-asset` already knows all three ways:
 *
 *   - a store build: the file is inside the binary. On Android it is a raw
 *     resource, which `downloadAsync` copies to the app cache once and then
 *     reuses; on iOS it is read in place from the app bundle.
 *   - an OTA update: `expo-updates` has the file in its own directory.
 *   - development: it is fetched from Metro.
 *
 * Nothing is ever fetched from the network in a release build.
 *
 * Kept in its own module so the corpus loader has exactly one native seam, and
 * so tests can replace that seam with a plain file read.
 */
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

export async function readValmikiPart(source: number): Promise<string> {
  const asset = Asset.fromModule(source);
  await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  return FileSystem.readAsStringAsync(uri);
}
