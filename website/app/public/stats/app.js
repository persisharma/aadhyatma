const $ = id => document.getElementById(id);
let report, token = '', allPlacements = false, requestNumber = 0;
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
    if(res.status===401 || res.status===503) {const data=await res.json();$('access').hidden=false;throw new Error(data.error || 'Owner access required');}
    if(!res.ok)throw new Error('Stats are unavailable. Check the analytics endpoint.');
    const data=await res.json();if(current !== requestNumber)return;report=data;$('access').hidden=true;render();$('status').textContent=`Updated ${new Date(report.generatedAt).toLocaleTimeString()}${report.truncated?' · Latest 100,000 events only':''}`;
  } catch(e) {if(current !== requestNumber)return;$('status').textContent=e.message;$('export').disabled=true;}
  finally {if(current === requestNumber)$('refresh').disabled=false;}
}
$('refresh').addEventListener('click',load);
for(const id of ['days','device','language'])$(id).addEventListener('change',load);
$('more-placements').addEventListener('click',()=>{allPlacements=!allPlacements;renderPlacements();});
$('sort').addEventListener('change',()=>report&&renderPlacements());
$('access').addEventListener('submit',e=>{e.preventDefault();token=$('token').value;$('token').value='';load();});
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
  } catch(e) { $('alltime-source').textContent='The site counter is unavailable here.'; }
}
loadAllTime();
load();
