import React from 'react';
import { StyleSheet, View } from 'react-native';

import { gold, ink } from './palette';

/** Kubera — treasure pot heaped with gold coins. */
export default function KuberaGlyph() {
  return (
    <View style={styles.wrap} accessible={false}>
      <View style={[styles.coin, styles.coinLeft]} />
      <View style={[styles.coin, styles.coinRight]} />
      <View style={[styles.coin, styles.coinTop]} />
      <View style={styles.rim} />
      <View style={styles.pot}>
        <View style={styles.band} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 24,
    height: 26,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  coin: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: gold,
    borderWidth: 1.3,
    borderColor: ink,
  },
  coinTop: {
    left: 9,
    top: 0,
  },
  coinLeft: {
    left: 3.5,
    top: 3.5,
  },
  coinRight: {
    left: 14.5,
    top: 3.5,
  },
  rim: {
    width: 15,
    height: 2.4,
    borderRadius: 1,
    backgroundColor: ink,
    marginBottom: -1,
    zIndex: 1,
  },
  pot: {
    width: 20,
    height: 13,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: gold,
    borderWidth: 1.9,
    borderColor: ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  band: {
    width: 12,
    height: 1.6,
    borderRadius: 1,
    backgroundColor: ink,
    opacity: 0.5,
  },
});
