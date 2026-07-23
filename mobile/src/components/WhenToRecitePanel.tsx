import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { getDiscoveryMeta, bestTimeLabel } from '@/data/discoveryMeta';
import { getPurposeMeta } from '@/data/purposes';
import { WEEKDAY_LABELS } from '@/data/routine/vaar';
import { getRuleById } from '@/panchang/vratCatalog';

type Props = {
  sourceId: string;
};

export default function WhenToRecitePanel({ sourceId }: Props) {
  const { colors, typography, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const [expanded, setExpanded] = React.useState(true);
  const meta = getDiscoveryMeta(sourceId);
  if (!meta) return null;

  const purposes = (meta.purposes ?? []).map(getPurposeMeta);
  const bestDays = (meta.bestDays ?? []).map((day) => WEEKDAY_LABELS[day]).filter(Boolean);
  const festivals = (meta.bestFestivals ?? [])
    .map((id) => getRuleById(id))
    .filter((rule): rule is NonNullable<typeof rule> => Boolean(rule));
  const bestTime = meta.bestTime ? bestTimeLabel(meta.bestTime) : null;

  return (
    <View
      style={[
        styles.panel,
        {
          borderColor: colors.cardActiveBorder,
          borderRadius: radii.lg,
          backgroundColor: colors.cardSurface,
        },
      ]}
    >
      <Pressable
        onPress={() => setExpanded((value) => !value)}
        accessibilityRole="button"
        accessibilityLabel={`${contentByLang(lang, 'कब पाठ करें', 'When to Recite')}. Toggle details.`}
        style={styles.header}
      >
        <Text
          style={{
            color: colors.saffronDeep,
            fontFamily: typography.sectionLabel.fontFamily,
            fontSize: typography.sectionLabel.fontSize,
            letterSpacing: typography.sectionLabel.letterSpacing,
          }}
        >
          {contentByLang(lang, 'कब पाठ करें', 'When to Recite')}
        </Text>
        <Text style={{ color: colors.saffronDeep, fontSize: 16 }}>
          {expanded ? '⌃' : '⌄'}
        </Text>
      </Pressable>

      {expanded && (
        <View style={styles.body}>
          {bestDays.length > 0 && (
            <MetaRow
              label={contentByLang(lang, 'श्रेष्ठ दिन', 'Best Days')}
              value={bestDays.map((day) => contentByLang(lang, day.hi, day.en)).join(' · ')}
            />
          )}
          {festivals.length > 0 && (
            <MetaRow
              label={contentByLang(lang, 'पर्व', 'Festival')}
              value={festivals.map((rule) => contentByLang(lang, rule.nameHi, rule.nameEn)).join(' · ')}
            />
          )}
          {bestTime && (
            <MetaRow
              label={contentByLang(lang, 'समय', 'Best Time')}
              value={contentByLang(lang, bestTime.hi, bestTime.en)}
            />
          )}
          {purposes.length > 0 && (
            <View style={styles.chipRow}>
              {purposes.map((purpose) => (
                <View
                  key={purpose.id}
                  style={[
                    styles.chip,
                    { backgroundColor: colors.saffronTint, borderRadius: radii.pill },
                  ]}
                >
                  <Text
                    style={{
                      color: colors.saffronDeep,
                      fontFamily: typography.cardMeta.fontFamily,
                      fontSize: 11,
                    }}
                  >
                    {contentByLang(lang, purpose.nameHi, purpose.nameEn)}
                  </Text>
                </View>
              ))}
            </View>
          )}
          {meta.viniyog && (
            <View style={styles.viniyog}>
              <Text
                style={{
                  color: colors.saffronDeep,
                  fontFamily: typography.sectionLabel.fontFamily,
                  fontSize: 10,
                  letterSpacing: 1.4,
                }}
              >
                {contentByLang(lang, 'विनियोग', 'Viniyog')}
              </Text>
              <MetaRow
                label={contentByLang(lang, 'ऋषि', 'Rishi')}
                value={contentByLang(lang, meta.viniyog.rishiHi, meta.viniyog.rishiEn)}
              />
              <MetaRow
                label={contentByLang(lang, 'छन्द', 'Chandas')}
                value={contentByLang(lang, meta.viniyog.chandasHi, meta.viniyog.chandasEn)}
              />
              <MetaRow
                label={contentByLang(lang, 'देवता', 'Devata')}
                value={contentByLang(lang, meta.viniyog.devataHi, meta.viniyog.devataEn)}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  const { colors, typography } = useTheme();
  return (
    <View style={styles.row}>
      <Text
        style={{
          color: colors.inkMuted,
          fontFamily: typography.cardMeta.fontFamily,
          fontSize: 11,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: colors.ink,
          fontFamily: typography.meaningEnglish.fontFamily,
          fontSize: 14,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    padding: 14,
    marginTop: 22,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  body: {
    gap: 10,
  },
  row: {
    gap: 2,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  viniyog: {
    gap: 8,
    paddingTop: 4,
  },
});
