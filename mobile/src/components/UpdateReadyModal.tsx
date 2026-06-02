import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Updates from 'expo-updates';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';

/**
 * "A fresh update is ready" prompt.
 *
 * We keep expo-updates' default flow untouched: on launch it checks the
 * `production` branch and downloads any new OTA bundle in the background,
 * applying it on the *next* cold start. That alone means users only see new
 * content after they happen to relaunch.
 *
 * This modal closes that gap without blocking startup. `useUpdates()` exposes
 * `isUpdatePending`, which flips true once a background download has finished
 * and is staged for the next launch. When that happens we offer a one-tap
 * `reloadAsync()` so the user gets the new content immediately. Tapping
 * "Later" simply falls back to the default behaviour — the staged update still
 * applies on the next natural relaunch.
 *
 * Guards:
 *  - `Updates.isEnabled` is false in dev clients / Expo Go, where
 *    `reloadAsync()` throws. We never show the modal there.
 *  - Dismissal is per-pending-update: once dismissed we don't nag again until a
 *    newer update is staged.
 */
export default function UpdateReadyModal() {
  const { colors, typography, radii, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const isHi = lang === 'hi';

  const { isUpdatePending } = Updates.useUpdates();
  const [dismissed, setDismissed] = useState(false);
  const [busy, setBusy] = useState(false);

  // Reset the dismissal latch whenever a fresh update is staged so a *new*
  // download re-prompts even if a prior one was dismissed this session.
  useEffect(() => {
    if (isUpdatePending) setDismissed(false);
  }, [isUpdatePending]);

  const visible = Updates.isEnabled && isUpdatePending && !dismissed;

  const onLater = useCallback(() => setDismissed(true), []);

  const onUpdate = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      await Updates.reloadAsync();
    } catch {
      // reloadAsync can reject (e.g. transient native error); fall back to the
      // default behaviour — the update still applies on the next launch.
      setBusy(false);
      setDismissed(true);
    }
  }, [busy]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onLater}>
      <View style={[styles.backdrop, { backgroundColor: colors.modalBackdrop }]}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.parchment,
              borderRadius: radii.lg,
              padding: spacing.xxl,
            },
          ]}
        >
          <Text
            style={[
              styles.title,
              { color: colors.ink, fontFamily: typography.readerTitle.fontFamily },
            ]}
          >
            {isHi ? 'नया अपडेट तैयार है' : 'A fresh update is ready'}
          </Text>
          <Text
            style={[
              styles.body,
              { color: colors.inkSoft, fontFamily: typography.meaning.fontFamily },
            ]}
          >
            {isHi
              ? 'नई सामग्री और सुधार डाउनलोड हो चुके हैं। अभी लागू करें, या ऐप दोबारा खोलने पर अपने आप लागू हो जाएँगे।'
              : 'New content and improvements have been downloaded. Apply them now, or they’ll apply automatically next time you open the app.'}
          </Text>

          <Pressable
            onPress={onUpdate}
            accessibilityRole="button"
            accessibilityLabel={isHi ? 'अभी अपडेट करें' : 'Update now'}
            disabled={busy}
            style={({ pressed }) => [
              styles.primary,
              {
                backgroundColor: colors.saffron,
                borderRadius: radii.md,
                opacity: busy ? 0.6 : pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.primaryText,
                { color: colors.onPrimary, fontFamily: typography.readerTitle.fontFamily },
              ]}
            >
              {isHi ? 'अभी अपडेट करें' : 'Update now'}
            </Text>
          </Pressable>

          <Pressable
            onPress={onLater}
            accessibilityRole="button"
            accessibilityLabel={isHi ? 'बाद में' : 'Later'}
            disabled={busy}
            style={({ pressed }) => [styles.secondary, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Text
              style={[
                styles.secondaryText,
                { color: colors.inkMuted, fontFamily: typography.cardLatin.fontFamily },
              ]}
            >
              {isHi ? 'बाद में' : 'Later'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    gap: 14,
  },
  title: {
    fontSize: 20,
    includeFontPadding: false,
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    includeFontPadding: false,
  },
  primary: {
    marginTop: 8,
    paddingVertical: 14,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    fontSize: 16,
    includeFontPadding: false,
  },
  secondary: {
    paddingVertical: 12,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    fontSize: 13,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
});
