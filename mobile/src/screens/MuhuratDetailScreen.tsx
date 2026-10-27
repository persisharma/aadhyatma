import React, { useCallback } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang, pick } from '@/utils/localize';
import { titleFontByLang } from '@/utils/langType';
import { useObservancesForDate, usePanchangCalendarSystem } from '@/panchang/usePanchang';
import { usePanchangLocation } from '@/contexts/PanchangLocationContext';
import { useMuhurat } from '@/panchang/useMuhurat';
import MuhuratCardBody from '@/components/MuhuratCardBody';
import ShareButton from '@/components/ShareButton';
import { usePanchangShare } from '@/utils/panchangShare';
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

  // The share is the पूर्ण पंचांग card (design.md §33a), the same one the
  // Panchang sky header shares — not a capture of this screen — through the
  // Daily Bhakti picker (§39.10).
  const observances = useObservancesForDate(date, calendarSystem);
  const { share, busy } = usePanchangShare();
  const onShare = useCallback(() => {
    if (!ready) return;
    void share({ p, md, observances, placeHi: location.labelHi, placeEn: location.labelEn, calendarSystem, lang });
  }, [ready, share, p, md, observances, location.labelHi, location.labelEn, calendarSystem, lang]);

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
            {muhurat.isToday
              ? contentByLang(lang, 'आज का पंचांग', "Today's Panchang")
              : contentByLang(lang, 'इस दिन का पंचांग', "This Day's Panchang")}
          </Text>
          <ShareButton
            onPress={onShare}
            busy={busy || !ready}
            accessibilityLabel={pick(lang, { hi: 'पंचांग साझा करें', en: 'Share panchang', gu: 'પંચાંગ શેર કરો', kn: 'ಪಂಚಾಂಗ ಹಂಚಿ' })}
            accessibilityHint=""
          />
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 4, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {ready ? (
            <MuhuratCardBody p={p} md={md} nowStartMs={nowStartMs} cityLabel={cityLabel} isToday={muhurat.isToday} />
          ) : (
            <View style={{ paddingVertical: 72, alignItems: 'center' }}>
              <ActivityIndicator color={colors.saffron} />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  backBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
