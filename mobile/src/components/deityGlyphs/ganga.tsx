import React from 'react';
import { StyleSheet, View } from 'react-native';

import { deepBlue, teal } from './palette';

/**
 * Maa Ganga — the descent: three widening wave arcs with spray droplets.
 * The only cool-palette glyph, sanctioned the same way as Krishna's
 * peacock feather (design.md §42 baked illustration palette).
 */
export default function GangaGlyph() {
  return (
    <View style={styles.wrap} accessible={false}>
      <View style={[styles.droplet, styles.dropletLeft]} />
      <View style={[styles.droplet, styles.dropletRight]} />
      <View style={styles.arcTop} />
      <View style={styles.arcMid} />
      <View style={styles.arcBottom} />
    </View>
  );
}

const arc = {
  borderColor: teal,
  borderTopWidth: 2,
} as const;

const styles = StyleSheet.create({
  wrap: {
    width: 28,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arcTop: {
    ...arc,
    width: 14,
    height: 7,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    borderColor: deepBlue,
  },
  arcMid: {
    ...arc,
    width: 20,
    height: 7,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginTop: -3,
  },
  arcBottom: {
    ...arc,
    width: 26,
    height: 7,
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    marginTop: -3,
  },
  droplet: {
    position: 'absolute',
    top: 1,
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: teal,
  },
  dropletLeft: {
    left: 3,
  },
  dropletRight: {
    right: 3,
  },
});
