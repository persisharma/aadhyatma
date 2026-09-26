#!/usr/bin/env bash
# Usage: ./e2e/library-audit/run-ios.sh <dedicated-simulator-UDID> <Release.app>
set -euo pipefail
cd "$(dirname "$0")/../.."
device="${1:?Pass a dedicated audit simulator UDID}"
release_app="${2:?Pass the existing Release simulator app path}"
audit_dir="$(mktemp -d /tmp/vedansh-verse-audit.XXXXXX)"
node e2e/library-audit/prepare.mjs
cp -R "$release_app" "$audit_dir/VerseAudit.app"
npx expo export:embed --entry-file e2e/library-audit/index.jsx --platform ios --dev false \
  --bundle-output "$audit_dir/VerseAudit.app/main.jsbundle" \
  --assets-dest "$audit_dir/VerseAudit.app" --max-workers 2
/usr/libexec/PlistBuddy -c "Set :EXUpdatesEnabled false" "$audit_dir/VerseAudit.app/Expo.plist"
codesign --force --deep --sign - "$audit_dir/VerseAudit.app"
xcrun simctl bootstatus "$device" -b
# Expo Updates caches the embedded bundle by manifest ID. Clear the audit app
# before installing a different test bundle under that same native manifest.
xcrun simctl uninstall "$device" com.prashantsharma.vedansh 2>/dev/null || true
xcrun simctl install "$device" "$audit_dir/VerseAudit.app"
xcrun simctl launch "$device" com.prashantsharma.vedansh
container="$(xcrun simctl get_app_container "$device" com.prashantsharma.vedansh data)"
python3 - "$container/Documents/library-audit.json" "$audit_dir" <<'PY'
import json,pathlib,sys,time
report=pathlib.Path(sys.argv[1]); out=pathlib.Path(sys.argv[2]); deadline=time.time()+10800
previous=None
last_change=time.time()
while time.time()<deadline:
 try:
  data=json.loads(report.read_text())
 except (FileNotFoundError,json.JSONDecodeError):
  if time.time()-last_change>90:raise SystemExit("FAIL: no readable native audit progress within 90 seconds")
  time.sleep(1);continue
 state=(data['status'],data['verses'],data['renders'],len(data['failures']))
 if state!=previous:
  print('status=%s verses=%s renders=%s failures=%s'%state,flush=True);previous=state;last_change=time.time()
 if data['status']!='running':
  (out/'library-audit.json').write_text(json.dumps(data,indent=2))
  assert data['status']=='passed',data['failures']
  assert not data.get('config'),'A diagnostic subset cannot certify the full audit'
  assert data['verses']==25395 and data['renders']==101580,state
  assert len(data['documents'])==114
  for doc in data['documents']:
   assert doc['checked']==doc['expected'] and all(n==doc['expected'] for n in doc['renders'].values()),doc
  print('PASS. Evidence: '+str(out/'library-audit.json'));sys.exit(0)
 if time.time()-last_change>90:
  current=report.with_name('library-audit-current.json')
  if current.exists():(out/current.name).write_bytes(current.read_bytes())
  raise SystemExit('FAIL: native audit stalled; inspect library-audit-current.json and simulator crash logs')
 time.sleep(10)
raise SystemExit('FAIL: native audit did not finish within 3 hours')
PY
