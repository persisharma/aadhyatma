/**
 * उपकरण — the fixed tool row on Home (TRD-42 §5.2).
 *
 * Eight launcher tiles in a static order. The registry (`data/home/tools.ts`)
 * holds the data; this file holds only the routing, because each tool lands on
 * a different stack and the cross-tab helpers must carry `initial: false`.
 *
 * No NEW badge here, ever. The two tiles this row replaces (कुंडली, मुहूर्त)
 * hardcoded `hasNew: true` in HomeScreen and so wore a badge that could never
 * clear. Feature novelty is नया's job now, and it clears itself.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CategoryCard from '@/components/CategoryCard';
import CategoryIcon from '@/components/CategoryIcon';
import { HOME_TOOLS, type HomeToolId } from '@/data/home/tools';
import { moreTabTarget, panchangTabTarget } from '@/navigation/entryRoutes';
import { useTilePress } from '@/contexts/TilePressContext';
import type { HomeStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

export default function ToolsRow({ rowRef }: { rowRef?: React.Ref<View> } = {}) {
  const navigation = useNavigation<Nav>();
  // Sibling tabs live on the root navigator, so those jumps dispatch through
  // the parent — the same pattern TodayStrip and RoutineBanner use.
  const rootNav = useNavigation<any>();
  const { beginTilePress, finishTilePress, activateTile } = useTilePress();

  const open = React.useCallback(
    (id: HomeToolId) => () => {
      switch (id) {
        case 'vrat':
          return rootNav.navigate(
            'PanchangTab',
            panchangTabTarget('ObservanceList', { category: 'vrat' })
          );
        case 'muhurat':
          return rootNav.navigate('PanchangTab', panchangTabTarget('MuhuratFinder', undefined));
        case 'kundali':
          return rootNav.navigate(
            'PanchangTab',
            panchangTabTarget('PanchangHome', { initialTab: 'jyotish' })
          );
        case 'vidhi':
          // Registered on the Home stack too, so Back retraces the Home journey
          // instead of stranding the user on the Panchang calendar (types.ts).
          return navigation.navigate('VidhiCatalog');
        case 'japam':
          return navigation.navigate('CategoryList', { categoryId: 'japam' });
        case 'vastu':
          return rootNav.navigate('MoreTab', moreTabTarget('VastuDisha'));
        case 'theerth':
          return navigation.navigate('TheerthMap', {});
        case 'pitru':
          return rootNav.navigate('MoreTab', moreTabTarget('PitruSmaranList'));
      }
    },
    [navigation, rootNav]
  );

  return (
    <View ref={rowRef} collapsable={false} style={styles.grid}>
      {HOME_TOOLS.map((tool) => {
        const press = open(tool.id);
        return (
          <View key={tool.id} style={styles.cell}>
            <CategoryCard
              nameHi={tool.nameHi}
              nameEn={tool.nameEn}
              displayNameEn={tool.shortNameEn}
              status="active"
              icon={<CategoryIcon iconKey={tool.iconKey} />}
              onPress={() => activateTile(press)}
              onPressIn={() => beginTilePress(press)}
              onPressOut={finishTilePress}
              variant="launcher"
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  // Four across: (100% − 3 gaps) / 4. basis keeps the row stable when a label
  // wraps on a large font scale.
  cell: { flexBasis: '22%', flexGrow: 1, minWidth: 0 },
});
