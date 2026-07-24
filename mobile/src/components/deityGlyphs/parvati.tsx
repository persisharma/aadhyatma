import React from 'react';
import { StyleSheet, View } from 'react-native';

import { gold, ink } from './palette';

/**
 * Maa Parvati — a five-petal mountain blossom: round outline petals at 72°
 * spacing around a gold center. Round petals keep it distinct from the
 * pointed lotus family (durga/lakshmi/radha).
 */
export default function ParvatiGlyph() {
  return (
    <View style={styles.wrap} accessible={false}>
      <View style={[styles.petal, styles.petalTop]} />
      <View style={[styles.petal, styles.petalUpperRight]} />
      <View style={[styles.petal, styles.petalLowerRight]} />
      <View style={[styles.petal, styles.petalLowerLeft]} />
      <View style={[styles.petal, styles.petalUpperLeft]} />
      <View style={styles.center} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petal: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.7,
    borderColor: ink,
  },
  petalTop: {
    left: 10,
    top: 0.5,
  },
  petalUpperRight: {
    left: 19,
    top: 7.1,
  },
  petalLowerRight: {
    left: 15.6,
    top: 17.7,
  },
  petalLowerLeft: {
    left: 4.4,
    top: 17.7,
  },
  petalUpperLeft: {
    left: 1,
    top: 7.1,
  },
  center: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: gold,
    borderWidth: 1.3,
    borderColor: ink,
  },
});
