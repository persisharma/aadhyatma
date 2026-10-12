import React from 'react';
import type { BackgroundImage } from '@/data/backgroundAsset';
import CachedArtwork, { type CachedArtworkProps } from './CachedArtwork';

type Props = Omit<CachedArtworkProps, 'source'> & { source?: BackgroundImage | null };

/** Backgrounds stay distinct from standalone reader illustrations. */
export default function BackgroundArtwork(props: Props) {
  return <CachedArtwork {...props} />;
}
