// Only selected by the opt-in development Metro resolver; no WebView/network.
import { useEffect } from 'react';
export default function DarshanErrorFrame({ onError }: { onError: (error: string) => void }) {
  useEffect(() => { onError('embed_not_allowed'); }, [onError]);
  return null;
}
