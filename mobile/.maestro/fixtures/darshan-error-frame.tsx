// Only selected by the opt-in development Metro resolver; no WebView/network.
import { useEffect } from 'react';
export default function DarshanErrorFrame({ onError }: { onError: () => void }) {
  useEffect(() => { onError(); }, [onError]);
  return null;
}
