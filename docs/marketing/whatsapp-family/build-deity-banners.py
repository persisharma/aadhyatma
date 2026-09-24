"""Build the three deity-background WhatsApp banners (1080x1350, Hindi + English).

Usage: python3 build-deity-banners.py  -> writes banner-<id>.html next to this file.
Render each with Playwright at 1080x1350, deviceScaleFactor 2.
Background plates are the app's own bundled sketches (mobile/assets/backgrounds).
"""
import base64, pathlib

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[2]
BG = ROOT / "mobile/assets/backgrounds"
ICON = base64.b64encode((ROOT / "mobile/assets/icon.png").read_bytes()).decode()

VARIANTS = [
    ("ram-darbar", "deity-rama-darbar.webp", "जय श्री राम", "Jai Shri Ram"),
    ("salasar-balaji", "theerth-salasar-balaji.webp", "जय श्री सालासर बालाजी", "Jai Shri Salasar Balaji"),
    ("khatu-shyam", "theerth-khatu-shyam.webp", "जय श्री श्याम", "Jai Shri Shyam"),
]

TILES = [
    ("पा", "पाठ", "Path", "गीता, सुंदरकांड, हनुमान चालीसा, आरती", "Gita, Sundarkand, Chalisa, Aarti"),
    ("जप", "जप माला", "Japa", "माला गिनती और मंत्र", "Mala counter & mantras"),
    ("पं", "पंचांग", "Panchang", "तिथि, व्रत-त्योहार, शुभ मुहूर्त", "Tithi, vrat, festivals, muhurat"),
    ("रा", "कुंडली, राशिफल", "Kundali", "रोज़ का राशिफल, गुण मिलान", "Daily rashifal, Guna Milan"),
    ("भ", "भजन सुनें", "Bhajan", "भजन, मंत्र और पाठ सुनें", "Listen to bhajans & paath"),
    ("पू", "रोज़ की पूजा", "Daily Puja", "अपनी पूजा की दिनचर्या", "Your daily puja routine"),
    ("ती", "तीर्थ", "Pilgrimage", "ज्योतिर्लिंग, चार धाम", "Jyotirlingas, Char Dham"),
    ("वि", "पूजा विधि", "Puja Vidhi", "त्योहार की पूजा, भोग, कथा", "Festival puja, bhog, katha"),
]

