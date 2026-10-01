import React, { memo, useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { JAPAM_BEADS_PER_ROUND } from '@/data/japam';
import { useReducedMotion } from '@/utils/useReducedMotion';
import {
  malaBeadAngle,
  malaBeadState,
  malaDirection,
  malaMarkerBead,
  malaRotation,
  type MalaBeadState,
} from './japamMalaGeometry';

const N = JAPAM_BEADS_PER_ROUND;

// Bead material colours. These are the wood and brass of a real mala rather
// than UI roles, so they stay fixed across themes (like the deity art).
const WOOD = ['#D99558', '#A9551A', '#6B2E07'] as const;
const WOOD_CHANTED = ['#9A5A2A', '#5E2A08', '#3A1804'] as const;
const BRASS = ['#F2D48A', '#C39A45', '#8A6424'] as const;

// Space around the ring for the Sumeru + tassel, which rotate with it and can
// sit at any angle.
const RING_INSET = 34;

type Props = {
  /** Beads chanted in the current round (0–107). */
  count: number;
  /** Completed rounds; its parity sets the direction (the mala is turned at the Sumeru). */
  rounds: number;
  /** Outer box size in px; the ring radius is derived from it. */
  size: number;
  /** Pulse the marker in time with the audio loop. */
  playing?: boolean;
  /** Short line shown under the count, e.g. the Sumeru-turn notice. */
  notice?: string | null;
};

function Gradients({ id }: { id: string }) {
  const stops = (c: readonly [string, string, string]) => [
    <Stop key="0" offset="0" stopColor={c[0]} />,
    <Stop key="1" offset="0.58" stopColor={c[1]} />,
    <Stop key="2" offset="1" stopColor={c[2]} />,
  ];
  return (
    <Defs>
      <RadialGradient id={`${id}-wood`} cx="35%" cy="32%" r="75%">
        {stops(WOOD)}
      </RadialGradient>
      <RadialGradient id={`${id}-chanted`} cx="35%" cy="32%" r="75%">
        {stops(WOOD_CHANTED)}
      </RadialGradient>
      <RadialGradient id={`${id}-brass`} cx="35%" cy="30%" r="75%">
        {stops(BRASS)}
      </RadialGradient>
    </Defs>
  );
}

const fillFor = (state: MalaBeadState) =>
  state === 'current' ? 'mala-brass' : state === 'chanted' ? 'mala-chanted' : 'mala-wood';

/** The rotating layer: thread, 108 beads, Sumeru and tassel. Memoised on the
 *  marker bead so unrelated parent renders don't redraw 108 circles. */
const MalaRing = memo(function MalaRing({
  size,
  pos,
  dir,
  threadColor,
  currentStroke,
}: {
  size: number;
  pos: number;
  dir: 1 | -1;
  threadColor: string;
  currentStroke: string;
}) {
  const c = size / 2;
  const r = c - RING_INSET;
  const beadR = Math.max(2.2, ((2 * Math.PI * r) / N) * 0.46);
  const sumeruY = c + r + beadR * 2.6;
  return (
    <Svg width={size} height={size}>
      <Gradients id="mala" />
      <Circle cx={c} cy={c} r={r} stroke={threadColor} strokeWidth={1} fill="none" opacity={0.55} />
      {Array.from({ length: N }, (_, i) => {
        const a = (malaBeadAngle(i) * Math.PI) / 180;
        const state = malaBeadState(i, pos, dir);
        return (
          <Circle
            key={i}
            cx={c + r * Math.cos(a)}
            cy={c + r * Math.sin(a)}
            r={beadR}
            fill={`url(#${fillFor(state)})`}
            stroke={state === 'current' ? currentStroke : 'rgba(40,16,2,0.45)'}
            strokeWidth={state === 'current' ? 1 : 0.6}
          />
        );
      })}
      <Path
        d={`M${c - 4} ${c + r - 1} L${c} ${sumeruY} L${c + 4} ${c + r - 1}`}
        stroke={threadColor}
        strokeWidth={1}
        fill="none"
      />
      <Circle cx={c} cy={sumeruY} r={beadR * 2.3} fill="url(#mala-brass)" stroke="rgba(90,58,30,0.5)" strokeWidth={0.8} />
      <Path
        d={`M${c - beadR * 0.8} ${sumeruY + beadR * 2.1} L${c - beadR * 2.5} ${sumeruY + beadR * 8} L${c + beadR * 2.5} ${sumeruY + beadR * 8} L${c + beadR * 0.8} ${sumeruY + beadR * 2.1} Z`}
        fill={BRASS[1]}
      />
    </Svg>
  );
});

/**
 * Turning mala (design.md §35). Each chanted bead turns the ring one bead under
 * the fixed top marker; chanted beads darken; every completed round flips the
 * direction so the Sumeru is never crossed.
 */
export default function JapamMala({ count, rounds, size, playing, notice }: Props) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const dir = malaDirection(rounds);
  const pos = malaMarkerBead(count, dir);
  const target = malaRotation(pos);

  const rotation = useRef(new Animated.Value(target)).current;
  useEffect(() => {
    if (reduceMotion) {
      rotation.setValue(target);
      return;
    }
    Animated.timing(rotation, {
      toValue: target,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [target, reduceMotion, rotation]);

  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!playing || reduceMotion) {
      pulse.stopAnimation();
      pulse.setValue(1);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.35, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [playing, reduceMotion, pulse]);

  const rotate = rotation.interpolate({
    inputRange: [-360, 360],
    outputRange: ['-360deg', '360deg'],
  });

  const c = size / 2;
  const r = c - RING_INSET;
  const omSize = Math.round(size * 0.17);

  return (
    <View
      style={{ width: size, height: size }}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate }] }]}>
        <MalaRing
          size={size}
          pos={pos}
          dir={dir}
          threadColor={colors.gold}
          currentStroke={colors.saffronDeep}
        />
      </Animated.View>

      <Animated.View style={[styles.marker, { top: c - r - 22, left: c - 7, opacity: pulse }]}>
        <Svg width={14} height={12}>
          <Path d="M0 0 L14 0 L7 11 Z" fill={colors.saffron} />
        </Svg>
      </Animated.View>

      <View style={styles.center} pointerEvents="none">
        <Text
          style={[
            styles.om,
            {
              color: colors.gold,
              fontFamily: fontFamilies.devanagari,
              fontSize: omSize,
              lineHeight: Math.round(omSize * 1.5),
            },
          ]}
        >
          ॐ
        </Text>
        <Text style={[styles.count, { color: colors.inkMuted, fontFamily: fontFamilies.inter }]}>
          {count} / {N}
        </Text>
        {notice ? (
          <Text
            style={[styles.notice, { color: colors.saffronDeep, fontFamily: fontFamilies.devanagari }]}
            numberOfLines={1}
          >
            {notice}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const MAX_MINIS = 9;

function MiniMala({ size = 26 }: { size?: number }) {
  const c = size / 2;
  return (
    <Svg width={size} height={size}>
      <Gradients id="mini" />
      <Circle
        cx={c}
        cy={c - 1}
        r={c - 4}
        fill="none"
        stroke="url(#mini-wood)"
        strokeWidth={3}
        strokeDasharray="1.6 1.1"
      />
      <Circle cx={c} cy={size - 3} r={2.4} fill="url(#mini-brass)" />
    </Svg>
  );
}

/** Newest mini mala drops in when a round completes during the session. */
function DroppingMini({ animate }: { animate: boolean }) {
  const reduceMotion = useReducedMotion();
  const v = useRef(new Animated.Value(animate && !reduceMotion ? 0 : 1)).current;
  useEffect(() => {
    if (!animate || reduceMotion) return;
    Animated.spring(v, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  }, [animate, reduceMotion, v]);
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] });
  return (
    <Animated.View style={{ opacity: v, transform: [{ translateY }, { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] }}>
      <MiniMala />
    </Animated.View>
  );
}

/**
 * Completed-malas tray under the ring: a large count beside one mini mala per
 * completed round (capped at 9, then "+N").
 */
export function JapamMalaTray({
  rounds,
  label,
  emptyLabel,
}: {
  rounds: number;
  label: string;
  emptyLabel: string;
}) {
  const { colors, typography } = useTheme();
  // Only a round completed while this screen is open animates in.
  const seenRef = useRef(rounds);
  const grew = rounds > seenRef.current;
  useEffect(() => {
    seenRef.current = rounds;
  }, [rounds]);
  const shown = Math.min(rounds, MAX_MINIS);
  const minis = useMemo(() => Array.from({ length: shown }, (_, i) => i), [shown]);

  return (
    <View style={[styles.tray, { borderTopColor: colors.divider }]}>
      <View style={styles.trayCount}>
        <Text
          style={[
            styles.trayNumber,
            { color: colors.saffronDeep, fontFamily: typography.cardLatin.fontFamily },
          ]}
        >
          {rounds}
        </Text>
        <Text style={[styles.trayLabel, { color: colors.inkMuted, fontFamily: fontFamilies.devanagari }]}>
          {label}
        </Text>
      </View>
      <View style={styles.minis}>
        {rounds === 0 ? (
          <Text
            style={[
              styles.trayEmpty,
              { color: colors.inkMuted, fontFamily: typography.swipeHint.fontFamily },
            ]}
          >
            {emptyLabel}
          </Text>
        ) : (
          minis.map((i) => (
            <DroppingMini key={`${rounds}-${i}`} animate={grew && i === shown - 1} />
          ))
        )}
        {rounds > MAX_MINIS ? (
          <View style={[styles.more, { backgroundColor: colors.saffronTint }]}>
            <Text style={[styles.moreText, { color: colors.saffronDeep, fontFamily: fontFamilies.inter }]}>
              +{rounds - MAX_MINIS}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  marker: {
    position: 'absolute',
    width: 14,
    height: 12,
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  om: {
    opacity: 0.55,
    textAlign: 'center',
  },
  count: {
    fontSize: 12,
    letterSpacing: 0.5,
    includeFontPadding: false,
  },
  notice: {
    marginTop: 6,
    fontSize: 12,
  },
  tray: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 4,
  },
  trayCount: {
    alignItems: 'center',
    minWidth: 56,
  },
  trayNumber: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '700',
    includeFontPadding: false,
  },
  trayLabel: {
    fontSize: 11,
  },
  minis: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
    minHeight: 30,
  },
  trayEmpty: {
    fontStyle: 'italic',
    fontSize: 14,
    opacity: 0.85,
  },
  more: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  moreText: {
    fontSize: 11,
  },
});
