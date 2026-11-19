import React from 'react';
import {View} from 'react-native';
import CachedArtwork from '@/components/CachedArtwork';
import {lessonArtSource} from '@/data/sanatan-parichay/lessonArt';
import {useGitaLanguage} from '@/data/gita/language';
/**
 * The painted teaching illustration for a lesson, chosen by reading language
 * (hi+gu share the Devanagari plate, en+kn the Roman plate). Served from R2 and
 * download-once cached. Returns null until published so no empty frame appears.
 */
export default function LessonArt({topicId,accessibilityLabel}:{topicId:string;accessibilityLabel:string}){
 const {lang}=useGitaLanguage();
 const source=lessonArtSource(topicId,lang);
 if(!source)return null;
 return <View testID={`sanatan-plate-${topicId}`} accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel}
   style={{width:'100%',aspectRatio:1.5,overflow:'hidden',borderRadius:16}}>
  <CachedArtwork source={source} style={{position:'absolute',top:0,left:0,width:'100%',height:'100%'}} resizeMode="cover"/>
 </View>;
}
