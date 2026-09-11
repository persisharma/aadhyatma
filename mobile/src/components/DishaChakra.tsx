/**
 * दिशा चक्र (PRD-24 §4, design.md §66) — the vastu compass rose. The rose
 * (8 dik labels + ticks) rotates under a FIXED top needle so the label under
 * the needle is always the direction the phone's top edge faces; the open
 * centre is the ब्रह्मस्थान, labelled as itself. Pure presentation: heading
 * (already true-north-corrected) and the faced dik arrive as props — sensor,
 * smoothing and manual-mode policy live in the screen.
 */
import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Polygon, Text as SvgText } from 'react-native-svg';

import { DISHA_LABELS, type DishaDirection } from '@/panchang/eventMuhurat';
import { dikCenterDegrees } from '@/vastu/compass';
import { useGitaLanguage } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang } from '@/utils/localize';
import { scriptTitleFont } from '@/utils/langType';

const SIZE = 264;
const CX = SIZE / 2;
const CY = SIZE / 2;
const RING_R = 118;
const LABEL_R = 96;
const CENTER_R = 44;

const CARDINALS: readonly DishaDirection[] = ['north', 'east', 'south', 'west'];

/**
 * The 32-pada door ring (PRD-24 Phase 2 §A5) — rendered only when the door
 * flow passes VERIFIED pada data for the faced wall; null keeps the dial
 * pixel-identical to Phase 1. Names arrive localized; the auspicious set is
 * tinted, the currently-pointed pada emphasised. Never numbers — names.
 */
export type PadaRing = {
  /** The wall the ring annotates (its 90° arc), from `cardinalSideForHeading`. */
  side: 'north' | 'east' | 'south' | 'west';
  /** Exactly 8 localized pada names, clockwise along the wall. */
  names: readonly string[];
  auspicious: readonly boolean[];
  /** 1–8 — the pada under the needle right now; null when outside the arc. */
  activeIndex: number | null;
};

type Props = {
  /** True-north heading in [0,360) — the rose rotates by its negative. Null renders the rose unrotated. */
  heading: number | null;
  /** The dik to emphasise (faced or manually chosen). */
  facingDik: DishaDirection | null;
  /** Rendered size in dp; the 264-unit viewBox scales, so geometry is untouched. */
  size?: number;
  padaRing?: PadaRing | null;
  testID?: string;
};

const SIDE_ARC_START_DEG: Record<PadaRing['side'], number> = {
  north: 315,
  east: 45,
  south: 135,
  west: 225,
};

