import React from 'react';
import { StyleSheet, View } from 'react-native';

import { goldSoft, ink } from './palette';

/** Hanuman — gada (mace). */
export default function GadaGlyph() {
  return (
    <View style={styles.wrap} accessible={false}>
      <View style={styles.head} />
      <View style={styles.neck} />
      <View style={styles.handle} />
      <View style={styles.pommel} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 22,
    height: 30,
    alignItems: 'center',
    transform: [{ rotate: '-12deg' }],
  },
  head: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: ink,
    borderWidth: 1.2,
    borderColor: goldSoft,
  },
  neck: {
    width: 5,
    height: 2,
    backgroundColor: goldSoft,
    marginTop: -1,
    opacity: 0.85,
  },
  handle: {
    width: 3.5,
    height: 9,
    borderRadius: 1,
    backgroundColor: ink,
  },
  pommel: {
    width: 9,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: ink,
    marginTop: -1,
  },
});
