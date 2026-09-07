/**
 * वास्तु पुरुष मंडल — the 3×3 grid (PRD-24 Phase 2 §C3, design.md §66.3).
 * North-up like a brochure. One component, two lives:
 *  - the assessment READING (chips tinted by finding class), and
 *  - the setup PLACEMENT surface (neutral chips; cells accept taps/drops).
 * A chip with a sketch point (`at`) rests exactly where the user dropped it
 * inside its cell; chips without one flow along the cell's bottom. The sketch
 * is presentation only — findings read the zone alone.
 */
import React from 'react';
import { Pressable, Text, View, type GestureResponderHandlers } from 'react-native';

import { DIKPALA_LABELS, MANDALA_GRID, zoneLabel } from '@/data/vastu/mandala';
import type { VastuZone } from '@/data/vastu/types';
import type { DishaDirection } from '@/panchang/eventMuhurat';
import type { FindingClass } from '@/vastu/assessHome';
import { useGitaLanguage } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang } from '@/utils/localize';
import { scriptTitleFont } from '@/utils/langType';

export type MandalaGridChip = {
  /** Stable key, e.g. `kitchen-1`. */
  key: string;
  label: string;
  zone: VastuZone;
  /** Sketch point inside the cell (fractions 0–1). */
  at?: { fx: number; fy: number };
  /** Reading mode tint; omitted = neutral placement chip. */
  cls?: FindingClass;
  selected?: boolean;
};

type Props = {
  chips: readonly MandalaGridChip[];
  facing: DishaDirection | null;
  /** Cell under the current drag — highlighted. */
  hoverZone?: VastuZone | null;
  /** Tap-a-cell (the non-drag placement path). Omit in reading mode. */
  onPressCell?: (zone: VastuZone) => void;
  /** Drag handles for a placed chip (move / clear). Omit in reading mode. */
  chipHandlers?: (chipKey: string) => GestureResponderHandlers;
  accessibilityLabel: string;
  testID?: string;
};

const CELL_GAP = 4;

