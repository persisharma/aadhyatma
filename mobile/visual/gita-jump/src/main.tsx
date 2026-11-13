import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Text, View, Pressable} from 'react-native';
import {ThemeProvider} from '@/theme/ThemeContext';
import GitaVerseJumpSheet from '@/components/GitaVerseJumpSheet';
import {getGitaChapter} from '@/data/gita';
import {PreviewLanguage} from './platform';
function Preview() {
 const [target,setTarget]=useState({chapter:2,verse:12});
 const [open,setOpen]=useState(true);
 return <View style={{flex:1,padding:22,backgroundColor:'#f3e7c9'}}>
  <Text>ACTUAL PICKER COMPONENT · browser adaptation, not native QA</Text>
  <Pressable onPress={()=>setOpen(true)}><Text>Chapter {target.chapter} · {target.verse} / {getGitaChapter(target.chapter).verseCount} ⌄</Text></Pressable>
  {open && <GitaVerseJumpSheet chapter={target.chapter} verse={target.verse} onClose={()=>setOpen(false)} onOpen={(chapter,verse)=>{setTarget({chapter,verse});setOpen(false);return true;}}/>}
 </View>;
}
createRoot(document.getElementById('root')!).render(<PreviewLanguage><ThemeProvider><Preview/></ThemeProvider></PreviewLanguage>);
