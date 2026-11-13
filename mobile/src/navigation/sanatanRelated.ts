import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {HomeStackParamList} from './types';
import type {RelatedLesson} from '@/data/sanatan-parichay/experience';
/** Push into the same Home stack so Back restores the mounted lesson and page. */
export function openSanatanRelated(navigation:NativeStackNavigationProp<HomeStackParamList>,link:RelatedLesson){
 const target=link.target;
 switch(target.kind){
  case 'lesson':navigation.push('SanatanReader',{topicId:target.id,initialPage:target.page??0});return;
  case 'gita':navigation.push('GitaReader',{chapter:target.chapter,initialIndex:target.verse-1});return;
  case 'deity':navigation.push('DeityDetail',{deityId:target.id});return;
  case 'graha':navigation.push('GrahaReference',target.id?{focusGraha:target.id}:undefined);return;
  case 'temples':navigation.push('TheerthMap',{});return;
  case 'reading':{
   // Read the active registry only on an explicit action, not at lesson import.
   const {library}=require('@/data/texts') as typeof import('@/data/texts');
   const entry=library.find(e=>e.id===target.id&&e.status==='active'&&!e.hidden);
   if(!entry)return;
   if(target.id==='ganesh-stotram'){navigation.push('GaneshStotramReader',{chapter:target.chapter??1,initialIndex:target.index??0});return;}
   if(target.id==='navagraha-stotram'){navigation.push('StutiReader',{stutiId:target.id,initialIndex:target.index??0});return;}
   if(target.id==='tulsi-puja'){navigation.push('SanskarReader',{sanskarId:target.id,initialIndex:0});return;}
   if(target.id==='tulsi-aarti'){
    const {aartiIndexById}=require('@/data/aarti/ids') as typeof import('@/data/aarti/ids');
    navigation.push('AartiReader',{aartiIndex:aartiIndexById['tulsi-aarti'],initialIndex:0});return;
   }
   const {buildEntryStartTarget}=require('./entryRoutes') as typeof import('./entryRoutes');
   const route=buildEntryStartTarget(entry);
   if(route){const push=navigation.push as (screen: keyof HomeStackParamList, params:unknown)=>void;push(route.screen,route.params);}
   return;
  }
 }
}
