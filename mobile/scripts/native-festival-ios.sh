#!/usr/bin/env bash
set -Eeuo pipefail
FESTIVAL_ROOT=$(git rev-parse --show-toplevel)
FESTIVAL_OUTPUT="$FESTIVAL_ROOT/native-festival-output"
FESTIVAL_DERIVED="${RUNNER_TEMP:-/tmp}/vedansh-festival-derived"
mkdir -p "$FESTIVAL_OUTPUT" e2e-shots
printf 'PENDING: native matrix has not completed.\n' > "$FESTIVAL_OUTPUT/result.txt"
git rev-parse HEAD > "$FESTIVAL_OUTPUT/tested-head.txt"
xcodebuild -version > "$FESTIVAL_OUTPUT/toolchain.txt"
maestro --version >> "$FESTIVAL_OUTPUT/toolchain.txt"
xcrun simctl list devices available --json > "$FESTIVAL_OUTPUT/simulators.json"
python3 - "$FESTIVAL_OUTPUT" <<'PY'
import json,sys,pathlib
out=pathlib.Path(sys.argv[1]); devices=json.loads((out/'simulators.json').read_text())['devices']
phones=[d for runtime, ds in devices.items() if runtime.endswith('.iOS-18-5') for d in ds if d.get('isAvailable')]
def choose(names):
 for name in names:
  match=[d for d in phones if d['name']==name]
  if match:return match[-1]
 raise SystemExit('Required form factor missing: '+repr(names))
compact=choose(['iPhone SE (3rd generation)','iPhone 16e','iPhone 17e','iPhone 16','iPhone 15'])
wide=choose(['iPhone 17 Pro Max','iPhone 16 Pro Max','iPhone 16 Plus','iPhone 15 Pro Max','iPhone 15 Plus'])
(out/'selected-devices.json').write_text(json.dumps({'compact':compact,'wide':wide},indent=2))
(out/'selected-devices.tsv').write_text(''.join(f"{label}\t{d['udid']}\n" for label,d in [('compact',compact),('wide',wide)]))
PY
FESTIVAL_SIM=''
cleanup() {
  local result=$?
  trap - EXIT
  set +e
  if [[ $result -ne 0 && -n "$FESTIVAL_SIM" ]]; then
    xcrun simctl io "$FESTIVAL_SIM" screenshot "$FESTIVAL_OUTPUT/failure.png"
    xcrun simctl spawn "$FESTIVAL_SIM" log show --last 5m --style compact \
      --predicate 'process == "Vedansh" OR process == "SpringBoard"' > "$FESTIVAL_OUTPUT/failure-device.log" 2>&1
  fi
  if [[ -d "$HOME/.maestro/tests" ]]; then cp -R "$HOME/.maestro/tests" "$FESTIVAL_OUTPUT/maestro-debug"; fi
  exit "$result"
}
trap cleanup EXIT
boot_sim() {
  FESTIVAL_SIM="$1"
  # Hosted CI only: selected devices are private to this job.
  xcrun simctl boot "$FESTIVAL_SIM" || true
  xcrun simctl bootstatus "$FESTIVAL_SIM" -b
  open -a Simulator --args -CurrentDeviceUDID "$FESTIVAL_SIM"
  xcrun simctl ui "$FESTIVAL_SIM" appearance light
  xcrun simctl status_bar "$FESTIVAL_SIM" override --time '09:41' --batteryState charged --batteryLevel 100
  maestro --device "$FESTIVAL_SIM" test --config .maestro/config.yaml --format junit \
    --output "$FESTIVAL_OUTPUT/driver-$FESTIVAL_SIM.xml" .maestro/brand-driver-check.yaml \
    2>&1 | tee "$FESTIVAL_OUTPUT/driver-$FESTIVAL_SIM.log"
}
# Prove XCTest readiness before compiling; keep one simulator booted at a time.
while IFS=$'\t' read -r form udid; do
  boot_sim "$udid"
  xcrun simctl shutdown "$udid"
done < "$FESTIVAL_OUTPUT/selected-devices.tsv"
# Keep this verification binary on its embedded checkout, never a published OTA.
python3 - "$FESTIVAL_OUTPUT" <<'PY'
from pathlib import Path
import plistlib,sys
plists=list(Path('ios').glob('*/Supporting/Expo.plist'))
if len(plists)!=1:raise SystemExit(f'Expected one host Expo.plist, found {len(plists)}')
p=plists[0];config=plistlib.loads(p.read_bytes());config['EXUpdatesEnabled']=False
p.write_bytes(plistlib.dumps(config))
(Path(sys.argv[1])/'verification-Expo.plist').write_bytes(p.read_bytes())
PY
FESTIVAL_WORKSPACE=$(python3 - <<'PY'
from pathlib import Path
print(next(Path('ios').glob('*.xcworkspace')))
PY
)
xcodebuild -workspace "$FESTIVAL_WORKSPACE" -scheme Vedansh -configuration Release \
  -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' \
  -derivedDataPath "$FESTIVAL_DERIVED" ARCHS="$(uname -m)" ONLY_ACTIVE_ARCH=YES CODE_SIGNING_ALLOWED=NO build \
  2>&1 | tee "$FESTIVAL_OUTPUT/native-build.log"
