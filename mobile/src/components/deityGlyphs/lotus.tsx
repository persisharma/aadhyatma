import React from 'react';
import { StyleSheet, View } from 'react-native';

import { gold, ink } from './palette';

/** Maa Durga — an open five-petal lotus over a gold seed-pod cup. */
export default function LotusGlyph() {
  return (
    <View style={styles.wrap} accessible={false}>
      <View style={[styles.petalOuter, styles.petalOuterLeft]} />
      <View style={[styles.petalOuter, styles.petalOuterRight]} />
      <View style={[styles.petalMid, styles.petalMidLeft]} />
      <View style={[styles.petalMid, styles.petalMidRight]} />
      <View style={styles.petalCenter} />
      <View style={styles.cup} />
    </View>
  );
}

const petal = {
  position: 'absolute',
  borderWidth: 1.8,
  borderColor: ink,
  borderTopLeftRadius: 4.5,
  borderTopRightRadius: 4.5,
  borderBottomLeftRadius: 3,
  borderBottomRightRadius: 3,
} as const;

const styles = StyleSheet.create({
  wrap: {
    width: 30,
    height: 24,
    position: 'relative',
  },
  petalCenter: {
    ...petal,
    left: 10.5,
    top: 0,
    width: 9,
    height: 14,
    backgroundColor: gold,
  },
  petalMid: {
    ...petal,
    width: 8,
    height: 12,
    top: 2.5,
  },
  petalMidLeft: {
    left: 4.5,
    transform: [{ rotate: '-30deg' }],
  },
  petalMidRight: {
    left: 17.5,
    transform: [{ rotate: '30deg' }],
  },
  petalOuter: {
    ...petal,
    width: 7,
    height: 10,
    top: 6,
  },
  petalOuterLeft: {
    left: 0.5,
    transform: [{ rotate: '-58deg' }],
  },
  petalOuterRight: {
    left: 22.5,
    transform: [{ rotate: '58deg' }],
  },
  cup: {
    position: 'absolute',
    left: 6,
    top: 15.5,
    width: 18,
    height: 7,
    borderBottomWidth: 2,
    borderColor: gold,
    borderBottomLeftRadius: 9,
    borderBottomRightRadius: 9,
  },
});
