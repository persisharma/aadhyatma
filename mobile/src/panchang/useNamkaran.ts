import { useEffect, useState } from 'react';
import { InteractionManager } from 'react-native';

import { parseIstMoment } from './gunaMilan';
import { calculateNamkaran, type NamkaranResult } from './namkaran';

export type NamkaranRequest =
  | { kind: 'birth'; date: string; time: string | null }
  | { kind: 'manual'; nakshatraIndex: number; pada: 1 | 2 | 3 | 4 };

export type NamkaranComputeState =
  | { status: 'computing' }
  | { status: 'result'; result: NamkaranResult }
  | { status: 'error' };

export function calculateNamkaranRequest(request: NamkaranRequest): NamkaranResult {
  if (request.kind === 'manual') return calculateNamkaran(request);
  if (request.time === null) return calculateNamkaran({ kind: 'dayIST', civilDate: request.date });
  return calculateNamkaran({ kind: 'instant', at: parseIstMoment(request.date, request.time) });
}

/** Keeps the astronomy call and corpus screen setup out of the push animation. */
export function useNamkaran(request: NamkaranRequest): NamkaranComputeState {
  const [state, setState] = useState<NamkaranComputeState>({ status: 'computing' });
  const requestKey = JSON.stringify(request);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | null = null;
    setState({ status: 'computing' });
    const task = InteractionManager.runAfterInteractions(() => {
      timer = setTimeout(() => {
        if (!active) return;
        try {
          setState({ status: 'result', result: calculateNamkaranRequest(request) });
        } catch {
          setState({ status: 'error' });
        }
      }, 0);
    });
    return () => {
      active = false;
      task.cancel();
      if (timer) clearTimeout(timer);
    };
    // The serialized request is the versioned, stable calculation identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  return state;
}
