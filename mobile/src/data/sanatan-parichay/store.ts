import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect,useSyncExternalStore } from 'react';
import { getSanatanTopic,validSanatanPage } from './index';
const KEY='@vedansh/sanatan-learning-v1';
export type Position={id:string;page:number};
type Data={saved:readonly string[];resume:Position|null;read:Readonly<Record<string,readonly number[]>>};
type Snapshot=Data&{ready:boolean;error:boolean};
type Storage=Pick<typeof AsyncStorage,'getItem'|'setItem'>;
export function decodeSanatanLearning(raw:string|null):Data{
 const empty:Data={saved:[],resume:null,read:{}};if(!raw)return empty;
 try{const d=JSON.parse(raw);if(d?.version!==1)return empty;const saved=Array.isArray(d.saved)?[...new Set<string>(d.saved.filter((id:unknown)=>typeof id==='string'&&getSanatanTopic(id)))]:[];const resume=d.resume&&validSanatanPage(d.resume.id,d.resume.page)?{id:d.resume.id,page:d.resume.page}:null;const read:Record<string,number[]>={};if(d.read&&typeof d.read==='object')for(const [id,pages] of Object.entries(d.read)){if(getSanatanTopic(id)&&Array.isArray(pages))read[id]=[...new Set(pages.filter(p=>validSanatanPage(id,p)))];}return {saved,resume,read};}catch{return empty;}
}
/** One serialized durable state: hydration and failed writes cannot erase older learning. */
export function createSanatanLearningStore(storage:Storage){
 let snapshot:Snapshot={ready:false,error:false,saved:[],resume:null,read:{}};let loading:Promise<void>|undefined;let queue:Promise<void>=Promise.resolve();const listeners=new Set<()=>void>();const emit=()=>listeners.forEach(f=>f());
 const hydrate=()=>loading??=(storage.getItem(KEY).then(raw=>{snapshot={...decodeSanatanLearning(raw),ready:true,error:false};emit();}).catch(()=>{loading=undefined;snapshot={...snapshot,error:true};emit();throw Error('Learning could not be loaded');}));
 const update=(apply:(d:Data)=>Data)=>{const op=queue.catch(()=>undefined).then(async()=>{await hydrate();const data=apply(snapshot);await storage.setItem(KEY,JSON.stringify({version:1,...data}));snapshot={...data,ready:true,error:false};emit();});queue=op;return op;};
 return {getSnapshot:()=>snapshot,subscribe:(f:()=>void)=>{listeners.add(f);return()=>{listeners.delete(f);};},hydrate,
 toggleSaved:(id:string)=>getSanatanTopic(id)?update(d=>({...d,saved:d.saved.includes(id)?d.saved.filter(x=>x!==id):[...d.saved,id]})):Promise.reject(Error('Unknown lesson')),
 resumeAt:(id:string,page:number)=>validSanatanPage(id,page)?update(d=>({...d,resume:{id,page}})):Promise.reject(Error('Invalid page')),
 readPage:(id:string,page:number,done=false)=>validSanatanPage(id,page)?update(d=>({...d,read:{...d.read,[id]:[...new Set([...(d.read[id]??[]),page])]},resume:done?null:{id,page}})):Promise.reject(Error('Invalid page'))};
}
const store=createSanatanLearningStore(AsyncStorage);
export function useSanatanLearning(){const state=useSyncExternalStore(store.subscribe,store.getSnapshot,store.getSnapshot);useEffect(()=>{void store.hydrate().catch(()=>undefined);},[]);return {...state,hydrate:store.hydrate,toggleSaved:store.toggleSaved,resumeAt:store.resumeAt,readPage:store.readPage};}
