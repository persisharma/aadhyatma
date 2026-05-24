import React, { useCallback, useEffect, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { APP_STORE_URL, PLAY_STORE_URL } from '@/data/shareLinks';

// One-time nudge: shown only on the 1.3.0 native build, never on any other version.
const TARGET_VERSION = '1.3.0';

const DISMISS_KEY = '@vedansh/updateBanner/dismissed/1.3.0';

export default function UpdateBanner() {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const isHi = lang === 'hi';

  const isTargetVersion = Constants.nativeApplicationVersion === TARGET_VERSION;

  const [hydrated, setHydrated] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isTargetVersion) {
      setHydrated(true);
      return;
    }
    AsyncStorage.getItem(DISMISS_KEY)
      .then((value) => {
        if (value === '1') setDismissed(true);
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, [isTargetVersion]);

  const onUpdate = useCallback(() => {
    const url = Platform.OS === 'android' ? PLAY_STORE_URL : APP_STORE_URL;
    Linking.openURL(url).catch(() => undefined);
  }, []);

  const onDismiss = useCallback(() => {
    setDismissed(true);
    AsyncStorage.setItem(DISMISS_KEY, '1').catch(() => undefined);
  }, []);

  if (!isTargetVersion || !hydrated || dismissed) return null;

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.cardSurface,
          borderColor: colors.cardActiveBorder,
          borderRadius: radii.md,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          marginBottom: spacing.lg,
        },
      ]}
      accessibilityRole="alert"
    >
      <View style={styles.textCol}>
        <Text
          style={[
            styles.title,
            {
              color: colors.ink,
              fontFamily: typography.cardHindi.fontFamily,
              fontSize: typography.cardHindi.fontSize,
            },
          ]}
        >
          {isHi ? 'नया संस्करण उपलब्ध है' : 'A new version is available'}
        </Text>
        <Text
          style={[
            styles.body,
            {
              color: colors.inkSoft,
              fontFamily: typography.cardLatin.fontFamily,
              fontSize: typography.cardLatin.fontSize + 1,
              marginTop: spacing.xs,
            },
          ]}
        >
          {isHi
            ? 'नए पाठ और सुधार पाने के लिए ऐप अपडेट करें।'
            : 'Update Vedansh to get the latest texts and fixes.'}
        </Text>
      </View>
      <View style={[styles.actions, { gap: spacing.sm }]}>
        <Pressable
          onPress={onUpdate}
          accessibilityRole="button"
          accessibilityLabel={isHi ? 'अपडेट करें' : 'Update now'}
          hitSlop={8}
          style={({ pressed }) => [
            styles.updateBtn,
            {
              backgroundColor: colors.saffron,
              borderRadius: radii.pill,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.lg,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.updateLabel,
              {
                color: colors.onPrimary,
                fontFamily: typography.cardLatin.fontFamily,
                fontSize: typography.cardLatin.fontSize + 1,
              },
            ]}
          >
            {isHi ? 'अपडेट' : 'Update'}
          </Text>
        </Pressable>
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel={isHi ? 'बंद करें' : 'Dismiss'}
          hitSlop={12}
          style={({ pressed }) => [styles.dismiss, pressed && { opacity: 0.6 }]}
        >
          <Text style={[styles.dismissGlyph, { color: colors.inkMuted }]}>✕</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  textCol: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    includeFontPadding: false,
  },
  body: {
    includeFontPadding: false,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  updateBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateLabel: {
    includeFontPadding: false,
  },
  dismiss: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissGlyph: {
    fontSize: 14,
    includeFontPadding: false,
  },
});
