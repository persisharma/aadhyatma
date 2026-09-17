/**
 * मेरे घर roster (PRD-24 Phase 2 §E3, design.md §66.6) — the private list of
 * saved homes (cap 12), living home pinned first, each row carrying its
 * class-count micro-strip in the frozen order. No winner, no ranking — the
 * compare screen (a later block) is a side-by-side reading, never a verdict.
 */
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ReaderHeader from '@/components/ReaderHeader';
import { useGitaLanguage } from '@/data/gita/language';
import { getHomeTemplate } from '@/data/vastu/homeTemplates';
import { DISHA_LABELS } from '@/panchang/eventMuhurat';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { FINDING_CLASS_LABELS, FINDING_CLASS_ORDER, assessHome } from '@/vastu/assessHome';
import { HOME_ROSTER_CAP, type HomeRecord } from '@/vastu/homeRecord';
import { useHomeRoster } from '@/vastu/homeRecordStore';

type Navigation = {
  goBack: () => void;
  navigate: (route: string, params?: object) => void;
};

export default function GharVastuRosterScreen({ navigation }: { navigation: Navigation }) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);
  const { hydrated, roster } = useHomeRoster();

  // Compare selection (§E3/US-13): a buyer surface — only `considering` homes
  // can be picked, 2–3 of them, and the result is a side-by-side READING,
  // never a winner.
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<readonly string[]>([]);
  const consideringCount = roster.homes.filter((home) => home.role === 'considering').length;

  const toggleSelected = (homeId: string) => {
    setSelectedIds((current) =>
      current.includes(homeId)
        ? current.filter((id) => id !== homeId)
        : current.length >= 3
          ? current // three columns is the readable ceiling
          : [...current, homeId]
    );
  };

  // Living home pinned first, then newest first (store order is newest-first).
  const homes = [...roster.homes].sort((a, b) => {
    if (a.id === roster.livingId) return -1;
    if (b.id === roster.livingId) return 1;
    return 0;
  });

  const HomeCard = ({ home }: { home: HomeRecord }) => {
    const selectable = selecting && home.role === 'considering';
    const selected = selectedIds.includes(home.id);
    const model = assessHome(home);
    const template = getHomeTemplate(home.template);
    const caption = [
      template ? contentByLang(lang, template.labelHi, template.labelEn) : home.template,
      home.facing
        ? `${contentByLang(lang, 'मुख', 'Facing')} ${contentByLang(lang, DISHA_LABELS[home.facing].hi, DISHA_LABELS[home.facing].en)}`
        : null,
    ]
      .filter(Boolean)
      .join(' · ');
    return (
      <Pressable
        testID={`ghar-roster-${home.id}`}
        accessibilityRole="button"
        accessibilityState={selecting ? { selected, disabled: !selectable } : undefined}
        accessibilityLabel={
          selecting ? `${selectable ? 'Select' : 'Cannot compare'} home ${home.label}` : `Home ${home.label}`
        }
        onPress={() => {
          if (selecting) {
            if (selectable) toggleSelected(home.id);
            return; // the living home stays un-selectable — compare is a buyer surface
          }
          navigation.navigate('GharVastu', { homeId: home.id });
        }}
        style={[
          styles.card,
          {
            backgroundColor: colors.parchmentSoft,
            borderColor: selected ? colors.saffronDeep : colors.cardActiveBorder,
            borderWidth: selected ? 2 : 1,
            borderRadius: radii.lg,
            opacity: selecting && !selectable ? 0.45 : 1,
          },
          elevation.card,
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
          <Text style={{ flex: 1, fontFamily: titleFont, fontSize: 15, lineHeight: 22, color: colors.ink }}>{home.label}</Text>
          <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 22, color: colors.inkMuted }}>
            {home.role === 'living'
              ? contentByLang(lang, 'यहाँ रहते हैं', 'We live here')
              : contentByLang(lang, 'देख रहे हैं', 'Viewing')}
          </Text>
        </View>
        <Text style={{ fontFamily: bodyFont, fontSize: 12, lineHeight: 18, color: colors.inkMuted, marginTop: 2 }}>{caption}</Text>
        <View style={styles.strip}>
          {FINDING_CLASS_ORDER.filter((cls) => cls !== 'unmeasured' || model.counts.unmeasured > 0).map((cls) => (
            <View
              key={cls}
              style={[
                styles.pill,
                {
                  backgroundColor:
                    cls === 'forbidden' ? colors.avoidChipBg : cls === 'in-keeping' ? colors.goldChipBg : colors.parchment,
                  borderColor: cls === 'forbidden' || cls === 'in-keeping' ? 'transparent' : colors.divider,
                  borderRadius: radii.pill,
                },
              ]}
            >
              <Text
                style={{
                  fontFamily: titleFont,
                  fontSize: 10,
                  lineHeight: 14,
                  color: cls === 'forbidden' ? colors.avoidDeep : cls === 'in-keeping' ? colors.saffronDeep : colors.inkSoft,
                }}
              >
                {contentByLang(lang, FINDING_CLASS_LABELS[cls].hi, FINDING_CLASS_LABELS[cls].en)}
                {` ${model.counts[cls]}`}
              </Text>
            </View>
          ))}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']} testID="ghar-vastu-roster-screen">
      <ReaderHeader
        title={contentByLang(lang, 'मेरे घर', 'My homes')}
        variant="index"
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, paddingBottom: spacing.xxl }}>
        {/* Compare (§E3): appears once two considering homes exist. Selection
            mode toggles; the confirm pill enables at 2, caps at 3. */}
        {consideringCount >= 2 ? (
          <View style={{ flexDirection: 'row', gap: 8, marginTop: spacing.md, alignItems: 'center' }}>
            <Pressable
              testID="ghar-roster-compare"
              accessibilityRole="button"
              accessibilityState={{ selected: selecting }}
              accessibilityLabel={selecting ? 'Cancel compare selection' : 'Compare considering homes'}
              onPress={() => {
                setSelecting((current) => !current);
                setSelectedIds([]);
              }}
              style={[
                styles.comparePill,
                {
                  borderColor: selecting ? colors.cardActiveBorder : colors.border,
                  backgroundColor: selecting ? colors.goldChipBg : colors.surface,
                  borderRadius: radii.pill,
                },
              ]}
            >
              <Text style={{ fontFamily: titleFont, fontSize: 12, lineHeight: 19, color: selecting ? colors.saffronDeep : colors.inkSoft }}>
                {selecting
                  ? contentByLang(lang, 'रहने दें', 'Cancel')
                  : contentByLang(lang, 'तुलना करें', 'Compare')}
              </Text>
            </Pressable>
            {selecting ? (
              <Pressable
                testID="ghar-roster-compare-go"
                accessibilityRole="button"
                accessibilityLabel="See the selected homes side by side"
                disabled={selectedIds.length < 2}
                onPress={() => {
                  navigation.navigate('GharVastuCompare', { homeIds: selectedIds });
                  setSelecting(false);
                  setSelectedIds([]);
                }}
                style={[
                  styles.comparePill,
                  {
                    borderColor: colors.cardActiveBorder,
                    backgroundColor: colors.saffron,
                    borderRadius: radii.pill,
                    opacity: selectedIds.length < 2 ? 0.45 : 1,
                  },
                ]}
              >
                <Text style={{ fontFamily: titleFont, fontSize: 12, lineHeight: 19, color: '#FFF8EC' }}>
                  {contentByLang(lang, 'साथ-साथ देखें', 'See side by side')}
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
        {selecting ? (
          <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 17, color: colors.inkMuted, marginTop: 6 }}>
            {meaningByLang(
              lang,
              'देखे जा रहे 2–3 घर चुनें — पाठ साथ-साथ दिखेगा, निर्णय आपका।',
              'Pick 2–3 homes you are viewing — the readings sit side by side; the decision stays yours.'
            )}
          </Text>
        ) : null}
        {hydrated && homes.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: spacing.xxl, paddingHorizontal: spacing.lg }} testID="ghar-roster-empty">
            <Text style={{ fontFamily: titleFont, fontSize: 30, lineHeight: 40, color: colors.gold }}>॥</Text>
            <Text style={{ fontFamily: bodyFont, fontSize: 13.5, lineHeight: 21, color: colors.inkSoft, textAlign: 'center', marginTop: spacing.md }}>
              {meaningByLang(
                lang,
                'अभी कोई घर दर्ज नहीं। जहाँ रहते हैं, या जो फ़्लैट देख रहे हैं — कक्ष मंडल पर रखिए, फिर विधान के साथ पढ़िए।',
                'Nothing saved yet. The home you live in, or a flat you are viewing — place its rooms on the mandala, then read them with the convention.'
              )}
            </Text>
          </View>
        ) : (
          homes.map((home) => <HomeCard key={home.id} home={home} />)
        )}

        {homes.length < HOME_ROSTER_CAP ? (
          <Pressable
            testID="ghar-roster-new"
            accessibilityRole="button"
            accessibilityLabel="New home"
            onPress={() => navigation.navigate('GharVastuSetup')}
            style={[styles.newButton, { backgroundColor: colors.saffron, borderRadius: radii.pill }]}
          >
            <Text style={{ fontFamily: titleFont, fontSize: 13.5, lineHeight: 20, color: '#FFF8EC' }}>
              {contentByLang(lang, '+ नया घर', '+ New home')}
            </Text>
          </Pressable>
        ) : (
          <Text style={{ fontFamily: bodyFont, fontSize: 12, lineHeight: 18, color: colors.inkMuted, textAlign: 'center', marginTop: spacing.lg }}>
            {contentByLang(lang, 'सूची पूरी है (12) — नया जोड़ने से पहले कोई घर हटाएँ।', 'The roster is full (12) — delete a home before adding another.')}
          </Text>
        )}

        <View style={[styles.privacy, { borderLeftColor: colors.goldChipBg }]}>
          <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 17, color: colors.inkMuted, fontStyle: 'italic' }}>
            {meaningByLang(
              lang,
              'ये मानचित्र केवल इस फ़ोन पर हैं — कहीं भेजे नहीं जाते।',
              'These maps live only on this phone — they are sent nowhere.'
            )}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  card: { borderWidth: 1, paddingHorizontal: 14, paddingTop: 13, paddingBottom: 12, marginTop: 10 },
  strip: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8 },
  pill: { borderWidth: 1, paddingHorizontal: 7, paddingVertical: 2 },
  comparePill: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 5 },
  newButton: { alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 10, marginTop: 22 },
  privacy: { borderLeftWidth: 2, paddingLeft: 10, paddingVertical: 4, marginTop: 18 },
});
