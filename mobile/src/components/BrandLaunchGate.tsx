import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { Linking, View } from 'react-native';
import { setBrandLaunchVisible, subscribeBrandLaunchTarget } from '@/navigation/brandLaunchIntent';
import BrandLaunchReveal from './BrandLaunchReveal';

/** One introduction per cold JS process. Background returns retain the running app. */
export default function BrandLaunchGate({ targeted, children, onReady }: {
  targeted: boolean; children: React.ReactNode; onReady?: () => void | Promise<void>;
}) {
  // Deliberately in memory: a killed process gets a fresh gate; a warm resume
  // cannot reset it. Do not persist this as an install-level "already seen" flag.
  const [entered, setEntered] = useState(targeted);
  const playing = !entered && !targeted;
  const finish = useCallback(() => {
    setBrandLaunchVisible(false);
    setEntered(true);
  }, []);
  useLayoutEffect(() => { setBrandLaunchVisible(playing); }, [playing]);
  useEffect(() => () => setBrandLaunchVisible(false), []);
  useEffect(() => { if (targeted) finish(); }, [targeted, finish]);
  useEffect(() => { if (!playing) onReady?.(); }, [playing, onReady]);
  useEffect(() => {
    const link = Linking.addEventListener('url', finish);
    const unsubscribe = subscribeBrandLaunchTarget(finish);
    return () => { link.remove(); unsubscribe(); };
  }, [finish]);
  if (playing) return <BrandLaunchReveal onReady={onReady} onComplete={finish} />;
  return <View style={{ flex: 1 }}>{children}</View>;
}
