import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { useFeatureTour } from '@/contexts/FeatureTourContext';
import Ornament from './Ornament';

type SlideVisual = 'welcome' | 'tabs' | 'reader' | 'panchang' | 'discover' | 'japam';

type Slide = {
  visual: SlideVisual;
  titleHi: string;
  titleEn: string;
  bodyHi: string;
  bodyEn: string;
};

const SLIDES: readonly Slide[] = [
  {
    visual: 'welcome',
    titleHi: 'वेदांश में आपका स्वागत है',
    titleEn: 'Welcome to Vedansh',
    bodyHi:
      'गीता, चालीसा, स्तोत्र, सुंदरकांड और पंचांग — सब एक ही ठिकाने पर, हिंदी और अंग्रेज़ी दोनों में।',
    bodyEn:
      'Gita, chalisas, stotrams, Sundarkand and Panchang — all in one quiet place, in Hindi and English.',
  },
  {
    visual: 'tabs',
    titleHi: 'चार ठिकाने',
    titleEn: 'Four places to begin',
    bodyHi:
      'गृह से ग्रंथ चुनें, भक्ति में दैनिक श्लोक पाएँ, पंचांग में तिथि व व्रत देखें, और अन्य में अपनी संग्रह सूची व साधक प्रोफ़ाइल खोलें।',
    bodyEn:
      'Home opens the library, Bhakti shows your verse for the day, Panchang carries tithi and vrats, More holds your Wishlist and Sadhak profile.',
  },
  {
    visual: 'reader',
    titleHi: 'पाठ करते समय',
    titleEn: 'While you read',
    bodyHi:
      'दायें-बायें सरकाकर श्लोक बदलें। ऊपर अ ⇆ A दबाकर हिंदी-अंग्रेज़ी अदल-बदल करें। हृदय छूकर श्लोक संग्रह करें।',
    bodyEn:
      'Swipe sideways to move between verses. Tap अ ⇆ A at the top to switch language. Tap the heart to save a verse to your Wishlist.',
  },
  {
    visual: 'panchang',
    titleHi: 'पंचांग और व्रत',
    titleEn: 'Panchang & Vrats',
    bodyHi:
      'पंचांग टैब में आज की तिथि, नक्षत्र, और आगामी पर्व देखें। किसी व्रत को "अनुसरण" करके स्मरण-संदेश पाएँ और उसकी कथा पढ़ें।',
    bodyEn:
      'The Panchang tab shows today\'s tithi, nakshatra, and upcoming vrats. Follow any vrat to receive reminders and read its katha.',
  },
  {
    visual: 'discover',
    titleHi: 'खोज और प्रवाह',
    titleEn: 'Search & resume',
    bodyHi:
      'गृह पर खोज बटन से किसी भी श्लोक तक पहुँचें। जहाँ छोड़ा था वहीं से पुनः आरंभ हो जाएगा, संग्रह में रखे श्लोक सदैव उपलब्ध रहेंगे।',
    bodyEn:
      'The search button on Home finds any verse. The app remembers where you left off, and your Wishlist keeps every saved verse one tap away.',
  },
  {
    visual: 'japam',
    titleHi: 'जप साधना',
    titleEn: 'Japam practice',
    bodyHi:
      'मंत्र खोलकर स्क्रीन छुएँ — एक स्पर्श एक मनका। १०८ पर एक आवृत्ति पूरी होती है, ध्वनि-स्पर्श आपको लय में रखते हैं।',
    bodyEn:
      'Open a mantra and tap anywhere to count a bead. Every 108 taps completes a round; subtle sound and haptics keep your rhythm.',
  },
];

