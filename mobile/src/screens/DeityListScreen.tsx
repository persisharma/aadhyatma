import React, { useMemo } from 'react';
import { ImageBackground, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { library } from '@/data/texts';
import { deities } from '@/data/deities';
import { getDeityBackground } from '@/data/listingBackgrounds';
import LibraryCard from '@/components/LibraryCard';
import { navigateToEntryStart } from '@/navigation/entryRoutes';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'DeityList'>;

export default function DeityListScreen({ navigation, route }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { deityId } = route.params;

  const backgroundImage = useMemo(() => getDeityBackground(deityId), [deityId]);
  const deityMeta = deities.find((d) => d.id === deityId);
  const items = library.filter(
    (e) => !e.hidden && e.category !== 'japam' && e.deities.includes(deityId)
  );

  return (
    <View style={styles.root}>
      {backgroundImage ? <StatusBar barStyle="light-content" /> : null}
      {backgroundImage ? (
        <ImageBackground source={backgroundImage} style={StyleSheet.absoluteFill} resizeMode="cover">
          <LinearGradient
            colors={[colors.overlayTop, colors.overlayUpper, colors.overlayLower, colors.overlayBottom]}
            locations={[0, 0.4, 0.85, 1]}
            style={StyleSheet.absoluteFill}
          />
        </ImageBackground>
      ) : (
        <LinearGradient
          colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
          style={StyleSheet.absoluteFill}
        />
      )}
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={[styles.topBar, { paddingHorizontal: spacing.xxl }]}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={16}
            style={({ pressed }) => [
              styles.backBtn,
              { backgroundColor: colors.parchmentSoft, borderColor: colors.divider },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={{ color: colors.inkSoft, fontSize: 18 }}>‹</Text>
          </Pressable>
          <View style={styles.titleRow}>
            <Text
              style={{
                fontFamily: typography.readerTitle.fontFamily,
                fontSize: 16,
                color: colors.ink,
              }}
            >
              {deityMeta?.nameHi ?? ''}
            </Text>
            <Text
              style={{
                fontFamily: 'CormorantGaramond_400Regular_Italic',
                fontSize: 13,
                color: colors.inkMuted,
                marginLeft: 6,
              }}
            >
              · {deityMeta?.nameEn ?? ''}
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl, gap: spacing.md }]}
          showsVerticalScrollIndicator={false}
        >
          {items.map((entry) => {
            const onPress =
              entry.status === 'active' ? () => navigateToEntryStart(navigation, entry) : undefined;
            return <LibraryCard key={entry.id} entry={entry} onPress={onPress} />;
          })}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scroll: {
    paddingTop: 8,
    paddingBottom: 40,
  },
});
