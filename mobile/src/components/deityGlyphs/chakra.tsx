import React from 'react';
import { StyleSheet, View } from 'react-native';

import { gold, ink } from './palette';

/** Vishnu — Sudarshana chakra: outer ring, eight spokes, gold hub. */
export default function ChakraGlyph() {
  return (
    <View style={styles.wrap} accessible={false}>
      <View style={styles.ring} testID="deity-icon-chakra-ring" />
      <View style={styles.spoke} testID="deity-icon-chakra-spoke" />
      <View style={[styles.spoke, styles.spokeDiagonalOne]} />
      <View style={[styles.spoke, styles.spokeAcross]} />
      <View style={[styles.spoke, styles.spokeDiagonalTwo]} />
      <View style={styles.hub} testID="deity-icon-chakra-hub" />
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
  ring: {
    position: 'absolute',
    left: 1,
    top: 1,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: ink,
  },
  spoke: {
    position: 'absolute',
    left: 13.15,
    top: 3,
    width: 1.7,
    height: 22,
    borderRadius: 1,
    backgroundColor: ink,
  },
  spokeDiagonalOne: {
    transform: [{ rotate: '45deg' }],
  },
  spokeAcross: {
    transform: [{ rotate: '90deg' }],
  },
  spokeDiagonalTwo: {
    transform: [{ rotate: '135deg' }],
  },
  hub: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: gold,
    borderWidth: 1.3,
    borderColor: ink,
  },
});
