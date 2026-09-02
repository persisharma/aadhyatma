import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// The five bottom-tab-bar icons (design.md §17). Four are hand-built from `View`
// strokes; Bhajan preserves the original filled SVG glyph so its classic note
// silhouette stays crisp at tab-bar size. Kept in a leaf module so the icons
// render in isolation under Jest, without pulling in the navigator graph.

export type TabIconProps = {
  color: string;
  size: number;
};

export type BhaktiIconProps = TabIconProps & {
  accentColor: string;
};

export function HomeIcon({ color, size }: TabIconProps) {
  const stroke = Math.max(1.5, size * 0.07);
  const windowSize = size * 0.11;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          position: 'absolute',
          top: size * 0.28,
          left: size * 0.12,
          width: size * 0.5,
          height: stroke,
          borderRadius: stroke / 2,
          backgroundColor: color,
          transform: [{ rotate: '-43deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: size * 0.28,
          right: size * 0.12,
          width: size * 0.5,
          height: stroke,
          borderRadius: stroke / 2,
          backgroundColor: color,
          transform: [{ rotate: '43deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: size * 0.2,
          right: size * 0.17,
          width: stroke,
          height: size * 0.22,
          backgroundColor: color,
          borderRadius: stroke / 2,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: size * 0.42,
          width: size * 0.56,
          height: size * 0.38,
          borderWidth: stroke,
          borderTopWidth: 0,
          borderColor: color,
          borderBottomLeftRadius: stroke,
          borderBottomRightRadius: stroke,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: size * 0.52,
          width: size * 0.28,
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: size * 0.05,
        }}
      >
        {[0, 1, 2, 3].map((pane) => (
          <View
            key={pane}
            style={{
              width: windowSize,
              height: windowSize,
              borderRadius: stroke * 0.3,
              backgroundColor: color,
            }}
          />
        ))}
      </View>
    </View>
  );
}

export function BhaktiIcon({ color, accentColor, size }: BhaktiIconProps) {
  const stroke = Math.max(1.5, size * 0.07);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          position: 'absolute',
          top: size * 0.08,
          width: stroke,
          height: size * 0.58,
          borderRadius: stroke / 2,
          backgroundColor: accentColor,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: size * 0.12,
          width: size * 0.48,
          height: size * 0.58,
          borderLeftWidth: stroke,
          borderRightWidth: stroke,
          borderBottomWidth: stroke,
          borderColor: color,
          borderBottomLeftRadius: size * 0.24,
          borderBottomRightRadius: size * 0.24,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: size * 0.78,
          width: size * 0.12,
          height: size * 0.12,
          borderRadius: size * 0.06,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

export function PanchangIcon({ color, size }: TabIconProps) {
  const stroke = Math.max(1.5, size * 0.08);
  const arm = size * 0.28;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: stroke, height: size * 0.64, backgroundColor: color, borderRadius: stroke / 2 }} />
      <View style={{ position: 'absolute', width: size * 0.64, height: stroke, backgroundColor: color, borderRadius: stroke / 2 }} />
      <View style={{ position: 'absolute', top: size * 0.18, left: size * 0.5, width: arm, height: stroke, backgroundColor: color, borderRadius: stroke / 2 }} />
      <View style={{ position: 'absolute', top: size * 0.5, right: size * 0.18, width: stroke, height: arm, backgroundColor: color, borderRadius: stroke / 2 }} />
      <View style={{ position: 'absolute', bottom: size * 0.18, right: size * 0.5, width: arm, height: stroke, backgroundColor: color, borderRadius: stroke / 2 }} />
      <View style={{ position: 'absolute', bottom: size * 0.5, left: size * 0.18, width: stroke, height: arm, backgroundColor: color, borderRadius: stroke / 2 }} />
    </View>
  );
}

export function MoreIcon({ color, size }: TabIconProps) {
  const stroke = Math.max(1.5, size * 0.07);
  const dotSize = size * 0.11;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size * 0.74,
          height: size * 0.74,
          borderWidth: stroke,
          borderColor: color,
          borderRadius: size * 0.37,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: size * 0.08,
        }}
      >
        {[0, 1, 2].map((dot) => (
          <View
            key={dot}
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: color,
            }}
          />
        ))}
      </View>
    </View>
  );
}

// This is the original filled note used by the audio tab before the later icon
// redraw. The filled head, vertical stem, and square flag are intentional: the
// reference icon is a classic eighth note, not a stroked approximation.
export function MusicIcon({ color, size }: TabIconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          testID="tab-music-icon-path"
          fill={color}
          d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"
        />
      </Svg>
    </View>
  );
}
