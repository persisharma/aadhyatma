import React from 'react';
import { StyleSheet, View } from 'react-native';

import { gold, ink } from './palette';

/**
 * Maa Lakshmi — three gold coins falling into an open lotus cup. The coins
 * keep it distinct from Durga's full lotus bloom.
 */
export default function LakshmiGlyph() {
  return (
    <View style={styles.wrap} accessible={false}>
      <View style={[styles.coin, styles.coinLeft]} testID="deity-icon-lakshmi-coin">
        <View style={styles.coinDot} />
      </View>
      <View style={[styles.coin, styles.coinTop]}>
        <View style={styles.coinDot} />
      </View>
      <View style={[styles.coin, styles.coinRight]}>
        <View style={styles.coinDot} />
      </View>
      <View style={[styles.petal, styles.petalLeft]} />
      <View style={[styles.petal, styles.petalRight]} />
      <View style={styles.cup} testID="deity-icon-lakshmi-cup" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 30,
    height: 28,
    position: 'relative',
  },
  coin: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: gold,
    borderWidth: 1.4,
    borderColor: ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: ink,
  },
  coinTop: {
    left: 11.5,
    top: 1,
  },
  coinLeft: {
    left: 4,
    top: 5,
  },
  coinRight: {
    left: 19,
    top: 5,
  },
  petal: {
    position: 'absolute',
    top: 13,
    width: 7,
    height: 10,
    borderWidth: 1.8,
    borderColor: ink,
    borderTopLeftRadius: 3.5,
    borderTopRightRadius: 3.5,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  petalLeft: {
    left: 1,
    transform: [{ rotate: '-55deg' }],
  },
  petalRight: {
    left: 22,
    transform: [{ rotate: '55deg' }],
  },
  cup: {
    position: 'absolute',
    left: 5,
    top: 18,
    width: 20,
    height: 8,
    borderBottomWidth: 2,
    borderColor: ink,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
});
