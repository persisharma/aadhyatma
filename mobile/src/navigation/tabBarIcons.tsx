import React from 'react';
import { View } from 'react-native';

// The five bottom-tab-bar icons (design.md §17). All are hand-built from `View`
// strokes on the same `stroke = max(1.5, size * 0.07)` grammar with rounded caps
// — no icon font, no SVG — so they tint with the active/inactive colour and stay
// crisp at any size. Kept in a leaf module (React + View only) so they render in
// isolation under Jest, without pulling in the whole navigator graph.

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

// Composed from Views in the same grammar as its four siblings (same
// `stroke = max(1.5, size * 0.07)`, same rounded caps). Replaced a filled SVG
// path that read visibly heavier than the icons beside it: here only the note
// head is solid, with a thin stem and a hairline flag, so the glyph stays light
// while still reading unmistakably as a music note. The head MUST stay filled —
// a hollow ring reads as a broken glyph, not a note (see tabBarIcons.test.tsx).
export function MusicIcon({ color, size }: TabIconProps) {
  const stroke = Math.max(1.5, size * 0.07);
  const head = size * 0.34;
  const headLeft = size * 0.16;
  const headBottom = size * 0.18;
  // Stem rises from the head's right edge; the flag springs from the stem top.
  const stemLeft = headLeft + head - stroke;
  const stemBottom = headBottom + head / 2;
  const stemHeight = size * 0.5;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Note head — a filled disc (see note above: a hollow ring reads broken). */}
      <View
        testID="tab-music-icon-head"
        style={{
          position: 'absolute',
          left: headLeft,
          bottom: headBottom,
          width: head,
          height: head,
          borderRadius: head / 2,
          backgroundColor: color,
        }}
      />
      {/* Stem */}
      <View
        testID="tab-music-icon-stem"
        style={{
          position: 'absolute',
          left: stemLeft,
          bottom: stemBottom,
          width: stroke,
          height: stemHeight,
          borderRadius: stroke / 2,
          backgroundColor: color,
        }}
      />
      {/* Flag */}
      <View
        testID="tab-music-icon-flag"
        style={{
          position: 'absolute',
          left: stemLeft + stroke,
          bottom: stemBottom + stemHeight - stroke,
          width: size * 0.24,
          height: stroke,
          borderRadius: stroke / 2,
          backgroundColor: color,
          transform: [{ rotate: '30deg' }],
        }}
      />
    </View>
  );
}
