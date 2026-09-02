import React from 'react';
import { StyleSheet, View } from 'react-native';

import { gold, ink } from './palette';

/**
 * Surya Dev — rising sun: gold half-disc on a horizon rule with a fan of
 * five rays. Deliberately a different silhouette from the Gayatri ray-star
 * (`surya`) so the two sun deities stay distinct at card size.
 */
export default function SuryadevGlyph() {
  return (
    <View style={styles.wrap} accessible={false}>
      <View style={[styles.ray, styles.rayCenter]} />
      <View style={[styles.ray, styles.rayLeftInner]} />
      <View style={[styles.ray, styles.rayRightInner]} />
      <View style={[styles.ray, styles.rayLeftOuter]} />
      <View style={[styles.ray, styles.rayRightOuter]} />
      <View style={styles.halfDisc} />
      <View style={styles.horizon} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 30,
    height: 24,
    position: 'relative',
  },
  horizon: {
    position: 'absolute',
    left: 2,
    bottom: 4,
    width: 26,
    height: 1.9,
    borderRadius: 1,
    backgroundColor: ink,
  },
  halfDisc: {
    position: 'absolute',
    left: 6,
    bottom: 5.9,
    width: 18,
    height: 9,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    backgroundColor: gold,
    borderWidth: 1.8,
    borderBottomWidth: 0,
    borderColor: ink,
  },
  ray: {
    position: 'absolute',
    width: 1.7,
    height: 5,
    borderRadius: 1,
    backgroundColor: ink,
  },
  rayCenter: {
    left: 14.15,
    top: 2.1,
  },
  rayLeftInner: {
    left: 7.4,
    top: 3.9,
    transform: [{ rotate: '-30deg' }],
  },
  rayRightInner: {
    left: 20.9,
    top: 3.9,
    transform: [{ rotate: '30deg' }],
  },
  rayLeftOuter: {
    left: 2.5,
    top: 8.9,
    transform: [{ rotate: '-60deg' }],
  },
  rayRightOuter: {
    left: 25.8,
    top: 8.9,
    transform: [{ rotate: '60deg' }],
  },
});
