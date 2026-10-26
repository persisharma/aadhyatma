#!/usr/bin/env python3
"""Build the local review wall from the authored script and selected artwork."""
import hashlib,json,pathlib,re
root=pathlib.Path(__file__).resolve().parents[1]
plan=json.loads((root/'page-plan.json').read_text());script=json.loads((root/'script.json').read_text())
copies={c['id']:c for c in script['copies']}
review=json.loads((root/'asset-review.json').read_text()) if (root/'asset-review.json').exists() else {'pages':[]}
art={p['page']:p for p in review['pages']}
pages=[]
for p in plan['pages']:
    selected=art.get(p['number']);scenes={s['id']:s for s in p['scenes']};rows=[]
    for row in p['rows']:
        items=[]
        for id in row:
            item={**copies[id], 'source':scenes[id]['source']}
            if selected:
                item['art']={'url':selected['file'],'dimensions':selected['dimensions'],'frame':selected['frames'][id],'zone':selected.get('zones',{}).get(id)}
            items.append(item)
        rows.append(items)
    pages.append({'number':p['number'],'id':p['id'],'title':p['title'],'sourceSargas':p['sourceSargas'],'rows':rows,'illustrated':bool(selected),'artReview':selected.get('reviewStatus') if selected else None})
out={'title':{'hi':'अयोध्याकाण्ड','en':'Ayodhyakanda','gu':'અયોધ્યાકાંડ','kn':'ಅಯೋಧ್ಯಾಕಾಂಡ'},'pages':pages,'sceneCount':sum(len(row) for p in pages for row in p['rows']),'selectedArtPages':len(art),'reviewedArtPages':sum(a.get('reviewStatus')=='agent-visual-review' for a in art.values()),'status':'preview draft; review before integration'}
(root/'preview-book.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
# Content versions keep a review reload from mixing old lettering code with a new book.
html=(root/'index.html').read_text()
for name,attribute in [('gallery.js','src'),('gallery.css','href')]:
 version=hashlib.sha256((root/name).read_bytes()).hexdigest()[:12]
 html=re.sub(attribute+'="'+re.escape(name)+r'(?:\?[^"]*)?"',attribute+'="'+name+'?v='+version+'"',html)
version=hashlib.sha256((root/'preview-book.json').read_bytes()).hexdigest()[:12]
html=re.sub(r' data-book-version="[^"]*"','',html)
html=html.replace('<body ','<body data-book-version="'+version+'" ',1)
(root/'index.html').write_text(html)
print(f"Built {len(pages)} review pages; {len(art)} selected paintings")
