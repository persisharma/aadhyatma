import React, { useEffect, useState } from 'react';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { suvicharArtRequest, suvicharHeroFraction } from '@/data/suvichar';
import type { SuvicharTemplate } from '@/data/suvicharTemplates';
import type { Lang } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { titleFontByLang } from '@/utils/langType';
import { subscribeBackgroundAsset } from '@/utils/backgroundAssetCache';

type Props = { templates: SuvicharTemplate[]; lang: Lang; selectedId?: string; disabled: boolean; onSelect: (template: SuvicharTemplate) => void;
  /** Deity-only picking (custom mode): hide the message excerpt and name tiles by deity. */
  compact?: boolean; testIDFor?: (template: SuvicharTemplate) => string };
const TILE_WIDTH = 156;
function PresetTile({ template, lang, selected, disabled, onSelect, compact, testID }: { template: SuvicharTemplate; lang: Lang; selected: boolean; disabled: boolean; onSelect: Props['onSelect']; compact?: boolean; testID: string }) {
  const { colors, spacing, radii, typography } = useTheme();
  const request = suvicharArtRequest(template.deity, template.frame);
  const [art, setArt] = useState<{ url: string; uri: string } | null>(null);
  useEffect(() => {
    if (!request) return;
    return subscribeBackgroundAsset(request, uri => setArt(uri ? { url: request.remoteUrl, uri } : null));
  }, [request?.remoteUrl]); // eslint-disable-line react-hooks/exhaustive-deps
  const uri = art?.url === request?.remoteUrl ? art?.uri : null;
  const title = contentByLang(lang, template.hi, template.en);
  const message = contentByLang(lang, template.messageHi, template.messageEn);
  return <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={compact ? title : `${title}. ${message}`}
    accessibilityState={{ selected, disabled }} disabled={disabled} onPress={() => onSelect(template)}
    style={{ width: TILE_WIDTH, borderRadius: radii.md, borderWidth: 2, borderColor: selected ? colors.saffron : colors.divider, backgroundColor: colors.parchmentSoft, overflow: 'hidden' }}>
    <View style={{ height: TILE_WIDTH * 1.25 * suvicharHeroFraction(template.deity, template.frame), overflow: 'hidden', backgroundColor: colors.parchmentSoft }}>
      {uri ? <Image accessible={false} source={{ uri }} style={{ width: TILE_WIDTH, height: TILE_WIDTH * 1.25 }} resizeMode="stretch" onError={() => setArt(null)} /> : null}
    </View>
    <View style={{ padding: spacing.sm, gap: spacing.xs }}>
      <Text style={{ color: colors.ink, fontFamily: titleFontByLang(lang), fontSize: typography.readerTitle.fontSize, lineHeight: typography.readerTitle.fontSize * 1.65 }}>{title}</Text>
      {compact ? null : <Text numberOfLines={2} style={{ color: colors.inkMuted, fontFamily: titleFontByLang(lang), fontSize: typography.listingEyebrow.fontSize, lineHeight: typography.listingEyebrow.lineHeight }}>{message}</Text>}
    </View>
  </Pressable>;
}

export default function SuvicharPresetPicker({ templates, lang, selectedId, disabled, onSelect, compact, testIDFor }: Props) {
  const { spacing } = useTheme();
  return <FlatList horizontal data={templates} extraData={[selectedId, disabled, lang, compact]} keyExtractor={item => item.id}
    showsHorizontalScrollIndicator={false} initialNumToRender={3} maxToRenderPerBatch={3} windowSize={3}
    contentContainerStyle={{ gap: spacing.sm }}
    renderItem={({ item }) => <PresetTile template={item} lang={lang} selected={item.id === selectedId} disabled={disabled} onSelect={onSelect} compact={compact}
      testID={testIDFor ? testIDFor(item) : `suvichar-preset-${item.id}`} />} />;
}
