import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { pick, contentByLang } from '@/utils/localize';
import { titleFontByLang, meaningToken } from '@/utils/langType';
import { useTour } from '@/contexts/TourContext';

/**
 * Post-update modal — surfaces the NEW features added in this app version.
 * Self-mounts when `useTour().shouldShowWhatsNew` is true. Returning users
 * see this after an update; brand-new users never see it because the
 * first-launch tour marks the current version as "what's new seen" on
 * completion.
 *
 * Language: this fires for returning users who already have a reading
 * language set, so it must honour all four (hi/en/gu/kn) — never a bare
 * hi/en ternary (see wiki concepts/languages Gotchas). Text routes through
 * `contentByLang` (gu/kn re-script the Hindi) and fonts through the
 * `langType` helpers so gu/kn don't render as tofu in a Devanagari face.
 */
export default function WhatsNewModal() {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const { shouldShowWhatsNew, whatsNewEntry, markWhatsNewSeen } = useTour();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (shouldShowWhatsNew && !visible) setVisible(true);
  }, [shouldShowWhatsNew, visible]);

  const close = useCallback(async () => {
    setVisible(false);
    await markWhatsNewSeen();
  }, [markWhatsNewSeen]);

  if (!whatsNewEntry) return null;

  const headerTitle = pick(lang, {
    hi: 'नई सुविधाएँ',
    en: "What's New",
    gu: 'નવી સુવિધાઓ',
    kn: 'ಹೊಸ ವೈಶಿಷ್ಟ್ಯಗಳು',
  });
  const gotIt = pick(lang, {
    hi: 'समझ गया',
    en: 'Got it',
    gu: 'સમજાયું',
    kn: 'ಅರ್ಥವಾಯಿತು',
  });
  const bodyFont = meaningToken(lang, typography).fontFamily;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={close}
    >
      <View style={[styles.root, { backgroundColor: colors.parchment }]}>
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
          <View style={[styles.header, { borderBottomColor: colors.divider }]}>
            <View>
              <Text
                accessibilityRole="header"
                style={[styles.title, { color: colors.ink, fontFamily: titleFontByLang(lang) }]}
              >
                {headerTitle}
              </Text>
              <Text
                style={[
                  styles.version,
                  { color: colors.inkMuted, fontFamily: typography.cardLatin.fontFamily },
                ]}
              >
                v{whatsNewEntry.version}
              </Text>
            </View>
            <Pressable
              onPress={close}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={16}
              style={({ pressed }) => [styles.close, pressed && { opacity: 0.7 }]}
            >
              <Text style={[styles.closeGlyph, { color: colors.saffron }]}>✕</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={[
              styles.body,
              { paddingHorizontal: spacing.xxl, paddingTop: spacing.xxl },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {whatsNewEntry.items.map((item, i) => (
              <View key={i} style={styles.item}>
                <View
                  style={[styles.bullet, { backgroundColor: colors.saffron }]}
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                />
                <View style={styles.itemContent}>
                  <Text
                    style={[styles.itemTitle, { color: colors.ink, fontFamily: titleFontByLang(lang) }]}
                  >
                    {contentByLang(lang, item.titleHi, item.titleEn)}
                  </Text>
                  <Text style={[styles.itemBody, { color: colors.inkSoft, fontFamily: bodyFont }]}>
                    {contentByLang(lang, item.bodyHi, item.bodyEn)}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={[styles.footer, { paddingHorizontal: spacing.xxl }]}>
            <Pressable
              onPress={close}
              accessibilityRole="button"
              accessibilityLabel={gotIt}
              style={({ pressed }) => [
                styles.primary,
                {
                  backgroundColor: colors.saffron,
                  borderRadius: radii.md,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text
                style={[styles.primaryLabel, { color: colors.onPrimary, fontFamily: titleFontByLang(lang) }]}
              >
                {gotIt}
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    includeFontPadding: false,
  },
  version: {
    marginTop: 2,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  close: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeGlyph: {
    fontSize: 20,
    fontWeight: '600',
  },
  body: {
    paddingBottom: 24,
    gap: 20,
  },
  item: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 9,
  },
  itemContent: {
    flex: 1,
    gap: 6,
  },
  itemTitle: {
    fontSize: 17,
    includeFontPadding: false,
  },
  itemBody: {
    fontSize: 14,
    lineHeight: 24,
  },
  footer: {
    paddingTop: 12,
    paddingBottom: 16,
  },
  primary: {
    paddingVertical: 14,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    fontSize: 15,
    includeFontPadding: false,
  },
});
