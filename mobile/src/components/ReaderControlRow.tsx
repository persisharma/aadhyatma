import React, { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

/** Keep a centred control group clear of the trailing control, including hit slop.
 * Start stacked until measured; reflow when locale, font size or width changes.
 */
export default function ReaderControlRow({ children, trailing }: {
  children: React.ReactNode;
  trailing: React.ReactNode;
}) {
  const [width, setWidth] = useState(0);
  const [group, setGroup] = useState(0);
  const [action, setAction] = useState(0);
  const measure = (setter: (value: number) => void) => (event: LayoutChangeEvent) =>
    setter(Math.ceil(event.nativeEvent.layout.width));
  // 16pt edge inset + 24pt clearance for the two controls' touch extensions.
  const inline = width > 0 && group > 0 && action > 0 && group / 2 + action + 40 <= width / 2;
  return <View testID="reader-control-row" onLayout={measure(setWidth)} style={styles.row}>
    <View testID="reader-control-group" onLayout={measure(setGroup)} style={styles.group}>
      {children}
    </View>
    <View testID="reader-control-trailing" onLayout={measure(setAction)}
      style={[styles.trailing, inline ? styles.inline : styles.stacked]}>
      {trailing}
    </View>
  </View>;
}

const styles = StyleSheet.create({
  row: { paddingTop: 6, paddingBottom: 12, alignItems: 'center' },
  group: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18, flexShrink: 0 },
  trailing: { alignSelf: 'flex-end', marginRight: 16 },
  inline: { position: 'absolute', right: 0, top: 6, bottom: 12, justifyContent: 'center' },
  stacked: { marginTop: 24 },
});
