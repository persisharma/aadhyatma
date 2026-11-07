import React, { useContext, useEffect, useState } from 'react';
import { InteractionManager, View } from 'react-native';
import { NavigationContext } from '@react-navigation/native';
import ObservanceArtwork from './ObservanceArtwork';
import type { OccasionTiming } from '@/panchang/occasionTimings';
import { OBSERVANCE_RULES } from '@/panchang/festivals';

/** Screen-only frame: text/navigation never wait for a remote painting.
 * The export renderer is evaluated only after layout and navigation settle.
 * Blur/unmount removes subscribers and cancels unneeded cache downloads. */
export default function OccasionInlineArtwork({ item }: { item: OccasionTiming }) {
  const navigation = useContext(NavigationContext);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState(false);
  const [painted, setPainted] = useState(false);
  const identity = `${item.id}:${item.ruleId}`;
  useEffect(() => {
    let task: ReturnType<typeof InteractionManager.runAfterInteractions> | undefined;
    let alive = true;
    const stop = () => { task?.cancel(); task = undefined; if (alive) { setActive(false); setPainted(false); } };
    const start = () => {
      task?.cancel();
      task = InteractionManager.runAfterInteractions(() => { if (alive) setActive(true); });
    };
    setPainted(false);
    if (width > 0 && (!navigation || navigation.isFocused())) start();
    const focus = navigation?.addListener('focus', start);
    const blur = navigation?.addListener('blur', stop);
    return () => { alive = false; task?.cancel(); focus?.(); blur?.(); };
  }, [identity, width, navigation]);
  const rule = OBSERVANCE_RULES.find(r => r.id === item.ruleId);
  let Hero: typeof import('./OccasionHeroArtwork').default | undefined;
  if (active && width > 0) Hero = require('./OccasionHeroArtwork').default;
  return <View testID="occasion-inline-art" accessible={false}
    onLayout={e => { const next = Math.floor(e.nativeEvent.layout.width); if (next > 0) setWidth(next); }}
    style={{ width: '100%', aspectRatio: 1.5, overflow: 'hidden', borderRadius: 12 }}>
    {!painted && rule && width > 0 && <ObservanceArtwork rule={rule} width={width} height={width / 1.5} />}
    {Hero && <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, opacity: painted ? 1 : 0 }}>
      <Hero key={identity} item={item} width={width} height={width / 1.5} onPaint={setPainted} />
    </View>}
  </View>;
}

