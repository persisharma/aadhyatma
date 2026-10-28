import React, { useEffect, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { suvicharArtRequest, suvicharFrames, type SuvicharDeity, type SuvicharFrame } from '@/data/suvichar';
import type { Lang } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { titleFontByLang } from '@/utils/langType';
import { subscribeBackgroundAsset } from '@/utils/backgroundAssetCache';

type Props = { deity: SuvicharDeity; frame: SuvicharFrame; lang: Lang; disabled: boolean; onSelect: (frame: SuvicharFrame) => void };
/** One painted miniature per frame for the current deity, from the shared R2 cache. */
function FrameTile({ deity, id, label, lang, selected, disabled, onSelect }: { deity: SuvicharDeity; id: SuvicharFrame; label: string; lang: Lang; selected: boolean; disabled: boolean; onSelect: Props['onSelect'] }) {
  const { colors, spacing, radii } = useTheme();
  const request = suvicharArtRequest(deity, id);
  const [art, setArt] = useState<{ url: string; uri: string } | null>(null);
  useEffect(() => {
    if (!request) return;
    return subscribeBackgroundAsset(request, uri => setArt(uri ? { url: request.remoteUrl, uri } : null));
  }, [request?.remoteUrl]); // eslint-disable-line react-hooks/exhaustive-deps
  const uri = art?.url === request?.remoteUrl ? art?.uri : null;
  return <Pressable testID={`suvichar-frame-${id}`} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected, disabled }}
    disabled={disabled} onPress={() => onSelect(id)}
    style={({ pressed }) => ({ flex: 1, alignItems: 'center', gap: spacing.xs + 2, paddingVertical: spacing.sm, paddingHorizontal: spacing.xs, borderRadius: radii.md,
      borderWidth: 2, borderColor: selected ? colors.saffron : colors.divider, backgroundColor: colors.parchmentSoft, opacity: pressed ? 0.85 : 1 })}>
    <View style={{ width: 52, height: 65, borderRadius: 4, overflow: 'hidden', backgroundColor: colors.parchmentDeep }}>
      {deity === 'annapurna' ? <View style={{ margin: 5, flex: 1, borderWidth: 1, borderColor: colors.gold, borderRadius: id === 'pushp-aangan' ? 9 : id === 'mandir-jharokha' ? 4 : 0, justifyContent: 'center', gap: 4, padding: 5 }}>{[1,2,3].map(n => <View key={n} style={{ height: 2, backgroundColor: colors.gold }} />)}</View> : uri ? <Image accessible={false} source={{ uri }} resizeMode="stretch" style={{ width: 52, height: 65 }} onError={() => setArt(null)} /> : null}
    </View>
    <Text numberOfLines={1} style={{ fontFamily: titleFontByLang(lang), fontSize: 12, lineHeight: 20, color: selected ? colors.saffronDeep : colors.inkSoft }}>{label}</Text>
  </Pressable>;
}

export default function SuvicharFramePicker({ deity, frame, lang, disabled, onSelect }: Props) {
  const { spacing } = useTheme();
  return <View style={{ flexDirection: 'row', gap: spacing.sm + 2 }}>
    {suvicharFrames.map(f => <FrameTile key={f.id} deity={deity} id={f.id} label={contentByLang(lang, f.hi, f.en)} lang={lang}
      selected={frame === f.id} disabled={disabled} onSelect={onSelect} />)}
  </View>;
}
