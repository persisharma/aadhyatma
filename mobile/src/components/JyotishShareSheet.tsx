import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

import type { Lang } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = {
  visible: boolean;
  lang: Lang;
  titleHi: string;
  titleEn: string;
  privacyHi: string;
  privacyEn: string;
  renderCard: (width: number) => React.ReactNode;
  onClose: () => void;
  onShareSheetOpened?: () => void;
  /** Optional second share action under the card actions (PRD-20: the
   * report's full-text handoff). The sheet's privacy line is the shared
   * warning surface for BOTH actions — callers passing this must name the
   * text export's contents in privacyHi/En. Omitting all detail props keeps
   * the shipped card-only sheet byte-identical. */
  detailTitleHi?: string;
  detailTitleEn?: string;
  detailSubtitleHi?: string;
  detailSubtitleEn?: string;
  onShareDetail?: () => void;
};

async function waitForLayout(): Promise<void> {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await new Promise<void>((resolve) => setTimeout(resolve, 60));
}

export default function JyotishShareSheet({
  visible,
  lang,
  titleHi,
  titleEn,
  privacyHi,
  privacyEn,
  renderCard,
  onClose,
  onShareSheetOpened,
  detailTitleHi,
  detailTitleEn,
  detailSubtitleHi,
  detailSubtitleEn,
  onShareDetail,
}: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const shotRef = useRef<View>(null);
  const [busy, setBusy] = useState(false);
  const cardWidth = Math.min(334, screenWidth - spacing.xxl * 2);

  const share = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      await waitForLayout();
      const uri = await captureRef(shotRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
        width: 1080,
        height: 1350,
      });
      if (await Sharing.isAvailableAsync()) {
        onShareSheetOpened?.();
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: contentByLang(lang, titleHi, titleEn),
        });
      }
    } catch {
      // Sharing is optional and must never break the underlying Jyotish view.
    } finally {
      setBusy(false);
    }
  }, [busy, lang, onShareSheetOpened, titleEn, titleHi]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <View style={[styles.backdrop, { backgroundColor: colors.modalBackdrop }]}>
        <SafeAreaView
          edges={['bottom']}
          style={[
            styles.sheet,
            {
              backgroundColor: colors.parchment,
              borderTopLeftRadius: radii.lg,
              borderTopRightRadius: radii.lg,
            },
            elevation.raised,
          ]}
        >
          <View style={[styles.header, { borderBottomColor: colors.divider }]}>
            <Text
              style={{
                flex: 1,
                color: colors.ink,
                fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
                fontSize: 17,
              }}
            >
              {contentByLang(lang, titleHi, titleEn)}
            </Text>
            <View
              style={[
                styles.format,
                {
                  borderColor: colors.divider,
                  backgroundColor: colors.parchmentSoft,
                  borderRadius: radii.pill,
                },
              ]}
            >
              <Text style={[styles.formatText, { color: colors.inkMuted }]}>
                4:5 · 1080×1350
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close share preview"
              style={[
                styles.close,
                { backgroundColor: colors.saffronTint, borderRadius: radii.pill },
              ]}
            >
              <Text style={{ color: colors.saffronDeep, fontSize: 20 }}>×</Text>
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View
              ref={shotRef}
              collapsable={false}
              accessibilityLabel={`${titleEn} image preview`}
              style={{ width: cardWidth, aspectRatio: 4 / 5 }}
            >
              {renderCard(cardWidth)}
            </View>
            <View style={styles.privacy}>
              <Text style={[styles.check, { color: colors.saffronDeep }]}>✓</Text>
              <Text
                style={{
                  flex: 1,
                  color: colors.inkMuted,
                  fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                  fontSize: 10,
                  lineHeight: 15,
                  textAlign: 'center',
                }}
              >
                {meaningByLang(lang, privacyHi, privacyEn)}
              </Text>
            </View>
            <View style={styles.actions}>
              <Pressable
                testID="jyotish-share-confirm"
                onPress={share}
                disabled={busy}
                accessibilityRole="button"
                accessibilityLabel="Open share sheet"
                style={({ pressed }) => [
                  styles.primary,
                  { backgroundColor: colors.saffronDeep, borderRadius: radii.pill },
                  (pressed || busy) && { opacity: 0.72 },
                ]}
              >
                {busy ? (
                  <ActivityIndicator color={colors.onPrimary} />
                ) : (
                  <Text style={[styles.primaryText, { color: colors.onPrimary }]}>
                    {contentByLang(lang, 'शेयर शीट खोलें', 'Open share sheet')}
                  </Text>
                )}
              </Pressable>
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Cancel sharing"
                style={({ pressed }) => [
                  styles.secondary,
                  {
                    backgroundColor: colors.parchmentSoft,
                    borderColor: colors.divider,
                    borderRadius: radii.pill,
                  },
                  pressed && { opacity: 0.72 },
                ]}
              >
                <Text style={[styles.secondaryText, { color: colors.saffronDeep }]}>
                  {contentByLang(lang, 'रद्द करें', 'Cancel')}
                </Text>
              </Pressable>
            </View>
            {onShareDetail && detailTitleHi && detailTitleEn && (
              <Pressable
                onPress={onShareDetail}
                accessibilityRole="button"
                accessibilityLabel="Share the full reading as text"
                style={({ pressed }) => [
                  styles.detail,
                  {
                    borderColor: colors.divider,
                    backgroundColor: colors.parchmentSoft,
                    borderRadius: radii.md,
                  },
                  pressed && { opacity: 0.72 },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.ink,
                      fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
                      fontSize: 13,
                    }}
                  >
                    {contentByLang(lang, detailTitleHi, detailTitleEn)}
                  </Text>
                  {detailSubtitleHi && detailSubtitleEn && (
                    <Text
                      style={{
                        color: colors.inkMuted,
                        fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                        fontSize: 10.5,
                        lineHeight: 15,
                        marginTop: 2,
                      }}
                    >
                      {meaningByLang(lang, detailSubtitleHi, detailSubtitleEn)}
                    </Text>
                  )}
                </View>
                <Text style={{ color: colors.saffronDeep, fontSize: 16 }}>⇪</Text>
              </Pressable>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '96%',
    overflow: 'hidden',
  },
  header: {
    minHeight: 58,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  format: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
  },
  formatText: {
    fontFamily: fontFamilies.interSemiBold,
    fontSize: 10,
  },
  close: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 14,
    alignItems: 'center',
  },
  privacy: {
    maxWidth: 334,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  check: {
    fontFamily: fontFamilies.interSemiBold,
    fontSize: 11,
  },
  actions: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  primary: {
    minHeight: 42,
    minWidth: 150,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    fontFamily: fontFamilies.interSemiBold,
    fontSize: 11,
  },
  secondary: {
    minHeight: 42,
    paddingHorizontal: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detail: {
    alignSelf: 'stretch',
    minHeight: 52,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderWidth: 1,
  },
  secondaryText: {
    fontFamily: fontFamilies.interSemiBold,
    fontSize: 11,
  },
});
