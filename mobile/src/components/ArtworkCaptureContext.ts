import { createContext } from 'react';

export type ArtworkPaintBarrier = {
  register: () => () => void;
  wait: (timeoutMs?: number) => Promise<boolean>;
};

/** Capture-only coordination; ordinary readers never wait for artwork. */
export const ArtworkCaptureContext = createContext<ArtworkPaintBarrier | null>(null);

export function createArtworkPaintBarrier(): ArtworkPaintBarrier {
  const pending = new Set<Promise<void>>();
  return {
    register() {
      let resolve!: () => void;
      const painted = new Promise<void>(done => { resolve = done; });
      pending.add(painted);
      return () => { pending.delete(painted); resolve(); };
    },
    async wait(timeoutMs = 10000) {
      if (!pending.size) return false;
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        await Promise.race([
          Promise.all([...pending]),
          new Promise<void>(resolve => { timer = setTimeout(resolve, timeoutMs); }),
        ]);
      } finally {
        if (timer) clearTimeout(timer);
      }
      return true;
    },
  };
}
