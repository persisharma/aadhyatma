import React from 'react';
import { StyleSheet, View } from 'react-native';

import { gold, ink } from './palette';

/**
 * Navagraha — the nine-graha yantra: a 3×3 grid of dots with Surya
 * (gold) at the center.
 */
export default function NavagrahaGlyph() {
  return (
    <View style={styles.wrap} accessible={false}>
      <View style={styles.row}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
      <View style={styles.row}>
        <View style={styles.dot} />
        <View style={styles.center} testID="deity-icon-navagraha-center" />
        <View style={styles.dot} />
      </View>
      <View style={styles.row}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 24,
    height: 24,
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dot: {
    width: 5.5,
    height: 5.5,
    borderRadius: 2.75,
    backgroundColor: ink,
  },
  center: {
    width: 5.5,
    height: 5.5,
    borderRadius: 2.75,
    backgroundColor: gold,
    borderWidth: 1.3,
    borderColor: ink,
  },
});
