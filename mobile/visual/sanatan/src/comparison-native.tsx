/** SSR-only bitmap adapter: web-native Image waits for effects and has no src. */
import React from 'react';
import {StyleSheet} from 'react-native-web';
export * from './native';
export function Image({source,style,resizeMode='cover',testID,...props}:any){
 return <img src={source?.uri} data-testid={testID} alt="" style={{...StyleSheet.flatten(style),objectFit:resizeMode==='contain'?'contain':'cover'}}/>;
}
