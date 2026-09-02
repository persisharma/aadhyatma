import React from 'react';
import { StyleSheet, View } from 'react-native';

import { gold, ink } from './palette';

/**
 * Dattatreya — a hand-drawn ॐ (the guru-tattva emblem), adapted from the
 * proven CategoryIcon Om geometry into the baked deity palette.
 */
export default function DattatreyaGlyph() {
  return (
    <View style={styles.wrap} accessible={false}>
      <View style={styles.body} />
      <View style={styles.tail} />
      <View style={styles.crescent} />
      <View style={styles.dot} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
  },
  body: {
    position: 'absolute',
    bottom: 3,
    width: 20,
    height: 15,
    borderWidth: 2,
    borderColor: ink,
    borderRadius: 10,
    borderRightWidth: 0.5,
  },
  tail: {
    position: 'absolute',
    top: 3,
    right: 4,
    width: 11,
    height: 11,
    borderWidth: 2,
    borderColor: ink,
    borderRadius: 5.5,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  crescent: {
    position: 'absolute',
    top: 1,
    right: 6.5,
    width: 9,
    height: 5,
    borderWidth: 1.8,
    borderColor: ink,
    borderTopWidth: 0,
    borderRadius: 4.5,
  },
  dot: {
    position: 'absolute',
    top: 0,
    right: 9,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: gold,
  },
});
