import { performance } from 'node:perf_hooks';
import { findTimingOccurrences, OCCASION_CARD_PROFILES } from '../src/panchang/occasionTimings';
import { ALL_LENSES } from '../src/panchang/lenses';
const options={calendarSystem:'purnimant' as const, location:{cityId:'jaipur',latitude:26.9124,longitude:75.7873,elevation:431}};
for(const lenses of [new Set(), ALL_LENSES]) {
 const work=findTimingOccurrences(new Date(2026,10,8),options,lenses); let i=0, total=0, max=0, worst='';
 while(true){const t=performance.now();const r=work.next();const ms=performance.now()-t;if(ms>max){max=ms;worst=OCCASION_CARD_PROFILES[i]?.ruleId??'done';}total+=ms;if(ms>20)console.log(JSON.stringify({rule:OCCASION_CARD_PROFILES[i]?.ruleId,ms}));i++;if(r.done)break;}
 console.log(JSON.stringify({all:lenses.size>0,total,max,worst}));
}
