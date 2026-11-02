import React, { useCallback, useEffect, useState } from 'react';
import BrandLaunchReveal from './BrandLaunchReveal';

/** Navigation and automatic asks mount together after the introduction. */
export default function BrandLaunchGate({ targeted, children, onReady }: {
  targeted: boolean; children: React.ReactNode; onReady?: () => void;
}) {
  const [complete, setComplete] = useState(false);
  const finish = useCallback(() => setComplete(true), []);
  useEffect(() => { if (targeted || complete) onReady?.(); }, [targeted, complete, onReady]);
  return targeted || complete ? <>{children}</> : <BrandLaunchReveal onReady={onReady} onComplete={finish} />;
}
