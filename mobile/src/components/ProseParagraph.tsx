import React, { useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, useWindowDimensions, type TextProps } from 'react-native';

/** A complete prose paragraph, with the source text kept intact for accessibility. */
export default function ProseParagraph({ children, style, onLayout, ...props }: Omit<TextProps, 'children'> & {
  children: string;
}) {
  const { width, fontScale } = useWindowDimensions();
  const metrics = StyleSheet.flatten(style);
  const identity = useMemo(() => JSON.stringify([children, width, fontScale, metrics?.fontFamily, metrics?.fontSize, metrics?.lineHeight]),
    [children, width, fontScale, metrics?.fontFamily, metrics?.fontSize, metrics?.lineHeight]);
  const currentIdentity = useRef(identity);
  currentIdentity.current = identity;
  const [measured, setMeasured] = useState<{ identity: string; height: number } | null>(null);
  const height = measured?.identity === identity ? measured.height : undefined;
  // RN 0.81 iOS Fabric can round the draw rectangle below its measured height
  // and clip a wrapped final line (react-native#53450). One point of room fixes
  // the drawing boundary without changing the source, font or line spacing.
  return <Text
    {...props}
    key={identity}
    style={[style, Platform.OS === 'ios' && height !== undefined ? { minHeight: height + 1 } : undefined]}
    onLayout={Platform.OS === 'ios' ? event => {
      if (currentIdentity.current === identity && height === undefined) setMeasured({ identity, height: event.nativeEvent.layout.height });
      onLayout?.(event);
    } : onLayout}
  >{children}</Text>;
}
