import { useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { NavigationContext } from '@react-navigation/native';

/**
 * Whether a decorative animation loop should be running: the app is in the
 * foreground AND the screen is focused. A native-stack screen stays mounted under
 * whatever is pushed on top, and a backgrounded app keeps its mounted loops, so
 * without this the loops run for the whole session. Safe outside a navigator
 * (tests, previews): with no navigation context the screen counts as focused.
 * `focused` lets a caller that already knows its focus state pass it in.
 */
export function useLoopActive(focused = true): boolean {
  const navigation = useContext(NavigationContext);
  const [navFocused, setNavFocused] = useState(() => navigation?.isFocused() ?? true);
  const [foreground, setForeground] = useState(() => AppState.currentState !== 'background');

  useEffect(() => {
    if (!navigation) return undefined;
    setNavFocused(navigation.isFocused());
    const offFocus = navigation.addListener('focus', () => setNavFocused(true));
    const offBlur = navigation.addListener('blur', () => setNavFocused(false));
    return () => {
      offFocus();
      offBlur();
    };
  }, [navigation]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => setForeground(state !== 'background'));
    return () => sub.remove();
  }, []);

  return focused && navFocused && foreground;
}