export default function FeatureTourModal() {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const { isVisible, markTourSeen } = useFeatureTour();
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);
  const { width: screenWidth } = Dimensions.get('window');
  const isHi = lang === 'hi';
  const isLast = index === SLIDES.length - 1;

  const onMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const i = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
      if (i !== index) setIndex(i);
    },
    [index, screenWidth]
  );

  const onPrimary = useCallback(() => {
    if (isLast) {
      void markTourSeen();
      return;
    }
    const next = index + 1;
    listRef.current?.scrollToIndex({ index: next, animated: true });
    setIndex(next);
  }, [isLast, index, markTourSeen]);

  const onSkip = useCallback(() => {
    void markTourSeen();
  }, [markTourSeen]);

  const onModalClose = useCallback(() => {
    void markTourSeen();
  }, [markTourSeen]);

  const keyExtractor = useCallback((_: Slide, i: number) => `tour-${i}`, []);
  const getItemLayout = useCallback(
    (_: ArrayLike<Slide> | null | undefined, i: number) => ({
      length: screenWidth,
      offset: screenWidth * i,
      index: i,
    }),
    [screenWidth]
  );

  const renderItem = useCallback(
    ({ item }: { item: Slide }) => (
      <View style={[styles.slide, { width: screenWidth }]}>
        <View style={[styles.slideInner, { paddingHorizontal: spacing.xxl }]}>
          <TourVisual kind={item.visual} />
          <Ornament />
          <Text
            style={[
              styles.titleHi,
              {
                color: colors.ink,
                fontFamily: typography.readerTitle.fontFamily,
              },
            ]}
          >
            {item.titleHi}
          </Text>
          <Text
            style={[
              styles.titleEn,
              {
                color: colors.inkMuted,
                fontFamily: typography.cardLatin.fontFamily,
              },
            ]}
          >
            {item.titleEn}
          </Text>
          <Text
            style={[
              styles.body,
              {
                color: colors.inkSoft,
                fontFamily: isHi
                  ? typography.meaning.fontFamily
                  : typography.meaningEnglish.fontFamily,
                fontSize: isHi ? 16 : 17,
                lineHeight: 28,
              },
            ]}
          >
            {isHi ? item.bodyHi : item.bodyEn}
          </Text>
        </View>
      </View>
    ),
    [colors, isHi, screenWidth, spacing.xxl, typography]
  );

  const dots = useMemo(
    () =>
      SLIDES.map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: i === index ? colors.saffron : colors.dotRest,
              width: i === index ? 22 : 6,
            },
          ]}
        />
      )),
    [colors.dotRest, colors.saffron, index]
  );

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      presentationStyle="overFullScreen"
      transparent
      onRequestClose={onModalClose}
    >
      <View style={styles.root}>
        <LinearGradient
          colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
          <View style={[styles.topBar, { paddingHorizontal: spacing.xxl }]}>
            <View style={styles.topBarSpacer} />
            <Pressable
              onPress={onSkip}
              accessibilityRole="button"
              accessibilityLabel={isHi ? 'छोड़ें' : 'Skip'}
              hitSlop={16}
              style={({ pressed }) => [styles.skipBtn, pressed && { opacity: 0.6 }]}
            >
              <Text
                style={[
                  styles.skipText,
                  {
                    color: colors.inkMuted,
                    fontFamily: typography.cardLatin.fontFamily,
                  },
                ]}
              >
                {isHi ? 'छोड़ें' : 'Skip'}
              </Text>
            </Pressable>
          </View>

          <FlatList
            ref={listRef}
            data={SLIDES as Slide[]}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            getItemLayout={getItemLayout}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onMomentumEnd}
            style={styles.list}
          />

          <View style={styles.footer}>
            <View
              style={styles.dotsRow}
              accessibilityRole="progressbar"
              accessibilityLabel={
                isHi
                  ? `पृष्ठ ${index + 1} / ${SLIDES.length}`
                  : `Page ${index + 1} of ${SLIDES.length}`
              }
            >
              {dots}
            </View>

            <Pressable
              onPress={onPrimary}
              accessibilityRole="button"
              accessibilityLabel={
                isLast ? (isHi ? 'आरंभ करें' : 'Get started') : isHi ? 'आगे' : 'Next'
              }
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
                style={[
                  styles.primaryText,
                  {
                    color: colors.onPrimary,
                    fontFamily: typography.readerTitle.fontFamily,
                  },
                ]}
              >
                {isLast ? (isHi ? 'आरंभ करें' : 'Get started') : isHi ? 'आगे' : 'Next'}
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function TourVisual({ kind }: { kind: SlideVisual }) {
  const { colors, typography, radii } = useTheme();

  switch (kind) {
    case 'welcome':
      return (
        <View
          style={[
            styles.visualCard,
            { borderColor: colors.cardActiveBorder, borderRadius: radii.lg },
          ]}
        >
          <LinearGradient
            colors={[colors.cardActiveFrom, colors.cardActiveTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: radii.lg }]}
          />
          <View style={[styles.visualCrest, { backgroundColor: colors.saffron }]}>
            <Text
              style={{
                color: colors.onPrimary,
                fontFamily: typography.readerTitle.fontFamily,
                fontSize: 30,
              }}
            >
              ॐ
            </Text>
          </View>
        </View>
      );

    case 'tabs':
      return (
        <View
          style={[
            styles.visualCard,
            { borderColor: colors.divider, borderRadius: radii.lg },
          ]}
        >
          <View style={styles.tabRow}>
            <TabChip glyph="गृ" label="Home" active />
            <TabChip glyph="भ" label="Bhakti" />
            <TabChip glyph="पं" label="Panchang" />
            <TabChip glyph="अ" label="More" />
          </View>
        </View>
      );

    case 'reader':
      return (
        <View
          style={[
            styles.visualCard,
            { borderColor: colors.divider, borderRadius: radii.lg },
          ]}
        >
          <View style={styles.readerHeader}>
            <Text
              style={{
                color: colors.ink,
                fontFamily: typography.readerTitle.fontFamily,
                fontSize: 13,
              }}
            >
              श्लोक · १
            </Text>
            <View style={[styles.toggleChip, { borderColor: colors.saffron }]}>
              <Text
                style={{
                  color: colors.saffronDeep,
                  fontFamily: typography.readerTitle.fontFamily,
                  fontSize: 11,
                }}
              >
                अ ⇆ A
              </Text>
            </View>
          </View>
          <Text
            style={{
              color: colors.ink,
              fontFamily: typography.verse.fontFamily,
              fontSize: 18,
              textAlign: 'center',
              marginTop: 12,
            }}
          >
            ॥ धर्मक्षेत्रे कुरुक्षेत्रे ॥
          </Text>
          <View style={styles.readerFooter}>
            <Text style={{ color: colors.inkMuted, fontSize: 14 }}>‹</Text>
            <Text style={{ color: colors.saffron, fontSize: 18, marginHorizontal: 18 }}>
              ♥
            </Text>
            <Text style={{ color: colors.inkMuted, fontSize: 14 }}>›</Text>
          </View>
        </View>
      );

    case 'panchang':
      return (
        <View
          style={[
            styles.visualCard,
            { borderColor: colors.divider, borderRadius: radii.lg },
          ]}
        >
          <View style={styles.panchangRow}>
            <View
              style={[
                styles.moonCircle,
                { borderColor: colors.gold },
              ]}
            >
              <Text
                style={{
                  color: colors.gold,
                  fontFamily: typography.readerTitle.fontFamily,
                  fontSize: 26,
                }}
              >
                ☽
              </Text>
            </View>
            <View style={styles.panchangMeta}>
              <Text
                style={{
                  color: colors.ink,
                  fontFamily: typography.readerTitle.fontFamily,
                  fontSize: 14,
                }}
              >
                आज की तिथि
              </Text>
              <Text
                style={{
                  color: colors.inkMuted,
                  fontFamily: typography.cardLatin.fontFamily,
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                Tithi · Nakshatra
              </Text>
              <View
                style={[
                  styles.followChip,
                  { backgroundColor: colors.saffronTint, borderRadius: radii.pill },
                ]}
              >
                <Text
                  style={{
                    color: colors.saffronDeep,
                    fontFamily: typography.cardLatin.fontFamily,
                    fontSize: 11,
                  }}
                >
                  ★ Follow vrat
                </Text>
              </View>
            </View>
          </View>
        </View>
      );

    case 'discover':
      return (
        <View
          style={[
            styles.visualCard,
            { borderColor: colors.divider, borderRadius: radii.lg },
          ]}
        >
          <View
            style={[
              styles.searchBar,
              { borderColor: colors.divider, borderRadius: radii.pill },
            ]}
          >
            <Text
              style={{
                color: colors.saffron,
                fontSize: 16,
                marginRight: 8,
              }}
            >
              ⌕
            </Text>
            <Text
              style={{
                color: colors.inkMuted,
                fontFamily: typography.cardLatin.fontFamily,
                fontSize: 13,
              }}
            >
              {'Search verses…'}
            </Text>
          </View>
          <View style={styles.resumeRow}>
            <View
              style={[
                styles.resumeChip,
                {
                  backgroundColor: colors.saffronTint,
                  borderRadius: radii.pill,
                },
              ]}
            >
              <Text
                style={{
                  color: colors.saffronDeep,
                  fontFamily: typography.cardLatin.fontFamily,
                  fontSize: 12,
                }}
              >
                {'जारी रखें · Resume'}
              </Text>
            </View>
            <View
              style={[
                styles.resumeChip,
                {
                  backgroundColor: colors.goldTint,
                  borderRadius: radii.pill,
                },
              ]}
            >
              <Text
                style={{
                  color: colors.gold,
                  fontFamily: typography.cardLatin.fontFamily,
                  fontSize: 12,
                }}
              >
                {'♥ Wishlist'}
              </Text>
            </View>
          </View>
        </View>
      );

    case 'japam':
      return (
        <View
          style={[
            styles.visualCard,
            { borderColor: colors.divider, borderRadius: radii.lg },
          ]}
        >
          <View style={[styles.beadCircle, { borderColor: colors.saffron }]}>
            <Text
              style={{
                color: colors.saffronDeep,
                fontFamily: typography.readerTitle.fontFamily,
                fontSize: 26,
              }}
            >
              १०८
            </Text>
            <Text
              style={{
                color: colors.inkMuted,
                fontFamily: typography.cardLatin.fontFamily,
                fontSize: 11,
                letterSpacing: 1.8,
                textTransform: 'uppercase',
                marginTop: 2,
              }}
            >
              Beads
            </Text>
          </View>
        </View>
      );
  }
}

function TabChip({
  glyph,
  label,
  active = false,
}: {
  glyph: string;
  label: string;
  active?: boolean;
}) {
  const { colors, typography, radii } = useTheme();
  return (
    <View style={styles.tabChip}>
      <View
        style={[
          styles.tabGlyph,
          {
            borderRadius: radii.md,
            backgroundColor: active ? colors.saffron : colors.parchmentDeep,
          },
        ]}
      >
        <Text
          style={{
            color: active ? colors.onPrimary : colors.inkSoft,
            fontFamily: typography.readerTitle.fontFamily,
            fontSize: 16,
          }}
        >
          {glyph}
        </Text>
      </View>
      <Text
        style={{
          color: active ? colors.saffronDeep : colors.inkMuted,
          fontFamily: typography.cardLatin.fontFamily,
          fontSize: 10,
          marginTop: 6,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 4,
  },
  topBarSpacer: { width: 44, height: 44 },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontSize: 13,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  list: { flex: 1 },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  titleHi: {
    fontSize: 22,
    textAlign: 'center',
    includeFontPadding: false,
  },
  titleEn: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    includeFontPadding: false,
  },
  body: {
    textAlign: 'center',
    marginTop: 14,
    paddingHorizontal: 4,
    includeFontPadding: false,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  primary: {
    paddingVertical: 14,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    fontSize: 16,
    includeFontPadding: false,
  },

  visualCard: {
    width: 260,
    height: 160,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    overflow: 'hidden',
  },
  visualCrest: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  tabChip: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabGlyph: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  toggleChip: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  readerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  panchangRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    width: '100%',
  },
  moonCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panchangMeta: {
    flex: 1,
  },
  followChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
  },
  searchBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  resumeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  resumeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  beadCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
