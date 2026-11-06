#!/usr/bin/env python3
"""One XCTest session; a loopback-only host helper prepares real simulator storage."""
import argparse, http.server, json, os, pathlib, shutil, signal, subprocess, sys, threading

APP = 'com.prashantsharma.vedansh'
DRIVER = 'dev.mobile.maestro-driver-iosUITests.xctrunner'

def commands(port, profile, system):
    steps = [{'runFlow': {'file': 'brand-driver-check.yaml'}}]
    expected, images = [], []
    version = '1.5.3'
    def request(action, **params):
        steps.append({'runScript': {'file': '../scripts/native-store-update-request.js', 'env': {
            'REQUEST_URL': f'http://127.0.0.1:{port}/{action}',
            'REQUEST_JSON': json.dumps(params),
        }}})
    def seed(state='due', lang='en', size='M'):
        request('seed', state=state, lang=lang, size=size)
    def case(name, flow):
        capture=f'update-ios-{version}-{profile}-{name}'
        steps.append({'runFlow': {'file': f'store-update-native-{flow}.yaml', 'env': {'CAPTURE': capture}}})
        label=f'{version}/{name}';expected.append(label)
        images.append(capture+'.png')
        if flow=='visible': images.append(capture+'-body.png')
        request('passed', case=label)
    seed();case('first-display','visible');request('read', name='persisted-shown')
    case('later-cold-restart','hidden')
    seed('recent');case('cooldown-71-hours','hidden')
    seed('expired');case('cooldown-73-hours','visible')
    seed('used');case('shared-daily-slot','hidden')
    seed();case('background-resume-dismiss','lifecycle');request('read',name='lifecycle-persisted-shown')
    case('lifecycle-cold-restart','hidden')
    request('system',size=system)
    for lang in ['hi','en','gu','kn']:
        for size in ['M','L']:
            seed(lang=lang,size=size);case(f'{lang}-{size}-{system}','visible')
    request('system',size='standard');seed();case('store-handoff','handoff');case('store-return','return')
    version='1.5.4';request('install',version=version);seed();case('native-cutoff','hidden')
    return steps, expected, images

