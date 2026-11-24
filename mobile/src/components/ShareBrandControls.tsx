import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import type { Lang } from '@/data/gita/language';
import { pick } from '@/utils/localize';
import { cardFontByLang, eyebrowTextStyle } from '@/utils/langType';
import AppIcon from './AppIcon';
import TextField from './TextField';
import {
  BRAND_CONTACT_LIMIT,
  BRAND_NAME_LIMIT,
  BRAND_TITLE_LIMIT,
  cleanBrandText,
  resolveShareBrand,
} from '@/data/shareBrand';
import { updateShareBrand, useShareBrand } from '@/utils/shareBrandStore';

/**
 * "मेरी ब्रांडिंग" in the Panchang share sheet (design.md §33a *Co-branding*): one switch,
 * off by default, and a profile typed once and remembered — name (needed to switch on),
 * title and contact (optional). The card's renderer reads the same saved profile, so the
 * preview above updates as the person types and saves.
 */
export default function ShareBrandControls({ lang, busy }: { lang: Lang; busy: boolean }) {
  const { colors, spacing, radii } = useTheme();
  const { brand, hydrated } = useShareBrand();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: '', title: '', contact: '' });
  const off = busy || !hydrated;
  const resolved = resolveShareBrand(brand);
  const titleFont = cardFontByLang(lang);
  const sub = [eyebrowTextStyle(lang, 12), { color: colors.inkMuted }];
  const label = [eyebrowTextStyle(lang, 12), { color: colors.saffronDeep }];

  const startEditing = () => {
    setDraft({ name: brand.name, title: brand.title, contact: brand.contact });
    setEditing(true);
  };
  const onToggle = (on: boolean) => {
    // Nothing to print yet: switching on opens the profile instead.
    if (on && !cleanBrandText(brand.name)) return startEditing();
    void updateShareBrand({ on });
  };
  const save = () => {
    const hasName = cleanBrandText(draft.name) !== '';
    void updateShareBrand({ ...draft, on: hasName });
    setEditing(false);
  };

  const field = (key: keyof typeof draft, title: string, limit: number, testID: string, extra?: Partial<React.ComponentProps<typeof TextField>>) => (
    <View style={{ gap: 4 }}>
      <Text style={label}>{title}</Text>
      <TextField
        testID={testID}
        variant="form"
        value={draft[key]}
        maxLength={limit}
        editable={!off}
        accessibilityLabel={title}
        onChangeText={(value) => setDraft((d) => ({ ...d, [key]: value }))}
        returnKeyType="done"
        {...extra}
      />
    </View>
  );

  return (
    <View
      testID="share-brand-controls"
      style={[styles.box, { gap: spacing.sm, padding: spacing.md, borderRadius: radii.md, borderColor: colors.cardActiveBorder, backgroundColor: colors.saffronTint }]}
    >
      <View style={styles.head}>
        <View style={styles.headText}>
          <Text style={{ fontFamily: titleFont, fontSize: 17, color: colors.ink }}>
            {pick(lang, { hi: 'मेरी ब्रांडिंग', en: 'My branding', gu: 'મારું બ્રાન્ડિંગ', kn: 'ನನ್ನ ಬ್ರ್ಯಾಂಡಿಂಗ್', mr: 'माझे ब्रँडिंग', te: 'నా బ్రాండింగ్' })}
          </Text>
          <Text style={sub}>
            {pick(lang, {
              hi: 'कार्ड पर आपका नाम, उपाधि और संपर्क',
              en: 'Your name, title and contact on the card',
              gu: 'કાર્ડ પર તમારું નામ, ઉપાધિ અને સંપર્ક',
              kn: 'ಕಾರ್ಡ್‌ನಲ್ಲಿ ನಿಮ್ಮ ಹೆಸರು, ಬಿರುದು ಮತ್ತು ಸಂಪರ್ಕ',
              mr: 'कार्डवर तुमचे नाव, उपाधी आणि संपर्क',
              te: 'కార్డుపై మీ పేరు, బిరుదు, సంప్రదింపు',
            })}
          </Text>
        </View>
        <Switch
          testID="share-brand-toggle"
          value={brand.on}
          onValueChange={onToggle}
          disabled={off}
          trackColor={{ true: colors.saffron, false: colors.divider }}
          thumbColor={colors.onPrimary}
          ios_backgroundColor={colors.divider}
          accessibilityLabel={pick(lang, { hi: 'कार्ड पर मेरी ब्रांडिंग', en: 'My branding on the card', gu: 'કાર્ડ પર મારું બ્રાન્ડિંગ', kn: 'ಕಾರ್ಡ್‌ನಲ್ಲಿ ನನ್ನ ಬ್ರ್ಯಾಂಡಿಂಗ್', mr: 'कार्डवर माझे ब्रँडिंग', te: 'కార్డుపై నా బ్రాండింగ్' })}
        />
      </View>

      {editing ? (
        <View style={{ gap: spacing.sm }}>
          {field('name', pick(lang, { hi: 'नाम (ज़रूरी)', en: 'Name (required)', gu: 'નામ (જરૂરી)', kn: 'ಹೆಸರು (ಅಗತ್ಯ)', mr: 'नाव (आवश्यक)', te: 'పేరు (తప్పనిసరి)' }), BRAND_NAME_LIMIT, 'share-brand-name', { autoFocus: !draft.name })}
          {field('title', pick(lang, { hi: 'उपाधि (वैकल्पिक) — जैसे ज्योतिषाचार्य', en: 'Title (optional) — e.g. Jyotishacharya', gu: 'ઉપાધિ (વૈકલ્પિક)', kn: 'ಬಿರುದು (ಐಚ್ಛಿಕ)', mr: 'उपाधी (ऐच्छिक)', te: 'బిరుదు (ఐచ్ఛికం)' }), BRAND_TITLE_LIMIT, 'share-brand-title')}
          {field('contact', pick(lang, { hi: 'संपर्क (वैकल्पिक)', en: 'Contact (optional)', gu: 'સંપર્ક (વૈકલ્પિક)', kn: 'ಸಂಪರ್ಕ (ಐಚ್ಛಿಕ)', mr: 'संपर्क (ऐच्छिक)', te: 'సంప్రదింపు (ఐచ్ఛికం)' }), BRAND_CONTACT_LIMIT, 'share-brand-contact')}
          <Text style={sub}>
            {pick(lang, {
              hi: 'संपर्क आगे भेजे गए हर कार्ड पर दिखेगा। सिर्फ़ कार्ड पर छपेगा — कैप्शन या हैशटैग में नहीं।',
              en: 'Your contact shows on every forwarded card. It prints on the card only — never in the caption or hashtags.',
              gu: 'સંપર્ક આગળ મોકલાયેલા દરેક કાર્ડ પર દેખાશે. ફક્ત કાર્ડ પર છપાશે — કૅપ્શન કે હૅશટૅગમાં નહીં.',
              kn: 'ಸಂಪರ್ಕವು ಮುಂದೆ ಕಳುಹಿಸಿದ ಪ್ರತಿ ಕಾರ್ಡ್‌ನಲ್ಲೂ ಕಾಣುತ್ತದೆ. ಕಾರ್ಡ್‌ನಲ್ಲಿ ಮಾತ್ರ — ಶೀರ್ಷಿಕೆ ಅಥವಾ ಹ್ಯಾಶ್‌ಟ್ಯಾಗ್‌ನಲ್ಲಿ ಅಲ್ಲ.',
              mr: 'संपर्क पुढे पाठवलेल्या प्रत्येक कार्डवर दिसेल. फक्त कार्डवर छापला जाईल — कॅप्शन किंवा हॅशटॅगमध्ये नाही.',
              te: 'సంప్రదింపు వివరాలు ముందుకు పంపిన ప్రతి కార్డుపై కనిపిస్తాయి. కార్డుపై మాత్రమే — క్యాప్షన్ లేదా హ్యాష్‌ట్యాగ్‌లలో కాదు.',
            })}
          </Text>
          <View style={[styles.actions, { gap: spacing.sm }]}>
            <Pressable
              testID="share-brand-cancel"
              accessibilityRole="button"
              onPress={() => setEditing(false)}
              disabled={off}
              style={({ pressed }) => [styles.action, { borderRadius: radii.pill, borderColor: colors.divider }, pressed && { opacity: 0.7 }]}
            >
              <Text style={[eyebrowTextStyle(lang, 14), { color: colors.inkMuted }]}>
                {pick(lang, { hi: 'रद्द करें', en: 'Cancel', gu: 'રદ કરો', kn: 'ರದ್ದುಮಾಡಿ', mr: 'रद्द करा', te: 'రద్దు చేయండి' })}
              </Text>
            </Pressable>
            <Pressable
              testID="share-brand-save"
              accessibilityRole="button"
              onPress={save}
              disabled={off}
              style={({ pressed }) => [styles.action, { borderRadius: radii.pill, borderColor: colors.saffron, backgroundColor: colors.saffron }, (pressed || off) && { opacity: 0.7 }]}
            >
              <Text style={[eyebrowTextStyle(lang, 14), { color: colors.onPrimary }]}>
                {pick(lang, { hi: 'सहेजें', en: 'Save', gu: 'સાચવો', kn: 'ಉಳಿಸಿ', mr: 'जतन करा', te: 'సేవ్ చేయండి' })}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : resolved ? (
        <Pressable
          testID="share-brand-summary"
          accessibilityRole="button"
          accessibilityLabel={pick(lang, { hi: 'ब्रांडिंग बदलें', en: 'Edit branding', gu: 'બ્રાન્ડિંગ બદલો', kn: 'ಬ್ರ್ಯಾಂಡಿಂಗ್ ಬದಲಿಸಿ', mr: 'ब्रँडिंग बदला', te: 'బ్రాండింగ్ మార్చండి' })}
          onPress={startEditing}
          disabled={off}
          style={({ pressed }) => [styles.summary, { gap: spacing.sm, borderTopColor: colors.divider }, pressed && { opacity: 0.7 }]}
        >
          <View style={styles.headText}>
            <Text style={{ fontFamily: titleFont, fontSize: 15, color: colors.ink }}>{resolved.name}</Text>
            {resolved.line ? <Text style={sub}>{resolved.line}</Text> : null}
          </View>
          <AppIcon name="edit" size={16} color={colors.saffronDeep} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderWidth: 1 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  headText: { flex: 1, minWidth: 0, gap: 2 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end' },
  action: { minHeight: 44, paddingHorizontal: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  summary: { flexDirection: 'row', alignItems: 'center', minHeight: 44, paddingTop: 8, borderTopWidth: 1 },
});
