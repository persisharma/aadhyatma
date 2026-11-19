import React, { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { occasionHeroRequest, occasionHeroSubject, occasionIdentityPaintings } from '@/panchang/occasionHeroArt';
import type { OccasionTiming } from '@/panchang/occasionTimings';
import type { ArtworkImage } from '@/data/artworkAsset';
import { artworkRequest } from '@/data/artworkAsset';
import { subscribeBackgroundAsset, evictBackgroundAsset } from '@/utils/backgroundAssetCache';
import type { CachedAssetRequest } from '@/utils/assetCache';

function Painting({ source, request, width, height, onPaint }: { source?: ArtworkImage; request?: CachedAssetRequest | null; width: number; height: number; onPaint?: (ready: boolean) => void }) {
  const bundled = typeof source === 'number' ? source : null;
  const remote = request === undefined ? artworkRequest(source) : request;
  const key = bundled ?? remote?.remoteUrl ?? 'unavailable';
  const [local, setLocal] = useState<{ key: string | number; uri: string } | null>(null);
  useEffect(() => {
    onPaint?.(false);
    if (bundled !== null || !remote) return;
    let active = true;
    const stop = subscribeBackgroundAsset(remote, uri => { if (active) setLocal(uri ? { key, uri } : null); });
    return () => { active = false; stop(); };
    // Request identity, not a rebuilt object, owns the subscription.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const uri = local?.key === key ? local.uri : null;
  if (bundled === null && !uri) return <View testID="occasion-art-loading" style={{ width, height }} />;
  return <Image key={key} testID="occasion-hero-image" accessible={false}
    source={bundled ?? { uri: uri! }} resizeMode="contain" style={{ width, height }}
    onLoad={() => onPaint?.(true)} onError={() => { onPaint?.(false); if (remote) void evictBackgroundAsset(remote); }} />;
}

/** Complete scenes, numeric native frames, strict capture readiness. A failed
 * download never becomes a successfully shared blank/other-deity painting. */
export default function OccasionHeroArtwork({ item, width = 492, height = 300, onPaint }: {
  item: Pick<OccasionTiming, 'ruleId' | 'id'>; width?: number; height?: number; onPaint?: (ready: boolean) => void;
}) {
  const subject = occasionHeroSubject(item), request = subject ? occasionHeroRequest(subject) : undefined;
  const paintings = subject ? [] : occasionIdentityPaintings(item.ruleId);
  const [painted, setPainted] = useState<ReadonlySet<number>>(new Set());
  const identity = `${item.id}:${item.ruleId}`;
  useEffect(() => { setPainted(new Set()); onPaint?.(false); }, [identity]); // eslint-disable-line react-hooks/exhaustive-deps
  const count = subject ? 1 : paintings.length;
  const mark = (i: number, ready: boolean) => setPainted(old => {
    if (old.has(i) === ready) return old;
    const next = new Set(old); if (ready) next.add(i); else next.delete(i); return next;
  });
  useEffect(() => { onPaint?.(count > 0 && painted.size === count); }, [painted, count, onPaint]);
  return <View testID={`occasion-hero-${subject ?? item.ruleId}`} accessible={false}
    style={{ width, height, overflow: 'hidden', alignSelf: 'center', flexDirection: 'row', backgroundColor: '#FFF2D5' }}>
    {subject ? <Painting key={identity} request={request} width={width} height={height} onPaint={ready => mark(0, ready)} />
      : paintings.map((p, i) => <Painting key={`${identity}:${i}`} source={p.source} width={width / count} height={height} onPaint={ready => mark(i, ready)} />)}
    <LinearGradient pointerEvents="none" colors={['#FFF2D500', '#FFF2D5']} style={{ position: 'absolute', bottom: 0, left: 0, width, height: 28 }} />
  </View>;
}
