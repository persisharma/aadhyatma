import React from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { ListingCardFrame } from '@/components/ListingCard';
import AppIcon from '@/components/AppIcon';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { titleFontByLang, meaningToken } from '@/utils/langType';
import type { SanatanTopic } from '@/data/sanatan-parichay';
import { Painting, useSanatanText } from './Primitives';

/** The app's shared painted card shell, with the approved landscape art slot. */
export default function CollectionCard({ topic, variant = 'row', onPress, testID }: {
  topic: SanatanTopic; variant?: 'row' | 'feature' | 'discovery'; onPress: () => void; testID?: string;
}) {
  const t = useSanatanText();
  const { colors, typography, radii, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const row = variant === 'row';
  const title = { fontFamily: titleFontByLang(lang), color: colors.ink, fontSize: row ? typography.listingTitle.fontSize : variant === 'feature' ? 24 : 17,
    lineHeight: row ? typography.listingTitle.lineHeight : variant === 'feature' ? 40 : 29 };
  const meta = { ...meaningToken(lang, typography), fontSize: 13, lineHeight: 22, color: colors.inkMuted };
  return <ListingCardFrame testID={testID} onPress={onPress} accessibilityLabel={t(row ? topic.name : topic.question)}
    style={{ borderRadius: radii.lg, overflow: 'hidden', flexGrow: 1 }}
    contentStyle={row ? { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 13, minHeight: 94 } : undefined}>
    {row ? <>
      <Painting id={topic.id} small />
      <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
        <Text style={title}>{t(topic.name)}</Text><Text style={meta}>{t(topic.title)}</Text>
      </View>
      <AppIcon name="next" size={18} color={colors.saffronDeep} />
    </> : <>
      <Painting id={topic.id} />
      <View style={{ padding: variant === 'feature' ? spacing.lg : 13, gap: 7, flexGrow: 1 }}>
        <Text style={{ ...meta, fontSize: 12, color: colors.saffronDeep }}>{t(topic.name)}</Text>
        <Text style={title}>{t(topic.question)}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 'auto', paddingTop: 9 }}>
          <Text style={{ ...meta, flex: 1 }}>{t(variant === 'feature' ? ['मंगल के इस चिह्न को समझें','Discover this auspicious sign'] : ['जानें','Explore'])}</Text>
          <View style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.saffronTint }}>
            <AppIcon name="next" size={18} color={colors.saffronDeep} />
          </View>
        </View>
      </View>
    </>}
  </ListingCardFrame>;
}

export function DiscoveryPair({ topics, onOpen }: { topics: readonly SanatanTopic[]; onOpen: (id: string) => void }) {
  const { width, fontScale } = useWindowDimensions();
  const stack = width < 340 || fontScale > 1.3;
  return <View style={{ flexDirection: stack ? 'column' : 'row', gap: 12, alignItems: 'stretch' }}>
    {topics.map(topic => <View key={topic.id} style={{ flex: stack ? undefined : 1, minWidth: 0 }}>
      <CollectionCard topic={topic} variant="discovery" onPress={() => onOpen(topic.id)} />
    </View>)}
  </View>;
}
