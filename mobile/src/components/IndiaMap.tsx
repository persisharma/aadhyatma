import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import TheerthPin from './TheerthPin';
import {
  INDIA_PROJECTION,
  INDIA_OUTLINE,
  INDIA_STATES,
} from './indiaMapPaths.generated';

const { lngMin, lngMax, latMin, latMax, width: VB_W, height: VB_H } =
  INDIA_PROJECTION;

/**
 * Equirectangular projection (design.md §28). Uses the SAME constants the
 * committed paths in indiaMapPaths.generated.ts were generated from, so a pin
 * lands exactly on the real outline. Exported for the alignment test.
 */
export function projectLatLng(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - lngMin) / (lngMax - lngMin)) * VB_W;
  const y = ((latMax - lat) / (latMax - latMin)) * VB_H;
  return { x, y };
}

function normalizeState(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

const STATE_BY_NORM = new Map(
  INDIA_STATES.map((s) => [normalizeState(s.nameEn), s] as const),
);

export type IndiaMapPin = {
  id: string;
  lat: number;
  lng: number;
  label: string;
};

type Props = {
  pins: IndiaMapPin[];
  width: number;
  onPinPress: (id: string) => void;
  /** Render thin state-boundary strokes. Default true on the Theerth surface. */
  showStates?: boolean;
  /** Fill the matching state (By-State focus). Matched on a normalised name. */
  highlightStateEn?: string;
};

export default function IndiaMap({
  pins,
  width,
  onPinPress,
  showStates = true,
  highlightStateEn,
}: Props) {
  const { colors } = useTheme();
  const height = width * (VB_H / VB_W);
  const scale = width / VB_W;
  const highlighted = highlightStateEn
    ? STATE_BY_NORM.get(normalizeState(highlightStateEn))
    : undefined;

  if (__DEV__) {
    pins.forEach((pin) => {
      if (
        pin.lat < latMin ||
        pin.lat > latMax ||
        pin.lng < lngMin ||
        pin.lng > lngMax
      ) {
        console.warn(
          `[IndiaMap] Pin "${pin.id}" coordinates out of bounds: lat=${pin.lat}, lng=${pin.lng}`,
        );
      }
    });
  }

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height} viewBox={`0 0 ${VB_W} ${VB_H}`}>
        {showStates ? (
          <G>
            {INDIA_STATES.map((s) => {
              const isOn = highlighted?.id === s.id;
              return (
                <Path
                  key={s.id}
                  d={s.path}
                  stroke={colors.saffron}
                  strokeOpacity={0.25}
                  strokeWidth={0.6}
                  fill={isOn ? colors.saffron : 'none'}
                  fillOpacity={isOn ? 0.12 : 0}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              );
            })}
          </G>
        ) : null}
        <G>
          {INDIA_OUTLINE.map((d, i) => (
            <Path
              key={`outline-${i}`}
              d={d}
              stroke={colors.saffronDeep}
              strokeOpacity={0.6}
              strokeWidth={1.2}
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
        </G>
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.pinLayer]} pointerEvents="box-none">
        {pins.map((pin) => {
          const projected = projectLatLng(pin.lat, pin.lng);
          const x = projected.x * scale;
          const y = projected.y * scale;
          return (
            <TheerthPin
              key={pin.id}
              x={x}
              y={y}
              label={pin.label}
              onPress={() => onPinPress(pin.id)}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
  pinLayer: {
    overflow: 'visible',
  },
});
