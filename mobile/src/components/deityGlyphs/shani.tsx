import React from 'react';
import { StyleSheet, View } from 'react-native';

import { gold, ink } from './palette';

/** Shani Dev — the ringed graha (Saturn) with a small moon dot. */
export default function ShaniGlyph() {
  return (
    <View style={styles.wrap} accessible={false}>
      <View style={styles.disc} testID="deity-icon-shani-disc" />
      <View style={styles.ring} testID="deity-icon-shani-ring" />
      <View style={styles.moon} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 30,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disc: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: gold,
    borderWidth: 1.8,
    borderColor: ink,
  },
  ring: {
    position: 'absolute',
    left: 1.5,
    top: 7.5,
    width: 27,
    height: 11,
    borderRadius: 5.5,
    borderWidth: 1.8,
    borderColor: ink,
    transform: [{ rotate: '-18deg' }],
  },
  moon: {
    position: 'absolute',
    top: 2,
    right: 3,
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: ink,
  },
});
