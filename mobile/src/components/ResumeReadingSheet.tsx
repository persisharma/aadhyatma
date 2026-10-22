import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { orderTitlesByLanguage } from '@/utils/titleByLanguage';
import { contentByLang } from '@/utils/localize';
import { pillTextStyle, titleFontByLang } from '@/utils/langType';
import ReadProgressBar from '@/components/ReadProgressBar';

type Props = {
  visible: boolean;
  titleHi: string;
  titleEn: string;
  /** Pre-formatted location label for the saved progress, e.g. "Chapter 3 · Verse 5". */
  locationHi: string;
  locationEn: string;
  onResume: () => void;
  onStartOver: () => void;
  onDismiss: () => void;
  /** Read-coverage line inside the location card, e.g. "23 / 43 पठित · कुल 25%" (design.md §84). */
  coverageHi?: string;
  coverageEn?: string;
  /** Fill of the bar under the coverage line, 0–100. */
  coveragePct?: number;
  /** The first unread verse; shows the "Next unread" action when set. */
  nextUnreadHi?: string;
  nextUnreadEn?: string;
  onNextUnread?: () => void;
  /** Opens the text's subsection list; set only for texts that have one. */
  onAllChapters?: () => void;
};

export default function ResumeReadingSheet({
  visible,
  titleHi,
  titleEn,
  locationHi,
  locationEn,
  onResume,
  onStartOver,
  onDismiss,
  coverageHi,
  coverageEn,
  coveragePct,
  nextUnreadHi,
  nextUnreadEn,
  onNextUnread,
  onAllChapters,
}: Props) {
  const { colors, typography, radii, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const title = orderTitlesByLanguage(lang, titleHi, titleEn, {
    devPrimary: 20,
    devSecondary: 13,
    latPrimary: 22,
    latSecondary: 12,
  });

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onDismiss}
    >
      <Pressable
        accessible={false}
        style={[styles.backdrop, { backgroundColor: colors.modalBackdrop }]}
        onPress={onDismiss}
      >
        <Pressable
          accessible={false}
          style={[
            styles.sheet,
            {
              backgroundColor: colors.parchment,
              borderRadius: radii.lg,
              borderColor: colors.cardActiveBorder,
              paddingHorizontal: spacing.xxl,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <LinearGradient
            colors={[colors.cardActiveFrom, colors.cardActiveTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: radii.lg }]}
          />

          <View style={styles.titleBlock}>
            <Text
              style={[
                styles.titleHi,
                {
                  color: colors.ink,
                  fontFamily: title.primary.fontFamily,
                  fontSize: title.primary.fontSize,
                  fontStyle: title.primary.fontStyle,
                  letterSpacing: title.primary.letterSpacing,
                },
              ]}
              numberOfLines={1}
            >
              {title.primary.text}
            </Text>
            <Text
              style={[
                styles.titleEn,
                {
                  color: colors.inkMuted,
                  fontFamily: title.secondary.fontFamily,
                  fontSize: title.secondary.fontSize,
                  fontStyle: title.secondary.fontStyle,
                },
              ]}
              numberOfLines={1}
            >
              {title.secondary.text}
            </Text>
          </View>

          <View
            style={[
              styles.divider,
              { backgroundColor: colors.divider },
            ]}
          />

          <Text
            style={[
              styles.promptHi,
              {
                color: colors.ink,
                fontFamily: typography.readerTitle.fontFamily,
                fontSize: 17,
              },
            ]}
          >
            जहाँ छोड़ा था, वहीं से जारी रखें?
          </Text>
          <Text
            style={[
              styles.promptEn,
              {
                color: colors.inkSoft,
                fontFamily: typography.cardLatin.fontFamily,
                fontSize: 13,
              },
            ]}
          >
            Resume where you left off?
          </Text>

          <View
            style={[
              styles.locationCard,
              {
                backgroundColor: colors.parchmentSoft,
                borderColor: colors.divider,
                borderRadius: radii.md,
              },
            ]}
          >
            <Text
              style={[
                styles.locationLabel,
                pillTextStyle(lang, typography.sectionLabel),
                { color: colors.inkMuted },
              ]}
            >
              {contentByLang(lang, 'अंतिम पठित', 'LAST READ')}
            </Text>
            <Text
              style={[
                styles.locationValue,
                {
                  color: colors.ink,
                  fontFamily: titleFontByLang(lang),
                  fontSize: 16,
                  fontStyle: lang === 'en' ? 'italic' : 'normal',
                },
              ]}
            >
              {contentByLang(lang, locationHi, locationEn)}
            </Text>
            {coverageHi && coverageEn ? (
              <View style={styles.coverage} testID="resume-coverage">
                {coveragePct != null ? <ReadProgressBar pct={coveragePct} /> : null}
                <Text style={[styles.coverageText, { color: colors.inkSoft }]}>
                  {contentByLang(lang, coverageHi, coverageEn)}
                </Text>
              </View>
            ) : null}
          </View>

          <Pressable
            onPress={onResume}
            accessibilityRole="button"
            accessibilityLabel="Resume reading"
            style={({ pressed }) => [
              styles.primaryBtn,
              {
                backgroundColor: colors.saffron,
                borderRadius: radii.md,
              },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text
              style={[
                styles.primaryBtnText,
                {
                  color: colors.onPrimary,
                  fontFamily: typography.readerTitle.fontFamily,
                },
              ]}
            >
              जारी रखें · Resume
            </Text>
          </Pressable>

          {onNextUnread && nextUnreadHi && nextUnreadEn ? (
            <Pressable
              onPress={onNextUnread}
              accessibilityRole="button"
              accessibilityLabel="Next unread verse"
              testID="resume-next-unread"
              style={({ pressed }) => [
                styles.secondaryBtn,
                styles.stackedBtn,
                { borderColor: colors.cardActiveBorder, borderRadius: radii.md },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text
                style={[
                  styles.secondaryBtnText,
                  { color: colors.saffronDeep, fontFamily: typography.readerTitle.fontFamily },
                ]}
              >
                अगला अपठित · Next unread
              </Text>
              <Text style={[styles.btnCaption, { color: colors.inkMuted }]}>
                {contentByLang(lang, nextUnreadHi, nextUnreadEn)}
              </Text>
            </Pressable>
          ) : null}

          <Pressable
            onPress={onStartOver}
            accessibilityRole="button"
            accessibilityLabel="Start over from the beginning"
            testID="resume-start-over"
            style={({ pressed }) => [
              styles.secondaryBtn,
              {
                borderColor: colors.cardActiveBorder,
                borderRadius: radii.md,
              },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text
              style={[
                styles.secondaryBtnText,
                {
                  color: colors.saffronDeep,
                  fontFamily: typography.readerTitle.fontFamily,
                },
              ]}
            >
              आरंभ से पढ़ें · Start Over
            </Text>
            {coverageHi ? (
              // Start Over moves only the position; read marks are separate (design.md §84).
              <Text style={[styles.btnCaption, { color: colors.inkMuted }]}>
                पठित चिह्न बने रहेंगे · Read marks stay
              </Text>
            ) : null}
          </Pressable>

          <View style={styles.footerRow}>
            {onAllChapters ? (
              <Pressable
                onPress={onAllChapters}
                accessibilityRole="button"
                accessibilityLabel="All chapters"
                testID="resume-all-chapters"
                hitSlop={12}
                style={styles.cancelBtn}
              >
                <Text
                  style={[
                    styles.linkText,
                    { color: colors.saffronDeep, fontFamily: typography.readerTitle.fontFamily },
                  ]}
                >
                  सभी अध्याय · All chapters
                </Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={onDismiss}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              hitSlop={12}
              style={styles.cancelBtn}
            >
              <Text
                style={[
                  styles.cancelBtnText,
                  {
                    color: colors.inkMuted,
                    fontFamily: typography.cardLatin.fontFamily,
                  },
                ]}
              >
                Cancel
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    paddingTop: 22,
    paddingBottom: 18,
    overflow: 'hidden',
  },
  titleBlock: {
    alignItems: 'center',
    marginBottom: 14,
  },
  titleHi: {
    includeFontPadding: false,
    textAlign: 'center',
  },
  titleEn: {
    marginTop: 4,
    fontStyle: 'italic',
    includeFontPadding: false,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    opacity: 0.6,
    marginBottom: 18,
  },
  promptHi: {
    textAlign: 'center',
    includeFontPadding: false,
  },
  promptEn: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 4,
    includeFontPadding: false,
  },
  locationCard: {
    marginTop: 16,
    marginBottom: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  locationLabel: {
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  locationValue: {
    includeFontPadding: false,
    textAlign: 'center',
  },
  primaryBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryBtnText: {
    fontSize: 15,
    includeFontPadding: false,
  },
  secondaryBtn: {
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 15,
    includeFontPadding: false,
  },
  cancelBtn: {
    marginTop: 12,
    paddingVertical: 12,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverage: {
    alignSelf: 'stretch',
    marginTop: 10,
    gap: 6,
  },
  coverageText: {
    fontSize: 12,
    textAlign: 'center',
  },
  stackedBtn: {
    marginBottom: 10,
  },
  btnCaption: {
    fontSize: 11,
    marginTop: 3,
    textAlign: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  linkText: {
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  cancelBtnText: {
    fontSize: 13,
    fontStyle: 'italic',
    opacity: 0.85,
  },
});
