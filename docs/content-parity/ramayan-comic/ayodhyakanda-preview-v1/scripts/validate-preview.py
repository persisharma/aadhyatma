#!/usr/bin/env python3
"""Validate the authoring package; --complete requires every illustrated page reviewed."""
import argparse,hashlib,json,pathlib,struct
root=pathlib.Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('--complete',action='store_true');parser.add_argument('--output');args=parser.parse_args()
plan=json.loads((root/'page-plan.json').read_text());script=json.loads((root/'script.json').read_text());langs={'hi','en','gu','kn'}
ids=[];chapters=set();errors=[]
for expected,p in enumerate(plan['pages'],1):
 if p['number']!=expected:errors.append(f'Page order: {p["number"]}')
 if set(p['title'])!=langs:errors.append(f'Title languages: {expected}')
 if not 1<=len(p['rows'])<=3:errors.append(f'Row count: {expected}')
 flattened=[id for row in p['rows'] for id in row]
 if flattened!=[s['id'] for s in p['scenes']]:errors.append(f'Panel order: {expected}')
 ids.extend(flattened);chapters.update(p['sourceSargas'])
 if not p.get('castContract') or not p.get('appearanceContract'):errors.append(f'Missing continuity contract: {expected}')
if len(ids)!=len(set(ids)):errors.append('Duplicate panel ID')
if chapters!=set(range(1,120)):errors.append('Incomplete 119-sarga coverage')
copies={c['id']:c for c in script['copies']}
if set(copies)!=set(ids):errors.append('Copy/scene coverage mismatch')
for c in script['copies']:
 if set(c['text'])!=langs:errors.append(f'Text languages: {c["id"]}')
 if c['mode']!='silent' and not all(c['text'].values()):errors.append(f'Empty text: {c["id"]}')
 if c['mode']=='dialogue' and not c['speaker']:errors.append(f'Missing speaker: {c["id"]}')
 for kind in ['narration','afterNarration']:
  if c.get(kind) and (set(c[kind])!=langs or not all(c[kind].values())):errors.append(f'Bridge languages: {c["id"]}')
review=json.loads((root/'asset-review.json').read_text()) if (root/'asset-review.json').exists() else {'pages':[]}
selected=review.get('pages',[]);hashes=[]
for p in selected:
 file=root/p['file'];raw=file.read_bytes();actual=hashlib.sha256(raw).hexdigest()
 if actual!=p['sha256']:errors.append(f'Asset hash: page {p["page"]}')
 hashes.append(actual)
 w,h=struct.unpack('>II',raw[16:24])
 if [w,h]!=p['dimensions']:errors.append(f'Asset dimensions: page {p["page"]}')
 if set(p['frames'])!=set([s['id'] for s in plan['pages'][p['page']-1]['scenes']]):errors.append(f'Frame coverage: page {p["page"]}')
 for id,frame in p['frames'].items():
  x,y,fw,fh=frame
  if min(x,y)<0 or min(fw,fh)<=0 or x+fw>w or y+fh>h:errors.append(f'Out of bounds: {id}')
if len(hashes)!=len(set(hashes)):errors.append('Duplicate selected page-image hash')
reviewed=sum(p.get('reviewStatus')=='agent-visual-review' for p in selected)
complete=len(selected)==len(plan['pages']) and reviewed==len(plan['pages'])
if args.complete and not complete:errors.append('Whole illustrated preview is not complete/reviewed')
result={'pages':len(plan['pages']),'scenes':len(ids),'sargas':len(chapters),'languages':sorted(langs),'dialogueFrames':sum(c['mode']=='dialogue' for c in script['copies']),'selectedArtPages':len(selected),'agentReviewedArtPages':reviewed,'wholeIllustratedPreviewReady':complete and not errors,'errors':errors,'limits':['Original adaptation/translation drafts; human editorial approval pending','Full independent two-publication passage collation pending','Browser evidence does not establish native integration or delivery']}
if args.output:pathlib.Path(args.output).write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False,indent=2));raise SystemExit(bool(errors))
