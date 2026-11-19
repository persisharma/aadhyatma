from pathlib import Path
import subprocess,json,re,base64,io
from PIL import Image
from fontTools.ttLib import TTFont
from fontTools import subset
root=Path(__file__).resolve().parents[3]
visual=root/'mobile/visual/sanatan'
topics=json.loads((root/'mobile/src/data/sanatan-parichay/content.json').read_text())['topics']
data={};all_css=[]
for t in topics:
 data[t['id']]={}
 for before in [True,False]:
  result=subprocess.run(['node',str(visual/'dist/comparison.cjs'),f'?topic={t["id"]}&lang=hi&page=1&before={int(before)}&width=360'],capture_output=True,text=True,check=True)
  row=json.loads(result.stdout)
  data[t['id']]['before' if before else 'after']=row['html']
  all_css.append(row['css'])
# Scope native generated stylesheet; no global body/html resets in the conversation.
rules={}
for css in all_css:
 for selector,body in re.findall(r'([^{}]+)\{([^{}]*)\}',css):
  selector=selector.strip()
  if not selector or selector.startswith('[stylesheet-') or 'html' in selector or selector=='body':continue
  scoped=','.join('#sanatan-review .native-content '+s.strip() for s in selector.split(','))
  rules[scoped]=body
css='\n'.join(k+'{'+v+'}' for k,v in rules.items())
all_html=''.join(v for d in data.values() for v in d.values())
assets={}
for name in set(re.findall(r'/assets/[^\s\)"&<>]+',all_html)):
 p=visual/'dist'/name.lstrip('/')
 if not p.exists():raise Exception(name)
 img=Image.open(p).convert('RGB');img.thumbnail((680,450))
 b=io.BytesIO();img.save(b,format='WEBP',quality=78,method=6)
 assets[name]='data:image/webp;base64,'+base64.b64encode(b.getvalue()).decode()
# Only the actual subset of both production Devanagari weights is embedded.
fonts=''
for family in ['NotoSerifDevanagari_500Medium','NotoSerifDevanagari_600SemiBold']:
 font=TTFont(visual/'dist/fonts'/f'{family}.ttf')
 opts=subset.Options();opts.flavor='woff';opts.notdef_outline=True
 sub=subset.Subsetter(options=opts);sub.populate(text=all_html);sub.subset(font)
 font.flavor='woff';out=io.BytesIO();font.save(out)
 fonts+="@font-face{font-family:'"+family+"';src:url('data:font/woff;base64,"+base64.b64encode(out.getvalue()).decode()+"') format('woff');font-display:swap}\n"
# Mark inert native actions as content-only: the review controls are functional.
for d in data.values():
 for phase,h in d.items():
  h=re.sub(r' tabindex="0"','',h)
  h=h.replace('role="button"','role="button" aria-disabled="true"')
  d[phase]=h
(visual/'dist/comparison-data.json').write_text(json.dumps({'lessons':[{ 'id':t['id'],'label':t['title'][0]} for t in topics],'data':data,'assets':assets},ensure_ascii=False,separators=(',',':')))
(visual/'dist/comparison-fonts.css').write_text(fonts+css)
print(json.dumps({'html_chars':len(all_html),'assets':len(assets),'asset_chars':sum(map(len,assets.values())),'font_css':len(fonts+css)}))

# Optional conversation preview path; never changes app assets/manifests.
import sys
if len(sys.argv)>1:
 output=Path(sys.argv[1])
 markup=(visual/'comparison-template.html').read_text()
 markup=markup.replace('/* NATIVE_STYLES */',(visual/'dist/comparison-fonts.css').read_text()).replace('REVIEW_DATA',(visual/'dist/comparison-data.json').read_text().replace('</script','<\\/script'))
 output.write_text(markup)
 assert output.stat().st_size<1000000
 print(f'Wrote {output.stat().st_size} byte component comparison')
