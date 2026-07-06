import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang, pick } from '@/utils/localize';
import { titleFontByLang } from '@/utils/langType';
import { usePanchangCalendarSystem } from '@/panchang/usePanchang';
import { usePanchangLocation } from '@/contexts/PanchangLocationContext';
import { useMuhurat } from '@/panchang/useMuhurat';
import MuhuratCardBody from '@/components/MuhuratCardBody';
import type { PanchangStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<PanchangStackParamList, 'MuhuratDetail'>;

export default function MuhuratDetailScreen({ navigation, route }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const { location } = usePanchangLocation();
  const [calendarSystem] = usePanchangCalendarSystem();

  const date = new Date(route.params.dateMs);
  const muhurat = useMuhurat(date, calendarSystem);
  const md = muhurat.muhurat;
  const p = muhurat.panchang;
  const ready = md != null && p != null;
  const cityLabel = contentByLang(lang, location.labelHi, location.labelEn);
  const nowStartMs = muhurat.isToday ? muhurat.nowChoghadiya?.start.getTime() ?? null : null;

  const shotRef = useRef<View>(null);
  const [busy, setBusy] = useState(false);

  const onShare = useCallback(async () => {
    if (busy || !ready) return;
    setBusy(true);
    try {
      const uri = await captureRef(shotRef, { format: 'png', quality: 1, result: 'tmpfile' });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: pick(lang, { hi: 'पंचांग साझा करें', en: 'Share panchang', gu: 'પંચાંગ શેર કરો', kn: 'ಪಂಚಾಂಗ ಹಂಚಿ' }),
        });
      }
    } catch {
      /* capture/share unavailable — non-fatal */
    } finally {
      setBusy(false);
    }
  }, [busy, ready, lang]);

  return (
    <View style={styles.root}>
      <LinearGradient colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={[styles.topBar, { paddingHorizontal: spacing.xxl }]}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel={pick(lang, { hi: 'वापस', en: 'Back', gu: 'પાછા', kn: 'ಹಿಂದೆ' })}
            hitSlop={16}
            style={[styles.backBtn, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider }]}
          >
            <Text style={{ color: colors.inkSoft, fontSize: 18 }}>‹</Text>
          </Pressable>
          <Text style={{ flex: 1, fontFamily: titleFontByLang(lang), fontSize: 16, color: colors.ink }}>
            {contentByLang(lang, 'आज का पंचांग', "Today's Panchang")}
          </Text>
          <Pressable
            onPress={onShare}
            disabled={busy || !ready}
            accessibilityRole="button"
            accessibilityLabel={pick(lang, { hi: 'साझा करें', en: 'Share', gu: 'શેર કરો', kn: 'ಹಂಚಿ' })}
            hitSlop={12}
            style={[styles.shareBtn, { backgroundColor: colors.saffron, opacity: busy || !ready ? 0.5 : 1 }]}
          >
            <Text style={{ color: colors.onPrimary, fontSize: 13, fontFamily: titleFontByLang(lang) }}>
              {contentByLang(lang, 'साझा', 'Share')}
            </Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.xxl, paddingTop: 8, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {ready ? (
            <MuhuratCardBody p={p} md={md} variant="full" nowStartMs={nowStartMs} cityLabel={cityLabel} />
          ) : (
            <View style={{ paddingVertical: 72, alignItems: 'center' }}>
              <ActivityIndicator color={colors.saffron} />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Off-screen share card — captured to a PNG for the OS share sheet. */}
      {ready && (
        <View collapsable={false} style={styles.offscreen} pointerEvents="none">
          <View ref={shotRef} style={{ width: 340, backgroundColor: colors.parchment, padding: 18 }}>
            <MuhuratCardBody p={p} md={md} variant="share" cityLabel={cityLabel} brand />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  backBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  shareBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  offscreen: { position: 'absolute', left: -10000, top: 0 },
});
