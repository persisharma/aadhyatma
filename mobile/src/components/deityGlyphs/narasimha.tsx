import React from 'react';
import { StyleSheet, View } from 'react-native';

import { gold, goldSoft, ink } from './palette';

/**
 * Narasimha — a flat lion emblem: face within a radiant gold mane ring.
 * Emblematic, not a portrait (the spec forbids mini portraits).
 */
export default function NarasimhaGlyph() {
  return (
    <View style={styles.wrap} accessible={false}>
      <View style={styles.mane} testID="deity-icon-narasimha-mane" />
      <View style={[styles.tick, styles.tickNE]} />
      <View style={[styles.tick, styles.tickSE]} />
      <View style={[styles.tick, styles.tickSW]} />
      <View style={[styles.tick, styles.tickNW]} />
      <View style={styles.face} testID="deity-icon-narasimha-face">
        <View style={[styles.eye, styles.eyeLeft]} />
        <View style={[styles.eye, styles.eyeRight]} />
        <View style={styles.nose} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mane: {
    position: 'absolute',
    left: 4,
    top: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2.2,
    borderColor: gold,
  },
  tick: {
    position: 'absolute',
    width: 1.6,
    height: 5,
    borderRadius: 1,
    backgroundColor: gold,
  },
  tickNE: {
    left: 25.5,
    top: 3.5,
    transform: [{ rotate: '45deg' }],
  },
  tickSE: {
    left: 25.5,
    top: 23.5,
    transform: [{ rotate: '-45deg' }],
  },
  tickSW: {
    left: 5,
    top: 23.5,
    transform: [{ rotate: '45deg' }],
  },
  tickNW: {
    left: 5,
    top: 3.5,
    transform: [{ rotate: '-45deg' }],
  },
  face: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: goldSoft,
    borderWidth: 1.8,
    borderColor: ink,
  },
  eye: {
    position: 'absolute',
    top: 4,
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: ink,
  },
  eyeLeft: {
    left: 3,
  },
  eyeRight: {
    right: 3,
  },
  nose: {
    position: 'absolute',
    left: 4.5,
    top: 7.5,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: ink,
  },
});
