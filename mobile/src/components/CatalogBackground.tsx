import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

/** One quiet paper/edge treatment for the complete Vrat browsing journey. */
export default function CatalogBackground() {
  return <View pointerEvents="none" accessible={false} accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFillObject}>
    <Image source={require('@assets/ui/vrat-catalog-parchment.webp')}
      resizeMode="cover" style={StyleSheet.absoluteFillObject} />
  </View>;
}
