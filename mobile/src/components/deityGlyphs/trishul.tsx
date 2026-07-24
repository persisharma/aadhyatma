import React from 'react';
import { StyleSheet, View } from 'react-native';

import { gold, ink } from './palette';

/** Shri Shiva — trishul: three prongs over a gold crossbar and damaru dot. */
export default function TrishulGlyph() {
  return (
    <View style={styles.wrap} accessible={false}>
      <View style={styles.prongCenter} testID="deity-icon-trishul-prong" />
      <View style={styles.prongLeft} />
      <View style={styles.prongRight} />
      <View style={styles.crossbar} testID="deity-icon-trishul-crossbar" />
      <View style={styles.shaft} testID="deity-icon-trishul-shaft" />
      <View style={styles.damaru} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 24,
    height: 32,
    position: 'relative',
    transform: [{ rotate: '-8deg' }],
  },
  prongCenter: {
    position: 'absolute',
    left: 10.5,
    top: 0,
    width: 3,
    height: 10,
    borderRadius: 1.5,
    backgroundColor: ink,
  },
  prongLeft: {
    position: 'absolute',
    left: 3,
    top: 1,
    width: 8,
    height: 11,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: ink,
    borderTopLeftRadius: 7,
  },
  prongRight: {
    position: 'absolute',
    left: 13,
    top: 1,
    width: 8,
    height: 11,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: ink,
    borderTopRightRadius: 7,
  },
  crossbar: {
    position: 'absolute',
    left: 5,
    top: 11,
    width: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: gold,
  },
  shaft: {
    position: 'absolute',
    left: 11,
    top: 11,
    width: 2,
    height: 21,
    borderRadius: 1,
    backgroundColor: ink,
  },
  damaru: {
    position: 'absolute',
    left: 15.5,
    top: 15,
    width: 3.5,
    height: 3.5,
    borderRadius: 1.75,
    backgroundColor: gold,
  },
});
