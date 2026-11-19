import React from 'react';
import {View} from 'react-native';
import CachedArtwork from '@/components/CachedArtwork';
import ZoomableArtwork from '@/components/ZoomableArtwork';
import {lessonArtSource} from '@/data/sanatan-parichay/lessonArt';
import {useGitaLanguage} from '@/data/gita/language';
import {useTheme} from '@/theme/ThemeContext';
/**
 * The painted teaching illustration for a lesson, chosen by reading language
 * (hi+gu share the Devanagari plate, en+kn the Roman plate). Served from R2 and
 * download-once cached. Returns null until published so no empty frame appears.
 *
 * The plate runs edge to edge through the reading gutter and opens in the shared
 * picture viewer, because its painted labels are too small to read in the page.
 */
export default function LessonArt({topicId,title,caption,onOpen}:{topicId:string;title:string;caption:string;onOpen?:()=>void}){
 const {lang}=useGitaLanguage();
 const {colors,spacing}=useTheme();
 const source=lessonArtSource(topicId,lang);
 if(!source)return null;
 return <ZoomableArtwork testID={`sanatan-plate-${topicId}`} source={source} aspectRatio={1.5} title={title} caption={caption}
   showLabel onOpen={onOpen} style={{marginHorizontal:-spacing.readingGutter}}>
  <View style={{width:'100%',aspectRatio:1.5,overflow:'hidden',backgroundColor:colors.parchmentSoft}}>
   <CachedArtwork source={source} style={{position:'absolute',top:0,left:0,width:'100%',height:'100%'}} resizeMode="cover"/>
  </View>
 </ZoomableArtwork>;
}
