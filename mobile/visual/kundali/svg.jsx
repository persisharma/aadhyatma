import React from 'react';
export * from 'react-native-svg-web';
export { default } from 'react-native-svg-web';

// RN Web's semantic-element conversion turns an SVG g with a button role
// into an HTML button. Preserve the SVG element and its browser semantics.
export function G({ children, accessible, accessibilityRole, accessibilityLabel, testID, onPress, ...props }) {
  return React.createElement('g', {
    ...props,
    role: accessibilityRole,
    'aria-label': accessibilityLabel,
    'data-testid': testID,
    tabIndex: onPress ? 0 : undefined,
    onClick: onPress,
    onKeyDown: onPress ? event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onPress(event); }
    } : undefined,
  }, children);
}
