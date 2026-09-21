import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { Lang } from '@/data/gita/language';
import {
  READING_TONE_LABELS, type DetailedRashifal, type LifeAreaId, type ReadingText,
} from '@/panchang/rashifalReading';
import { useTheme } from '@/theme/ThemeContext';
import { meaningToken, pillTextStyle, titleFontByLang } from '@/utils/langType';
import { contentByLang, meaningByLang } from '@/utils/localize';

export default function RashifalLifeAreas({ reading, lang }: { reading: DetailedRashifal; lang: Lang }) {
  const { colors, typography, spacing, radii } = useTheme();
  const [open, setOpen] = useState<LifeAreaId | null>('relationships');
  const [basis, setBasis] = useState<LifeAreaId | null>(null);
  const label = (text: ReadingText) => contentByLang(lang, text.hi, text.en);
  const prose = (text: ReadingText) => meaningByLang(lang, text.hi, text.en);
  const bodyStyle = { ...meaningToken(lang, typography), color: colors.ink };
  const labelStyle = { ...pillTextStyle(lang, typography.sectionLabel), color: colors.inkSoft };
  return (
    <View>
      <Text style={{ ...labelStyle, marginTop: spacing.xl, marginBottom: spacing.sm }}>
        {contentByLang(lang, 'जीवन के अलग-अलग पहलू', 'Your day in detail')}
      </Text>
      <View style={{ borderWidth: 1, borderColor: colors.divider, borderRadius: radii.lg, backgroundColor: colors.parchmentSoft, overflow: 'hidden' }}>
        {reading.areas.map((area, index) => {
          const expanded = open === area.id;
          const showBasis = basis === area.id;
          return (
            <View key={area.id} style={{ borderBottomWidth: index < reading.areas.length - 1 ? 1 : 0, borderBottomColor: colors.divider }}>
              <Pressable
                testID={`rashifal-area-${area.id}`}
                accessibilityRole="button"
                accessibilityLabel={`${area.title.en} guidance`}
                accessibilityState={{ expanded }}
                onPress={() => { setOpen(expanded ? null : area.id); setBasis(null); }}
                style={{ minHeight: 44, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: titleFontByLang(lang), fontSize: typography.cardHindi.fontSize, color: colors.ink }}>{label(area.title)}</Text>
                  <Text style={{ ...labelStyle, color: colors.inkMuted, marginTop: spacing.xs }}>{label(READING_TONE_LABELS[area.tone])}</Text>
                </View>
                <Text style={{ color: colors.saffronDeep, fontSize: typography.cardHindi.fontSize }}>{expanded ? '−' : '+'}</Text>
              </Pressable>
              {expanded && (
                <View testID={`rashifal-body-${area.id}`} style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: spacing.md }}>
                  <Text style={bodyStyle}>{prose(area.body)}</Text>
                  <View style={{ borderLeftWidth: spacing.xs, borderLeftColor: colors.gold, padding: spacing.md, backgroundColor: colors.goldTint }}>
                    <Text style={labelStyle}>{contentByLang(lang, 'आज का छोटा कदम', 'A small step')}</Text>
                    <Text style={bodyStyle}>{prose(area.step)}</Text>
                  </View>
                  {area.personalNote && <Text testID={`rashifal-personal-${area.id}`} style={{ ...bodyStyle, color: colors.inkSoft }}>{prose(area.personalNote)}</Text>}
                  <Pressable
                    testID={`rashifal-basis-${area.id}`}
                    accessibilityRole="button"
                    accessibilityLabel={`Basis for ${area.title.en}`}
                    accessibilityState={{ expanded: showBasis }}
                    onPress={() => setBasis(showBasis ? null : area.id)}
                    style={{ minHeight: 44, justifyContent: 'center' }}
                  >
                    <Text style={{ ...labelStyle, color: colors.saffronDeep }}>{contentByLang(lang, 'इस मार्गदर्शन का आधार', 'Why this guidance?')} {showBasis ? '−' : '+'}</Text>
                  </Pressable>
                  {showBasis && (
                    <View style={{ gap: spacing.md }}>
                      <Text style={{ ...bodyStyle, color: colors.inkSoft }}>{meaningByLang(lang,
                        'भाव के विषय और ग्रह के पारम्परिक संबंध से संकेत चुने गए हैं। सहज और धैर्य के संकेत साथ हों तो संतुलित ध्यान सुझाया जाता है।',
                        'Signals are grouped by house themes and traditional planetary associations. When support and patience cues occur together, the reading suggests balanced attention.')}</Text>
                      {area.evidence.map((item) => <Text key={item.graha} style={bodyStyle}>{prose(item.description)}</Text>)}
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
