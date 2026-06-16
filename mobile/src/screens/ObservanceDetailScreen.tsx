import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { usePanchangCalendarSystem } from '@/panchang/usePanchang';
import { getKathaContent } from '@/panchang/kathaContent';
import { getNextOccurrence, getRuleById } from '@/panchang/vratCatalog';
import { useVratFollows } from '@/contexts/VratFollowContext';
import type { PanchangStackParamList } from '@/navigation/types';
import { captionFont } from '@/utils/scriptFont';

type Props = NativeStackScreenProps<PanchangStackParamList, 'ObservanceDetail'>;

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_HI = ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्टू', 'नवं', 'दिसं'];

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatDate(date: Date, isHindi: boolean): string {
  const months = isHindi ? MONTHS_HI : MONTHS_EN;
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function relativeLabel(date: Date, from: Date, isHindi: boolean): string {
  const days = Math.round((startOfLocalDay(date).getTime() - startOfLocalDay(from).getTime()) / 86400000);
  if (days <= 0) return isHindi ? 'आज' : 'Today';
  if (days === 1) return isHindi ? 'कल' : 'Tomorrow';
  return isHindi ? `${days} दिन में` : `in ${days} days`;
}

function categoryLabel(category: string, isHindi: boolean): string {
  if (category === 'vrat') return isHindi ? 'व्रत' : 'Vrat';
  if (category === 'upavas') return isHindi ? 'उपवास' : 'Upvas';
  return isHindi ? 'पर्व' : 'Festival';
}

export default function ObservanceDetailScreen({ route, navigation }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const isHindi = lang === 'hi';
  const rootNav = useNavigation<any>();
  const [calendarSystem] = usePanchangCalendarSystem();

  const rule = getRuleById(route.params.ruleId);
  const today = useMemo(() => startOfLocalDay(new Date()), []);
  const next = useMemo(
    () => (rule ? getNextOccurrence(rule.id, today, calendarSystem) : null),
    [rule, today, calendarSystem]
  );
  const katha = rule?.kathaId ? getKathaContent(rule.kathaId) : null;

  const { isFollowing, follow, unfollow } = useVratFollows();
  const following = rule ? isFollowing(rule.id) : false;
  const [justAdded, setJustAdded] = useState(false);

  // The "Added — View in My Vrat" confirmation auto-dismisses.
  useEffect(() => {
    if (!justAdded) return undefined;
    const t = setTimeout(() => setJustAdded(false), 3500);
    return () => clearTimeout(t);
  }, [justAdded]);

  const toggleFollow = () => {
    if (!rule) return;
    if (following) {
      unfollow(rule.id);
      setJustAdded(false);
    } else {
      follow(rule.id);
      setJustAdded(true);
    }
  };

  const openKatha = () => {
    if (rule?.kathaId) {
      rootNav.navigate('HomeTab', { screen: 'VratKathaReader', params: { kathaId: rule.kathaId } });
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel={isHindi ? 'वापस' : 'Back'}
            hitSlop={12}
            style={({ pressed }) => [styles.backButton, { borderColor: colors.divider }, pressed && { opacity: 0.6 }]}
          >
            <Text style={{ color: colors.inkSoft, fontSize: 20 }}>‹</Text>
          </Pressable>
          <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 15, color: colors.ink }}>
            {isHindi ? 'व्रत विवरण' : 'Observance'}
          </Text>
          <View style={{ width: 36 }} />
        </View>

        {!rule ? (
          <View style={styles.centered}>
            <Text style={{ fontFamily: typography.meaning.fontFamily, fontSize: 14, color: colors.inkMuted }}>
              {isHindi ? 'यह व्रत नहीं मिला।' : 'Observance not found.'}
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl }]}
            showsVerticalScrollIndicator={false}
          >
            {/* Hero */}
            <View style={styles.hero}>
              <View style={styles.heroTags}>
                <View style={[styles.pill, { backgroundColor: rule.category === 'festival' ? colors.saffronTint : colors.goldTint, borderRadius: radii.pill }]}>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: colors.saffronDeep }}>
                    {categoryLabel(rule.category, isHindi)}
                  </Text>
                </View>
                <Text style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 13, color: colors.inkMuted }}>
                  {isHindi ? rule.deityHi : rule.deityEn}
                </Text>
              </View>
              <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 24, color: colors.ink, textAlign: 'center', marginTop: 8 }}>
                {isHindi ? rule.nameHi : rule.nameEn}
              </Text>
              <Text style={{ ...captionFont(isHindi ? rule.nameEn : rule.nameHi), fontSize: 15, color: colors.inkMuted, textAlign: 'center', marginTop: 4 }}>
                {isHindi ? rule.nameEn : rule.nameHi}
              </Text>
              {next && (
                <View style={[styles.nextPill, { backgroundColor: colors.saffronTint, borderRadius: radii.pill }]}>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colors.saffronDeep }}>
                    {isHindi ? 'अगला' : 'Next'} · {formatDate(next.date, isHindi)} · {relativeLabel(next.date, today, isHindi)}
                  </Text>
                </View>
              )}
            </View>

            {/* Actions (P2: Follow + Read Katha; Remind arrives in P3) */}
            <View style={styles.actionRow}>
              <Pressable
                onPress={toggleFollow}
                accessibilityRole="button"
                accessibilityState={{ selected: following }}
                accessibilityLabel={following ? 'Following' : 'Follow'}
                style={({ pressed }) => [
                  styles.actionBtn,
                  {
                    borderRadius: radii.pill,
                    backgroundColor: following ? colors.saffron : 'transparent',
                    borderColor: colors.saffron,
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: following ? colors.parchment : colors.saffronDeep }}>
                  {following ? (isHindi ? '✓ फ़ॉलो किया' : '✓ Following') : isHindi ? '★ फ़ॉलो करें' : '★ Follow'}
                </Text>
              </Pressable>
              {katha && (
                <Pressable
                  onPress={openKatha}
                  accessibilityRole="button"
                  accessibilityLabel={`Read katha ${katha.titleEn}`}
                  style={({ pressed }) => [
                    styles.actionBtn,
                    { borderRadius: radii.pill, backgroundColor: colors.saffron, borderColor: colors.saffron },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.parchment }}>
                    {isHindi ? '॥ कथा पढ़ें' : '॥ Read Katha'}
                  </Text>
                </Pressable>
              )}
            </View>
            {justAdded && (
              <Pressable
                onPress={() => navigation.navigate('MyVrat')}
                accessibilityRole="button"
                accessibilityLabel="Added — View in My Vrat"
                style={[styles.confirmBar, { backgroundColor: colors.goldTint, borderColor: colors.gold, borderRadius: radii.md }]}
              >
                <Text style={{ flex: 1, fontFamily: typography.meaning.fontFamily, fontSize: 13, color: colors.inkSoft }}>
                  {isHindi ? 'मेरा व्रत में जोड़ा' : 'Added to My Vrat'}
                </Text>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colors.saffronDeep }}>
                  {isHindi ? 'देखें →' : 'View →'}
                </Text>
              </Pressable>
            )}

            {/* About */}
            <View style={styles.block}>
              <Text style={[styles.blockHeading, { color: colors.ink, fontFamily: typography.readerTitle.fontFamily }]}>
                {isHindi ? 'महत्व' : 'About'}
              </Text>
              <Text style={{ fontFamily: typography.meaning.fontFamily, fontSize: 14, lineHeight: 22, color: colors.inkSoft }}>
                {isHindi ? rule.shortDescriptionHi : rule.shortDescriptionEn}
              </Text>
            </View>

            {/* Story / Katha */}
            {katha && (
              <View style={styles.block}>
                <Text style={[styles.blockHeading, { color: colors.ink, fontFamily: typography.readerTitle.fontFamily }]}>
                  {isHindi ? 'कथा' : 'Story'}
                </Text>
                <Pressable
                  onPress={openKatha}
                  accessibilityRole="button"
                  accessibilityLabel={`Read katha ${katha.titleEn}`}
                  style={({ pressed }) => [styles.kathaCard, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }, elevation.card, pressed && { opacity: 0.8 }]}
                >
                  <Text style={{ fontSize: 22, color: colors.saffron, marginRight: 12 }}>॥</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 15, color: colors.ink }}>
                      {isHindi ? katha.titleHi : katha.titleEn}
                    </Text>
                    <Text style={{ ...captionFont(isHindi ? katha.titleEn : katha.titleHi), fontSize: 13, color: colors.inkMuted, marginTop: 2 }}>
                      {isHindi ? katha.titleEn : katha.titleHi} · {katha.sections.length} {isHindi ? 'खंड' : 'sections'}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 20, color: colors.inkMuted }}>›</Text>
                </Pressable>
              </View>
            )}
            {/* "How to observe" (उपवास विधि) is intentionally omitted until real
                vidhi content exists — an empty "coming soon" placeholder made this
                primary screen read as under-construction. Re-add the section gated
                on a populated vidhi field once content lands (PRD-09 P4). */}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 },
  backButton: { width: 36, height: 36, borderWidth: 1, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  scroll: { paddingTop: 8, paddingBottom: 32 },
  hero: { alignItems: 'center', marginTop: 6, marginBottom: 8 },
  heroTags: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pill: { paddingHorizontal: 10, paddingVertical: 4 },
  nextPill: { marginTop: 8, paddingHorizontal: 14, paddingVertical: 6 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 4, marginBottom: 4 },
  actionBtn: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, borderWidth: 1.5 },
  confirmBar: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9, marginTop: 8 },
  block: { marginTop: 18 },
  blockHeading: { fontSize: 15, marginBottom: 8 },
  kathaCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, padding: 13 },
});
