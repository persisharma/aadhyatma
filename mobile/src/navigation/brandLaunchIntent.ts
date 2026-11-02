import { useSyncExternalStore } from 'react';
/** Lightweight target signal: a notification/widget destination always wins over branding. */
const listeners = new Set<() => void>();
export function signalBrandLaunchTarget() { for (const listener of [...listeners]) listener(); }
export function subscribeBrandLaunchTarget(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

// A reveal is a temporary visual block, not a consumed daily launch prompt.
let visible = false;
const visibilityListeners = new Set<() => void>();
export function isBrandLaunchVisible() { return visible; }
export function setBrandLaunchVisible(next: boolean) {
  if (next === visible) return;
  visible = next;
  for (const listener of [...visibilityListeners]) listener();
}
export function useBrandLaunchVisible() {
  return useSyncExternalStore(listener => {
    visibilityListeners.add(listener);
    return () => { visibilityListeners.delete(listener); };
  }, isBrandLaunchVisible, () => false);
}
