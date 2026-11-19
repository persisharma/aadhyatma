import React from 'react';import {View} from 'react-native';
export const useSafeAreaInsets=()=>({top:0,bottom:0,left:0,right:0});
export function SafeAreaView({edges,style,children,...props}){const inset=Number(new URLSearchParams(location.search).get('inset')||0);return <View {...props} style={[style,edges?.includes('top')?{paddingTop:inset}:null]}>{children}</View>;}
