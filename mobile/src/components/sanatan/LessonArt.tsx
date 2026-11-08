import React from 'react';
import {View,Text} from 'react-native';
import CachedArtwork from '@/components/CachedArtwork';
import {lessonArtSource} from '@/data/sanatan-parichay/lessonArt';
import {useSanatanText} from './Primitives';
/** Unpublished art makes no request and occupies no empty reader rectangle. */
export default function LessonArt({topicId}:{topicId:string}){
 const source=lessonArtSource(topicId),t=useSanatanText();
 if(!source)return null;
 const description=topicId==='deity'?['चार हाथों वाले गणेश: अंकुश, पाश, टूटा दन्त, वरद मुद्रा और पास में मूषक।','Four-armed Ganesha with goad, noose, broken tusk and boon-giving gesture, with a mouse nearby.']:['बाएँ से तुलसी का पौधा, अर्पित पत्ते, बड़े मनकों की जप-माला और छोटे मनकों की कण्ठी।','From left: Tulasi plant, offered leaves, a larger-bead japa mala and small neck beads.'];
 return <View accessible accessibilityRole="image" accessibilityLabel={t([description[0],description[1]])} style={{width:'100%',aspectRatio:topicId==='deity'?1.5:2,overflow:'hidden',borderRadius:16}}>
  <CachedArtwork source={source} style={{position:'absolute',top:0,left:0,width:'100%',height:'100%'}} resizeMode="contain"/>
 </View>;
}
