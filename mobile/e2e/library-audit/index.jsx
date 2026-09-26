// Test-only entry point. Never imported by the production app.
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {registerRootComponent} from 'expo';
import {Text, View, Dimensions} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {initializeLibrary, readVerse, readVerseRange, database} from '../../src/storage/content.native';
import {fingerprint} from './fingerprint';
import oracle from './oracle.generated.json';

const languages = ['hi','en','gu','kn'];
const reportPath = `${FileSystem.documentDirectory}library-audit.json`;
const report = {status:'running', startedAt:new Date().toISOString(), documents:[], verses:0, renders:0, failures:[]};
const save = () => FileSystem.writeAsStringAsync(reportPath, JSON.stringify(report));
const fail = (scope,error) => { report.failures.push({scope,error:String(error?.stack ?? error)}); };
const assert = (condition,message) => { if (!condition) throw new Error(message); };
let renderer;

class Boundary extends React.Component {
  state = {error:null, resetKey:null};
  static getDerivedStateFromProps(props,state) { return props.resetKey!==state.resetKey ? {error:null,resetKey:props.resetKey} : null; }
  static getDerivedStateFromError(error) { return {error}; }
  componentDidCatch(error) { this.props.done(error); }
  render() { return this.state.error ? <Text>Render failed</Text> : this.props.children; }
}
function Page({item, done}) {
  const pageRef = useRef(null);
  useLayoutEffect(() => {
    let cancelled = false;
    const frame = requestAnimationFrame(() => pageRef.current?.measure((x,y,width,height) => {
      if (cancelled) return;
      if (!(width>0 && height>0)) { done(new Error('Empty native page layout'));return; }
      requestAnimationFrame(() => { if (!cancelled) done(); });
    }));
    return () => { cancelled=true;cancelAnimationFrame(frame); };
  },[item.sequence,done]);
  const {GitaLanguageProvider} = require('../../src/data/gita/language');
  const {ThemeProvider} = require('../../src/theme/ThemeContext');
  const family = item.key.split('/')[0];
  const verse = item.omitCommentary ? {...item.verse,commentaryHi:[],commentaryEn:[]} : item.verse;
  let Component;
  if (family === 'gita') Component = require('../../src/components/GitaVersePage').default;
  else if (family === 'sanskar') Component = require('../../src/components/SanskarVersePage').default;
  else if (family === 'bajrang-baan') Component = require('../../src/components/BajrangBaanVersePage').default;
  else if ('sanskrit' in verse) Component = require('../../src/components/ShivaStrotamVersePage').default;
  else if (['valmiki-ramayan','ramcharitmanas','sundarkand'].includes(family)) Component = require('../../src/components/SundarkandVersePage').default;
  else Component = require('../../src/components/VersePage').default;
  return <GitaLanguageProvider key={item.lang} initialLang={item.lang}><ThemeProvider>
    <View ref={pageRef} collapsable={false} style={{flex:1}}>
      <Component verse={verse} sourceId={item.sourceId} width={Dimensions.get('window').width} />
    </View>
  </ThemeProvider></GitaLanguageProvider>;
}
async function audit() {
  const {toReadableVerse} = require('../../src/readAloud/verseAdapter');
  const {buildVerseScript} = require('../../src/readAloud/verseScript');
  const {verseLinesByLang,meaningByLang} = require('../../src/utils/localize');
  const rows = await database().getAllAsync('SELECT key,verse_count FROM documents ORDER BY key');
  assert(rows.length === oracle.length,'Document count differs from source');
  const configPath = `${FileSystem.documentDirectory}library-audit-config.json`;
  const config = (await FileSystem.getInfoAsync(configPath)).exists ? JSON.parse(await FileSystem.readAsStringAsync(configPath)) : {};
  report.config = config;
  for (const doc of oracle) {
    if (config.onlyKeys && !config.onlyKeys.includes(doc.key)) continue;
    const coverage = {key:doc.key, expected:doc.verses.length, checked:0, renders:{hi:0,en:0,gu:0,kn:0}};
    report.documents.push(coverage);
    assert(rows.find(r => r.key===doc.key)?.verse_count === doc.verses.length,`Document count: ${doc.key}`);
    for (const lang of config.languages ?? languages) {
    for (let start=0; start<doc.verses.length; start+=24) {
      const page = await readVerseRange(doc.key,start,24);
      assert(page.length===Math.min(24,doc.verses.length-start),`Page count: ${doc.key}:${start}`);
      for (let i=0; i<page.length; i++) {
        const position=start+i, verse=page[i], expected=doc.verses[position];
        if (config.positions && !config.positions.includes(position)) continue;
        const scope=`${doc.key}:${position}:${expected.id}`;
        try {
          assert(verse.id===expected.id && fingerprint(verse)===expected.hash,`Paged verse differs: ${scope}`);
          assert(fingerprint(readVerse(doc.key,position))===expected.hash,`Single verse differs: ${scope}`);
          const readable = toReadableVerse(verse);
          assert(readable?.kind==='verse',`Missing readable adapter: ${scope}`);
          {
            const lines=verseLinesByLang(lang,readable.deva,readable.latin);
            const meaning=meaningByLang(lang,readable.meaningHi,readable.meaningEn,{gu:readable.meaningGu,kn:readable.meaningKn});
            assert(lines.every(s => typeof s==='string') && typeof meaning==='string',`Invalid localized text: ${scope}/${lang}`);
            assert(lines.some(s => s.trim()) || meaning.trim(),`Empty localized page: ${scope}/${lang}`);
            const speech=buildVerseScript(readable,lang,{readMeaning:true,readCommentary:true,maxChars:4000});
            assert(speech.length>0 && speech.every(c => c.text.length>0 && c.text.length<=4000),`Invalid speech chunks: ${scope}/${lang}`);
            await FileSystem.writeAsStringAsync(`${FileSystem.documentDirectory}library-audit-current.json`,JSON.stringify({key:doc.key,position,id:verse.id,lang}));
            const error=await new Promise(resolve => {
              const timer=setTimeout(() => resolve(new Error('Native layout timeout')),30000);
              renderer({...doc,verse,lang,position,omitCommentary:config.omitCommentary},error => { clearTimeout(timer);resolve(error); });
            });
            if(error) fail(`${scope}/${lang}`,error);
            else { coverage.renders[lang]++; report.renders++; }
          }
          if(lang===languages[0]) { coverage.checked++; report.verses++; }
        } catch(error) { fail(scope,error); }
      }
      await save();
    }
    }
  }
  report.status=report.failures.length ? 'failed' : 'passed';
  report.finishedAt=new Date().toISOString();
  await save();
  renderer(null,()=>{});
}
function App() {
  const [item,setItem] = useState(null);
  const [message,setMessage] = useState('Preparing exhaustive verse audit');
  const sequence=useRef(0);
  useEffect(() => {
    renderer=(next,done) => {
      if (!next) { setItem(null); setMessage(`${report.status}: ${report.verses} verses, ${report.renders} renders`);return; }
      setItem({...next,done,sequence:++sequence.current});
    };
    (async () => {
      await initializeLibrary();
      await Font.loadAsync(require('./fonts.generated').fonts);
      await SplashScreen.hideAsync();
      await audit();
    })().catch(async error => { fail('audit',error);report.status='failed';await save();setMessage(String(error)); });
  },[]);
  return <View style={{flex:1,paddingTop:58,paddingBottom:34,backgroundColor:'#fff8ee'}}>
    <Text accessibilityLabel="Verse audit progress">{item ? `${item.key} ${item.position+1}/${item.verses.length} ${item.lang}` : message}</Text>
    {item && <Boundary resetKey={item.sequence} done={item.done}>
      <Page item={item} done={item.done} />
    </Boundary>}
  </View>;
}
registerRootComponent(App);
