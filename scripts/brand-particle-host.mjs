// Native hosting only. The owner-approved fragment remains byte-for-byte intact.
export function wrapApprovedParticles(fragment) {
  const bridge = `<script>(()=>{
    const root=document.getElementById('vedansh-calligraphic-particles');
    let prepared=false,started=false;
    const send=type=>window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({type}));
    window.__vedanshStart=()=>{
      if(!prepared||started)return;
      started=true;
      root.querySelector('canvas').style.visibility='visible';
      root.querySelector('button').click();
    };
    const timer=setInterval(()=>{
      const animation=root.vpAnimation;
      if(!animation||!animation.ready)return;
      if(!prepared){prepared=true;animation.renderAt(0);send('brand-ready');}
      if(started&&animation.elapsed>=3350){clearInterval(timer);send('brand-complete');}
    },32);
    window.addEventListener('pagehide',()=>clearInterval(timer));
  })()</script>`;
  const style = `html,body{margin:0;width:100%;height:100%;background:#fff1d5;overflow:hidden}body{display:flex;align-items:center;justify-content:center}#vedansh-calligraphic-particles{width:100%;max-width:460px}#vedansh-calligraphic-particles .vp-actions{display:none!important}#vedansh-calligraphic-particles canvas{visibility:hidden}#vedansh-calligraphic-particles .vp-stage{max-width:100%}@media(max-height:540px){#vedansh-calligraphic-particles{width:min(100vw,calc(100vh * 12 / 13))}}`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; script-src 'unsafe-inline'; style-src 'unsafe-inline'"><style>${style}</style></head><body>${fragment}${bridge}</body></html>`;
}
