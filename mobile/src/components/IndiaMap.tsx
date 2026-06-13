import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import TheerthPin from './TheerthPin';

const VIEWBOX_WIDTH = 300;
const VIEWBOX_HEIGHT = 350;

const LAT_MIN = 8;
const LAT_MAX = 36;
const LNG_MIN = 68;
const LNG_MAX = 97;

const INDIA_OUTLINE_PATH =
  'M 52,13 L 103,13 L 114,50 L 145,75 L 207,100 L 290,100 ' +
  'L 269,150 L 248,175 L 217,175 L 197,188 L 186,200 ' +
  'L 135,250 L 124,300 L 93,350 L 83,338 L 62,263 ' +
  'L 52,225 L 31,188 L 0,163 L 21,113 L 62,63 Z';

function projectLatLng(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * VIEWBOX_WIDTH;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * VIEWBOX_HEIGHT;
  return { x, y };
}

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
};

export default function IndiaMap({ pins, width, onPinPress }: Props) {
  const { colors } = useTheme();
  const height = width * (VIEWBOX_HEIGHT / VIEWBOX_WIDTH);
  const scale = width / VIEWBOX_WIDTH;

  if (__DEV__) {
    pins.forEach((pin) => {
      if (
        pin.lat < LAT_MIN ||
        pin.lat > LAT_MAX ||
        pin.lng < LNG_MIN ||
        pin.lng > LNG_MAX
      ) {
        console.warn(
          `[IndiaMap] Pin "${pin.id}" coordinates out of bounds: lat=${pin.lat}, lng=${pin.lng}`,
        );
      }
    });
  }

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      >
        <G>
          <Path
            d={INDIA_OUTLINE_PATH}
            stroke={colors.saffronDeep}
            strokeOpacity={0.6}
            strokeWidth={1.2}
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
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