export default function DishaChakra({ heading, facingDik, size = SIZE, padaRing = null, testID = 'disha-chakra' }: Props) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const labelFont = scriptTitleFont(lang, typography.cardHindi.fontFamily);

  // Manual mode has no live heading: rotate the chosen dik under the needle.
  const rotation =
    heading != null ? -heading : facingDik != null ? -dikCenterDegrees(facingDik) : 0;

  const a11y =
    facingDik != null
      ? `Compass, facing ${DISHA_LABELS[facingDik].en}${heading != null ? `, ${Math.round(heading)} degrees` : ''}`
      : 'Compass';

  return (
    <View testID={testID} accessible accessibilityLabel={a11y} style={{ alignItems: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* Fixed needle above the rose — the top of the dial is "where I face". */}
        <Polygon
          points={`${CX - 7},22 ${CX + 7},22 ${CX},6`}
          fill={colors.saffronDeep}
        />

        <Circle cx={CX} cy={CY} r={RING_R} fill={colors.parchmentSoft} stroke={colors.divider} strokeWidth={1} />

        <G rotation={rotation} origin={`${CX}, ${CY}`}>
          {/* द्वार-पद ring (§A5): 8 ticks at 11.25° along the faced wall's 90°
              arc, each pada named; auspicious padas in saffron. Inside the
              rotated G so the ring stays glued to its wall. */}
          {padaRing
            ? padaRing.names.map((name, i) => {
                const startDeg = SIDE_ARC_START_DEG[padaRing.side] + i * 11.25;
                const midDeg = startDeg + 11.25 / 2;
                const midRad = ((midDeg - 90) * Math.PI) / 180;
                const tickRad = ((startDeg - 90) * Math.PI) / 180;
                const nameX = CX + Math.cos(midRad) * (RING_R + 13);
                const nameY = CY + Math.sin(midRad) * (RING_R + 13);
                const active = padaRing.activeIndex === i + 1;
                return (
                  <G key={`pada-${i}`}>
                    <Line
                      x1={CX + Math.cos(tickRad) * RING_R}
                      y1={CY + Math.sin(tickRad) * RING_R}
                      x2={CX + Math.cos(tickRad) * (RING_R + 6)}
                      y2={CY + Math.sin(tickRad) * (RING_R + 6)}
                      stroke={colors.inkMuted}
                      strokeWidth={1}
                    />
                    <G rotation={midDeg} origin={`${nameX}, ${nameY}`}>
                      <SvgText
                        x={nameX}
                        y={nameY + 3}
                        textAnchor="middle"
                        fontFamily={labelFont}
                        fontSize={10}
                        fill={
                          active
                            ? colors.saffronDeep
                            : padaRing.auspicious[i]
                              ? colors.saffron
                              : colors.inkMuted
                        }
                      >
                        {name}
                      </SvgText>
                    </G>
                  </G>
                );
              })
            : null}
          {/* 45° ticks */}
          {Array.from({ length: 8 }, (_, i) => {
            const rad = ((i * 45 - 90) * Math.PI) / 180;
            const x1 = CX + Math.cos(rad) * (RING_R - 6);
            const y1 = CY + Math.sin(rad) * (RING_R - 6);
            const x2 = CX + Math.cos(rad) * RING_R;
            const y2 = CY + Math.sin(rad) * RING_R;
            return <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={colors.inkMuted} strokeWidth={1.5} />;
          })}
          {/* Dik labels — cardinal larger, intercardinal quieter; the faced dik in saffron. */}
          {(Object.keys(DISHA_LABELS) as DishaDirection[]).map((dik) => {
            const deg = dikCenterDegrees(dik);
            const rad = ((deg - 90) * Math.PI) / 180;
            const x = CX + Math.cos(rad) * LABEL_R;
            const y = CY + Math.sin(rad) * LABEL_R;
            const cardinal = CARDINALS.includes(dik);
            const active = dik === facingDik;
            return (
              <G key={dik} rotation={-rotation} origin={`${x}, ${y}`}>
                <SvgText
                  x={x}
                  y={y + (cardinal ? 5 : 4)}
                  textAnchor="middle"
                  fontFamily={labelFont}
                  fontSize={cardinal ? 15 : 11.5}
                  fill={active ? colors.saffronDeep : cardinal ? colors.ink : colors.inkSoft}
                >
                  {contentByLang(lang, DISHA_LABELS[dik].hi, DISHA_LABELS[dik].en)}
                </SvgText>
              </G>
            );
          })}
        </G>

        {/* The open centre IS the Brahmasthan — labelled as itself, never a needle pivot. */}
        <Circle cx={CX} cy={CY} r={CENTER_R} fill={colors.background} stroke={colors.divider} strokeWidth={1} />
        <SvgText
          x={CX}
          y={facingDik ? CY - 8 : CY - 2}
          textAnchor="middle"
          fontFamily={labelFont}
          fontSize={11}
          fill={colors.inkMuted}
        >
          {contentByLang(lang, 'ब्रह्मस्थान', 'Brahmasthan')}
        </SvgText>
        {facingDik ? (
          <SvgText
            x={CX}
            y={CY + 12}
            textAnchor="middle"
            fontFamily={labelFont}
            fontSize={14}
            fill={colors.saffronDeep}
          >
            {contentByLang(lang, DISHA_LABELS[facingDik].hi, DISHA_LABELS[facingDik].en)}
            {heading != null ? ` · ${Math.round(heading)}°` : ''}
          </SvgText>
        ) : null}
      </Svg>
    </View>
  );
}
