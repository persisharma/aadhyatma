import { useEffect, useState } from 'react';

/**
 * Re-renders the consumer roughly once a minute, so a live "now" read (e.g. the
 * current Choghadiya on the Muhurat card) stays current without polling the
 * clock on every frame. Returns an incrementing counter to use in deps.
 */
export function useMinuteTick(): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);
  return tick;
}
