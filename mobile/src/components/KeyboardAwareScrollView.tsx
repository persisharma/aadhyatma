import React, { forwardRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, type ScrollViewProps } from 'react-native';

/**
 * The one scroll container for screens with text inputs, so lower fields and the
 * Save button are never left behind the keyboard.
 *
 * iOS: `automaticallyAdjustKeyboardInsets` grows the scroll inset and scrolls the
 * focused field into view. Android: with edge-to-edge on (app.json) the window no
 * longer resizes for the keyboard, so a `KeyboardAvoidingView` ('height') shrinks
 * the scroll area instead; it is disabled on iOS to avoid double-adjusting.
 * Every ScrollView prop passes through, so adopting it changes nothing else about
 * a screen's layout or content.
 */
const KeyboardAwareScrollView = forwardRef<ScrollView, ScrollViewProps>(function KeyboardAwareScrollView(
  props,
  ref,
) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'android' ? 'height' : undefined}
      enabled={Platform.OS === 'android'}
    >
      <ScrollView
        ref={ref}
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        {...props}
      />
    </KeyboardAvoidingView>
  );
});

export default KeyboardAwareScrollView;
