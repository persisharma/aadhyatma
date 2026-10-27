#!/usr/bin/env python3
"""Print complete ordered corpus meanings for a bounded manual editorial reading."""
import argparse,json,pathlib,re
p=argparse.ArgumentParser();p.add_argument('start',type=int);p.add_argument('end',type=int);p.add_argument('--language',choices=['hi','en'],default='en');a=p.parse_args()
root=pathlib.Path(__file__).resolve().parents[5];verses=json.loads((root/'mobile/src/data/valmiki-ramayan/chapter-03.json').read_text())['verses'];prev=None;refs=[]
for v in verses:
 sarga=int(v['reference'].split('.')[1])
 if not a.start<=sarga<=a.end:continue
 value=v['meaningEn' if a.language=='en' else 'meaningHi'];value=re.split(r'इत्यार्ष|इतयार्ष|इतयार्श|इत्यार्श|Thus ends the',value)[0].strip()
 if value==prev:print(v['reference']+' [same combined meaning as previous printed reference]');continue
 print(v['reference']+' '+value);prev=value
