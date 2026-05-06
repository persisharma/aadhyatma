import React, { useState, useCallback } from 'react';
import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { library } from '@/data/texts';
import { helpContent, buildDiscrepancyMailto } from '@/data/help/content';
import LibraryCard from '@/components/LibraryCard';
import Crest from '@/components/Crest';
import HelpFloatingButton from '@/components/HelpFloatingButton';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const [helpVisible, setHelpVisible] = useState(false);
  const hi = helpContent.hi;
  const en = helpContent.en;

  const openHelp = useCallback(() => setHelpVisible(true), []);
  const closeHelp = useCallback(() => setHelpVisible(false), []);
  const openMailto = useCallback(() => {
    Linking.openURL(buildDiscrepancyMailto());
  }, []);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingHorizontal: spacing.xxl,
              paddingBottom: spacing.xxl * 3,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <Crest />
            <Text
              style={[
                styles.title,
                {
                  color: colors.ink,
                  fontFamily: typography.screenTitle.fontFamily,
                  fontSize: typography.screenTitle.fontSize,
                  letterSpacing: typography.screenTitle.letterSpacing,
                },
              ]}
            >
              वेदांश़
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color: colors.inkMuted,
                  fontFamily: typography.subtitle.fontFamily,
                  fontSize: typography.subtitle.fontSize,
                  letterSpacing: typography.subtitle.letterSpacing,
                },
              ]}
            >
              Sacred Texts · Daily Reading
            </Text>
          </View>

          <Text
            style={[
              styles.sectionLabel,
              {
                color: colors.inkMuted,
                fontSize: typography.sectionLabel.fontSize,
                fontWeight: typography.sectionLabel.fontWeight,
                letterSpacing: typography.sectionLabel.letterSpacing,
              },
            ]}
          >
            LIBRARY
          </Text>

          <View style={[styles.library, { gap: spacing.md }]}>
            {library.filter((entry) => !entry.hidden).map((entry) => {
              let onPress: (() => void) | undefined;
              if (entry.id === 'hanuman-chalisa') {
                onPress = () => navigation.navigate('ChalisaReader', { initialIndex: 0 });
              } else if (entry.id === 'bhagavad-gita') {
                onPress = () => navigation.navigate('GitaChapters');
              } else if (entry.id === 'sundarkand') {
                onPress = () => navigation.navigate('SundarkandReader', { initialIndex: 0 });
              }
              return <LibraryCard key={entry.id} entry={entry} onPress={onPress} />;
            })}
          </View>

          <Text
            style={[
              styles.footer,
              {
                color: colors.inkMuted,
                fontFamily: typography.footerMantra.fontFamily,
                fontSize: typography.footerMantra.fontSize,
                letterSpacing: typography.footerMantra.letterSpacing,
              },
            ]}
          >
            ॥ श्रीरामचन्द्र चरणौ शरणं प्रपद्ये ॥
          </Text>
        </ScrollView>
      </SafeAreaView>

      <HelpFloatingButton onPress={openHelp} />

      <Modal
        visible={helpVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeHelp}
      >
        <View style={[styles.modalRoot, { backgroundColor: colors.parchment }]}>
          <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.divider }]}>
              <Text
                style={[
                  styles.modalTitle,
                  {
                    color: colors.ink,
                    fontFamily: typography.readerTitle.fontFamily,
                    fontSize: 20,
                  },
                ]}
              >
                {en.title} / {hi.title}
              </Text>
              <Pressable onPress={closeHelp} hitSlop={12}>
                <Text style={[styles.closeButton, { color: colors.saffron }]}>✕</Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={[
                styles.modalScroll,
                { paddingHorizontal: spacing.xxl },
              ]}
              showsVerticalScrollIndicator={false}
            >
              <Text
                style={[
                  styles.modalSectionHeading,
                  {
                    color: colors.ink,
                    fontFamily: typography.readerTitle.fontFamily,
                  },
                ]}
              >
                {en.disclaimerHeading}
              </Text>
              {en.disclaimerParagraphs.map((para, i) => (
                <Text
                  key={`en-${i}`}
                  style={[
                    styles.modalPara,
                    {
                      color: colors.inkSoft,
                      fontFamily: typography.meaning.fontFamily,
                      fontSize: 14,
                      lineHeight: 24,
                    },
                  ]}
                >
                  {para}
                </Text>
              ))}

              <View style={[styles.langDivider, { borderBottomColor: colors.divider }]} />

              <Text
                style={[
                  styles.modalSectionHeading,
                  {
                    color: colors.ink,
                    fontFamily: typography.readerTitle.fontFamily,
                  },
                ]}
              >
                {hi.disclaimerHeading}
              </Text>
              {hi.disclaimerParagraphs.map((para, i) => (
                <Text
                  key={`hi-${i}`}
                  style={[
                    styles.modalPara,
                    {
                      color: colors.inkSoft,
                      fontFamily: typography.meaning.fontFamily,
                      fontSize: 14,
                      lineHeight: 24,
                    },
                  ]}
                >
                  {para}
                </Text>
              ))}

              <View style={[styles.langDivider, { borderBottomColor: colors.divider }]} />

              <Text
                style={[
                  styles.modalSectionHeading,
                  {
                    color: colors.ink,
                    fontFamily: typography.readerTitle.fontFamily,
                    marginTop: 8,
                  },
                ]}
              >
                {en.reportHeading} / {hi.reportHeading}
              </Text>
              <Text
                style={[
                  styles.modalPara,
                  {
                    color: colors.inkSoft,
                    fontFamily: typography.meaning.fontFamily,
                    fontSize: 14,
                    lineHeight: 24,
                  },
                ]}
              >
                {en.reportIntro}
              </Text>
              <Text
                style={[
                  styles.modalPara,
                  {
                    color: colors.inkSoft,
                    fontFamily: typography.meaning.fontFamily,
                    fontSize: 14,
                    lineHeight: 24,
                  },
                ]}
              >
                {hi.reportIntro}
              </Text>
              <Pressable
                onPress={openMailto}
                style={[
                  styles.emailButton,
                  {
                    backgroundColor: colors.saffron,
                    borderRadius: radii.md,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.emailButtonText,
                    { fontFamily: typography.readerTitle.fontFamily },
                  ]}
                >
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
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    paddingTop: 12,
  },
  hero: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    includeFontPadding: false,
  },
  subtitle: {
    marginTop: 6,
    fontStyle: 'italic',
    includeFontPadding: false,
  },
  sectionLabel: {
    textTransform: 'uppercase',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  library: {
    gap: 12,
  },
  footer: {
    textAlign: 'center',
    opacity: 0.55,
    marginTop: 36,
    includeFontPadding: false,
  },
  modalRoot: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    includeFontPadding: false,
  },
  closeButton: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalScroll: {
    paddingTop: 24,
    paddingBottom: 48,
  },
  modalSectionHeading: {
    fontSize: 16,
    marginBottom: 12,
    includeFontPadding: false,
  },
  modalPara: {
    marginBottom: 14,
    includeFontPadding: false,
  },
  langDivider: {
    borderBottomWidth: 1,
    marginVertical: 20,
    opacity: 0.5,
  },
  emailButton: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  emailButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
});
