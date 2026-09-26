import { useCallback, useEffect, useMemo, useState } from 'react';
import { readVerse, readVerseRange } from './content.native';
import type { LoadingVerse } from './usePagedVerses';
export type { LoadingVerse } from './usePagedVerses';
const PAGE = 24;
/** Only the current 24-row page and its two neighbors enter the JS heap. */
export function usePagedVerses<T>(key: string, count: number, current: number) {
  const block = Math.floor(current / PAGE);
  const [window, setWindow] = useState<{key:string; start:number; rows:T[]}>({key:'',start:0,rows:[]});
  const [error,setError] = useState(false);
  const [attempt,setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setError(false);
    if (!count) return;
    const start = Math.max(0, (block-1)*PAGE);
    readVerseRange<T>(key, start, Math.min(72,count-start)).then((rows) => {
      if (rows.length !== Math.min(72,count-start)) throw new Error('Incomplete scripture page');
      if (!cancelled) setWindow({key,start,rows});
    }).catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [key,count,block,attempt]);
  const verses = useMemo<(T|LoadingVerse)[]>(() => Array.from({length:count}, (_,i) =>
    window.key === key && i >= window.start && i < window.start+window.rows.length
      ? window.rows[i-window.start] : {__type:'loading',id:`loading:${i}`}
  ), [key,count,window]);
  // Speech can request its next verse before a visual prefetch resolves. That path
  // reads a single indexed row synchronously, never a chapter or the whole corpus.
  const getVerse = useCallback((index:number):T => {
    if (window.key === key && index >= window.start && index < window.start+window.rows.length) return window.rows[index-window.start];
    return readVerse<T>(key,index);
  }, [key,window]);
  return {verses,getVerse,error,retry:() => setAttempt((n) => n+1)};
}
