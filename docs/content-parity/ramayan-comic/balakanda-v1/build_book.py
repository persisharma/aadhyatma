from pathlib import Path
import json,re,hashlib,math
ROOT=Path(__file__).resolve().parent
BOOKROOT=ROOT.parent
from PIL import Image
review_path=ROOT/'asset-review.json'
art_review=json.loads(review_path.read_text()) if review_path.exists() else {'assets':{}}
source=json.loads((BOOKROOT.parents[2]/'mobile/src/data/valmiki-ramayan/chapter-01.json').read_text())
episodes=[]
for raw in (ROOT/'story.tsv').read_text().splitlines():
    row=raw.split('|')
    if row[0]=='E':
        assert len(row)==4,row
        episodes.append(dict(id=f'bk-{len(episodes)+1:02d}',title=row[1],sargas=row[2],framing=row[3],panels=[]))
    else:
        assert len(row)==7,row
        e=episodes[-1]; k=len(e['panels'])+1
        m=re.fullmatch(r'1\.(\d+)(?:-(\d+))?',row[1]); assert m,row[1]
        chapters=list(range(int(m[1]),int(m[2] or m[1])+1))
        p=dict(id=f"{e['id']}-{k:02d}",source=row[1],sargas=chapters,narration=row[2],speaker=row[3] or None,dialogue=row[4] or None,artAction=row[5],characters=row[6].split(','))
        e['panels'].append(p)
covered=set()
pages=[]
for ei,e in enumerate(episodes):
    n=len(e['panels']); rows=math.ceil(n/2)
    e['asset']=art_review['assets'].get(e['id'],{}).get('selectedAsset',f"assets/{e['id']}-v1.png")
    asset_file=ROOT/e['asset']
    if asset_file.exists():
        w,h=Image.open(asset_file).size;e['dimensions']={'width':w,'height':h}
    e['grid']={'columns':2,'rows':rows,'lastSpansRow':bool(n%2)}
    for i,p in enumerate(e['panels']):
        covered.update(p['sargas'])
        wide=n%2 and i==n-1
        p['frame']={'x':0 if wide else (i%2)/2,'y':(i//2)/rows,'width':1 if wide else .5,'height':1/rows,'status':art_review['assets'].get(e['id'],{}).get('frameStatus','proposed-grid-awaiting-visual-review')}
        reviewed_frames=art_review['assets'].get(e['id'],{}).get('panelFrames',[])
        if reviewed_frames:
            f=next(f for f in reviewed_frames if f['panelId']==p['id'])
            p['frame'].update({k:f[k] for k in ('x','y','width','height')})
    for i in range(0,n,3):
        pages.append({'id':f"{e['id']}-page-{i//3+1}",'episodeId':e['id'],'panelIds':[p['id'] for p in e['panels'][i:i+3]]})
assert covered==set(range(1,78)),sorted(set(range(1,78))-covered)
book={'id':'valmiki-balakanda-comic-v1','title':'बालकाण्ड','locale':'hi','status':'local-authoring-draft','baseText':'Valmiki Ramayana, Bala Kanda, 77 sargas','scope':'Complete chapter-arc comic retelling; not a verse-by-verse edition. Dialogues are original source-based paraphrases, not verbatim quotations.','otherLocales':{'en':'pending','gu':'pending','kn':'pending'},'episodes':episodes,'pages':pages,'panelCount':sum(len(e['panels']) for e in episodes),'sourceCoverage':sorted(covered)}
(ROOT/'book.json').write_text(json.dumps(book,ensure_ascii=False,indent=2)+'\n')
# Every transition has its actual next beat recorded, including shifts back from embedded stories.
review=['# Bālakāṇḍa complete arc and pacing review','', '2026-10-11. Hindi authoring draft; source anchors are sarga-level, not claims that dialogue is a direct verse translation. All 77 sargas are covered in order, with framed retrospective episodes. Independent human editorial review and four-language/native review remain pending.','', 'The complete outline precedes illustration generation. Episode framing explicitly identifies future-time prologue, present journey, ancestor legends, Shatananda’s account of Vishwamitra, and return to Mithila. No fixed page quota.','', '| Panel | Principal beat | Source | Transition to next panel | Exact artwork action |','|---|---|---|---|---|']
flat=[(e,p) for e in episodes for p in e['panels']]
transition_reasons=json.loads((ROOT/'transition-review.json').read_text())
for e in episodes:
    assert len(transition_reasons[e['id']])==len(e['panels']),e['id']
for i,(e,p) in enumerate(flat):
    if i+1<len(flat):
        ne,np=flat[i+1]
        transition=('Same episode: ' if ne==e else f"Episode/frame transition — {ne['framing']} ")+np['narration']
    else: transition='Ending: Ayodhya household and public life restored; Bala Kanda ends. No exile or coronation added.'
    transition=transition_reasons[e['id']][e['panels'].index(p)]+' Next: '+transition
    review.append(f"| {p['id']} | {p['narration']} | {p['source']} | {transition} | {p['artAction']} |")
review+=['','## Review boundaries','', '- Whole Hindi arc: authoring pass complete, including every adjacent panel. Human Sanskrit/Hindi editorial approval pending.','- English/Gujarati/Kannada narratives: not authored; no claim of language parity.','- Art: see asset-review.json; source sheet inspection and cell boundaries are tracked separately.','- Native Standard/Large and CDN/no-bundle checks: pending; this package does not register a mobile story.','- Child-safe rendering condenses sexual/graphic detail while preserving consequences. Ahalya remains unseen during penance in this source; no stone transformation is substituted. Trishanku’s curse is not depicted through skin-colour or caste caricature.','- Prologue Rama is later adult king; journey/wedding Rama remains adolescent. Four marriage pairings and intact/broken bow states are explicit.','- Genealogies are introduced in the retelling; this is not a name-by-name or verse-by-verse Sanskrit edition.']
(ROOT/'pacing-review.md').write_text('\n'.join(review)+'\n')
manifest=json.loads(Path('/tmp/vedansh-bala-source-review/fetch-manifest.json').read_text())
(ROOT/'source-fetch-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(f"{len(episodes)} episodes, {book['panelCount']} panels, {len(pages)} reader pages; all 77 sargas covered")
