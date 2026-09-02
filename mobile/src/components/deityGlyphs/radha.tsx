import React from 'react';
import { StyleSheet, View } from 'react-native';

import { gold, ink, leafGreen } from './palette';

/**
 * Radha Rani — a closed lotus bud on a curving stem with green sepals;
 * the bud silhouette keeps it distinct from the open-lotus glyphs.
 */
export default function RadhaGlyph() {
  return (
    <View style={styles.wrap} accessible={false}>
      <View style={styles.bud} />
      <View style={[styles.sepal, styles.sepalLeft]} />
      <View style={[styles.sepal, styles.sepalRight]} />
      <View style={styles.stem} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 22,
    height: 30,
    position: 'relative',
  },
  bud: {
    position: 'absolute',
    left: 6,
    top: 0,
    width: 10,
    height: 14,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: gold,
    borderWidth: 1.8,
    borderColor: ink,
    transform: [{ rotate: '-8deg' }],
  },
  sepal: {
    position: 'absolute',
    top: 7,
    width: 5,
    height: 9,
    borderWidth: 1.6,
    borderColor: leafGreen,
    borderTopLeftRadius: 2.5,
    borderTopRightRadius: 2.5,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  sepalLeft: {
    left: 3.5,
    transform: [{ rotate: '-25deg' }],
  },
  sepalRight: {
    left: 13.5,
    transform: [{ rotate: '25deg' }],
  },
  stem: {
    position: 'absolute',
    left: 2,
    top: 20,
    width: 12,
    height: 8,
    borderBottomWidth: 1.8,
    borderColor: leafGreen,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
});