FESTIVAL_APP=$(python3 - "$FESTIVAL_DERIVED" <<'PY'
from pathlib import Path
import sys
apps=list((Path(sys.argv[1])/'Build/Products/Release-iphonesimulator').glob('*.app'))
if len(apps)!=1:raise SystemExit(f'Expected one app, found {len(apps)}')
print(apps[0])
PY
)
python3 - "$FESTIVAL_APP" "$FESTIVAL_OUTPUT" <<'PY'
from pathlib import Path
import plistlib,hashlib,json,sys
app=Path(sys.argv[1]);config=plistlib.loads((app/'Expo.plist').read_bytes())
if config.get('EXUpdatesEnabled') is not False:raise SystemExit('Native verification must disable downloaded updates')
info=plistlib.loads((app/'Info.plist').read_bytes())
if info.get('CFBundleIdentifier')!='com.prashantsharma.vedansh':raise SystemExit('Unexpected app bundle identifier')
bundle=app/'main.jsbundle'
if not bundle.is_file():raise SystemExit('Missing embedded JS bundle')
(Path(sys.argv[2])/'binary-origin.json').write_text(json.dumps({'source':'fresh Release compilation of tested-head.txt','updatesEnabled':False,'bundleId':info['CFBundleIdentifier'],'embeddedJsSha256':hashlib.sha256(bundle.read_bytes()).hexdigest()},indent=2))
PY
ditto -c -k --sequesterRsrc --keepParent "$FESTIVAL_APP" "$FESTIVAL_OUTPUT/Vedansh-simulator.zip"
run_case() {
  local language="$1" reading="$2" system="$3" focused="$4"
  local occasion="${5:-diwali}" occasion_date="${6:-2026-11-08}" expected_clock="${7:-.*17:55.*19:50.*}"
  local case_id="$FESTIVAL_FORM-$language-$reading-$system-$focused-$occasion"
  local started
  xcrun simctl ui "$FESTIVAL_SIM" content_size "$system"
  started=$(node -e 'console.log(Date.now())')
  maestro --device "$FESTIVAL_SIM" test --config .maestro/config.yaml --format junit \
    --output "$FESTIVAL_OUTPUT/$case_id.xml" \
    -e "LANGUAGE_NAME=$language" -e "READING_SIZE=$reading" -e "CASE_ID=$case_id" -e "FOCUSED=$focused" \
    -e "OCCASION_DATE=$occasion_date" -e "EXPECTED_CLOCK=$expected_clock" \
    .maestro/occasion-native-matrix.yaml 2>&1 | tee "$FESTIVAL_OUTPUT/$case_id.log"
  local container
  container=$(xcrun simctl get_app_container "$FESTIVAL_SIM" com.prashantsharma.vedansh data)
  node scripts/collect-native-festival-png.cjs "$container" "$started" "$FESTIVAL_OUTPUT/$case_id.png" "$focused" \
    >> "$FESTIVAL_OUTPUT/export-metadata.jsonl"
  printf 'PASS\t%s\n' "$case_id" >> "$FESTIVAL_OUTPUT/executed-cases.tsv"
  # Close the OS sheet without selecting a recipient. The next case clears only this app.
  xcrun simctl terminate "$FESTIVAL_SIM" com.prashantsharma.vedansh
}
while IFS=$'\t' read -r FESTIVAL_FORM udid; do
  boot_sim "$udid"
  xcrun simctl install "$FESTIVAL_SIM" "$FESTIVAL_APP"
  for language in Hindi English Gujarati Kannada; do
    for reading in Standard Large; do run_case "$language" "$reading" large true; done
  done
  if [[ "$FESTIVAL_FORM" == compact ]]; then
    for language in Hindi English Gujarati Kannada; do run_case "$language" Large accessibility-large true; done
    run_case Kannada Large accessibility-large false
    run_case English Standard large true shastra 2026-10-20 ".*13:59.*14:44.*"
    run_case Hindi Large large true holika 2026-03-03 ".*18:22.*20:50.*"
    run_case Kannada Large accessibility-large true vrat-parana 2026-11-05 ".*06:36.*08:47.*"
    run_case English Standard large true govardhan 2026-11-10 ".*06:39.*08:49.*"
    run_case English Standard large true dhanteras 2026-11-06 ".*18:02.*19:58.*"
    run_case English Large accessibility-large true guidance 2026-01-14 ".*sidereal ingress.*"
    run_case English Large accessibility-large true maha-shivaratri 2026-02-15 ".*Nishita.*"
  fi
  xcrun simctl shutdown "$FESTIVAL_SIM"
done < "$FESTIVAL_OUTPUT/selected-devices.tsv"
printf 'PASS: 28 native cases; compact/wide, four languages, Standard/Large, compact enlarged-system-text full almanac export, Shastra/Holika, Govardhan/Dhanteras heroes, guidance, all Shivaratri windows and next-day parana.\nPENDING: human visual comparison of captured screens/PNGs, physical devices and Android.\n' > "$FESTIVAL_OUTPUT/result.txt"
