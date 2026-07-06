import { useEffect, useState } from 'react';

/**
 * Re-renders the consumer on each wall-clock minute boundary, so a live "now"
 * read (e.g. the current Choghadiya on the Muhurat card) flips within ~1s of the
 * minute rather than lagging up to a full interval. Returns an incrementing
 * counter to use in deps.
 */
export function useMinuteTick(): number {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;
    // Align the first fire to the next :00, then tick once a minute.
    const msToNextMinute = 60_000 - (Date.now() % 60_000);
    const timeoutId = setTimeout(() => {
      setTick((t) => t + 1);
      intervalId = setInterval(() => setTick((t) => t + 1), 60_000);
    }, msToNextMinute);
    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return tick;
}
