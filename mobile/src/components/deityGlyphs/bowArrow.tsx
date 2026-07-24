import React from 'react';
import { StyleSheet, View } from 'react-native';

import { gold, ink } from './palette';

/**
 * Shri Rama — bow with a nocked arrow: an ink arc strung across its chord,
 * a gold shaft loosed along the NE diagonal.
 */
export default function BowArrowGlyph() {
  return (
    <View style={styles.wrap} accessible={false}>
      <View style={styles.bowArc} />
      <View style={styles.bowString} />
      <View style={styles.arrowShaft} />
      <View style={styles.arrowHead} />
      <View style={[styles.fletch, styles.fletchOne]} />
      <View style={[styles.fletch, styles.fletchTwo]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 32,
    height: 32,
    position: 'relative',
  },
  bowArc: {
    position: 'absolute',
    left: 3,
    top: 3,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: ink,
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  bowString: {
    position: 'absolute',
    left: 15.2,
    top: 4,
    width: 1.6,
    height: 24,
    borderRadius: 1,
    backgroundColor: ink,
    transform: [{ rotate: '45deg' }],
  },
  arrowShaft: {
    position: 'absolute',
    left: 15.1,
    top: 3,
    width: 1.8,
    height: 26,
    borderRadius: 1,
    backgroundColor: gold,
    transform: [{ rotate: '-45deg' }],
  },
  arrowHead: {
    position: 'absolute',
    left: 21.5,
    top: 1.5,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: ink,
    transform: [{ rotate: '45deg' }],
  },
  fletch: {
    position: 'absolute',
    width: 1.5,
    height: 5,
    borderRadius: 1,
    backgroundColor: ink,
    transform: [{ rotate: '45deg' }],
  },
  fletchOne: {
    left: 5.5,
    top: 24,
  },
  fletchTwo: {
    left: 8.5,
    top: 27,
  },
});
