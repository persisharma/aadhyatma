import { useContext, useEffect } from 'react';
import { AppState } from 'react-native';
import { NavigationContext } from '@react-navigation/core';
import { completedAction, waitingForAction } from './mobile';
import type { Action } from './cohort';

/** Count content only after three uninterrupted seconds in a focused foreground screen. */
export function useVisibleAction(action: Action, ready: boolean, contentKey?: string | number) {
  const navigation = useContext(NavigationContext);
  useEffect(() => {
    if (!ready || !navigation || !waitingForAction()) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      clearTimeout(timer);
      if (navigation.isFocused() && AppState.currentState === 'active')
        timer = setTimeout(() => {
          if (navigation.isFocused()) completedAction(action);
        }, 3000);
    };
    refresh();
    const focus = navigation.addListener('focus', refresh);
    const blur = navigation.addListener('blur', () => clearTimeout(timer));
    const app = AppState.addEventListener('change', refresh);
    return () => {
      clearTimeout(timer);
      focus();
      blur();
      app.remove();
    };
  }, [action, ready, contentKey, navigation]);
}
