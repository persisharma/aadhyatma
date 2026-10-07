type Permission = { status: string; canAskAgain: boolean };
type AppState = 'active' | 'background' | 'inactive' | 'unknown' | 'extension';

export type MetaActivationDependencies = {
  platform: 'ios' | 'android';
  currentState: () => AppState | null;
  getPermission: () => Promise<Permission>;
  requestPermission: () => Promise<Permission>;
  activate: () => Promise<boolean>;
};

/** Serializes ATT and activation across permission-dialog lifecycle changes.
 * Native SDK session handling deduplicates short returns; no event payloads
 * or user/feature data enter this controller. */
export function createMetaActivationController(deps: MetaActivationDependencies) {
  let stopped = false;
  let permissionRequested = false;
  let generation = 0;
  let activatedGeneration = -1;
  let pending: Promise<void> | null = null;
  let activeWhilePending = false;
  let lastState = deps.currentState();

  const onActive = (): Promise<void> => {
    if (stopped || deps.currentState() !== 'active') return Promise.resolve();
    if (pending) {
      activeWhilePending = true;
      return pending;
    }
    activeWhilePending = false;
    const currentGeneration = generation;
    pending = (async () => {
      try {
        if (deps.platform === 'ios') {
          const permission = await deps.getPermission();
          if (permission.status === 'undetermined' && permission.canAskAgain && !permissionRequested) {
            // Another permission sheet may have appeared while this read was
            // pending. iOS cannot show ATT until the app is active again.
            if (stopped || deps.currentState() !== 'active' || generation !== currentGeneration) return;
            permissionRequested = true;
            const result = await deps.requestPermission();
            // iOS may return undetermined without showing a prompt when its
            // active state changes between JS and the native permission call.
            if (result.status === 'undetermined' && result.canAskAgain) permissionRequested = false;
          }
        }
        // ATT may complete while another permission sheet is open, or after
        // the user backgrounds the app. Wait for a future active transition.
        if (stopped || deps.currentState() !== 'active' || generation !== currentGeneration) return;
        if (activatedGeneration === currentGeneration) return;
        if (await deps.activate()) activatedGeneration = currentGeneration;
      } catch {
        // Tracking failure cannot block app usage; retry on the next foreground.
      }
    })().finally(() => {
      pending = null;
      // An active transition can arrive between the permission read finishing
      // in an inactive state and this finally handler. Do not lose that return.
      if (!stopped && (generation !== currentGeneration || activeWhilePending)
        && activatedGeneration !== generation) void onActive();
    });
    return pending;
  };

  return {
    start: onActive,
    onStateChange(state: AppState) {
      if (state === 'background' && lastState !== 'background') generation += 1;
      lastState = state;
      if (state === 'active') void onActive();
    },
    stop() { stopped = true; },
  };
}
