import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { View } from 'react-native';
import TodayRecommendationsRow from '@/components/TodayRecommendationsRow';

const mockNavigate = jest.fn();
const renderedFeatureCardProps: Array<{
  item: { key: string; titleEn: string; descEn: string };
  width: number;
}> = [];
const recommendations = [
  {
    id: 'vishnu-sahasranama',
    nameHi: 'विष्णु सहस्रनाम अंश',
    nameEn: 'Vishnu Sahasranama Excerpt',
    sub: '4 sections',
    subEn: '4 sections',
    thumb: 'वि',
    category: 'stotram',
    status: 'active',
    hidden: false,
  },
  {
    id: 'vishnu-chalisa',
    nameHi: 'विष्णु चालीसा',
    nameEn: 'Vishnu Chalisa',
    sub: '40 Chaupai + 1 Doha',
    subEn: '40 Chaupai + 1 Doha',
    thumb: 'वि',
    category: 'chalisa',
    status: 'active',
    hidden: false,
  },
];

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));
jest.mock('@/data/gita/language', () => ({
  useGitaLanguage: () => ({ lang: 'en' }),
}));
jest.mock('@/utils/useTodayKey', () => ({
  useTodayKey: () => '2026-07-23',
}));
jest.mock('@/data/discoveryMeta', () => ({
  getTodayRecommendationsForDate: () => recommendations,
}));
jest.mock('@/components/FeatureCard', () => {
  const React = require('react');
  const { View } = require('react-native');
  return function MockFeatureCard(props: {
    item: { key: string; titleEn: string; descEn: string };
    width: number;
  }) {
    renderedFeatureCardProps.push(props);
    return React.createElement(View, {
      accessibilityLabel: `recommendation-${props.item.key}`,
      style: { width: props.width, minHeight: 112 },
    });
  };
});

describe('TodayRecommendationsRow', () => {
  beforeEach(() => {
    renderedFeatureCardProps.length = 0;
  });

  test('renders homepage recommendations with the Discover card shell', () => {
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(<TodayRecommendationsRow />);
    });

    const cards = tree.root
      .findAllByType(View)
      .filter((node) => node.props.accessibilityLabel?.startsWith('recommendation-'));
    expect(cards).toHaveLength(2);
    expect(renderedFeatureCardProps.map((props) => props.width)).toEqual([292, 292]);
    expect(renderedFeatureCardProps.map((props) => props.item.titleEn)).toEqual([
      'Vishnu Sahasranama Excerpt',
      'Vishnu Chalisa',
    ]);
    expect(renderedFeatureCardProps.every((props) => props.item.descEn === 'Recommended for today')).toBe(true);
  });
});
