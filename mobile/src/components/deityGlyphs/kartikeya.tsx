import React from 'react';
import { StyleSheet, View } from 'react-native';

import { gold, ink } from './palette';

/** Kartikeya — the vel: a leaf-shaped spear blade on a slender shaft. */
export default function KartikeyaGlyph() {
  return (
    <View style={styles.wrap} accessible={false}>
      <View style={styles.blade} />
      <View style={styles.midrib} />
      <View style={styles.collar} />
      <View style={styles.shaft} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 16,
    height: 32,
    alignItems: 'center',
    transform: [{ rotate: '-6deg' }],
  },
  blade: {
    width: 10,
    height: 14,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    backgroundColor: gold,
    borderWidth: 1.8,
    borderColor: ink,
  },
  midrib: {
    position: 'absolute',
    left: 7.3,
    top: 3,
    width: 1.4,
    height: 9,
    borderRadius: 1,
    backgroundColor: ink,
  },
  collar: {
    width: 7,
    height: 2,
    borderRadius: 1,
    backgroundColor: ink,
    marginTop: -0.5,
  },
  shaft: {
    width: 1.9,
    height: 15,
    borderRadius: 1,
    backgroundColor: ink,
  },
});
