#!/usr/bin/env python3
"""Measure actual ink dividers. Output is a review proposal, never automatic approval."""
import argparse,hashlib,json,pathlib
from PIL import Image,ImageStat,ImageDraw
root=pathlib.Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('--contacts');args=parser.parse_args()
plan=json.loads((root/'page-plan.json').read_text());results=[]

def groups(values,gap=1):
    out=[]
    for n in values:
        if not out or n-out[-1][-1]>gap:out.append([n])
        else:out[-1].append(n)
    return out

def ratio(mask,box):return ImageStat.Stat(mask.crop(box)).mean[0]/255

for page in plan['pages']:
    n=page['number'];files=[root/'assets'/f'page-{n:03}{suffix}.png' for suffix in ['-v4','-v3','-v2','-v1','']]
    file=next((f for f in files if f.exists()),None)
    if not file:continue
    image=Image.open(file).convert('RGB');w,h=image.size
    # Dark straight ink, not a percentage-based crop. The complete original remains untouched.
    channels=image.split();maximum=Image.merge('RGB',channels)
    try:
        import numpy as np
        dark=Image.fromarray((np.asarray(maximum).max(axis=2)<90).astype('uint8')*255)
    except ImportError:
        dark=image.convert('L').point(lambda v:255 if v<65 else 0)
    raw=groups([y for y in range(h) if ratio(dark,(8,y,w-8,y+1))>.88])
    thin=[g for g in raw if len(g)<=12];bars=groups([y for g in thin for y in g],gap=16)
    boundaries=[(g[0],g[-1]) for g in bars]
    result={'page':n,'file':str(file.relative_to(root)),'dimensions':[w,h],'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'frames':{},'candidateHorizontalDividers':boundaries,'reviewStatus':'frame-proposal; visual review required','errors':[]}
    if len(boundaries)!=len(page['rows'])+1:
        result['errors'].append(f"Expected {len(page['rows'])+1} divider bands; measured {len(boundaries)}")
    else:
        for i,row in enumerate(page['rows']):
            top,bottom=boundaries[i][1]+1,boundaries[i+1][0]
            left_ink=groups([x for x in range(0,min(50,w//8)) if ratio(dark,(x,top+8,x+1,bottom-8))>.88])
            right_ink=groups([x for x in range(max(w-50,w*7//8),w) if ratio(dark,(x,top+8,x+1,bottom-8))>.88])
            left_ink=[g for g in left_ink if len(g)<=12];right_ink=[g for g in right_ink if len(g)<=12]
            if not left_ink or not right_ink:
                result['errors'].append(f'Row {i+1}: outer painted boundaries need manual measurement')
                continue
            x0,x1=left_ink[0][-1]+1,right_ink[-1][0]
            if len(row)==1:result['frames'][row[0]]=[x0,top,x1-x0,bottom-top]
            else:
                columns=groups([x for x in range(int(w*.15),int(w*.85)) if ratio(dark,(x,top+8,x+1,bottom-8))>.88],gap=16)
                if len(columns)!=1:result['errors'].append(f'Row {i+1}: expected one vertical divider, measured {len(columns)}')
                else:
                    left,right=columns[0][0],columns[0][-1]
                    result['frames'][row[0]]=[x0,top,left-x0,bottom-top]
                    result['frames'][row[1]]=[right+1,top,x1-right-1,bottom-top]
    results.append(result)
(root/'frame-proposals.json').write_text(json.dumps({'pages':results},ensure_ascii=False,indent=2)+'\n')
print(f'Measured {len(results)} paintings; {sum(bool(r["errors"]) for r in results)} need manual divider repair')
if args.contacts:
    target=pathlib.Path(args.contacts);target.mkdir(parents=True,exist_ok=True)
    for start in range(0,len(results),4):
        batch=results[start:start+4];cw,ch=500,1030;contact=Image.new('RGB',(cw*2,ch*2),'#eee0bd');draw=ImageDraw.Draw(contact)
        for j,p in enumerate(batch):
            im=Image.open(root/p['file']).convert('RGB');overlay=im.copy();paint=ImageDraw.Draw(overlay)
            for id,(x,y,w,h) in p['frames'].items():
                paint.rectangle((x,y,x+w,y+h),outline='#f33158',width=3)
                paint.text((x+8,y+8),id,fill='white',stroke_width=2,stroke_fill='black')
            overlay.thumbnail((cw-10,ch-35));x=(j%2)*cw+(cw-overlay.width)//2;y=(j//2)*ch+28;contact.paste(overlay,(x,y));draw.text(((j%2)*cw+10,(j//2)*ch+8),f'PAGE {p["page"]} / '+('MEASURED' if not p['errors'] else 'FRAME CHECK'),fill='black')
        contact.save(target/f'contact-{start//4+1:02}.png')
    print('Review contacts:',target)
