import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { meaningToken, titleFontByLang } from '@/utils/langType';
import { contentByLang, pick } from '@/utils/localize';
import type { Lang } from '@/data/gita/language';
import { suvicharDeities, type SuvicharDeity } from '@/data/suvichar';
import { suvicharSourceLabel, suvicharThoughtsFor, type SuvicharThought } from '@/data/suvicharContent';

type Props = { visible: boolean; deity: SuvicharDeity; lang: Lang; selectedId?: string; onClose: () => void; onSelect: (thought: SuvicharThought) => void };
/** All reviewed messages for the selected deity, without mounting hundreds of artwork subscriptions. */
export default function SuvicharThoughtPicker({ visible, deity, lang, selectedId, onClose, onSelect }: Props) {
  const { colors, spacing, radii, typography } = useTheme();
  const [query, setQuery] = useState('');
  const pool = suvicharThoughtsFor(deity), subject = suvicharDeities.find(d => d.id === deity)!;
  const rows = useMemo(() => { const q = query.trim().toLocaleLowerCase(); return pool.filter(t => !q || [t.hi, t.en, t.categoryHi, t.id, suvicharSourceLabel(t, lang)].join(' ').toLocaleLowerCase().includes(q)); }, [pool, query, lang]);
  const face = titleFontByLang(lang);
  return <Modal visible={visible} animationType="slide" onRequestClose={onClose} onShow={() => setQuery('')}>
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.parchment }}>
      <View style={{ padding: spacing.lg, gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: face, color: colors.ink, fontSize: 22, flex: 1 }}>{contentByLang(lang, subject.hi, subject.en)} · {pool.length}</Text>
          <Pressable testID="suvichar-thoughts-close" accessibilityRole="button" onPress={onClose} style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.md }}>
            <Text style={{ fontFamily: face, color: colors.saffronDeep }}>{pick(lang, { hi: 'बंद करें', en: 'Close', gu: 'બંધ કરો', kn: 'ಮುಚ್ಚಿ' })}</Text>
          </Pressable>
        </View>
        <TextInput testID="suvichar-thought-search" accessibilityLabel={pick(lang, { hi: 'सुविचार खोजें', en: 'Search thoughts', gu: 'સુવિચાર શોધો', kn: 'ಸುವಿಚಾರ ಹುಡುಕಿ' })} value={query} onChangeText={setQuery} placeholder={pick(lang, { hi: 'संदेश या संदर्भ खोजें', en: 'Search messages or references', gu: 'સંદેશ અથવા સંદર્ભ શોધો', kn: 'ಸಂದೇಶ ಅಥವಾ ಉಲ್ಲೇಖ ಹುಡುಕಿ' })} placeholderTextColor={colors.inkMuted}
          style={{ fontFamily: face, color: colors.ink, padding: spacing.md, borderRadius: radii.md, borderWidth: 1, borderColor: colors.divider }} />
      </View>
      <FlatList testID="suvichar-thought-list" data={rows} keyExtractor={t => t.id} initialNumToRender={8} maxToRenderPerBatch={8} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.sm }}
        ListEmptyComponent={<Text style={{ color: colors.inkMuted, padding: spacing.md }}>{pick(lang, { hi: 'कोई संदेश नहीं मिला', en: 'No matching messages', gu: 'કોઈ સંદેશ મળ્યો નથી', kn: 'ಹೊಂದುವ ಸಂದೇಶಗಳಿಲ್ಲ' })}</Text>}
        renderItem={({ item }) => <Pressable testID={`suvichar-thought-${item.id}`} accessibilityRole="button" accessibilityState={{ selected: selectedId === item.id }} onPress={() => { onSelect(item); onClose(); }}
          style={{ padding: spacing.md, gap: spacing.sm, borderRadius: radii.md, borderWidth: 1, borderColor: selectedId === item.id ? colors.saffron : colors.divider, backgroundColor: colors.parchmentSoft }}>
          <Text style={{ ...meaningToken(lang, typography), color: colors.ink }}>{contentByLang(lang, item.hi, item.en)}</Text>
          <Text style={{ fontFamily: face, fontSize: 12, lineHeight: 20, color: colors.inkMuted }}>{suvicharSourceLabel(item, lang)}</Text>
        </Pressable>} />
    </SafeAreaView>
  </Modal>;
}
