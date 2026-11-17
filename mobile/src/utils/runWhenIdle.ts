import { InteractionManager } from 'react-native';

/** A scheduled idle task; `cancel()` drops it if it has not started yet. */
export type IdleTask = ReturnType<typeof InteractionManager.runAfterInteractions>;

/**
 * Run `task` once the UI is idle — after the touches, transitions and animations
 * in flight have finished — so launch deferral, artwork loading, reminder
 * re-arming and the widget plan never land on a frame the person is watching.
 *
 * This is the ONE place the app touches `InteractionManager`. React Native 0.88
 * (Expo SDK 58) removes that API, so every caller goes through here: at upgrade
 * time only this body changes (for example to `requestIdleCallback`) and no call
 * site moves. Until then it is exactly `InteractionManager.runAfterInteractions`,
 * looked up at call time so tests that spy on it keep working.
 */
export function runWhenIdle(task?: Parameters<typeof InteractionManager.runAfterInteractions>[0]): IdleTask {
  return InteractionManager.runAfterInteractions(task);
}
