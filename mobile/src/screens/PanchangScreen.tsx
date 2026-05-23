import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { useTodayPanchang } from '@/panchang/usePanchang';
import type { PanchangElement } from '@/panchang/types';

function formatTime12(date: Date | null): string {
  if (!date) return '';
  const h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

export default function PanchangScreen() {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const isHindi = lang === 'hi';
  const { today: p, upcoming } = useTodayPanchang();

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
          <View style={styles.titleArea}>
            <Text style={{ fontFamily: typography.screenTitle.fontFamily, fontSize: 20, color: colors.ink, textAlign: 'center' }}>
              पंचांग
            </Text>
            <Text style={{ fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 12, color: colors.inkMuted, textAlign: 'center', marginTop: 2 }}>
              Panchang
            </Text>
          </View>

          <View style={[styles.schoolPill, { backgroundColor: 'rgba(184, 98, 27, 0.1)', borderRadius: radii.sm }]}>
            <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 12, color: colors.saffronDeep }}>
              {isHindi ? 'दृक् पंचांग' : 'Drik Panchang'}
            </Text>
          </View>

          <Text style={{ fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 10, color: colors.inkMuted, textAlign: 'center', marginTop: 6 }}>
            {isHindi ? 'संदर्भ: उज्जैन, भारत · पूर्णिमांत' : 'Reference: Ujjain, India · Purnimant'}
          </Text>

          <View style={[styles.dateHeader, { borderBottomColor: colors.divider }]}>
            <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 15, color: colors.saffronDeep }}>
              {isHindi ? p.vara.nameHi : p.vara.nameEn}
              <Text style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 12, color: colors.inkSoft }}>
                {'  '}{p.date.getDate()} {p.date.toLocaleString('en', { month: 'short' })} {p.date.getFullYear()} · {isHindi ? `विक्रम संवत् ${p.vikramSamvat}` : `Vikram Samvat ${p.vikramSamvat}`}
              </Text>
            </Text>
            <Text style={{ fontFamily: typography.meaning.fontFamily, fontSize: 11, color: colors.inkMuted, marginTop: 2 }}>
              {isHindi ? `${p.lunarMonth.nameHi} · ${p.tithi.paksha === 'shukla' ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष'}` : `${p.lunarMonth.nameEn} · ${p.tithi.paksha === 'shukla' ? 'Shukla Paksha' : 'Krishna Paksha'}`}
            </Text>
          </View>

          <View style={[styles.detailCard, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }]}>
            <PanchangRow label={isHindi ? 'तिथि' : 'Tithi'} element={p.tithi} isHindi={isHindi} colors={colors} typography={typography} />
            <PanchangRow label={isHindi ? 'नक्षत्र' : 'Nakshatra'} element={p.nakshatra} isHindi={isHindi} colors={colors} typography={typography} />
            <PanchangRow label={isHindi ? 'योग' : 'Yoga'} element={p.yoga} isHindi={isHindi} colors={colors} typography={typography} />
            <PanchangRow label={isHindi ? 'करण' : 'Karana'} element={p.karana} isHindi={isHindi} colors={colors} typography={typography} isLast />
          </View>

          <View style={[styles.timesCard, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }]}>
            <View style={styles.timesRow}>
              <TimeCell icon="☀" label={isHindi ? 'सूर्योदय' : 'Sunrise'} value={formatTime12(p.sunrise)} colors={colors} />
              <TimeCell icon="☀" label={isHindi ? 'सूर्यास्त' : 'Sunset'} value={formatTime12(p.sunset)} colors={colors} />
            </View>
            <View style={[styles.timesRow, { marginTop: 8 }]}>
              <TimeCell icon="☽" label={isHindi ? 'चंद्रोदय' : 'Moonrise'} value={formatTime12(p.moonrise)} colors={colors} />
              <TimeCell icon="☽" label={isHindi ? 'ब्रह्म मुहूर्त' : 'Brahma Muhurta'} value={`${formatTime12(p.brahmaMuhurta.start)} – ${formatTime12(p.brahmaMuhurta.end)}`} colors={colors} />
            </View>
          </View>

          {upcoming.length > 0 && (
            <View style={styles.upcomingSection}>
              <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 14, color: colors.ink, marginBottom: 10 }}>
                {isHindi ? 'आगामी' : 'Upcoming'}
              </Text>
              {upcoming.map((item, i) => (
                <View key={item.rule.id} style={[styles.upcomingRow, { borderBottomColor: i < upcoming.length - 1 ? colors.divider : 'transparent' }]}>
                  <View style={[styles.upcomingDot, { backgroundColor: item.rule.marker === 'star' ? colors.saffron : item.rule.marker === 'halfmoon' ? colors.ink : colors.gold }]} />
                  <Text style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 12, color: colors.inkMuted, width: 50 }}>
                    {item.date.getDate()} {item.date.toLocaleString('en', { month: 'short' })}
                  </Text>
                  <Text style={{ fontFamily: typography.meaning.fontFamily, fontSize: 13, color: colors.ink, flex: 1 }}>
                    {isHindi ? item.rule.nameHi : item.rule.nameEn}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function PanchangRow({ label, element, isHindi, colors, typography, isLast }: { label: string; element: PanchangElement; isHindi: boolean; colors: any; typography: any; isLast?: boolean }) {
  return (
    <View style={[styles.pRow, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider }]}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 14, color: colors.ink }}>
            {isHindi ? element.nameHi : element.nameEn}
          </Text>
          <Text style={{ fontSize: 9, color: colors.inkMuted, fontFamily: 'CormorantGaramond_500Medium', textTransform: 'uppercase', letterSpacing: 0.4 }}>
            {label}
          </Text>
        </View>
        <Text style={{ fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 10, color: colors.inkMuted, marginTop: 1 }}>
          {isHindi ? element.nameEn : element.nameHi}
        </Text>
      </View>
      {element.endTime && (
        <Text style={{ fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 11, color: colors.inkSoft }}>
          till {formatTime12(element.endTime)}
        </Text>
      )}
    </View>
  );
}

function TimeCell({ icon, label, value, colors }: { icon: string; label: string; value: string; colors: any }) {
  return (
    <View style={styles.timeCell}>
      <Text style={{ fontSize: 14 }}>{icon}</Text>
      <View style={{ marginLeft: 6 }}>
        <Text style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 10, color: colors.inkMuted }}>{label}</Text>
        <Text style={{ fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 13, color: colors.ink }}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingTop: 12, paddingBottom: 24 },
  titleArea: { marginBottom: 6, alignItems: 'center' },
  schoolPill: { alignSelf: 'center', paddingHorizontal: 14, paddingVertical: 6 },
  dateHeader: { marginTop: 10, paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: 8 },
  detailCard: { borderWidth: 1, padding: 10 },
  pRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7 },
  timesCard: { borderWidth: 1, padding: 10, marginTop: 8 },
  timesRow: { flexDirection: 'row', justifyContent: 'space-around' },
  timeCell: { flexDirection: 'row', alignItems: 'center', width: '45%' },
  upcomingSection: { marginTop: 12 },
  upcomingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, gap: 6 },
  upcomingDot: { width: 5, height: 5, borderRadius: 2.5 },
});
