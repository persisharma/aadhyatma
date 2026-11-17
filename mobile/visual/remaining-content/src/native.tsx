export * from '../node_modules/react-native-web/dist/index.js';
export function useWindowDimensions(){
 const p=new URLSearchParams(location.search);
 return {width:Number(p.get('width')||390),height:Number(p.get('height')||844),scale:2,fontScale:Number(p.get('system')||1)};
}