def main():
    p=argparse.ArgumentParser();p.add_argument('device');p.add_argument('profile',choices=['compact','wide']);p.add_argument('system',choices=['standard','enlarged']);p.add_argument('fixtures',type=pathlib.Path);a=p.parse_args()
    out=pathlib.Path(os.environ['GITHUB_WORKSPACE'])/'native-update-output';out.mkdir(exist_ok=True)
    completed=[];state={'version':'1.5.3','started':False};expected=[]
    def run(args):
        result=subprocess.run(args,check=True,capture_output=True,text=True,timeout=120)
        return result.stdout
    class Handler(http.server.BaseHTTPRequestHandler):
        def log_message(self,*args): pass
        def do_POST(self):
            try:
                if self.client_address[0]!='127.0.0.1': raise ValueError('Loopback required')
                length=int(self.headers.get('Content-Length','0'))
                if not 0<length<4096: raise ValueError('Invalid request size')
                data=json.loads(self.rfile.read(length));target=out/f'ios-{state["version"]}-{a.profile}';target.mkdir(exist_ok=True)
                if self.path=='/seed':
                    if data.get('state') not in ['due','recent','expired','used'] or data.get('lang') not in ['hi','en','gu','kn'] or data.get('size') not in ['M','L']: raise ValueError('Invalid fixture')
                    state['started']=True
                    run([sys.executable,'scripts/native-store-update-seed.py','ios',a.device,'seed','--state',data['state'],'--lang',data['lang'],'--size',data['size']])
                elif self.path=='/read':
                    if data.get('name') not in ['persisted-shown','lifecycle-persisted-shown']: raise ValueError('Invalid read')
                    raw=run([sys.executable,'scripts/native-store-update-seed.py','ios',a.device,'read']);json.loads(raw)
                    (target/(data['name']+'.json')).write_text(raw)
                elif self.path=='/system':
                    category={'standard':'large','enlarged':'accessibility-extra-large'}[data['size']]
                    run(['xcrun','simctl','ui',a.device,'content_size',category])
                elif self.path=='/install':
                    if data.get('version')!='1.5.4': raise ValueError('Invalid runtime fixture')
                    subprocess.run(['xcrun','simctl','terminate',a.device,APP],capture_output=True)
                    app=a.fixtures/'1.5.4'/'Vedansh.app'
                    if not app.is_dir(): raise ValueError('Missing verified native fixture')
                    run(['xcrun','simctl','install',a.device,str(app)]);state['version']='1.5.4'
                elif self.path=='/passed':
                    if len(completed)>=len(expected) or data.get('case')!=expected[len(completed)]: raise ValueError('Unexpected scenario completion')
                    completed.append(data['case']);(out/'executed-cases.json').write_text(json.dumps(completed,indent=2))
                    print('PASS native scenario: '+data['case'],flush=True)
                else: raise ValueError('Unknown fixture action')
                body=json.dumps({'ok':True}).encode();self.send_response(200)
            except Exception as e:
                detail=str(e)
                if isinstance(e,subprocess.CalledProcessError):detail+=' '+e.stderr[-2000:]
                body=json.dumps({'error':detail}).encode();self.send_response(500)
            self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body)
    server=http.server.ThreadingHTTPServer(('127.0.0.1',0),Handler)
    thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
    steps,expected,images=commands(server.server_port,a.profile,a.system)
    (out/'expected-cases.json').write_text(json.dumps(expected,indent=2))
    flow=pathlib.Path('.maestro/store-update-native-session.generated.yaml')
    flow.write_text(json.dumps({'appId':APP})+'\n---\n'+json.dumps(steps,ensure_ascii=False,indent=2)+'\n')
    shutil.copy2(flow,out/'session-plan.yaml')
    cli=['maestro','--device',a.device,'test','--config','.maestro/config.yaml','--format','junit','--output',str(out/'ios-session.xml'),str(flow)]
    try:
        for attempt in range(1,4):
            result=subprocess.run(cli,capture_output=True,text=True,timeout=75*60)
            log=result.stdout+result.stderr;(out/f'ios-session-attempt-{attempt}.log').write_text(log);print(log,flush=True)
            if result.returncode==0: break
            # Initial XCTest launch only. A product assertion can never trigger a retry.
            if attempt==3 or state['started'] or completed or 'IOSDriverTimeoutException' not in log or (out/'ios-session.xml').exists():
                raise SystemExit(result.returncode)
            print('Retrying initial XCTest startup before any scenario executed',flush=True)
            for line in run(['ps','-axo','pid=,command=']).splitlines():
                parts=line.strip().split(None,1)
                if len(parts)==2 and 'xcodebuild' in parts[1] and 'maestro' in parts[1] and a.device in parts[1]:
                    try:os.kill(int(parts[0]),signal.SIGTERM)
                    except ProcessLookupError:pass
            subprocess.run(['xcrun','simctl','terminate',a.device,DRIVER],capture_output=True)
            subprocess.run(['xcrun','simctl','uninstall',a.device,DRIVER],capture_output=True)
            run(['xcrun','simctl','launch',a.device,'com.apple.Preferences'])
        if completed!=expected: raise SystemExit('Native scenario completion mismatch')
        shots={p.name:p for p in (pathlib.Path.home()/'.maestro/tests').rglob(f'update-ios-*-{a.profile}-*.png')}
        missing=set(images)-shots.keys()
        if missing: raise SystemExit('Missing native screenshots: '+str(sorted(missing)))
        for name in images:
            version='1.5.4' if name.startswith('update-ios-1.5.4-') else '1.5.3'
            target=out/f'ios-{version}-{a.profile}';target.mkdir(exist_ok=True);shutil.copy2(shots[name],target/name)
        (out/'ios-result.txt').write_text(f'PASS: iOS {a.profile}/{a.system}; {len(completed)} native scenarios, aggregate JUnit and {len(images)} screenshots.\n')
    finally:server.shutdown();server.server_close()

if __name__=='__main__':main()
