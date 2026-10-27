#!/usr/bin/env python3
"""Cache source-publication evidence for editorial review; downloads are not sign-off."""
import argparse,concurrent.futures,datetime,hashlib,json,pathlib,re,subprocess
from html.parser import HTMLParser
class Text(HTMLParser):
 def __init__(self):super().__init__();self.parts=[];self.hidden=0;self.links=[]
 def handle_starttag(self,t,a):
  if t in ('script','style'):self.hidden+=1
  if t=='a':self.links.extend(v for k,v in a if k=='href')
  if t in ('p','div','br','h1','h2','h3','h4','article'):self.parts.append('\n')
 def handle_endtag(self,t):
  if t in ('script','style'):self.hidden=max(0,self.hidden-1)
  if t in ('p','div','article'):self.parts.append('\n')
 def handle_data(self,s):
  if not self.hidden:self.parts.append(s)
def get(url,dest):
 run=subprocess.run(['curl','--fail','--silent','--show-error','--location','--max-time','35','-A','Mozilla/5.0',url,'-o',str(dest)],capture_output=True,text=True)
 return run
if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('--cache',required=True);ap.add_argument('--manifest',required=True);a=ap.parse_args();cache=pathlib.Path(a.cache);cache.mkdir(parents=True,exist_ok=True)
 idx=cache/'hi-index.html';url='https://www.ramcharit.in/valmiki-ramayana-aranya-kanda-in-hindi-sanskrit-complete-pdf/';run=get(url,idx);hindi={}
 if run.returncode==0:
  parser=Text();parser.feed(idx.read_text(errors='replace'))
  for link in parser.links:
   m=re.search(r'aranyakanda-sarga-chapter-(\d+)-',link)
   if m:hindi[int(m[1])]=link
 def fetch(pair):
  lang,n=pair;url=f'https://www.valmikiramayan.net/utf8/aranya/sarga{n}/aranya_{n}_prose.htm' if lang=='en' else hindi.get(n,f'https://www.ramcharit.in/valmiki-ramayana-aranyakanda-sarga-chapter-{n}-slokas-with-hindi-meaning/');dest=cache/f'{lang}-{n:03}.html';run=get(url,dest)
  row={'language':lang,'sarga':n,'url':url,'retrievedOn':datetime.date.today().isoformat(),'status':'unavailable','cacheFile':dest.name}
  if run.returncode:row['error']=run.stderr.strip();return row
  raw=dest.read_bytes();parser=Text();parser.feed(raw.decode('utf-8-sig','replace'));text='\n'.join(' '.join(x.split()) for x in ''.join(parser.parts).splitlines() if x.strip());(cache/f'{lang}-{n:03}.txt').write_text(text);row.update(status='retrieved; editorial comparison pending',sha256=hashlib.sha256(raw).hexdigest(),bytes=len(raw));return row
 with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:rows=list(pool.map(fetch,[(l,n) for n in range(1,76) for l in ['en','hi']]))
 pathlib.Path(a.manifest).write_text(json.dumps({'scope':'source access evidence only','retrievedOn':'2026-10-27','publications':rows},ensure_ascii=False,indent=2)+'\n');print('Retrieved',sum(x['status'].startswith('retrieved') for x in rows),'of',len(rows),'publication chapters; Hindi links inventoried',len(hindi));print('Unavailable',[(x['language'],x['sarga']) for x in rows if x['status']=='unavailable'])
