import { dailySeries, istToday, splitBySource, channelOf, CHANNELS } from '/stats/daily.js';
const $ = id => document.getElementById(id);
// The owner token is kept in this browser only when "Remember on this device" is ticked.
const TOKEN_KEY = 'vedansh-stats-token';
const savedToken = () => { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; } };
const keepToken = value => { try { if (value) localStorage.setItem(TOKEN_KEY, value); else localStorage.removeItem(TOKEN_KEY); } catch { /* private mode: memory only */ } };
let report, token = savedToken(), allPlacements = false, requestNumber = 0;
const human = value => (value || 'page').replace(/[-_:]/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
const node = (tag,text,cls) => {const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;};
function empty(el,text='No activity in this view yet.') {el.replaceChildren(node('div',text,'empty'));}
function renderPlacements() {
  const tbody=$('placements');tbody.replaceChildren();
  const sort=$('sort').value;
  const rows=[...report.placements].sort((a,b)=>(b[sort] || 0)-(a[sort] || 0));
  $('more-placements').hidden=rows.length<=10;
  $('more-placements').textContent=allPlacements ? 'Show top 10' : `Show all ${rows.length} placements`;
  for(const r of (allPlacements ? rows : rows.slice(0,10))) {
    const tr=node('tr'),cell=node('td');cell.append(node('strong',human(r.target)),node('small',human(r.section)));tr.append(cell,node('td',r.views.toLocaleString()),node('td',r.clicks.toLocaleString()));
    const rate=node('td',r.ctr===null?'—':`${(r.ctr*100).toFixed(1)}%`);if(r.views<30)rate.append(node('small','Low sample'));tr.append(rate);tbody.append(tr);
  }
  if(!rows.length){const tr=node('tr'),td=node('td','No button activity yet. Explore the website, then refresh.');td.colSpan=4;tr.append(td);tbody.append(tr);}
}
function render() {
  $('storage').textContent=report.storage;
  $('metrics').replaceChildren();
  for(const [label,value,note] of [ ['Visits',report.metrics.visits,'Anonymous tab sessions'],['Button clicks',report.metrics.clicks,'Across tracked placements'],['Install intent',report.metrics.installPrompts,'Visits opening an install prompt'],['Download clicks',report.metrics.storeClicks,`${report.metrics.storeVisitors} visits · not confirmed installs`] ]) {
    const card=node('div',undefined,'metric');card.append(node('span',label),node('strong',value.toLocaleString()),node('small',note));$('metrics').append(card);
  }
  renderPlacements();
  $('funnel').replaceChildren();
  const max=Math.max(1,...report.funnel.map(r=>r[1]));
  for(const [name,count] of report.funnel) {const row=node('div',undefined,'row');row.append(node('span',name),node('strong',count));const bar=node('div',undefined,'bar'),fill=node('span');fill.style.width=`${count/max*100}%`;bar.append(fill);$('funnel').append(row,bar);}
  $('sources').replaceChildren();for(const r of report.sources){const row=node('div',undefined,'row');row.append(node('span',human(r.source)),node('strong',r.clicks));$('sources').append(row);}if(!report.sources.length)empty($('sources'),'No download clicks yet.');
  $('sections').replaceChildren();for(const r of report.sections){const row=node('tr');row.append(node('td',human(r.section)),node('td',r.views),node('td',r.clicks));$('sections').append(row);}
  $('campaigns').replaceChildren();for(const r of (report.campaigns||[])){const row=node('tr');row.append(node('td',r.campaign==='direct'?'Direct / untagged':r.campaign),node('td',r.visits),node('td',r.previews),node('td',r.installPrompts),node('td',r.storeClicks));$('campaigns').append(row);}if(!(report.campaigns||[]).length){const row=node('tr'),td=node('td','No visits in this view yet.');td.colSpan=5;row.append(td);$('campaigns').append(row);}
  $('paths').replaceChildren();for(const r of report.paths){const li=node('li');li.append(node('span',r.path.split(' → ').map(human).join(' → ')),node('b',`${r.count}×`));$('paths').append(li);}if(!report.paths.length)empty($('paths'),'Click paths appear after someone opens a store or download link.');
  $('export').disabled=false;
}
async function load() {
  const current = ++requestNumber;
  $('refresh').disabled=true;$('status').textContent='Updating…';
  const query=new URLSearchParams({days:$('days').value,device:$('device').value,language:$('language').value});
  try {
    const res=await fetch(`/api/stats?${query}`,{headers:token?{Authorization:`Bearer ${token}`}:{},cache:'no-store'});
    if(current !== requestNumber) return;
    if(res.status===401 || res.status===503) {const data=await res.json();if(res.status===401){keepToken('');token='';$('forget').hidden=true;}$('access').hidden=false;throw new Error(data.error || 'Owner access required');}
    if(!res.ok)throw new Error('Stats are unavailable. Check the analytics endpoint.');
    const data=await res.json();if(current !== requestNumber)return;report=data;$('access').hidden=true;$('forget').hidden=!savedToken();render();$('status').textContent=`Updated ${new Date(report.generatedAt).toLocaleTimeString()}${report.truncated?' · Latest 100,000 events only':''}`;
  } catch(e) {if(current !== requestNumber)return;$('status').textContent=e.message;$('export').disabled=true;}
  finally {if(current === requestNumber)$('refresh').disabled=false;}
}
$('refresh').addEventListener('click',load);
for(const id of ['days','device','language'])$(id).addEventListener('change',load);
$('more-placements').addEventListener('click',()=>{allPlacements=!allPlacements;renderPlacements();});
$('sort').addEventListener('change',()=>report&&renderPlacements());
$('access').addEventListener('submit',e=>{e.preventDefault();token=$('token').value;$('token').value='';keepToken($('remember').checked?token:'');load();});
$('forget').addEventListener('click',()=>{keepToken('');location.reload();});
$('export').addEventListener('click',()=>{
  if(!report)return;
  const rows=[['design','section','button','seen_visits','clicks','clicked_visits','exposed_clicked_visits','click_rate'],...report.placements.map(r=>[report.version,r.section,r.target,r.views,r.clicks,r.visitors,r.exposedClicks,r.ctr??''])];
  const csv=rows.map(row=>row.map(cell=>`"${String(cell).replaceAll('"','""')}"`).join(',')).join('\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv'})),a=node('a');a.href=url;a.download=`vedansh-placements-${new Date().toISOString().slice(0,10)}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
// All-time numbers come from the site's existing public counter (/api/hits), not from
// the 30-day event store, so they load without the owner token.
async function loadAllTime() {
  const rows=(el,list,emptyText)=>{el.replaceChildren();if(!list||!list.length){el.append(node('div',emptyText,'empty'));return;}for(const r of list){const row=node('div',undefined,'row');row.append(node('span',r.name),node('strong',Number(r.count).toLocaleString()));el.append(row);}};
  try {
    const res=await fetch('/api/hits?all=1',{cache:'no-store'});
    if(!res.ok) throw new Error(String(res.status));
    const d=await res.json(), live=res.headers.get('X-Vedansh-Hits-Source');
    $('alltime-total').textContent=`${Number(d.total).toLocaleString()} visits`;
    $('alltime-source').textContent=live?`Live from ${live} (read-only, via the local preview)`:'Counted on this site since launch.';
    rows($('at-pages'),d.pages,'No page visits yet.');rows($('at-src'),d.sources,'No tagged download-link visits yet.');rows($('at-site'),d.siteSources,'No tagged landings yet.');
    renderDaily(d.days,d.daySources);
  } catch(e) { $('alltime-source').textContent='The site counter is unavailable here.'; }
}
// One stacked column per India-time day from the counter's `day:` rows, split by
// source (`dsrc:` rows) into the fixed CHANNELS order, bottom to top; visits
// counted before the split sit on top as a neutral "not split" segment. The peak
// day and today carry their total on the cap, every day has a hover/focus
// tooltip with the breakdown, and the same numbers are in a table.
const NOT_SPLIT={id:'unsplit',label:'Before the split',short:'Not split'};
const SHORT={direct:'Direct',instagram:'Instagram',other:'Other',get:'/get/'};
const tagName=t=>`${t.kind==='get'?'/get/ ':''}${t.source}`;
function renderDaily(days,daySources) {
  const series=splitBySource(dailySeries(days,istToday()),daySources), chart=$('daily-chart'), tip=$('daily-tip');
  for(const id of ['daily-chart','daily-axis','daily-rows','daily-thead','daily-legend'])$(id).replaceChildren();
  tip.hidden=true;
  if(!series.length){chart.append(node('div','The daily count starts with the next visit.','empty'));return;}
  const when=(date,opts)=>new Date(`${date}T00:00:00Z`).toLocaleDateString('en-IN',{timeZone:'UTC',...opts});
  const visits=n=>`${n.toLocaleString()} visit${n===1?'':'s'}`;
  const groups=[...CHANNELS,...(series.some(d=>d.parts.unsplit)?[NOT_SPLIT]:[])];
  const max=Math.max(1,...series.map(d=>d.count)), peak=series.reduce((a,b)=>b.count>a.count?b:a), today=series.at(-1), yesterday=series.at(-2);
  $('daily-summary').textContent=`Today ${today.count.toLocaleString()}${yesterday?` · Yesterday ${yesterday.count.toLocaleString()}`:''} · India time`;
  for(const g of groups){
    const li=node('li'),sw=node('i',undefined,`sw seg-${g.id}`);sw.setAttribute('aria-hidden','true');
    li.append(sw,node('span',g.label),node('strong',series.reduce((sum,d)=>sum+d.parts[g.id],0).toLocaleString()));$('daily-legend').append(li);
  }
  const tr=node('tr');for(const h of ['Date','Visits',...groups.map(g=>g.short||SHORT[g.id]),'Tags'])tr.append(node('th',h));$('daily-thead').append(tr);
  // Tooltip: the date and total, then one line per channel with its tags.
  const fill=d=>{
    tip.replaceChildren(node('strong',`${when(d.date,{weekday:'short',day:'numeric',month:'short'})} · ${visits(d.count)}`));
    for(const g of groups){
      if(!d.parts[g.id])continue;
      // List the tags behind a channel, except Instagram's when it is only "instagram".
      const tags=d.tags.filter(t=>channelOf(t.kind,t.source)===g.id);
      const detail=tags.length&&(g.id!=='instagram'||tags.length>1)?` (${tags.map(t=>`${t.source} ${t.count}`).join(', ')})`:'';
      const line=node('span',undefined,'tip-row');
      line.append(node('i',undefined,`sw seg-${g.id}`),node('span',`${g.label}${detail}`),node('b',d.parts[g.id].toLocaleString()));tip.append(line);
    }
  };
  const show=(slot,d)=>{fill(d);tip.hidden=false;const x=slot.offsetLeft+slot.offsetWidth/2,half=tip.offsetWidth/2;tip.style.left=`${Math.min(Math.max(x,half),chart.offsetWidth-half)}px`;tip.style.top=`${slot.firstChild.offsetTop-6}px`;};
  for(const d of series){
    const slot=node('div',undefined,'day');slot.tabIndex=0;
    const breakdown=groups.filter(g=>d.parts[g.id]).map(g=>`${g.label} ${d.parts[g.id]}`).join(', ');
    slot.setAttribute('aria-label',`${when(d.date,{weekday:'short',day:'numeric',month:'short'})} · ${visits(d.count)}${breakdown?`: ${breakdown}`:''}`);
    if(d===today || (d===peak && d.count>0)) slot.append(node('span',d.count.toLocaleString(),'cap'));
    const stack=node('div',undefined,'stack');stack.style.height=`${d.count/max*100}%`;
    for(const g of [...groups].reverse()) if(d.parts[g.id]){const seg=node('i',undefined,`seg-${g.id}`);seg.style.flexGrow=d.parts[g.id];stack.append(seg);}
    slot.append(stack);
    for(const on of ['pointerenter','focus'])slot.addEventListener(on,()=>show(slot,d));
    for(const off of ['pointerleave','blur'])slot.addEventListener(off,()=>{tip.hidden=true;});
    chart.append(slot);
    const row=node('tr');row.append(node('td',when(d.date,{weekday:'short',day:'numeric',month:'short',year:'numeric'})),node('td',d.count.toLocaleString()));
    for(const g of groups)row.append(node('td',d.parts[g.id].toLocaleString()));
    row.append(node('td',d.tags.map(t=>`${tagName(t)} ${t.count}`).join(' · ')||'—','tags'));
    $('daily-rows').prepend(row);
  }
  $('daily-axis').append(node('span',when(series[0].date,{day:'numeric',month:'short'})),node('span','Today'));
}
loadAllTime();
load();
