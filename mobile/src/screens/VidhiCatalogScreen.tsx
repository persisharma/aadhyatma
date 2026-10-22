import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/spacing';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { orderTitlesByLanguage } from '@/utils/titleByLanguage';
import { VIDHI_ENTRIES, type VidhiEntry } from '@/data/vidhi';
import { isRecurringVidhi } from '@/data/vidhi/recurrence';
import ReaderHeader from '@/components/ReaderHeader';
import ListCard, { CARD_TITLE_SIZES, CardRoutineTail, CardThumb, CardTitles } from '@/components/ListCard';
import DeityIcon from '@/components/DeityIcon';
import StoryIcon from '@/components/StoryIcon';
import { deityIconKeyFor } from '@/data/deities';
import ShareButton from '@/components/ShareButton';
import { useShare } from '@/utils/shareVerse';
import { buildListingShare } from '@/utils/listingShare';
import type { VidhiStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<VidhiStackParamList, 'VidhiCatalog'>;

/**
 * पूजा विधियाँ — the vidhi catalog (PRD-19, design.md §61). Each row is the
 * shared regular `ListCard` (design.md §8): painted deity thumb, hi-name /
 * latin-italic / step-count meta. Recurring (monthly) vidhis carry the ＋ ›
 * add-to-routine tail, the same rule as the detail screen's header button.
 */
export default function VidhiCatalogScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { lang } = useGitaLanguage();
  const { share, busy: shareBusy } = useShare();

  return (
    <View style={[styles.root, { backgroundColor: colors.parchment }]}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ReaderHeader
          variant="index"
          title={contentByLang(lang, 'पूजा विधियाँ', 'Puja Vidhis')}
          onBack={() => navigation.goBack()}
          sideWidth={60}
          right={<ShareButton busy={shareBusy} accessibilityLabel="Share puja vidhi listing" accessibilityHint="Share the complete list as post, Story, or Reel cards" onPress={() => void share(buildListingShare({
            sourceId: 'vidhi-catalog', titleHi: 'पूजा विधियाँ', titleEn: 'Puja Vidhis', background: null,
            items: VIDHI_ENTRIES.map((entry) => ({
              titleHi: entry.titleHi, titleEn: entry.titleEn,
              detailHi: `${entry.steps.length} चरण · लगभग ${entry.durationHintMin} मिनट`,
              detailEn: `${entry.steps.length} steps · About ${entry.durationHintMin} min`,
            })),
          }), lang)} />}
        />
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.screenGutter }]}
          showsVerticalScrollIndicator={false}
        >
          {VIDHI_ENTRIES.map((entry) => (
            <VidhiCard
              key={entry.id}
              entry={entry}
              onPress={() => navigation.navigate('VidhiDetail', { vidhiId: entry.id })}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function VidhiCard({ entry, onPress }: { entry: VidhiEntry; onPress: () => void }) {
  const { lang } = useGitaLanguage();
  const { primary, secondary } = orderTitlesByLanguage(lang, entry.titleHi, entry.titleEn, CARD_TITLE_SIZES);
  const iconKey = entry.deities.map(deityIconKeyFor).find(Boolean);
  const hasKatha = entry.steps.some((step) => step.ref?.kind === 'katha');
  const sub = contentByLang(
    lang,
    `${entry.steps.length} चरण · लगभग ${entry.durationHintMin} मिनट${hasKatha ? ' · कथा सहित' : ''}`,
    `${entry.steps.length} steps · About ${entry.durationHintMin} min${hasKatha ? ' · with katha' : ''}`
  );

  return (
    <ListCard
      onPress={onPress}
      testID={`vidhi-card-${entry.id}`}
      accessibilityLabel={contentByLang(
        lang,
        `${entry.titleHi}। ${entry.steps.length} चरण। खोलने के लिए टैप करें।`,
        `${entry.titleEn}. ${entry.steps.length} steps. Tap to open.`
      )}
      leading={
        <CardThumb>
          {/* The first tagged deity's painted art; the Puja Vidhi art for an untagged vidhi. */}
          {iconKey
            ? <DeityIcon iconKey={iconKey} />
            : <StoryIcon name="vrat" size={36} />}
        </CardThumb>
      }
      right={isRecurringVidhi(entry) ? <CardRoutineTail sourceId={entry.id} nameEn={entry.titleEn} /> : undefined}
    >
      <CardTitles primary={primary} secondary={secondary} meta={sub} />
    </ListCard>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingTop: 4, paddingBottom: 32 },
});
