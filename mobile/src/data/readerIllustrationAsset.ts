import manifestJson from './readerIllustrationManifest.json';
import aliasesJson from './readerIllustrationAliases.json';
import { assetBaseUrl, remoteAssetRequest, type RemoteAssetManifest } from './assetManifest';
import type { BackgroundImage } from './backgroundAsset';

export type ReaderIllustration = Readonly<{ kind: 'reader-illustration'; stem: string }>;
export type ReadingImage = BackgroundImage | ReaderIllustration;
const manifest: RemoteAssetManifest & {
  assets: Record<string, { hash: string; ext: string; width: number; height: number }>;
} = manifestJson;
const aliases: Readonly<Record<string, string>> = aliasesJson;

/** Only approved, published illustrations belong in this separate manifest. */
export function readerIllustrationAsset(stem: string): ReaderIllustration {
  return { kind: 'reader-illustration', stem };
}

export function readerIllustrationRequest(source: ReaderIllustration) {
  return remoteAssetRequest(manifest, source.stem, assetBaseUrl());
}

/** Known before fetching; the publisher requires the compact 2:1 format. */
export function readerIllustrationAspectRatio(source: ReaderIllustration): number | undefined {
  const entry = manifest.assets[source.stem];
  return entry && entry.width > 0 && entry.height > 0 ? entry.width / entry.height : undefined;
}

/** Adopt each replacement only after publication, preserving current background use. */
export function resolveReaderIllustration(source: ReadingImage): ReadingImage {
  if (typeof source === 'number' || source.kind === 'reader-illustration') return source;
  const stem = aliases[source.stem];
  return stem && Object.prototype.hasOwnProperty.call(manifest.assets, stem)
    ? readerIllustrationAsset(stem) : source;
}
