import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GaugeIcon } from 'phosphor-react-native/src/icons/Gauge';
import { useTheme } from '@/theme/ThemeContext';
import { useFontScale } from '@/contexts/FontScaleContext';
import type { Lang } from '@/data/gita/language';
import { pick } from '@/utils/localize';
import AppIcon from './AppIcon';
import RateStepper from './RateStepper';
import { MIN_JAPA_RATE, MAX_JAPA_RATE } from './japamRecitationTiming';

/** Compact speed control opening the existing stepper in a sheet. `iconOnly` is the
 *  44 dp speedometer circle of the counter's control column (design.md §35). */
export default function JapamTempoControl({ value, onChange, lang, fontFamily, iconOnly = false }: {
  value: number; onChange: (rate: number) => void; lang: Lang; fontFamily: string; iconOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { colors, typography } = useTheme();
  const { factor } = useFontScale();
  const label = pick(lang, { hi: 'जप की गति', en: 'Chanting speed', gu: 'જપની ગતિ', kn: 'ಜಪದ ವೇಗ' });
  return <View>
    <Pressable testID="japam-tempo-open" onPress={() => setOpen(true)} accessibilityRole="button"
      accessibilityLabel={`${label}, ${value.toFixed(1)}×`} accessibilityState={{ expanded: open }}
      hitSlop={iconOnly ? 6 : undefined}
      style={({ pressed }) => [iconOnly ? styles.circle : styles.chip, {
        backgroundColor: colors.parchmentSoft,
        borderColor: iconOnly ? colors.cardActiveBorder : colors.divider,
        opacity: pressed ? .7 : 1 }]}>
      <GaugeIcon size={iconOnly ? 20 : 18} color={colors.saffronDeep} />
      {iconOnly ? null : <>
        <Text style={{ color: colors.ink, fontSize: 18 * factor, fontFamily: typography.pageCounter.fontFamily }}>{value.toFixed(1)}×</Text>
        <View style={{ transform: [{ rotate: '90deg' }] }}><AppIcon name="next" size={12} color={colors.inkMuted} /></View>
      </>}
    </Pressable>
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      <Pressable style={[styles.backdrop, { backgroundColor: colors.modalBackdrop }]} onPress={() => setOpen(false)}
        accessibilityLabel="Dismiss chanting speed">
        <Pressable onPress={event => event.stopPropagation()} accessibilityViewIsModal
          style={[styles.sheet, { backgroundColor: colors.parchment, borderColor: colors.divider }]}>
          <SafeAreaView edges={['bottom']}>
            <View style={styles.heading}>
              <Text style={{ flex: 1, color: colors.ink, fontFamily, fontSize: 18 * factor }}>{label}</Text>
              <Pressable testID="japam-tempo-close" onPress={() => setOpen(false)} accessibilityRole="button"
                accessibilityLabel="Close chanting speed" style={styles.close}>
                <AppIcon name="close" size={18} color={colors.inkSoft} />
              </Pressable>
            </View>
            <RateStepper value={value} onChange={onChange} min={MIN_JAPA_RATE} max={MAX_JAPA_RATE} step={.1}
              labelFontFamily={fontFamily} />
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  </View>;
}

const styles = StyleSheet.create({
  chip: { minHeight: 44, borderWidth: 1, borderRadius: 24, paddingHorizontal: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  circle: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: { padding: 20, paddingBottom: 28, borderWidth: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  close: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
