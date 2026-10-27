import json, os, re, shutil, hashlib

PREV='docs/content-parity/ramayan-comic/ayodhyakanda-preview-v1'
STAGE='.context/ayodhya-build/assets'
EDITION='docs/content-parity/ramayan-comic/ayodhyakanda-illustrated-v1'
os.makedirs(STAGE, exist_ok=True); os.makedirs(EDITION, exist_ok=True)
LANGS=['hi','en','gu','kn']

# Localized speaker names + recollection label, parsed from the approved preview gallery.
gjs=open(f'{PREV}/gallery.js',encoding='utf8').read()
rows=re.search(r'const speakerRows=\[(.*?)\];', gjs, re.S).group(1)
SPEAKER={}
for m in re.finditer(r"\['([^']*)','([^']*)','([^']*)','([^']*)'\]", rows):
    en,hi,gu,kn=m.groups(); SPEAKER[en]={'en':en,'hi':hi,'gu':gu,'kn':kn}
rec=re.search(r"const recollection=\{hi:'([^']*)',en:'([^']*)',gu:'([^']*)',kn:'([^']*)'\}", gjs)
RECOLLECT=dict(zip(['hi','en','gu','kn'], rec.groups()))

def speaker_label(spk, off, L):
    base=(SPEAKER.get(spk,{}).get(L) or spk or '')
    return f'{base} · {RECOLLECT[L]}' if off else base

pb=json.load(open(f'{PREV}/preview-book.json'))
episodes=[]; pages=[]; panelCount=0; all_sargas=set(); art_sources={}

for pg in pb['pages']:
    num=pg['number']; stem=f'page-{num:03d}'
    src=list({p['art']['url'] for row in pg['rows'] for p in row})[0]
    dst=os.path.join(STAGE, stem+'.png')
    shutil.copyfile(os.path.join(PREV,src), dst)
    sha=hashlib.sha256(open(dst,'rb').read()).hexdigest()
    art_sources[stem]=src
    panels=[]; rows_ids=[]
    for row in pg['rows']:
        rid=[]
        for p in row:
            panelCount+=1; pid=p['id']; rid.append(pid)
            art=p['art']; W,H=art['dimensions']; fx,fy,fw,fh=art['frame']
            mode=p.get('mode','caption'); text=p.get('text') or {}; narr=p.get('narration') or {}
            off=bool(p.get('offPanel')); spk=p.get('speaker')
            copy={}
            for L in LANGS:
                if mode=='dialogue':
                    line=f'{speaker_label(spk,off,L)}: “{text.get(L,"")}”'
                    narration='\n'.join(x for x in [narr.get(L,''), line] if x)
                elif mode=='silent':
                    narration=narr.get(L,'')
                else:  # caption
                    narration=text.get(L,'') or narr.get(L,'')
                copy[L]={'narration':narration,'speaker':None,'dialogue':None,'note':''}
            # Render all speech as attributed captions (preview authored no balloon geometry).
            out_mode='caption' if mode=='dialogue' else mode
            panel={'id':pid,'sourcePanel':pid,'source':p.get('source',''),
                   'art':stem,'sha256':sha,'dimensions':{'width':W,'height':H},
                   'frame':{'x':fx/W,'y':fy/H,'width':fw/W,'height':fh/H},
                   'zone':[0,0,0,0,0],'mode':out_mode}
            panel.update(copy); panels.append(panel)
        rows_ids.append(rid)
    for s in pg.get('sourceSargas',[]): all_sargas.add(s)
    episodes.append({'id':pg['id'], **{L:{'title':pg['title'][L],'framing':''} for L in LANGS}, 'panels':panels})
    pages.append({'id':pg['id'],'number':num,'title':{L:pg['title'][L] for L in LANGS},
                  'rows':rows_ids,'sourceSargas':pg.get('sourceSargas',[])})

book={'edition':'ayodhyakanda-illustrated-v1','baseText':'Valmiki Ramayana, Ayodhya Kanda',
      'scope':'Sourced illustrated retelling of the Ayodhya Kanda; not a verse-by-verse translation',
      'sourceCoverage':sorted(all_sargas),
      'title':{'hi':'रामायण कॉमिक · अयोध्याकाण्ड','en':'Ramayana Comic · Ayodhyākāṇḍa',
               'gu':'રામાયણ કોમિક · અયોધ્યાકાંડ','kn':'ರಾಮಾಯಣ ಕಾಮಿಕ್ · ಅಯೋಧ್ಯಾಕಾಂಡ'},
      'reviewStatus':'integrated from ayodhyakanda-preview-v1 (2026-10-27)',
      'episodes':episodes,'pages':pages,'panelCount':panelCount}
open(f'{EDITION}/book.json','w').write(json.dumps(book, ensure_ascii=False, indent=2)+'\n')
open(f'{EDITION}/art-sources.json','w').write(json.dumps(art_sources, ensure_ascii=False, indent=2)+'\n')
print('speakers localized:',len(SPEAKER),'| recollection:',RECOLLECT['en'])
print('book:',len(episodes),'episodes',len(pages),'pages',panelCount,'panels; sargas',min(all_sargas),'..',max(all_sargas))
