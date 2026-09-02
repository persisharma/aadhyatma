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
import ShareButton from '@/components/ShareButton';
import type { PanchangStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<PanchangStackParamList, 'MuhuratDetail'>;

// Render width (dp) of the hidden share card. Output PNG is captured at 2× for
// a crisp image, matching the reader share path (shareVerse.tsx).
const SHARE_CARD_WIDTH = 340;
const SHARE_SCALE = 2;

// One frame + a short beat so the hidden share card is committed and its fonts
// are resolved before capture, matching the reader share path (shareVerse.tsx).
async function waitForLayout() {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await new Promise<void>((resolve) => setTimeout(resolve, 60));
}

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
  // Measured height of the hidden card (dp). Handed to captureRef as an explicit
  // output size — a content-sized view captured with no dimensions can come back
  // blank under the New Architecture.
  const cardHeightRef = useRef(0);
  const [busy, setBusy] = useState(false);

  const onShare = useCallback(async () => {
    if (busy || !ready) return;
    setBusy(true);
    try {
      await waitForLayout();
      const h = cardHeightRef.current;
      const uri = await captureRef(shotRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
        ...(h > 0
          ? { width: SHARE_CARD_WIDTH * SHARE_SCALE, height: Math.round(h * SHARE_SCALE) }
          : null),
      });
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
      {/* Share card — captured to a PNG for the OS share sheet. Rendered
          off-screen (so the full card is captured regardless of screen height —
          an on-screen card taller than the viewport clips), and handed an
          explicit measured output size so view-shot renders the whole subtree
          instead of a blank background. This mirrors the proven reader share
          path (shareVerse.tsx), which captures a tall off-screen card the same
          way. collapsable={false} on the captured view keeps it a real native
          view for view-shot to target. */}
      {ready && (
        <View style={styles.captureLayer} pointerEvents="none">
          <View
            ref={shotRef}
            collapsable={false}
            onLayout={(e) => {
              cardHeightRef.current = e.nativeEvent.layout.height;
            }}
            style={{ width: SHARE_CARD_WIDTH, backgroundColor: colors.parchment, padding: 18 }}
          >
            <MuhuratCardBody p={p} md={md} variant="share" cityLabel={cityLabel} brand isToday={muhurat.isToday} />
          </View>
        </View>
      )}
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

        <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.xxl, paddingTop: 8, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {ready ? (
            <MuhuratCardBody p={p} md={md} variant="full" nowStartMs={nowStartMs} cityLabel={cityLabel} isToday={muhurat.isToday} />
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
  // Fully off-screen so the whole card is captured no matter how tall it is
  // (an on-screen card taller than the viewport gets clipped in the snapshot).
  captureLayer: { position: 'absolute', left: -10000, top: -10000, width: SHARE_CARD_WIDTH },
});
