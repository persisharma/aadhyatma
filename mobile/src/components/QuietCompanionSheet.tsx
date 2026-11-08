import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { useFontScale } from '@/contexts/FontScaleContext';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { readerIllustrationAsset } from '@/data/readerIllustrationAsset';
import CachedArtwork from './CachedArtwork';
import AppIcon from './AppIcon';
export default function QuietCompanionSheet({
  visible,
  title,
  kicker,
  art,
  step,
  children,
  primary,
  secondary,
  onPrimary,
  onSecondary,
  onBack,
  onDismiss,
  busy = false,
  meta,
  primaryLabel,
}: {
  visible: boolean;
  title: string;
  kicker: string;
  art: string;
  step?: number;
  children: React.ReactNode;
  primary: string;
  secondary?: string;
  onPrimary: () => void;
  onSecondary?: () => void;
  onBack?: () => void;
  onDismiss?: () => void;
  busy?: boolean;
  meta?: string;
  primaryLabel?: string;
}) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const { scale } = useFontScale();
  const insets = useSafeAreaInsets();
  const factor = scale === 'L' ? 1.15 : 1;
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily),
    bodyFont = scriptBodyFont(lang, typography.cardHindi.fontFamily);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onDismiss={onDismiss}
      onRequestClose={() => {
        if (!busy) (onBack ?? onSecondary)?.();
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.backdrop, { backgroundColor: colors.modalBackdrop }]}
      >
        <View
          accessibilityViewIsModal
          style={[
            styles.sheet,
            {
              backgroundColor: colors.parchmentSoft,
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}
        >
          <View style={[styles.grabber, { backgroundColor: colors.divider }]} />
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
          >
            <View style={styles.top}>
              <View style={styles.heading}>
                <View style={styles.kicker}>
                  {onBack && (
                    <Pressable
                      onPress={onBack}
                      accessibilityLabel="Back"
                      accessibilityRole="button"
                      disabled={busy}
                      style={styles.back}
                    >
                      <AppIcon
                        name="back"
                        size={17}
                        color={colors.saffronDeep}
                      />
                    </Pressable>
                  )}
                  <Text
                    style={{
                      fontFamily: bodyFont,
                      color: colors.saffronDeep,
                      fontSize: 12,
                      flexShrink: 1,
                    }}
                  >
                    {kicker}
                  </Text>
                </View>
                <Text
                  accessibilityRole="header"
                  style={{
                    fontFamily: titleFont,
                    fontSize: 24 * factor,
                    lineHeight: 36 * factor,
                    color: colors.ink,
                    marginTop: 7,
                  }}
                >
                  {title}
                </Text>
              </View>
              <View style={styles.art}>
                <CachedArtwork
                  source={readerIllustrationAsset(art)}
                  style={StyleSheet.absoluteFill}
                />
              </View>
            </View>
            {step != null && (
              <View
                accessibilityLabel={`Step ${step} of 3`}
                style={styles.steps}
              >
                {[1, 2, 3].map((n) => (
                  <View
                    key={n}
                    style={{
                      width: n === step ? 20 : 5,
                      height: 5,
                      borderRadius: 4,
                      backgroundColor:
                        n === step ? colors.saffronDeep : colors.divider,
                    }}
                  />
                ))}
              </View>
            )}
            {children}
          </ScrollView>
          <View style={styles.footer}>
            {meta && (
              <Text
                style={{
                  textAlign: 'center',
                  fontFamily: bodyFont,
                  fontSize: 12 * factor,
                  lineHeight: 20 * factor,
                  color: colors.inkMuted,
                  marginBottom: 10,
                }}
              >
                {meta}
              </Text>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={primaryLabel ?? primary}
              accessibilityState={{ disabled: busy }}
              disabled={busy}
              onPress={onPrimary}
              style={[styles.primary, { backgroundColor: colors.avoidDeep }]}
            >
              {busy ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <>
                  <Text
                    style={{
                      fontFamily: titleFont,
                      color: colors.onPrimary,
                      fontSize: 16 * factor,
                      textAlign: 'center',
                      flexShrink: 1,
                    }}
                  >
                    {primary}
                  </Text>
                  <AppIcon name="next" size={17} color={colors.onPrimary} />
                </>
              )}
            </Pressable>
            {secondary && (
              <Pressable
                disabled={busy}
                accessibilityRole="button"
                onPress={onSecondary}
                style={styles.secondary}
              >
                <Text
                  style={{
                    fontFamily: bodyFont,
                    fontSize: 14 * factor,
                    color: colors.inkMuted,
                    textAlign: 'center',
                  }}
                >
                  {secondary}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    maxHeight: '88%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
  },
  grabber: {
    height: 4,
    width: 36,
    alignSelf: 'center',
    borderRadius: 3,
    marginBottom: 14,
  },
  content: { paddingHorizontal: 24, paddingBottom: 12 },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 15 },
  heading: { flex: 1 },
  kicker: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  back: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -12,
  },
  art: {
    width: 80,
    height: 80,
    borderRadius: 23,
    overflow: 'hidden',
    transform: [{ rotate: '4deg' }],
  },
  steps: { flexDirection: 'row', gap: 5, marginTop: 12 },
  footer: { paddingHorizontal: 24, paddingTop: 10 },
  primary: {
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 9,
  },
  secondary: { minHeight: 44, justifyContent: 'center', paddingVertical: 10 },
});
