import React from 'react';
import { StyleSheet, View } from 'react-native';

import { gold, ink } from './palette';

/** Maa Kali — the khadga: a thick curved blade over a gold crossguard. */
export default function KaliGlyph() {
  return (
    <View style={styles.wrap} accessible={false}>
      <View style={styles.blade} />
      <View style={styles.tip} />
      <View style={styles.crossguard} />
      <View style={styles.grip} />
      <View style={styles.pommel} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 28,
    height: 30,
    position: 'relative',
    transform: [{ rotate: '-20deg' }],
  },
  blade: {
    position: 'absolute',
    left: 6,
    top: 0,
    width: 14,
    height: 20,
    borderRightWidth: 4.5,
    borderColor: ink,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 10,
  },
  tip: {
    position: 'absolute',
    left: 11,
    top: 0,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: ink,
  },
  crossguard: {
    position: 'absolute',
    left: 8.5,
    top: 20,
    width: 9,
    height: 2,
    borderRadius: 1,
    backgroundColor: gold,
  },
  grip: {
    position: 'absolute',
    left: 11.75,
    top: 21.5,
    width: 2.5,
    height: 7,
    borderRadius: 1,
    backgroundColor: ink,
  },
  pommel: {
    position: 'absolute',
    left: 11,
    top: 26.5,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: gold,
  },
});