CSS = """
:root { --ink:#1A0E03; --ink-soft:#5A3A1E; --ink-muted:#6E5230; --saffron:#B8621B; --saffron-deep:#8A3E0B; --gold:#A67C34; --divider:rgba(138,62,11,0.20); }
* { margin:0; padding:0; box-sizing:border-box; }
html, body { width:1080px; height:1350px; overflow:hidden; }
body { font-family:'Noto Serif Devanagari', serif; color:var(--ink); background:#F1E3BF; position:relative; }
.lat { font-family:'Cormorant Garamond', serif; font-weight:600; }
.plate { position:absolute; left:50%; top:-24px; width:840px; height:840px; transform:translateX(-50%);
  background-size:cover; background-position:center top;
  -webkit-mask-image: radial-gradient(ellipse 48% 44% at 50% 38%, #000 62%, transparent 100%);
          mask-image: radial-gradient(ellipse 48% 44% at 50% 38%, #000 62%, transparent 100%); }
.fade { position:absolute; left:0; right:0; top:380px; height:460px; background:linear-gradient(180deg, rgba(241,227,191,0) 0%, #F1E3BF 38%, #F1E3BF 100%); }
.frame { position:absolute; inset:22px; border:1.5px solid var(--divider); border-radius:10px; pointer-events:none; }
.frame::after { content:''; position:absolute; inset:8px; border:1px solid rgba(138,62,11,0.10); border-radius:6px; }
.jai { position:absolute; top:452px; left:0; right:0; text-align:center; }
.jai .hi { display:inline-block; padding:6px 30px 8px; border-radius:999px; background:rgba(138,62,11,0.88); color:#FFF5E0; font-size:32px; font-weight:700; box-shadow:0 6px 18px rgba(90,58,30,0.30); }
.jai .en { font-family:'Cormorant Garamond', serif; font-weight:600; font-size:28px; color:#F8E3B8; font-style:italic; margin-left:6px; }
.wrap { position:absolute; left:0; right:0; top:536px; bottom:0; padding:0 60px 40px; display:flex; flex-direction:column; }
.brand { display:flex; align-items:center; justify-content:center; gap:22px; }
.icon { width:76px; height:76px; border-radius:18px; box-shadow:0 8px 22px rgba(90,58,30,0.26); border:1px solid rgba(138,62,11,0.25); }
.wordmark { display:flex; align-items:center; gap:10px; }
.om { width:36px; height:36px; border:2px solid var(--saffron); border-radius:50%; display:grid; place-items:center; font-size:20px; color:var(--saffron-deep); }
.name { font-size:42px; font-weight:700; line-height:1; padding-top:6px; }
.sub { font-size:22px; color:var(--saffron-deep); font-weight:600; margin-top:4px; }
.sube { font-size:21px; color:var(--ink-muted); }
.head { text-align:center; margin-top:10px; white-space:nowrap; }
.head h1 { display:inline; font-size:32px; font-weight:700; line-height:1.3; }
.head h1 span { color:var(--saffron); }
.head .en { display:inline; font-size:27px; font-style:italic; color:var(--ink-soft); margin-left:10px; }
.grid { margin-top:14px; display:grid; grid-template-columns:1fr 1fr; grid-template-rows:repeat(4, 104px); gap:10px; }
.item { display:flex; align-items:center; gap:14px; padding:8px 16px; border-radius:16px; border:1px solid var(--divider); background:linear-gradient(180deg,rgba(255,250,235,0.96),rgba(248,239,214,0.96)); box-shadow:0 2px 6px rgba(90,58,30,0.08); }
.dot { flex:none; width:48px; height:48px; border-radius:13px; display:grid; place-items:center; background:linear-gradient(160deg,#F8D291,#E0A255); color:#fff; font-size:23px; font-weight:700; text-shadow:0 1px 2px rgba(90,58,30,0.35); }
.t { font-size:24px; font-weight:700; line-height:1.45; }
.t .en { font-family:'Cormorant Garamond', serif; font-weight:600; font-size:22px; color:var(--saffron-deep); margin-left:6px; }
.s { font-size:18px; color:var(--ink-soft); line-height:1.4; }
.se { font-family:'Cormorant Garamond', serif; font-weight:600; font-size:19px; color:var(--ink-muted); line-height:1.25; }
.cta { margin-top:auto; padding-top:12px; text-align:center; }
.free { font-size:20px; color:var(--ink-muted); font-weight:600; }
.btn { display:inline-block; margin-top:8px; padding:11px 32px; border-radius:16px; background:linear-gradient(135deg,var(--saffron),var(--saffron-deep)); color:#FFF5E0; font-size:32px; font-weight:700; box-shadow:0 8px 22px rgba(138,62,11,0.32); }
.btn .en { font-family:'Cormorant Garamond', serif; font-size:30px; font-weight:700; }
.link { margin-top:8px; font-size:27px; color:var(--saffron-deep); letter-spacing:.5px; }
"""

def tile(d, hi, en, shi, sen):
    return (f'<div class="item"><div class="dot">{d}</div><div><div class="t">{hi}<span class="en">{en}</span></div>'
            f'<div class="s">{shi}</div><div class="se">{sen}</div></div></div>')

def page(vid, plate, jai_hi, jai_en):
    img = base64.b64encode((BG / plate).read_bytes()).decode()
    tiles = "\n      ".join(tile(*t) for t in TILES)
    return f"""<!DOCTYPE html>
<html lang="hi"><head><meta charset="utf-8">
<title>Vedansh — WhatsApp banner, {jai_en} (1080×1350)</title>
<style>{CSS}</style></head>
<body>
  <div class="plate" style="background-image:url(data:image/webp;base64,{img})"></div>
  <div class="fade"></div>
  <div class="frame"></div>
  <div class="jai"><div class="hi">॥ {jai_hi} ॥ <span class="en">{jai_en}</span></div></div>
  <div class="wrap">
    <div class="brand">
      <img class="icon" src="data:image/png;base64,{ICON}" alt="">
      <div>
        <div class="wordmark"><span class="om">ॐ</span><span class="name">वेदांश़</span><span class="om">ॐ</span></div>
        <div class="sub">पूजा-पाठ का साथी · <span class="lat" style="font-size:22px">Your puja companion</span></div>
      </div>
    </div>
    <div class="head"><h1>पूरी भक्ति, <span>एक ही ऐप में</span></h1><div class="en lat">Complete bhakti in one app</div></div>
    <div class="grid">
      {tiles}
    </div>
    <div class="cta">
      <div class="free">मुफ़्त · बिना इंटरनेट के भी चलता है · <span class="lat" style="font-size:22px">Free · Works offline</span></div>
      <div class="btn">अभी डाउनलोड करें · <span class="en">Download Now</span></div>
      <div class="link lat">persisharma.github.io/get-vedansh</div>
    </div>
  </div>
</body></html>
"""

for vid, plate, hi, en in VARIANTS:
    (HERE / f"banner-{vid}.html").write_text(page(vid, plate, hi, en), encoding="utf-8")
    print(f"banner-{vid}.html")
