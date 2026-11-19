import React from 'react';
import ListCard, { CARD_TITLE_SIZES, CardThumb, CardTitles } from './ListCard';
import DeityIcon from './DeityIcon';
import { deityIconKey } from '@/data/deities';
import { readingLinks } from '@/data/readingLinks';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { orderTitlesByLanguage } from '@/utils/titleByLanguage';

export default function ReadingLinks({ onOpen }: { onOpen: (id: string) => void }) {
  const { lang } = useGitaLanguage();

  return (
    <>
      {readingLinks.map((link) => {
        const { primary, secondary } = orderTitlesByLanguage(lang, link.titleHi, link.titleEn, CARD_TITLE_SIZES);
        return (
          <ListCard
            key={link.id}
            testID={`reading-link-${link.id}`}
            accessibilityLabel={`${link.titleEn}. ${link.detailEn}. Tap to open.`}
            leading={<CardThumb><DeityIcon iconKey={deityIconKey(link.deity)} /></CardThumb>}
            onPress={() => onOpen(link.id)}
          >
            <CardTitles primary={primary} secondary={secondary} meta={contentByLang(lang, link.detailHi, link.detailEn)} />
          </ListCard>
        );
      })}
    </>
  );
}
