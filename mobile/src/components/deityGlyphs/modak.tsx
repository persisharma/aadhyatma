import React from 'react';
import { StyleSheet, View } from 'react-native';

import { goldSoft, ink } from './palette';

/** Ganesha — modak (sweet). */
export default function ModakGlyph() {
  return (
    <View style={styles.wrap} accessible={false}>
      <View style={styles.peak} />
      <View style={styles.body} />
      <View style={styles.pleatLeft} />
      <View style={styles.pleatRight} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 30,
    height: 32,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  peak: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 13,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: ink,
    marginBottom: -3,
  },
  body: {
    width: 22,
    height: 19,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    borderBottomLeftRadius: 11,
    borderBottomRightRadius: 11,
    backgroundColor: ink,
  },
  pleatLeft: {
    position: 'absolute',
    top: 4,
    left: 7,
    width: 1.5,
    height: 14,
    borderRadius: 1,
    backgroundColor: goldSoft,
    opacity: 0.45,
    transform: [{ rotate: '-22deg' }],
  },
  pleatRight: {
    position: 'absolute',
    top: 4,
    right: 7,
    width: 1.5,
    height: 14,
    borderRadius: 1,
    backgroundColor: goldSoft,
    opacity: 0.45,
    transform: [{ rotate: '22deg' }],
  },
});
