import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AppState, Linking, Modal, View } from 'react-native';
import { setBrandLaunchVisible, subscribeBrandLaunchTarget } from '@/navigation/brandLaunchIntent';
import BrandLaunchReveal from './BrandLaunchReveal';

/** Cold launches gate navigation; later foreground visits cover it without remounting it. */
export default function BrandLaunchGate({ targeted, children, onReady }: {
  targeted: boolean; children: React.ReactNode; onReady?: () => void | Promise<void>;
}) {
  const [entered, setEntered] = useState(targeted);
  const enteredRef = useRef(targeted);
  const [playing, setPlaying] = useState(!targeted);
  const [generation, setGeneration] = useState(0);
  const skipResume = useRef(targeted);
  const finish = useCallback(() => {
    setBrandLaunchVisible(false);
    enteredRef.current = true;
    setEntered(true);
    setPlaying(false);
  }, []);
  useLayoutEffect(() => { setBrandLaunchVisible(playing); }, [playing]);
  useEffect(() => () => setBrandLaunchVisible(false), []);
  useEffect(() => {
    if (targeted && !enteredRef.current) { skipResume.current = true; finish(); }
  }, [targeted, finish]);
  useEffect(() => { if (!playing || targeted) onReady?.(); }, [playing, targeted, onReady]);
  useEffect(() => {
    let previous = AppState.currentState;
    let away = previous === 'background';
    const target = () => { skipResume.current = true; finish(); };
    const state = AppState.addEventListener('change', next => {
      // A quick iOS app-switcher return can emit active → inactive → active
      // without background. There is no reliable duration threshold for a visit.
      if (next !== 'active' && previous === 'active') {
        away = true;
        skipResume.current = false;
      }
      previous = next;
      if (next === 'active' && away) {
        away = false;
        if (skipResume.current) { finish(); return; }
        setBrandLaunchVisible(true);
        setGeneration(value => value + 1);
        setPlaying(true);
      }
    });
    const link = Linking.addEventListener('url', target);
    const unsubscribe = subscribeBrandLaunchTarget(target);
    return () => { state.remove(); link.remove(); unsubscribe(); };
  }, [finish]);
  const reveal = <BrandLaunchReveal key={generation} onReady={onReady} onComplete={finish} />;
  if (!entered && !targeted) return reveal;
  return <View style={{ flex: 1 }}>
    {children}
    {playing && <Modal testID="brand-resume-modal" visible animationType="none"
      presentationStyle="fullScreen" onRequestClose={finish} statusBarTranslucent>
      {reveal}
    </Modal>}
  </View>;
}
