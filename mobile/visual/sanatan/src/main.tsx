import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {View} from 'react-native';
import {ThemeProvider} from '@/theme/ThemeContext';
import SanatanParichayScreen from '@/screens/SanatanParichayScreen';
import SanatanReaderScreen from '@/screens/SanatanReaderScreen';
import SanatanHomeCard from '@/components/SanatanHomeCard';
import {PreviewLanguage} from './platform';
const query=new URLSearchParams(location.search);
function Preview(){
 const [routes,setRoutes]=useState<any[]>([{name:query.get('view')==='reader'?'SanatanReader':'SanatanParichay',params:query.get('topic')?{topicId:query.get('topic'),initialPage:Number(query.get('page')||0)}:undefined}]);
 const route=routes[routes.length-1];
 const navigation:any={goBack:()=>setRoutes(r=>r.length>1?r.slice(0,-1):r),push:(name:any,params:any)=>setRoutes(r=>[...r,{name,params}]),navigate:(name:any,params:any)=>setRoutes(r=>[...r,{name,params}])};
 if(query.get('view')==='home' && routes.length===1) return <View style={{padding:22,flex:1}}><SanatanHomeCard onPress={()=>navigation.push('SanatanParichay')} onPressIn={()=>{}} onPressOut={()=>{}}/></View>;
 return route.name==='SanatanReader'?<SanatanReaderScreen navigation={navigation} route={{...route,key:'reader'}}/>:<SanatanParichayScreen navigation={navigation} route={{...route,key:'hub'}}/>;
}
createRoot(document.getElementById('root')!).render(<PreviewLanguage><ThemeProvider><Preview/></ThemeProvider></PreviewLanguage>);