export default function VastuMandalaGrid({
  chips,
  facing,
  hoverZone = null,
  onPressCell,
  chipHandlers,
  accessibilityLabel,
  testID = 'vastu-mandala-grid',
}: Props) {
  const { colors, typography, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);

  const clsTone = (cls?: FindingClass): { bg: string; border: string; text: string } => {
    switch (cls) {
      case 'forbidden':
        return { bg: colors.avoidChipBg, border: 'transparent', text: colors.avoidDeep };
      case 'in-keeping':
        return { bg: colors.goldChipBg, border: 'transparent', text: colors.saffronDeep };
      case 'alternate':
        return { bg: colors.goldChipBg, border: colors.cardActiveBorder, text: colors.saffronDeep };
      case 'differs':
        return { bg: colors.parchment, border: colors.saffronDeep, text: colors.inkSoft };
      case 'preferred-unmet':
        return { bg: colors.parchment, border: colors.border, text: colors.inkMuted };
      default:
        return { bg: colors.parchment, border: colors.border, text: colors.inkSoft };
    }
  };

  const doorEdge = (() => {
    if (!facing) return null;
    const base = {
      position: 'absolute' as const,
      zIndex: 2,
    };
    switch (facing) {
      case 'north':
        return { ...base, top: -8, alignSelf: 'center' as const };
      case 'south':
        return { ...base, bottom: -8, alignSelf: 'center' as const };
      case 'east':
        return { ...base, right: 2, top: '48%' as const };
      case 'west':
        return { ...base, left: 2, top: '48%' as const };
      case 'northeast':
        return { ...base, top: -8, right: 10 };
      case 'northwest':
        return { ...base, top: -8, left: 10 };
      case 'southeast':
        return { ...base, bottom: -8, right: 10 };
      case 'southwest':
        return { ...base, bottom: -8, left: 10 };
    }
  })();

  const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

  return (
    <View testID={testID} accessible accessibilityLabel={accessibilityLabel} style={{ position: 'relative' }}>
      <View style={{ gap: CELL_GAP }}>
        {MANDALA_GRID.map((row, rowIndex) => (
          <View key={rowIndex} style={{ flexDirection: 'row', gap: CELL_GAP }}>
            {row.map((zone) => {
              const inCell = chips.filter((chip) => chip.zone === zone);
              const hovered = hoverZone === zone;
              const cell = (
                <View
                  style={{
                    flex: 1,
                    aspectRatio: 1,
                    borderWidth: 1,
                    borderStyle: zone === 'center' ? 'dashed' : 'solid',
                    borderColor: hovered ? colors.saffronDeep : colors.divider,
                    backgroundColor: hovered
                      ? colors.goldChipBg
                      : zone === 'center'
                        ? colors.parchment
                        : colors.parchmentSoft,
                    borderRadius: radii.md,
                    padding: 5,
                    overflow: 'hidden',
                  }}
                >
                  <Text style={{ fontFamily: titleFont, fontSize: 10.5, lineHeight: 14, color: colors.inkSoft }}>
                    {zoneLabel(zone, lang === 'en' ? 'en' : 'hi')}
                  </Text>
                  <Text style={{ fontFamily: typography.meaning.fontFamily, fontSize: 10, lineHeight: 13, color: colors.inkMuted }}>
                    {contentByLang(lang, DIKPALA_LABELS[zone].hi, DIKPALA_LABELS[zone].en)}
                  </Text>
                  {/* Sketch-positioned chips rest where they were dropped. */}
                  {inCell
                    .filter((chip) => chip.at)
                    .map((chip) => {
                      const tone = clsTone(chip.cls);
                      const handlers = chipHandlers ? chipHandlers(chip.key) : {};
                      return (
                        <View
                          key={chip.key}
                          testID={`mandala-chip-${chip.key}`}
                          {...handlers}
                          style={{
                            position: 'absolute',
                            left: `${clamp(chip.at!.fx, 0.06, 0.8) * 100}%`,
                            top: `${clamp(chip.at!.fy, 0.3, 0.82) * 100}%`,
                            transform: [{ translateX: -18 }],
                            backgroundColor: tone.bg,
                            borderWidth: 1,
                            borderColor: chip.selected ? colors.saffronDeep : tone.border,
                            borderRadius: radii.pill,
                            paddingHorizontal: 5,
                            paddingVertical: 1,
                            maxWidth: '96%',
                          }}
                        >
                          <Text numberOfLines={1} style={{ fontFamily: titleFont, fontSize: 10, lineHeight: 14, color: tone.text }}>
                            {chip.label}
                          </Text>
                        </View>
                      );
                    })}
                  {/* Chips with no sketch point flow along the cell's bottom. */}
                  <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 3 }}>
                      {inCell
                        .filter((chip) => !chip.at)
                        .map((chip) => {
                          const tone = clsTone(chip.cls);
                          const handlers = chipHandlers ? chipHandlers(chip.key) : {};
                          return (
                            <View
                              key={chip.key}
                              testID={`mandala-chip-${chip.key}`}
                              {...handlers}
                              style={{
                                backgroundColor: tone.bg,
                                borderWidth: 1,
                                borderColor: chip.selected ? colors.saffronDeep : tone.border,
                                borderRadius: radii.pill,
                                paddingHorizontal: 5,
                                paddingVertical: 1,
                              }}
                            >
                              <Text numberOfLines={1} style={{ fontFamily: titleFont, fontSize: 10, lineHeight: 14, color: tone.text }}>
                                {chip.label}
                              </Text>
                            </View>
                          );
                        })}
                    </View>
                  </View>
                </View>
              );
              return onPressCell ? (
                <Pressable
                  key={zone}
                  testID={`mandala-cell-${zone}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Zone ${zoneLabel(zone, 'en')}`}
                  onPress={() => onPressCell(zone)}
                  style={{ flex: 1 }}
                >
                  {cell}
                </Pressable>
              ) : (
                <View key={zone} testID={`mandala-cell-${zone}`} style={{ flex: 1 }}>
                  {cell}
                </View>
              );
            })}
          </View>
        ))}
      </View>
      {doorEdge ? (
        <View
          style={[
            doorEdge,
            {
              backgroundColor: colors.parchmentSoft,
              borderWidth: 1,
              borderColor: colors.cardActiveBorder,
              borderRadius: radii.pill,
              paddingHorizontal: 7,
            },
          ]}
        >
          <Text style={{ fontFamily: titleFont, fontSize: 10, lineHeight: 15, color: colors.saffronDeep }}>
            {contentByLang(lang, 'द्वार', 'Door')}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
