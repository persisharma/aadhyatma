import React, { useState, useCallback } from 'react';
import { Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useBookmarks } from '@/contexts/BookmarksContext';
import { useGitaLanguage } from '@/data/gita/language';
import { helpContent, buildDiscrepancyMailto } from '@/data/help/content';
import { useUserActivity } from '@/contexts/UserActivityContext';
import type { MoreStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'MoreHome'>;

export default function MoreScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { bookmarks } = useBookmarks();
  const { lang: defaultLang, setLang: setDefaultLang } = useGitaLanguage();
  const { lifetimeTotals, currentStreak } = useUserActivity();
  const [disclaimerVisible, setDisclaimerVisible] = useState(false);
  const hi = helpContent.hi;
  const en = helpContent.en;
  const profileTotals = lifetimeTotals();
  const streak = currentStreak();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <View style={styles.titleArea}>
            <Text style={{ fontFamily: typography.screenTitle.fontFamily, fontSize: 22, color: colors.ink, textAlign: 'center' }}>
              अन्य
            </Text>
            <Text style={{ fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 14, color: colors.inkMuted, textAlign: 'center', marginTop: 4 }}>
              More
            </Text>
          </View>

          {/* Profile Card with insights snapshot */}
          <Pressable
            onPress={() => navigation.navigate('Profile')}
            accessibilityRole="button"
            accessibilityLabel="Open Sadhak profile"
            style={({ pressed }) => [
              styles.profileCard,
              {
                borderColor: colors.cardActiveBorder,
                borderRadius: radii.lg,
                opacity: pressed ? 0.92 : 1,
              },
            ]}
          >
            <LinearGradient
              colors={[colors.cardActiveFrom, colors.cardActiveTo]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: radii.lg }]}
            />
            <View style={styles.profileTopRow}>
              <View style={[styles.profileCrest, { backgroundColor: colors.saffron }]}>
                <Text
                  style={{
                    color: colors.onPrimary,
                    fontFamily: typography.readerTitle.fontFamily,
                    fontSize: 22,
                  }}
                >
                  ॐ
                </Text>
              </View>
              <View style={styles.profileTitleBlock}>
                <Text
                  style={{
                    fontFamily: typography.readerTitle.fontFamily,
                    fontSize: 18,
                    color: colors.ink,
                  }}
                >
                  साधक प्रोफ़ाइल
                </Text>
                <Text
                  style={{
                    fontFamily: 'CormorantGaramond_400Regular_Italic',
                    fontSize: 13,
                    color: colors.inkMuted,
                    marginTop: 2,
                  }}
                >
                  Sadhak Profile · Insights
                </Text>
              </View>
              <Text style={{ color: colors.saffron, fontSize: 22 }}>›</Text>
            </View>

            <View style={[styles.profileDivider, { backgroundColor: colors.divider }]} />

            <View style={styles.profileStatsRow}>
              <View style={styles.profileStatCell}>
                <Text
                  style={[
                    styles.profileStatValue,
                    {
                      color: colors.saffronDeep,
                      fontFamily: typography.readerTitle.fontFamily,
                    },
                  ]}
                >
                  {profileTotals.totalReads}
                </Text>
                <Text style={[styles.profileStatLabel, { color: colors.inkMuted }]}>
                  {defaultLang === 'hi' ? 'श्लोक' : 'VERSES'}
                </Text>
              </View>
              <View style={[styles.profileStatRule, { backgroundColor: colors.divider }]} />
              <View style={styles.profileStatCell}>
                <Text
                  style={[
                    styles.profileStatValue,
                    {
                      color: colors.saffronDeep,
                      fontFamily: typography.readerTitle.fontFamily,
                    },
                  ]}
                >
                  {profileTotals.totalRounds}
                </Text>
                <Text style={[styles.profileStatLabel, { color: colors.inkMuted }]}>
                  {defaultLang === 'hi' ? 'आवृत्ति' : 'ROUNDS'}
                </Text>
              </View>
              <View style={[styles.profileStatRule, { backgroundColor: colors.divider }]} />
              <View style={styles.profileStatCell}>
                <Text
                  style={[
                    styles.profileStatValue,
                    {
                      color: colors.saffronDeep,
                      fontFamily: typography.readerTitle.fontFamily,
                    },
                  ]}
                >
                  {streak}
                </Text>
                <Text style={[styles.profileStatLabel, { color: colors.inkMuted }]}>
                  {defaultLang === 'hi' ? 'श्रृंखला' : 'STREAK'}
                </Text>
              </View>
            </View>
          </Pressable>

          {/* Wishlist Card */}
          <Pressable
            onPress={() => navigation.navigate('Wishlist')}
            accessibilityRole="button"
            accessibilityLabel={`Wishlist, ${bookmarks.length} verse${bookmarks.length !== 1 ? 's' : ''} saved`}
            style={({ pressed }) => [
              styles.section,
              { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <View style={[styles.sectionIcon, { backgroundColor: colors.saffron }]}>
              <Text style={{ color: '#fff', fontSize: 16 }}>♥</Text>
            </View>
            <View style={styles.sectionMeta}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.ink }}>
                Wishlist
              </Text>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: colors.inkMuted, marginTop: 1 }}>
                {bookmarks.length} verse{bookmarks.length !== 1 ? 's' : ''} saved
              </Text>
            </View>
            <Text style={{ color: colors.saffron, fontSize: 20 }}>›</Text>
          </Pressable>

          {/* Language Card */}
          <View style={[styles.section, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, flexDirection: 'column', alignItems: 'stretch' }]}>
            <View
              accessibilityRole="header"
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}
            >
              <View style={[styles.sectionIcon, { backgroundColor: colors.gold }]}>
                <Text style={{ color: '#fff', fontSize: 14 }}>अ</Text>
              </View>
              <View>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.ink }}>
                  Language
                </Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: colors.inkMuted, marginTop: 1 }}>
                  Default reading language
                </Text>
              </View>
            </View>

            <View style={styles.langRow} accessibilityRole="radiogroup" accessibilityLabel="Default reading language">
              <Pressable
                onPress={() => setDefaultLang('hi')}
                accessibilityRole="radio"
                accessibilityState={{ selected: defaultLang === 'hi' }}
                accessibilityLabel="Hindi"
                style={[
                  styles.langOption,
                  { borderColor: defaultLang === 'hi' ? colors.saffron : colors.divider },
                  defaultLang === 'hi' && { backgroundColor: 'rgba(184, 98, 27, 0.1)' },
                ]}
              >
                {defaultLang === 'hi' && <Text style={[styles.langCheck, { color: colors.saffron }]}>✓</Text>}
                <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 15, color: defaultLang === 'hi' ? colors.saffronDeep : colors.ink }}>
                  हिन्दी
                </Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 9, color: defaultLang === 'hi' ? colors.saffron : colors.inkMuted, marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.1 }}>
                  Hindi
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setDefaultLang('en')}
                accessibilityRole="radio"
                accessibilityState={{ selected: defaultLang === 'en' }}
                accessibilityLabel="English"
                style={[
                  styles.langOption,
                  { borderColor: defaultLang === 'en' ? colors.saffron : colors.divider },
                  defaultLang === 'en' && { backgroundColor: 'rgba(184, 98, 27, 0.1)' },
                ]}
              >
                {defaultLang === 'en' && <Text style={[styles.langCheck, { color: colors.saffron }]}>✓</Text>}
                <Text style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 15, color: defaultLang === 'en' ? colors.saffronDeep : colors.ink }}>
                  English
                </Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 9, color: defaultLang === 'en' ? colors.saffron : colors.inkMuted, marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.1 }}>
                  English
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Links */}
          <View style={[styles.section, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, flexDirection: 'column', alignItems: 'stretch', paddingVertical: 4, paddingHorizontal: 16 }]}>
            <Pressable
              onPress={() => setDisclaimerVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="About and disclaimer"
              style={[styles.linkRow, { borderBottomColor: colors.divider }]}
            >
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: colors.ink }}>About & Disclaimer</Text>
              <Text style={{ color: colors.inkMuted, fontSize: 16 }}>›</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                const url = buildDiscrepancyMailto();
                Linking.canOpenURL(url).then((supported) => {
                  if (supported) {
                    Linking.openURL(url);
                  } else {
                    Alert.alert('Email', 'Please email us at incardible.app@gmail.com');
                  }
                });
              }}
              accessibilityRole="button"
              accessibilityLabel="Report an error"
              style={({ pressed }) => [styles.linkRowLast, pressed && { opacity: 0.6 }]}
            >
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: colors.ink }}>Report an Error</Text>
              <Text style={{ color: colors.inkMuted, fontSize: 16 }}>›</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Disclaimer Modal */}
      <Modal
        visible={disclaimerVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDisclaimerVisible(false)}
      >
        <View style={[styles.modalRoot, { backgroundColor: colors.parchment }]}>
          <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.divider }]}>
              <Text
                accessibilityRole="header"
                accessibilityLabel={`${en.title}. ${hi.title}.`}
                style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 20, color: colors.ink }}
              >
                {en.title} / {hi.title}
              </Text>
              <Pressable
                onPress={() => setDisclaimerVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close"
                hitSlop={16}
                style={({ pressed }) => [styles.modalClose, pressed && { opacity: 0.7 }]}
              >
                <Text style={{ fontSize: 20, fontWeight: '600', color: colors.saffron }}>✕</Text>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.xxl, paddingTop: 24, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
              <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 16, color: colors.ink, marginBottom: 12 }}>
                {en.disclaimerHeading}
              </Text>
              {en.disclaimerParagraphs.map((para: string, i: number) => (
                <Text key={`en-${i}`} style={{ fontFamily: typography.meaning.fontFamily, fontSize: 14, lineHeight: 24, color: colors.inkSoft, marginBottom: 14 }}>
                  {para}
                </Text>
              ))}
              <View style={{ borderBottomWidth: 1, borderBottomColor: colors.divider, marginVertical: 20, opacity: 0.5 }} />
              <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 16, color: colors.ink, marginBottom: 12 }}>
                {hi.disclaimerHeading}
              </Text>
              {hi.disclaimerParagraphs.map((para: string, i: number) => (
                <Text key={`hi-${i}`} style={{ fontFamily: typography.meaning.fontFamily, fontSize: 14, lineHeight: 24, color: colors.inkSoft, marginBottom: 14 }}>
                  {para}
                </Text>
              ))}
              <View style={{ borderBottomWidth: 1, borderBottomColor: colors.divider, marginVertical: 20, opacity: 0.5 }} />
              <Text
                accessibilityRole="header"
                accessibilityLabel={`${en.reportHeading}. ${hi.reportHeading}.`}
                style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 16, color: colors.ink, marginBottom: 12 }}
              >
                {en.reportHeading} / {hi.reportHeading}
              </Text>
              <Text style={{ fontFamily: typography.meaning.fontFamily, fontSize: 14, lineHeight: 24, color: colors.inkSoft, marginBottom: 14 }}>
                {en.reportIntro}
              </Text>
              <Text style={{ fontFamily: typography.meaning.fontFamily, fontSize: 14, lineHeight: 24, color: colors.inkSoft, marginBottom: 14 }}>
                {hi.reportIntro}
              </Text>
              <Pressable
                onPress={() => {
                const url = buildDiscrepancyMailto();
                Linking.canOpenURL(url).then((supported) => {
                  if (supported) {
                    Linking.openURL(url);
                  } else {
                    Alert.alert('Email', 'Please email us at incardible.app@gmail.com');
                  }
                });
              }}
                accessibilityRole="button"
                accessibilityLabel={`${en.reportButtonLabel}. ${hi.reportButtonLabel}.`}
                style={{ backgroundColor: colors.saffron, borderRadius: radii.md, paddingVertical: 14, minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 16 }}
              >
                <Text style={{ color: '#fff', fontFamily: typography.readerTitle.fontFamily, fontSize: 15 }}>
                  {en.reportButtonLabel} / {hi.reportButtonLabel}
                </Text>
              </Pressable>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingTop: 20, paddingBottom: 40, gap: 14 },
  titleArea: { marginBottom: 8 },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#3c1e0a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionMeta: { flex: 1 },
  langRow: { flexDirection: 'row', gap: 12 },
  langOption: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    position: 'relative',
  },
  langCheck: {
    position: 'absolute',
    top: 4,
    right: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  linkRowLast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  modalRoot: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalClose: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    overflow: 'hidden',
    shadowColor: '#3c1e0a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileCrest: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTitleBlock: {
    flex: 1,
  },
  profileDivider: {
    height: 1,
    opacity: 0.55,
    marginTop: 14,
    marginBottom: 12,
  },
  profileStatsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  profileStatCell: {
    flex: 1,
    alignItems: 'center',
  },
  profileStatRule: {
    width: 1,
    opacity: 0.5,
  },
  profileStatValue: {
    fontSize: 20,
    includeFontPadding: false,
  },
  profileStatLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginTop: 4,
  },
});
