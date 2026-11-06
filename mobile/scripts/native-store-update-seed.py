#!/usr/bin/env python3
"""Seed/read the actual native AsyncStorage backend while the test app is stopped."""
import argparse, datetime, json, os, pathlib, re, sqlite3, subprocess, time
p=argparse.ArgumentParser(); p.add_argument('platform',choices=['ios','android']); p.add_argument('device'); p.add_argument('action',choices=['seed','read']); p.add_argument('--lang',default='en'); p.add_argument('--size',default='M'); p.add_argument('--state',choices=['due','recent','expired','used'],default='due'); a=p.parse_args()
app='com.prashantsharma.vedansh'; out=pathlib.Path(os.environ.get('GITHUB_WORKSPACE','..'))/'native-update-output'; out.mkdir(parents=True,exist_ok=True)
def run(*args): return subprocess.check_output(args,text=True).strip()
if a.platform=='ios':
 subprocess.run(['xcrun','simctl','terminate',a.device,app],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
 container=pathlib.Path(run('xcrun','simctl','get_app_container',a.device,app,'data'))
 db=container/'Library/Application Support'/app/'RCTAsyncLocalStorage_V1/manifest.json'
else:
 subprocess.run(['adb','-s',a.device,'shell','am','force-stop',app],check=True)
 db=out/'RKStorage'
 if a.action=='read':
  subprocess.run(['adb','-s',a.device,'pull',f'/data/data/{app}/databases/RKStorage',str(db)],check=True,stdout=subprocess.DEVNULL)
if a.action=='read':
 if a.platform=='ios': values=json.loads(db.read_text())
 else:
  with sqlite3.connect(db) as conn: values=dict(conn.execute('select key,value from catalystLocalStorage'))
 raw=values.get('@vedansh/store-update-1.5.4'); stamp=json.loads(raw) if raw is not None else None
 # Reading is used only after a real positive display: a seed cannot satisfy it.
 assert isinstance(stamp,(int,float)) and abs(time.time()*1000-stamp)<120000, ('No newly persisted native shown stamp',stamp)
 print(json.dumps({'nativeShownAt':stamp,'verifiedAt':time.time()*1000,'storage':'ios-manifest' if a.platform=='ios' else 'android-sqlite'})); raise SystemExit(0)
now=int(time.time()*1000); day=datetime.datetime.now().strftime('%Y-%m-%d')
version=re.search(r"APP_TOUR_VERSION\s*=\s*'([^']+)'",pathlib.Path('src/data/tour/whatsNew.ts').read_text()).group(1)
values={
 '@vedansh/language':a.lang,'@vedansh/regionalLanguage':'hi' if a.lang=='en' else a.lang,'@vedansh/font-scale':a.size,
 '@vedansh/onboarding-phase':'done','@vedansh/tour-completed-v':version,'@vedansh/onboarding-setup-v':version,'@vedansh/whats-new-seen-v':version,
 '@vedansh/launch-asks-v1':json.dumps({'firstDay':'2026-01-01','lastDay':day if a.state=='used' else None,'lastReminderDay':None,'declines':3,'stopped':True}),
 '@vedansh/daily-bhakti-nudge':json.dumps({'reminderDismissedAt':now,'widgetDismissedAt':now,'widgetAddedAt':None,'panchangAddedAt':None}),
 '@vedansh/notif-prefs':json.dumps({'dailyVerseEnabled':False,'vratEnabled':False}),
 '@vedansh/notif-meta':json.dumps({'appOpenCount':0,'optedOutAt':now,'lastDeclinedAt':now}),
 '@vedansh/explore-sheet-v1':json.dumps({'version':1,'enabled':True,'createdAt':now,'visited':[],'shown':[],'declined':{},'streak':0,'sleepUntil':now+86400000}),
}
if a.state in ['recent','expired']: values['@vedansh/store-update-1.5.4']=json.dumps(now-(71 if a.state=='recent' else 73)*3600000)
if a.platform=='ios': db.parent.mkdir(parents=True,exist_ok=True); db.write_text(json.dumps(values,ensure_ascii=False))
else:
 if db.exists(): db.unlink()
 with sqlite3.connect(db) as conn:
  conn.execute('CREATE TABLE catalystLocalStorage (key TEXT PRIMARY KEY, value TEXT NOT NULL)'); conn.execute('PRAGMA user_version=1'); conn.executemany('INSERT INTO catalystLocalStorage VALUES (?,?)',values.items())
 uid=run('adb','-s',a.device,'shell','stat','-c','%u',f'/data/data/{app}')
 dest=f'/data/data/{app}/databases'
 subprocess.run(['adb','-s',a.device,'shell',f'mkdir -p {dest}; rm -f {dest}/RKStorage*'],check=True)
 subprocess.run(['adb','-s',a.device,'push',str(db),dest+'/RKStorage'],check=True,stdout=subprocess.DEVNULL)
 subprocess.run(['adb','-s',a.device,'shell',f'chown -R {uid}:{uid} {dest}; chmod 770 {dest}; chmod 660 {dest}/RKStorage; restorecon -R {dest}'],check=True)
(out/f'seed-{a.platform}-{a.lang}-{a.size}-{a.state}.json').write_text(json.dumps({'fixtureOnly':True,'state':a.state,'timestamp':now,'values':values},ensure_ascii=False,indent=2))
