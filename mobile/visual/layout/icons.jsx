import React from 'react';import{View,Text}from'react-native';
export default function AppIcon({name,size=22,color='#6F3F1D'}){const g={back:'‹',close:'×',play:'▶',pause:'Ⅱ',previous:'|◀',skip:'▶|',repeat:'↻'}[name]||'•';return <View style={{width:size,height:size,alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:size*.8,color,lineHeight:size}}>{g}</Text></View>;}
