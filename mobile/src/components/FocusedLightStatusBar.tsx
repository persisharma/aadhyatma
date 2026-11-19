import React from 'react';
import { StatusBar } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

/**
 * Light status-bar icons for a dark-backed screen, only while that screen is
 * focused. A native-stack screen stays mounted under whatever is pushed on top of
 * it, so an ungated `<StatusBar>` keeps its entry on RN's stack and a parchment
 * reader opened above would show white icons on a light page. Unmounting on blur
 * pops the entry and the app-level style returns.
 */
export default function FocusedLightStatusBar() {
  return useIsFocused() ? <StatusBar barStyle="light-content" /> : null;
}
