import React from 'react';
import {
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
import HomeWordmark from '@/components/HomeWordmark';
import SearchFloatingButton from '@/components/SearchFloatingButton';
import SadhanaRow from '@/components/SadhanaRow';
import ToolsRow from '@/components/ToolsRow';
import NewFeaturesSection from '@/components/NewFeaturesSection';
import TodayStrip from '@/components/TodayStrip';
import TodayRecommendationsRow from '@/components/TodayRecommendationsRow';
import FestiveToran from '@/components/FestiveToran';
import { getTodayFestival } from '@/data/discoveryMeta';
import { useTodayKey } from '@/utils/useTodayKey';
import { launchMarkOnce } from '@/utils/launchTrace';
import type { HomeStackParamList } from '@/navigation/types';
import { useNewContent } from '@/contexts/NewContentContext';
import { useTilePressController, TilePressProvider } from '@/contexts/TilePressContext';
import { library } from '@/data/texts';
import { deities } from '@/data/deities';
import { purposes } from '@/data/purposes';
import { useTourTarget, scrollNodeIntoView } from '@/components/tour/tourTargets';

/**
 * Static counts for the पाठ door's subtitle. Computed once at module scope from
 * the bundled registries — this line must not cost a render pass on the screen
 * every cold start lands on (design.md §64).
 */
const LIBRARY_TEXT_COUNT = library.filter((e) => !e.hidden && e.status === 'active').length;
const DEITY_COUNT = deities.length;
const PURPOSE_COUNT = purposes.length;

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  launchMarkOnce('home-render');
  const { colors, typography, spacing } = useTheme();
  const { devSimulateUpgrade, devResetNewState } = useNewContent();
  // Feature-tour spotlight anchors (design.md §47). Home tiles live in the
  // vertical scroll, so they reveal themselves (scroll into view) before measure.
  const homeScrollRef = React.useRef<ScrollView>(null);
  // `routineCard` still points at the daily-practice surface — now the साधना
  // row rather than the banner. `categoriesGrid`, `japaTile` and `theerthTile`
  // retired with the grid; `toolsRow` and `libraryDoor` replace them, and
  // data/tour/steps.ts moves with this (TRD-42 §10).
  const routineCardRef = useTourTarget('routineCard', (ref) => scrollNodeIntoView(homeScrollRef, ref));
  const toolsRowRef = useTourTarget('toolsRow', (ref) => scrollNodeIntoView(homeScrollRef, ref));
  const libraryDoorRef = useTourTarget('libraryDoor', (ref) => scrollNodeIntoView(homeScrollRef, ref));

  // First-tap recovery for the launcher tiles and the Today/Discover cards:
  // iOS can cancel a child Pressable's `onPress` when it lives inside a
  // ScrollView even without a real drag. One shared controller (context) covers
  // every Home card so a vertical page-scroll started on any card suppresses its
  // fallback instead of navigating. See @/contexts/TilePressContext.
  const tilePress = useTilePressController();
  const { beginTilePress, markTileDrag, finishTilePress, activateTile } = tilePress;

  // Festive toran (design.md §55): on the 18 catalog festivals Home hangs a
  // garland + greeting chip under the wordmark. Same festival resolution as the
  // FOR TODAY row's leading card (and the morning's notification), so the three
  // surfaces always name the same day. `new Date(todayKey)` mirrors
  // TodayRecommendationsRow; the observance lookup is the cheap precomputed-table
  // path the row already takes on this same render.
  const todayKey = useTodayKey();
  const todayFestival = React.useMemo(() => getTodayFestival(new Date(todayKey)), [todayKey]);

  const openLibrary = React.useCallback(() => navigation.navigate('Library'), [navigation]);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <TilePressProvider value={tilePress}>
        <ScrollView
          ref={homeScrollRef}
          contentContainerStyle={[
            styles.scroll,
            {
              paddingHorizontal: spacing.xxl,
              paddingBottom: spacing.xxl * 3,
            },
          ]}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={markTileDrag}
        >
          <View style={styles.hero}>
            <HomeWordmark />
          </View>

          {todayFestival && (
            <FestiveToran
              greetingHi={todayFestival.greetingHi}
              greetingEn={todayFestival.greetingEn}
            />
          )}

          <TodayStrip />

          <TodayRecommendationsRow />

          {/* साधना — routine + sankalp + japa streak in one row, replacing the
              banner, the नित्य साधना launcher tile and two Discover cards that
              all opened the same surface (TRD-42 §5.1). */}
          <SadhanaRow rowRef={routineCardRef} />

          <Text
            style={[
              styles.sectionLabel,
              styles.sectionLabelSpaced,
              {
                color: colors.inkMuted,
                fontSize: typography.sectionLabel.fontSize,
                fontFamily: typography.sectionLabel.fontFamily,
                letterSpacing: typography.sectionLabel.letterSpacing,
              },
            ]}
          >
            उपकरण
          </Text>
          <ToolsRow rowRef={toolsRowRef} />

          {/* पाठ — one door to the library that used to be sixteen tiles. */}
          <Pressable
            ref={libraryDoorRef}
            collapsable={false}
            onPress={() => activateTile(openLibrary)}
            onPressIn={() => beginTilePress(openLibrary)}
            onPressOut={finishTilePress}
            accessibilityRole="button"
            accessibilityLabel="Library. Texts, deities and purposes. Tap to open."
            style={({ pressed }) => [
              styles.libraryDoor,
              {
                backgroundColor: colors.parchmentSoft,
                borderColor: colors.divider,
                borderRadius: 18,
                paddingHorizontal: spacing.md,
              },
              pressed && { opacity: 0.85 },
            ]}
          >
            <View style={[styles.libraryThumb, { backgroundColor: colors.saffron }]}>
              <Text style={{ color: colors.onPrimary, fontFamily: typography.thumb.fontFamily, fontSize: 15 }}>
                पा
              </Text>
            </View>
            <View style={styles.libraryText}>
              <Text style={{ color: colors.ink, fontFamily: typography.thumb.fontFamily, fontSize: 15 }}>
                पाठ
              </Text>
              <Text style={{ color: colors.inkMuted, fontFamily: typography.cardMeta.fontFamily, fontSize: 11.5, marginTop: 1 }}>
                {`${LIBRARY_TEXT_COUNT} पाठ · ${DEITY_COUNT} देवता · ${PURPOSE_COUNT} उद्देश्य`}
              </Text>
            </View>
            <Text style={{ color: colors.gold, fontSize: 18 }}>›</Text>
          </Pressable>

          {/* नया — only what this user has not opened yet, at most three, gone
              once tapped. Replaces the eight-card Discover carousel that
              reshuffled on every open (TRD-42 §4). */}
          <NewFeaturesSection />

          <Text
            style={[
              styles.footer,
              {
                color: colors.inkMuted,
                fontFamily: typography.footerMantra.fontFamily,
                fontSize: typography.footerMantra.fontSize,
              },
            ]}
          >
            ॥ श्रीरामचन्द्र चरणौ शरणं प्रपद्ये ॥
          </Text>

          {__DEV__ && (
            <View style={{ marginTop: 24, marginBottom: 160, flexDirection: 'row', gap: 10, alignSelf: 'center' }}>
              <Pressable
                testID="dev-seed-new-content"
                onPress={devSimulateUpgrade}
                accessibilityLabel="DEV simulate update"
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 14,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: colors.divider,
                  opacity: 0.6,
                }}
              >
                <Text style={{ color: colors.inkMuted, fontSize: 11 }}>🔧 seed NEW</Text>
              </Pressable>
              <Pressable
                testID="dev-reset-new-content"
                onPress={devResetNewState}
                accessibilityLabel="DEV reset new state"
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 14,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: colors.divider,
                  opacity: 0.6,
                }}
              >
                <Text style={{ color: colors.inkMuted, fontSize: 11 }}>🔧 reset</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
        </TilePressProvider>
      </SafeAreaView>

      <SearchFloatingButton onPress={() => navigation.navigate('Search')} />
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
    paddingTop: 4,
  },
  hero: {
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  sectionLabel: {
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionLabelSpaced: {
    marginTop: 16,
  },
  libraryDoor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 56,
    borderWidth: 1,
    marginTop: 16,
  },
  libraryThumb: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  libraryText: { flex: 1, minWidth: 0 },
  footer: {
    textAlign: 'center',
    opacity: 0.55,
    marginTop: 20,
    includeFontPadding: false,
  },
});
