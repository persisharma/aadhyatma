#!/usr/bin/env python3
"""Fetch publication evidence into a separate review cache, not the app or Git."""
import argparse, concurrent.futures, datetime, hashlib, json, pathlib, re, subprocess
from html.parser import HTMLParser

class Text(HTMLParser):
    def __init__(self): super().__init__(); self.parts=[]; self.hidden=0
    def handle_starttag(self,tag,attrs):
        if tag in ('script','style'): self.hidden+=1
        elif tag in ('p','div','br','h1','h2','h3','h4'): self.parts.append('\n')
    def handle_endtag(self,tag):
        if tag in ('script','style'): self.hidden=max(0,self.hidden-1)
        elif tag in ('p','div','h1','h2','h3','h4'): self.parts.append('\n')
    def handle_data(self,data):
        if not self.hidden:self.parts.append(data)

def fetch(sarga):
    url=f'https://www.valmikiramayan.net/utf8/ayodhya/sarga{sarga}/ayodhya_{sarga}_prose.htm'
    dest=cache/f'en-{sarga:03}.html'
    run=subprocess.run(['curl','--fail','--silent','--show-error','--location','--max-time','35','-A','Mozilla/5.0',url,'-o',str(dest)],capture_output=True,text=True)
    evidence={'sarga':sarga,'language':'en','url':url,'retrievedOn':'2026-10-20','cachePath':str(dest),'status':'unavailable'}
    if run.returncode:
        evidence['error']=run.stderr.strip();return evidence
    raw=dest.read_bytes();parser=Text();parser.feed(raw.decode('utf-8-sig','replace'))
    text='\n'.join(' '.join(x.split()) for x in ''.join(parser.parts).splitlines() if x.strip())
    (cache/f'en-{sarga:03}.txt').write_text(text)
    evidence.update(status='retrieved; complete editorial collation pending',sha256=hashlib.sha256(raw).hexdigest(),bytes=len(raw))
    match=re.search(r'Sarga\s+'+str(sarga)+r'\s*\n(.*?)\n- - -',text,re.S)
    summary=' '.join(match.group(1).split()) if match else ''
    if summary:(cache/f'en-{sarga:03}-summary.txt').write_text(summary)
    evidence['hasSynopsis']=bool(summary)
    return evidence

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--cache',required=True);parser.add_argument('--manifest',required=True);args=parser.parse_args()
    cache=pathlib.Path(args.cache).resolve();cache.mkdir(parents=True,exist_ok=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        rows=list(pool.map(fetch,range(1,120)))
    pathlib.Path(args.manifest).write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
    print('Fetched',sum(x['status'].startswith('retrieved') for x in rows),'of 119; synopses',sum(x.get('hasSynopsis',False) for x in rows))
    for x in rows:
        if x['status']=='unavailable': print(x['sarga'],x.get('error'))
