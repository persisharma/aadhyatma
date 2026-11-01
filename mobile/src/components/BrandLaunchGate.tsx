import React, { useCallback, useState } from 'react';
import BrandLaunchReveal from './BrandLaunchReveal';

/** Navigation and automatic asks mount together after the introduction. */
export default function BrandLaunchGate({ targeted, children }: {
  targeted: boolean; children: React.ReactNode;
}) {
  const [complete, setComplete] = useState(false);
  const finish = useCallback(() => setComplete(true), []);
  return targeted || complete ? <>{children}</> : <BrandLaunchReveal onComplete={finish} />;
}
