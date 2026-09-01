/**
 * वास्तु दिशा (PRD-24, design.md §66) — the disha chakra + room-by-room
 * classical guidance + घर-का-मंदिर upkeep. Honest-accuracy contract:
 * the sensor never gates the content — `unavailable` opens manual mode,
 * `unreliable` shows the calibration hint while the dial keeps moving, and a
 * chip tap always wins over the sensor (tap the active chip to go live again).
 * Registered on the More AND Panchang stacks (the PRD-19 multi-stack door
 * pattern) so the griha-pravesh door pushes in place.
 */
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DishaChakra from '@/components/DishaChakra';
import ReaderHeader from '@/components/ReaderHeader';
import { useGitaLanguage } from '@/data/gita/language';
import { getMandirGuidance } from '@/data/vastu/mandirGuidance';
import { getVastuRoomEntries } from '@/data/vastu/roomGuidance';
import type { MandirGuidanceEntry, VastuRoomEntry } from '@/data/vastu/types';
import { DISHA_LABELS, DISHA_ORDER, type DishaDirection } from '@/panchang/eventMuhurat';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang, meaningByLang, pick } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { dikForHeading } from '@/vastu/compass';
import { useCompassHeading } from '@/vastu/useCompassHeading';

export default function VastuDishaScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);

  // A chosen chip pauses the sensor (subscription removed); tapping the active
  // chip returns to live — unless the device has no magnetometer to return to.
  const [manualDik, setManualDik] = useState<DishaDirection | null>(null);
  const sensor = useCompassHeading(manualDik == null);

  const liveDik = sensor.heading != null ? dikForHeading(sensor.heading) : null;
  const facingDik = manualDik ?? liveDik;
  const heading = manualDik == null ? sensor.heading : null;

  const roomEntries = getVastuRoomEntries();
  const mandirEntries = getMandirGuidance();
  const facedEntries = facingDik
    ? roomEntries.filter((entry) => entry.directions.includes(facingDik))
    : [];

  const statusLine = (() => {
    if (manualDik != null) {
      return sensor.status === 'unavailable'
        ? pick(lang, {
            hi: 'इस डिवाइस में दिक्सूचक नहीं है — दिशा स्वयं चुनी गई है।',
            en: 'This device has no compass sensor — direction chosen by hand.',
            gu: 'આ ડિવાઇસમાં દિક્સૂચક નથી — દિશા જાતે પસંદ કરી છે.',
            kn: 'ಈ ಸಾಧನದಲ್ಲಿ ದಿಕ್ಸೂಚಕವಿಲ್ಲ — ದಿಕ್ಕನ್ನು ಕೈಯಾರೆ ಆರಿಸಲಾಗಿದೆ.',
          })
        : pick(lang, {
            hi: 'चुनी हुई दिशा — लाइव दिक्सूचक के लिए इसी दिशा को फिर दबाएँ।',
            en: 'Direction chosen by hand — tap it again for the live compass.',
            gu: 'જાતે પસંદ કરેલી દિશા — લાઇવ દિક્સૂચક માટે તે જ દિશા ફરી દબાવો.',
            kn: 'ಕೈಯಾರೆ ಆರಿಸಿದ ದಿಕ್ಕು — ಲೈವ್ ದಿಕ್ಸೂಚಕಕ್ಕೆ ಅದೇ ದಿಕ್ಕನ್ನು ಮತ್ತೆ ಒತ್ತಿರಿ.',
          });
    }
    switch (sensor.status) {
      case 'unavailable':
        return pick(lang, {
          hi: 'इस डिवाइस में दिक्सूचक उपलब्ध नहीं — नीचे से दिशा चुनें।',
          en: 'No compass sensor on this device — choose a direction below.',
          gu: 'આ ડિવાઇસમાં દિક્સૂચક ઉપલબ્ધ નથી — નીચેથી દિશા પસંદ કરો.',
          kn: 'ಈ ಸಾಧನದಲ್ಲಿ ದಿಕ್ಸೂಚಕ ಲಭ್ಯವಿಲ್ಲ — ಕೆಳಗಿನಿಂದ ದಿಕ್ಕನ್ನು ಆರಿಸಿ.',
        });
      case 'unreliable':
        return pick(lang, {
          hi: 'रीडिंग अस्थिर है — फ़ोन समतल रखें, धातु-उपकरणों से दूर, और ∞ आकार में घुमाएँ।',
          en: 'Reading is unsteady — hold the phone flat, away from metal, and sweep it in a figure-8.',
          gu: 'રીડિંગ અસ્થિર છે — ફોન સપાટ રાખો, ધાતુથી દૂર, અને ∞ આકારમાં ફેરવો.',
          kn: 'ಓದು ಅಸ್ಥಿರವಾಗಿದೆ — ಫೋನನ್ನು ಸಮತಟ್ಟಾಗಿ, ಲೋಹದಿಂದ ದೂರ ಹಿಡಿದು ∞ ಆಕಾರದಲ್ಲಿ ತಿರುಗಿಸಿ.',
        });
      case 'starting':
        return pick(lang, {
          hi: 'दिक्सूचक प्रारंभ हो रहा है…',
          en: 'Starting the compass…',
          gu: 'દિક્સૂચક શરૂ થઈ રહ્યું છે…',
          kn: 'ದಿಕ್ಸೂಚಕ ಪ್ರಾರಂಭವಾಗುತ್ತಿದೆ…',
        });
      default:
        return pick(lang, {
          hi: 'फ़ोन को समतल रखें — ऊपरी किनारा जिस ओर है, वही दिशा।',
          en: 'Hold the phone flat — the top edge points the direction you face.',
          gu: 'ફોન સપાટ રાખો — ઉપરની ધાર જે તરફ છે, તે જ દિશા.',
          kn: 'ಫೋನನ್ನು ಸಮತಟ್ಟಾಗಿ ಹಿಡಿಯಿರಿ — ಮೇಲ್ತುದಿ ತೋರುವ ದಿಕ್ಕೇ ನಿಮ್ಮ ದಿಕ್ಕು.',
        });
    }
  })();

  const sectionLabelStyle = {
    fontFamily: typography.sectionLabel.fontFamily,
    fontSize: typography.sectionLabel.fontSize,
    letterSpacing: lang === 'en' ? typography.sectionLabel.letterSpacing : 0,
    color: colors.inkMuted,
    textTransform: 'uppercase' as const,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  };

  const onChip = (dik: DishaDirection) => {
    setManualDik((current) => {
      if (current !== dik) return dik;
      // Tapping the active chip goes live — unless there is no sensor to go to.
      return sensor.status === 'unavailable' ? current : null;
    });
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']} testID="vastu-disha-screen">
      <ReaderHeader
        title={contentByLang(lang, 'वास्तु दिशा', 'Vastu Disha')}
        variant="index"
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, paddingBottom: spacing.xxl }}>
        <View style={{ marginTop: spacing.md }}>
          <DishaChakra heading={heading} facingDik={facingDik} />
        </View>
        <Text
          testID="vastu-compass-status"
          style={{
            fontFamily: bodyFont,
            fontSize: 12.5,
            lineHeight: 19,
            color: sensor.status === 'unreliable' && manualDik == null ? colors.saffronDeep : colors.inkMuted,
            textAlign: 'center',
            marginTop: spacing.sm,
          }}
        >
          {statusLine}
        </Text>

        {/* The 8-dik chip row — the muhurat finder's दिशा chip idiom. Always
            rendered: the manual override is part of the feature, not a fallback. */}
        <View style={styles.dishaRow}>
          {DISHA_ORDER.map((dik) => {
            const active = manualDik === dik || (manualDik == null && liveDik === dik);
            return (
              <Pressable
                key={dik}
                testID={`vastu-disha-${dik}`}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Direction ${DISHA_LABELS[dik].en}`}
                onPress={() => onChip(dik)}
                style={[
                  styles.dishaChip,
                  {
                    borderColor: active ? colors.cardActiveBorder : colors.border,
                    backgroundColor: active ? colors.goldChipBg : colors.surface,
                    borderRadius: radii.pill,
                  },
                ]}
              >
                <Text style={{ fontFamily: titleFont, fontSize: 12, color: active ? colors.saffronDeep : colors.inkSoft, lineHeight: 19 }}>
                  {contentByLang(lang, DISHA_LABELS[dik].hi, DISHA_LABELS[dik].en)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {facedEntries.length > 0 && (
          <>
            <Text style={sectionLabelStyle}>{contentByLang(lang, 'इस दिशा में', 'In this direction')}</Text>
            {facedEntries.map((entry) => (
              <RoomCard key={entry.id} entry={entry} emphasised />
            ))}
          </>
        )}

        <Text style={sectionLabelStyle}>{contentByLang(lang, 'कक्ष-दर-कक्ष', 'Room by room')}</Text>
        {roomEntries
          .filter((entry) => !facedEntries.includes(entry))
          .map((entry) => (
            <RoomCard key={entry.id} entry={entry} />
          ))}

        <Text style={sectionLabelStyle}>{contentByLang(lang, 'घर का मंदिर', 'The home mandir')}</Text>
        {mandirEntries.map((entry) => (
          <MandirCard key={entry.id} entry={entry} />
        ))}

        <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 18, color: colors.inkMuted, marginTop: spacing.lg }}>
          {meaningByLang(
            lang,
            'यह शास्त्रीय परंपरा का परिचय है, घर का दोष-निर्णय नहीं — जो बदला नहीं जा सकता, उसके लिए परंपरा में ही व्यावहारिक रूप बताए गए हैं।',
            'This introduces the classical convention — it is not a verdict on a home. Where something cannot change, tradition itself states the practical form.'
          )}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function RoomCard({ entry, emphasised = false }: { entry: VastuRoomEntry; emphasised?: boolean }) {
  const { colors, typography, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);

  const dikLine = entry.isCenter
    ? contentByLang(lang, 'केंद्र', 'Centre')
    : entry.directions.map((d) => contentByLang(lang, DISHA_LABELS[d].hi, DISHA_LABELS[d].en)).join(' · ');

  return (
    <View
      testID={`vastu-room-${entry.id}`}
      style={[
        styles.card,
        { backgroundColor: colors.parchmentSoft, borderColor: emphasised ? colors.cardActiveBorder : colors.divider, borderRadius: radii.lg },
        elevation.card,
      ]}
    >
      <View style={styles.cardHeader}>
        <Text style={{ flex: 1, color: colors.ink, fontFamily: titleFont, fontSize: 15, lineHeight: 22 }}>
          {contentByLang(lang, entry.titleHi, entry.titleEn)}
        </Text>
        <Text style={{ color: colors.saffronDeep, fontFamily: titleFont, fontSize: 11.5, lineHeight: 22 }}>{dikLine}</Text>
      </View>
      <Text style={{ color: colors.inkSoft, fontFamily: bodyFont, fontSize: 13, lineHeight: 20, marginTop: 6 }}>
        {meaningByLang(lang, entry.conventionHi, entry.conventionEn)}
      </Text>
      <Text style={{ color: colors.inkMuted, fontFamily: bodyFont, fontSize: 12, lineHeight: 18, marginTop: 6 }}>
        {contentByLang(lang, 'कारण · ', 'Why · ')}
        {meaningByLang(lang, entry.reasonHi, entry.reasonEn)}
      </Text>
      {entry.accommodationHi && entry.accommodationEn ? (
        <Text style={{ color: colors.inkMuted, fontFamily: bodyFont, fontSize: 12, lineHeight: 18, marginTop: 4 }}>
          {contentByLang(lang, 'जहाँ संभव न हो · ', 'Where that is not possible · ')}
          {meaningByLang(lang, entry.accommodationHi, entry.accommodationEn)}
        </Text>
      ) : null}
    </View>
  );
}

function MandirCard({ entry }: { entry: MandirGuidanceEntry }) {
  const { colors, typography, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);

  const Bullet = ({ text, warning = false }: { text: string; warning?: boolean }) => (
    <View style={styles.bulletRow}>
      <Text style={{ color: warning ? colors.saffronDeep : colors.inkSoft, fontSize: 13, lineHeight: 20 }}>•</Text>
      <Text style={{ flex: 1, color: colors.inkSoft, fontFamily: bodyFont, fontSize: 13, lineHeight: 20 }}>{text}</Text>
    </View>
  );

  return (
    <View
      testID={`vastu-mandir-${entry.id}`}
      style={[styles.card, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }, elevation.card]}
    >
      <Text style={{ color: colors.ink, fontFamily: titleFont, fontSize: 15, lineHeight: 22 }}>
        {contentByLang(lang, entry.titleHi, entry.titleEn)}
      </Text>
      <View style={{ marginTop: 6, gap: 3 }}>
        {entry.rows.map((row) => (
          <Bullet key={row.id} text={meaningByLang(lang, row.textHi, row.textEn)} />
        ))}
      </View>
      {entry.avoidRows && entry.avoidRows.length > 0 ? (
        <View style={[styles.avoidBlock, { borderTopColor: colors.divider }]}>
          <Text style={{ color: colors.saffronDeep, fontFamily: titleFont, fontSize: 11, letterSpacing: 0.35, marginBottom: 5 }}>
            {contentByLang(lang, 'टालें', 'Avoid')}
          </Text>
          <View style={{ gap: 3 }}>
            {entry.avoidRows.map((row) => (
              <Bullet key={row.id} warning text={meaningByLang(lang, row.textHi, row.textEn)} />
            ))}
          </View>
        </View>
      ) : null}
      {entry.noteHi && entry.noteEn ? (
        <Text style={[styles.note, { color: colors.inkMuted, fontFamily: bodyFont, borderTopColor: colors.divider }]}>
          {meaningByLang(lang, entry.noteHi, entry.noteEn)}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  dishaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, justifyContent: 'center', marginTop: 12 },
  dishaChip: { borderWidth: 1, paddingHorizontal: 11, paddingVertical: 5 },
  card: { borderWidth: 1, paddingHorizontal: 14, paddingTop: 13, paddingBottom: 12, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 7 },
  avoidBlock: { borderTopWidth: 1, marginTop: 10, paddingTop: 10 },
  note: { borderTopWidth: 1, marginTop: 10, paddingTop: 9, fontSize: 12, lineHeight: 18 },
});
