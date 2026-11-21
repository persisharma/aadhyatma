import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { GitaStyleChapters } from './GitaChaptersIndexScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'BhagavatamChapters'>;

export default function BhagavatamChaptersScreen({ navigation }: Props) {
  return <GitaStyleChapters isBhagavatam onBack={() => navigation.goBack()}
    onOpenChapter={params => navigation.navigate('BhagavatamReader', params)} />;
}
