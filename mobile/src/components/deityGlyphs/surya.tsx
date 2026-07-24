import React from 'react';
import { StyleSheet, View } from 'react-native';

import { gold, ink } from './palette';

/** Maa Gayatri (Savitr) — radiant sun: eight-ray star behind a gold disc. */
export default function SuryaGlyph() {
  return (
    <View style={styles.wrap} accessible={false}>
      <View style={styles.ray} />
      <View style={[styles.ray, styles.rayDiagonalOne]} />
      <View style={[styles.ray, styles.rayAcross]} />
      <View style={[styles.ray, styles.rayDiagonalTwo]} />
      <View style={styles.disc} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ray: {
    position: 'absolute',
    left: 14.1,
    top: 1,
    width: 1.8,
    height: 28,
    borderRadius: 1,
    backgroundColor: ink,
  },
  rayDiagonalOne: {
    transform: [{ rotate: '45deg' }],
  },
  rayAcross: {
    transform: [{ rotate: '90deg' }],
  },
  rayDiagonalTwo: {
    transform: [{ rotate: '135deg' }],
  },
  disc: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: gold,
    borderWidth: 1.8,
    borderColor: ink,
  },
});
