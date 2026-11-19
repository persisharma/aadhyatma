import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import { GitaLanguageProvider } from '@/data/gita/language';
import { ShareProvider } from '@/utils/shareVerse';
import { getKathaLibrary } from '@/panchang/vratCatalog';
import { buildEntryStartTarget } from '@/navigation/entryRoutes';
import KathaLibraryScreen from '../KathaLibraryScreen';
import SaptashatiCoreScreen from '../SaptashatiCoreScreen';
import CategoryListScreen from '../CategoryListScreen';
import DeityDayLinks from '@/components/DeityDayLinks';
import LibraryCard from '@/components/LibraryCard';
import ListingCard from '@/components/ListingCard';
const mockNavigate=jest.fn();
const mockNavigation={navigate:mockNavigate,goBack:jest.fn(),getState:()=>({routeNames:['VratKathaReader']})};
jest.mock('@react-navigation/native',()=>({useNavigation:()=>mockNavigation}));
jest.mock('@/utils/useTodayKey',()=>({useTodayKey:()=> '2026-11-16'}));
jest.mock('expo-haptics',()=>({ImpactFeedbackStyle:{Light:'Light'},impactAsync:jest.fn()}));
jest.mock('@react-native-async-storage/async-storage',()=>({getItem:jest.fn(async()=>null),setItem:jest.fn(async()=>{})}));
let tree:TestRenderer.ReactTestRenderer;
async function mount(child:React.ReactElement){
 await act(async()=>{tree=TestRenderer.create(<GitaLanguageProvider initialLang="en"><ShareProvider>{child}</ShareProvider></GitaLanguageProvider>);});
}
afterEach(()=>{act(()=>tree?.unmount());jest.clearAllMocks();});
test('katha hub opens its selected canonical story in the local Home stack',async()=>{
 await mount(<KathaLibraryScreen navigation={mockNavigation as never} route={{name:'KathaLibrary',key:'test'} as never}/>);
 const story=getKathaLibrary()[0];
 const card=tree.root.findAllByType(ListingCard).find(n=>n.props.testID===`katha-card-${story.id}`)!;
 act(()=>card.props.onPress());
 expect(mockNavigate).toHaveBeenCalledWith('VratKathaReader',{kathaId:story.id});
});
test.each([false, true])('Stotram cards use the normal reading routes (Japmala mode: %s)', async (practice) => {
  await mount(<CategoryListScreen
    navigation={mockNavigation as never}
    route={{ name: 'CategoryList', key: 'test', params: { categoryId: 'stotram', practice } }}
  />);
  const shortcuts = tree.root.findAllByType(ListingCard);
  for (const [id, expected] of [
    ['durga-saptashati-core', ['SaptashatiCore']],
    ['ganesh-atharvashirsha', ['GaneshStotramReader', { chapter: 2, initialIndex: 0 }]],
  ] as const) {
    const card = shortcuts.find((item) => item.props.testID === `reading-link-${id}`)!;
    mockNavigate.mockClear();
    act(() => card.props.onPress());
    expect(mockNavigate.mock.calls).toEqual([expected]);
  }

  const hymns = tree.root.findAllByType(LibraryCard)
    .filter((card) => card.props.entry.status === 'active');
  expect(hymns.length).toBeGreaterThan(0);
  for (const card of hymns) {
    const target = buildEntryStartTarget(card.props.entry);
    expect(target).not.toBeNull();
    const expected = Object.keys(target!.params).length
      ? [target!.screen, target!.params]
      : [target!.screen];
    mockNavigate.mockClear();
    act(() => card.props.onPress());
    expect(mockNavigate.mock.calls).toEqual([expected]);
  }
});

test('Saptashati collection opens the full versioned Kavach',async()=>{
 await mount(<SaptashatiCoreScreen navigation={mockNavigation as never} route={{name:'SaptashatiCore',key:'test'} as never}/>);
 const cards=tree.root.findAllByType(LibraryCard);expect(cards).toHaveLength(16);
 act(()=>cards.find(c=>c.props.entry.id==='durga-devi-kavacham')!.props.onPress());
 expect(mockNavigate).toHaveBeenCalledWith('KavachamReader',{kavachamId:'durga-devi-kavacham',initialIndex:0});
});
test('weekday strip exposes a guide without claiming a complete weekday story',async()=>{
 await mount(<DeityDayLinks/>);
 const text=tree.root.findAllByType(Text).map(n=>n.props.children).flat(Infinity).join(' ');
 expect(text).toContain('Shiva');expect(text).toContain('Weekday vrat guide');
 const guide=tree.root.findAll(n=>n.props.accessibilityRole==='button' && typeof n.props.onPress==='function').find(n=>n.findAllByType(Text).some(t=>JSON.stringify(t.props.children).includes('Weekday vrat guide')))!;
 act(()=>guide.props.onPress());expect(mockNavigate).toHaveBeenCalledWith('VratKathaReader',{kathaId:'weekday-vrat-katha'});
});

test('every Saptashati chapter opens its own reader and first saved position',async()=>{
 await mount(<SaptashatiCoreScreen navigation={mockNavigation as never} route={{name:'SaptashatiCore',key:'test'} as never}/>);
 const cards=tree.root.findAllByType(LibraryCard);
 for(let chapter=1;chapter<=13;chapter++){
  const stutiId=`durga-saptashati-chapter-${chapter}`;
  act(()=>cards.find(c=>c.props.entry.id===stutiId)!.props.onPress());
  expect(mockNavigate).toHaveBeenLastCalledWith('StutiReader',{stutiId,initialIndex:0});
 }
});
