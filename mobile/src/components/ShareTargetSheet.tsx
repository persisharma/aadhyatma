import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import type { Lang } from '@/data/gita/language';
import { pick } from '@/utils/localize';
import { cardFontByLang, eyebrowTextStyle, indicSafeTag } from '@/utils/langType';

/**
 * Share-target picker for the verse share flow (design.md §39).
 *
 * The share button used to go straight to the OS sheet. It now opens this sheet
 * first, because the two destinations want different payloads: WhatsApp and
 * Messages take the image + a short caption, while Instagram wants the same image
 * with a hashtag block derived from the verse. Instagram gives no API for
 * pre-filling a caption, so the Instagram row copies the caption to the clipboard
 * and says so — the reader long-presses the caption field and pastes.
 *
 * The hashtags are previewed here on purpose: they change with every verse, and a
 * reader about to post wants to see what is going out with their name on it (and
 * can trim tags after pasting).
 */

type Props = {
  visible: boolean;
  lang: Lang;
  /** The hashtag line exactly as it will be pasted (`#A #B …`). */
  hashtagPreview: string;
  onShareSystem: () => void;
  onShareInstagram: () => void;
  onClose: () => void;
  /** True while a capture/share is running — both rows disable. */
  busy?: boolean;
};

export default function ShareTargetSheet({
  visible,
  lang,
  hashtagPreview,
  onShareSystem,
  onShareInstagram,
  onClose,
  busy,
}: Props) {
  const { colors, spacing, radii } = useTheme();
  // Sub-labels and the eyebrow go through the §3.0 script-safe helpers: Inter and
  // Latin tracking shred a Devanagari/Gujarati/Kannada label's clusters.
  const subLabel = eyebrowTextStyle(lang, 12);
  const titleFont = cardFontByLang(lang);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable
        accessible={false}
        style={[styles.backdrop, { backgroundColor: colors.modalBackdrop }]}
        onPress={onClose}
      >
        <Pressable
          accessible={false}
          onPress={(e) => e.stopPropagation()}
          style={[
            styles.sheet,
            { backgroundColor: colors.parchmentHighlight, paddingHorizontal: spacing.xxl },
          ]}
        >
          <View style={[styles.grabber, { backgroundColor: colors.divider }]} />

          <Text
            accessibilityRole="header"
            style={{
              fontFamily: titleFont,
              fontSize: 18,
              color: colors.ink,
              textAlign: 'center',
              marginBottom: spacing.md,
            }}
          >
            {pick(lang, {
              hi: 'श्लोक साझा करें',
              en: 'Share this verse',
              gu: 'શ્લોક શેર કરો',
              kn: 'ಶ್ಲೋಕ ಹಂಚಿಕೊಳ್ಳಿ',
            })}
          </Text>

          <Pressable
            onPress={onShareSystem}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Share to other apps"
            style={({ pressed }) => [
              styles.row,
              {
                borderBottomWidth: 1,
                borderBottomColor: colors.divider,
                opacity: busy ? 0.5 : pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text style={[styles.glyph, { color: colors.saffron }]}>↗</Text>
            <View style={styles.rowText}>
              <Text style={{ fontFamily: titleFont, fontSize: 17, color: colors.ink }}>
                {pick(lang, {
                  hi: 'शेयर करें',
                  en: 'Share',
                  gu: 'શેર કરો',
                  kn: 'ಹಂಚಿಕೊಳ್ಳಿ',
                })}
              </Text>
              <Text style={[subLabel, { color: colors.inkMuted }]}>
                {pick(lang, {
                  hi: 'WhatsApp, संदेश या कहीं भी',
                  en: 'WhatsApp, Messages, anywhere',
                  gu: 'WhatsApp, સંદેશ કે ગમે ત્યાં',
                  kn: 'WhatsApp, ಸಂದೇಶ ಅಥವಾ ಎಲ್ಲಿಯಾದರೂ',
                })}
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={onShareInstagram}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Share on Instagram"
            accessibilityHint="Copies the caption and hashtags, then opens the share sheet"
            style={({ pressed }) => [styles.row, { opacity: busy ? 0.5 : pressed ? 0.7 : 1 }]}
          >
            <Text style={[styles.glyph, { color: colors.saffron }]}>◉</Text>
            <View style={styles.rowText}>
              <Text style={{ fontFamily: titleFont, fontSize: 17, color: colors.ink }}>
                {pick(lang, {
                  hi: 'Instagram पर शेयर करें',
                  en: 'Share on Instagram',
                  gu: 'Instagram પર શેર કરો',
                  kn: 'Instagram ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ',
                })}
              </Text>
              <Text style={[subLabel, { color: colors.inkMuted }]}>
                {pick(lang, {
                  hi: 'कैप्शन और हैशटैग कॉपी हो जाएँगे — पेस्ट कर दें',
                  en: 'Caption + hashtags are copied — just paste',
                  gu: 'કૅપ્શન અને હૅશટૅગ કૉપી થશે — પેસ્ટ કરો',
                  kn: 'ಶೀರ್ಷಿಕೆ ಮತ್ತು ಹ್ಯಾಶ್‌ಟ್ಯಾಗ್ ಕಾಪಿ ಆಗುತ್ತವೆ — ಪೇಸ್ಟ್ ಮಾಡಿ',
                })}
              </Text>
            </View>
          </Pressable>

          <View
            style={[
              styles.preview,
              {
                backgroundColor: colors.parchmentSoft,
                borderColor: colors.divider,
                borderRadius: radii.md,
                marginTop: spacing.sm,
              },
            ]}
          >
            <Text
              style={[
                indicSafeTag(lang, 1.6),
                { fontSize: 10, color: colors.inkMuted, marginBottom: 6 },
              ]}
            >
              {pick(lang, {
                hi: 'हैशटैग',
                en: 'HASHTAGS',
                gu: 'હૅશટૅગ',
                kn: 'ಹ್ಯಾಶ್‌ಟ್ಯಾಗ್',
              })}
            </Text>
            <ScrollView style={styles.previewScroll} nestedScrollEnabled>
              <Text
                accessibilityLabel={`Hashtags: ${hashtagPreview}`}
                style={{ fontSize: 12, lineHeight: 18, color: colors.saffronDeep }}
              >
                {hashtagPreview}
              </Text>
            </ScrollView>
          </View>

          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            style={({ pressed }) => [styles.cancel, pressed && { opacity: 0.7 }]}
          >
            <Text style={[eyebrowTextStyle(lang, 13), { color: colors.inkMuted }]}>
              {pick(lang, { hi: 'रद्द करें', en: 'Cancel', gu: 'રદ કરો', kn: 'ರದ್ದುಮಾಡಿ' })}
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingTop: 10, paddingBottom: 28 },
  grabber: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14, minHeight: 44 },
  rowText: { flex: 1, gap: 2 },
  glyph: { fontSize: 18, width: 22, textAlign: 'center' },
  preview: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  previewScroll: { maxHeight: 76 },
  cancel: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
});
