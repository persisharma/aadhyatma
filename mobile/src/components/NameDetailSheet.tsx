import React, { useEffect, useState } from 'react';
import { Clipboard, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { NameRecord } from '@/data/namkaran/types';
import type { Lang } from '@/data/gita/language';
import { getDeityMeta } from '@/data/deities';
import { NAKSHATRA_NAMES_EN, NAKSHATRA_NAMES_HI } from '@/panchang/names';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';

export default function NameDetailSheet({
  name,
  lang,
  shortlisted,
  onToggle,
  onClose,
  onOpenDeity,
}: {
  name: NameRecord | null;
  lang: Lang;
  shortlisted: boolean;
  onToggle: () => void;
  onClose: () => void;
  onOpenDeity?: (deityId: NonNullable<NameRecord['deityId']>) => void;
}) {
  const { colors, radii, elevation, typography } = useTheme();
  const [copied, setCopied] = useState(false);
  useEffect(() => setCopied(false), [name?.id]);
  if (!name) return null;
  const charana = name.charanas[0];
  const nakshatraIndex = Math.floor(charana / 4);
  const deity = name.deityId ? getDeityMeta(name.deityId) : null;
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose} accessibilityViewIsModal>
      <View style={[styles.backdrop, { backgroundColor: colors.modalBackdrop }]}>
        <SafeAreaView edges={['bottom']} style={[styles.sheet, { backgroundColor: colors.parchment, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg }, elevation.raised]}>
          <View style={[styles.header, { borderBottomColor: colors.divider }]}>
            <Text style={{ flex: 1, color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 20 }}>{contentByLang(lang, 'नाम का अर्थ', 'Name meaning')}</Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close name details" style={[styles.close, { backgroundColor: colors.saffronTint, borderRadius: radii.pill }]}><Text style={{ color: colors.saffronDeep, fontSize: 20 }}>×</Text></Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.content}>
            <Text accessibilityRole="header" style={{ color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 34, lineHeight: 48 }}>{name.hi}</Text>
            <Text style={[styles.latin, { color: colors.inkMuted }]}>{name.latin}</Text>
            <Text style={{ color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, lineHeight: 18 }}>
              {name.hi.slice(0, 1)} · {contentByLang(lang, NAKSHATRA_NAMES_HI[nakshatraIndex], NAKSHATRA_NAMES_EN[nakshatraIndex])} · {contentByLang(lang, `पद ${(charana % 4) + 1}`, `Pada ${(charana % 4) + 1}`)} · {contentByLang(lang, name.gender === 'boy' ? 'बालक' : name.gender === 'girl' ? 'बालिका' : 'सभी', name.gender === 'boy' ? 'Boy' : name.gender === 'girl' ? 'Girl' : 'All')}
            </Text>
            <View style={[styles.meaning, { borderColor: colors.divider, borderRadius: radii.md }]}>
              <Text style={[styles.label, { color: colors.saffronDeep }]}>{contentByLang(lang, 'अर्थ', 'MEANING')}</Text>
              <Text style={{ color: colors.ink, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 15, lineHeight: 23 }}>{name.meaningHi}</Text>
              <Text style={{ color: colors.inkMuted, fontFamily: fontFamilies.latinItalic, fontSize: 13, lineHeight: 20 }}>{name.meaningEn}</Text>
              {name.root ? <Text style={{ color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, lineHeight: 18 }}>{contentByLang(lang, 'मूल', 'Root')}: {name.root}</Text> : null}
            </View>
            {deity && name.deityId && onOpenDeity ? (
              <Pressable onPress={() => onOpenDeity(name.deityId!)} accessibilityRole="button" accessibilityLabel={`Open ${deity.nameEn} in Deity Index`} style={[styles.secondary, { borderColor: colors.divider, borderRadius: radii.pill }]}>
                <Text style={[styles.actionText, { color: colors.saffronDeep }]}>{contentByLang(lang, `${deity.nameHi} के पाठ देखें`, `Explore ${deity.nameEn}`)}</Text>
              </Pressable>
            ) : null}
            <View style={styles.actions}>
              <Pressable onPress={() => { Clipboard.setString(name.hi); setCopied(true); }} accessibilityRole="button" accessibilityLabel={`Copy ${name.latin} name`} style={[styles.secondary, { flex: 1, borderColor: colors.divider, borderRadius: radii.pill }]}>
                <Text style={[styles.actionText, { color: colors.saffronDeep }]}>{contentByLang(lang, copied ? 'नाम कॉपी हो गया' : 'नाम कॉपी करें', copied ? 'Name copied' : 'Copy name')}</Text>
              </Pressable>
              <Pressable onPress={onToggle} accessibilityRole="button" accessibilityState={{ selected: shortlisted }} accessibilityLabel={`${shortlisted ? 'Remove' : 'Add'} ${name.latin} ${shortlisted ? 'from' : 'to'} shortlist`} style={[styles.primary, { flex: 1, backgroundColor: colors.saffronDeep, borderRadius: radii.pill }]}>
                <Text style={[styles.actionText, { color: colors.onPrimary }]}>{contentByLang(lang, shortlisted ? 'हटाएँ' : '★ शॉर्टलिस्ट', shortlisted ? 'Remove' : '★ Shortlist')}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: { maxHeight: '80%' },
  header: { minHeight: 58, borderBottomWidth: StyleSheet.hairlineWidth, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center' },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 22, gap: 12 },
  latin: { fontFamily: fontFamilies.latinSemiBoldItalic, fontSize: 18 },
  label: { fontFamily: fontFamilies.interSemiBold, fontSize: 10, letterSpacing: 1.2 },
  meaning: { borderWidth: 1, padding: 14, gap: 8 },
  primary: { minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  secondary: { minHeight: 48, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  actions: { flexDirection: 'row', gap: 10 },
  actionText: { fontFamily: fontFamilies.interSemiBold, fontSize: 13 },
});
