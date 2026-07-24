import React from 'react';
import { StyleSheet, View } from 'react-native';

import { gold, ink } from './palette';

/** Saraswati — veena. */
export default function VeenaGlyph() {
  return (
    <View style={styles.wrap} accessible={false}>
      <View style={styles.upperGourd} />
      <View style={styles.neck} />
      <View style={[styles.string, styles.stringOne]} />
      <View style={[styles.string, styles.stringTwo]} />
      <View style={styles.gourd} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 30,
    height: 34,
    position: 'relative',
    transform: [{ rotate: '-16deg' }],
  },
  gourd: {
    position: 'absolute',
    left: 1,
    bottom: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: gold,
    borderWidth: 1.2,
    borderColor: ink,
  },
  neck: {
    position: 'absolute',
    left: 8,
    bottom: 13,
    width: 3.5,
    height: 21,
    borderRadius: 2,
    backgroundColor: ink,
  },
  upperGourd: {
    position: 'absolute',
    left: 5,
    top: 0,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: gold,
    borderWidth: 1,
    borderColor: ink,
  },
  string: {
    position: 'absolute',
    width: 1,
    backgroundColor: gold,
    opacity: 0.85,
  },
  stringOne: {
    left: 9,
    top: 2,
    height: 24,
  },
  stringTwo: {
    left: 11,
    top: 2,
    height: 24,
  },
});
