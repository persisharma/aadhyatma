import React from 'react';
import { Image, View } from 'react-native';
import type { FestivalMotif as Motif } from '@/panchang/occasionTimings';

const atlas = require('@assets/festival-art/painted-atlas.webp');
/** Reviewed equal-cell atlas: four columns, three rows, transparent padding.
 * Every subject and both floral corners use the same bundled decoded texture. */
const cells: Record<Motif, number> = {
  diya: 0, fire: 1, shastra: 2, kalash: 3, moon: 4, sun: 5,
  shiva: 6, ganesh: 7, rakhi: 8, lotus: 9,
};
export function FestivalPaintedCell({ cell, size, onLoad, testID, zoom = 1 }: {
  cell: number; size: number; zoom?: number; onLoad?: () => void; testID?: string;
}) {
  return (
    <View accessible={false} importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size, flexShrink: 0, overflow: 'hidden' }}>
      <Image source={atlas} testID={testID} onLoad={onLoad} resizeMode="stretch"
        style={{ position: 'absolute', width: size * 4 * zoom, height: size * 3 * zoom,
          left: -(cell % 4) * size * zoom - (zoom - 1) * size / 2, top: -Math.floor(cell / 4) * size * zoom - (zoom - 1) * size / 2 }} />
    </View>
  );
}
export default function FestivalMotif({ motif, size = 54, onLoad }: {
  motif: Motif; size?: number; onLoad?: () => void;
}) {
  return <FestivalPaintedCell cell={cells[motif]} size={size} zoom={motif === 'diya' ? 1.16 : 1}
    onLoad={onLoad} testID={`festival-art-${motif}`} />;
}
