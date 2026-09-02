import React from 'react';
import { StyleSheet, View } from 'react-native';

import { deepBlue, featherRim, featherYellow, gold, ink, leafGreen, teal } from './palette';

/** Krishna — bansuri (flute) crossed by a peacock-feather plume. */
export default function BansuriPeacockFeatherGlyph() {
  return (
    <View style={styles.wrap} accessible={false}>
      <View style={styles.bansuri}>
        <View style={styles.bansuriBody} />
        <View style={[styles.bansuriHole, styles.bansuriHoleOne]} />
        <View style={[styles.bansuriHole, styles.bansuriHoleTwo]} />
        <View style={[styles.bansuriHole, styles.bansuriHoleThree]} />
      </View>
      <View style={styles.peacockFeather}>
        <View style={styles.featherStem} />
        <View style={[styles.featherStrand, styles.featherStrandOne]} />
        <View style={[styles.featherStrand, styles.featherStrandTwo]} />
        <View style={[styles.featherStrand, styles.featherStrandThree]} />
        <View style={[styles.featherStrand, styles.featherStrandFour]} />
        <View style={[styles.featherStrand, styles.featherStrandFive]} />
        <View style={styles.featherEyeOuter}>
          <View style={styles.featherEyeMid}>
            <View style={styles.featherEyeInner} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 36,
    height: 34,
    position: 'relative',
  },
  bansuri: {
    position: 'absolute',
    left: 1,
    bottom: 7,
    width: 30,
    height: 12,
    transform: [{ rotate: '-19deg' }],
  },
  bansuriBody: {
    position: 'absolute',
    left: 0,
    top: 5,
    width: 30,
    height: 4,
    borderRadius: 2,
    backgroundColor: gold,
    borderWidth: 1,
    borderColor: ink,
  },
  bansuriHole: {
    position: 'absolute',
    top: 6,
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: ink,
  },
  bansuriHoleOne: {
    left: 8,
  },
  bansuriHoleTwo: {
    left: 15,
  },
  bansuriHoleThree: {
    left: 22,
  },
  peacockFeather: {
    position: 'absolute',
    right: 1,
    top: 0,
    width: 21,
    height: 30,
    transform: [{ rotate: '23deg' }],
  },
  featherStem: {
    position: 'absolute',
    left: 10,
    top: 2,
    width: 1.4,
    height: 27,
    borderRadius: 1,
    backgroundColor: leafGreen,
  },
  featherStrand: {
    position: 'absolute',
    height: 1,
    borderRadius: 1,
    backgroundColor: teal,
  },
  featherStrandOne: {
    left: 3,
    top: 7,
    width: 12,
    transform: [{ rotate: '-41deg' }],
  },
  featherStrandTwo: {
    left: 5,
    top: 13,
    width: 15,
    transform: [{ rotate: '-25deg' }],
  },
  featherStrandThree: {
    left: 2,
    top: 19,
    width: 14,
    transform: [{ rotate: '-15deg' }],
  },
  featherStrandFour: {
    right: 0,
    top: 15,
    width: 13,
    transform: [{ rotate: '28deg' }],
  },
  featherStrandFive: {
    right: 2,
    top: 21,
    width: 12,
    transform: [{ rotate: '18deg' }],
  },
  featherEyeOuter: {
    position: 'absolute',
    left: 4,
    top: 3,
    width: 15,
    height: 17,
    borderRadius: 9,
    backgroundColor: featherYellow,
    borderWidth: 1,
    borderColor: featherRim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featherEyeMid: {
    width: 9,
    height: 10,
    borderRadius: 5,
    backgroundColor: teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featherEyeInner: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: deepBlue,
  },
});
