import React from 'react';
import { Text, View } from 'react-native';
import ListingCard from './ListingCard';
import DeityIcon from './DeityIcon';
import { deityIconKey } from '@/data/deities';
import { readingLinks } from '@/data/readingLinks';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { useTheme } from '@/theme/ThemeContext';
import { scriptBodyFont } from '@/utils/langType';

export default function ReadingLinks({ onOpen }: { onOpen: (id: string) => void }) {
  const { lang } = useGitaLanguage();
  const { colors, typography } = useTheme();
  return <>{readingLinks.map((link) => <ListingCard key={link.id} testID={`reading-link-${link.id}`}
    language={lang} variant="observance" title={contentByLang(lang, link.titleHi, link.titleEn)}
    thumbnail={<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><DeityIcon iconKey={deityIconKey(link.deity)} size={64} /></View>}
    meta={<Text style={{ color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 13, lineHeight: 22 }}>{contentByLang(lang, link.detailHi, link.detailEn)}</Text>}
    onPress={() => onOpen(link.id)} />)}</>;
}
