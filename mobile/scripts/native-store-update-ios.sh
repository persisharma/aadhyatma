#!/usr/bin/env bash
set -Eeuo pipefail
OUTPUT="$GITHUB_WORKSPACE/native-update-output"
FIXTURES="$GITHUB_WORKSPACE/native-update-fixtures"
NATIVE_IOS_PROFILE=${NATIVE_IOS_PROFILE:?profile}
mkdir -p "$OUTPUT" e2e-shots
printf '%s\t%s\n' "$NATIVE_IOS_PROFILE" "$NATIVE_SYSTEM_SIZE" > "$OUTPUT/ios-batch.tsv"
trap 'rc=$?; if [[ -n "${DEVICE:-}" ]]; then xcrun simctl io "$DEVICE" screenshot "$OUTPUT/ios-final.png" || true; xcrun simctl spawn "$DEVICE" log show --last 3m --style compact --predicate '\''process == "Vedansh"'\'' > "$OUTPUT/ios-device.log" 2>&1 || true; fi; cp e2e-shots/update-*.png "$OUTPUT/" 2>/dev/null || true; exit "$rc"' EXIT
git rev-parse HEAD > "$OUTPUT/tested-head.txt"
xcodebuild -version > "$OUTPUT/ios-toolchain.txt"
cmp "$OUTPUT/tested-head.txt" "$FIXTURES/tested-head.txt"
cmp "$OUTPUT/ios-toolchain.txt" "$FIXTURES/toolchain.txt"
test "$(uname -m)" = "$(cat "$FIXTURES/architecture.txt")"
(cd "$FIXTURES"; shasum -a 256 -c SHA256SUMS)
xcrun simctl list devices available --json > "$OUTPUT/ios-devices.json"
python3 - "$OUTPUT" "$NATIVE_IOS_PROFILE" <<'PY'
import json,pathlib,subprocess,sys
out=pathlib.Path(sys.argv[1]); devices=json.loads((out/'ios-devices.json').read_text())['devices']
if sys.argv[2] not in ('compact','wide'): raise SystemExit('Unknown iOS profile')
sdk=subprocess.check_output(['xcrun','--sdk','iphonesimulator','--show-sdk-version'],text=True).strip()
runtime_prefix='com.apple.CoreSimulator.SimRuntime.iOS-'+sdk.replace('.','-')
phones=[d for runtime,ds in devices.items() if runtime.startswith(runtime_prefix) for d in ds if d.get('isAvailable') and d['name'].startswith('iPhone')]
if not phones:raise SystemExit('No available simulator matching selected Xcode SDK '+sdk)
compact=['iPhone SE (3rd generation)','iPhone 16e','iPhone 17e','iPhone 16','iPhone 17']
wide=['iPhone 17 Pro Max','iPhone 16 Pro Max','iPhone 16 Plus','iPhone 17 Pro','iPhone 16 Pro']
small=min(phones,key=lambda d:compact.index(d['name']) if d['name'] in compact else 99)
large=min([d for d in phones if d['udid']!=small['udid']],key=lambda d:wide.index(d['name']) if d['name'] in wide else 99)
(out/'ios-selected.tsv').write_text(''.join(f"{profile}\t{d['udid']}\t{d['name']}\n" for profile,d in [('compact',small),('wide',large)] if profile==sys.argv[2]))
PY
# Establish XCTest readiness before testing the immutable compiled fixture.
while IFS=$'\t' read -r PROFILE DEVICE NAME; do
  xcrun simctl boot "$DEVICE" 2>/dev/null || true
  xcrun simctl bootstatus "$DEVICE" -b
  open -a Simulator --args -CurrentDeviceUDID "$DEVICE"
  maestro --device "$DEVICE" test --config .maestro/config.yaml .maestro/brand-driver-check.yaml \
    2>&1 | tee "$OUTPUT/ios-$PROFILE-driver.log"
  xcrun simctl shutdown "$DEVICE"
done < "$OUTPUT/ios-selected.tsv"
for VERSION in 1.5.3 1.5.4; do
  DEST="$RUNNER_TEMP/update-fixture-$VERSION"
  mkdir -p "$DEST"
  ditto -x -k "$FIXTURES/Vedansh-$VERSION.zip" "$DEST"
  APP=$(find "$DEST" -maxdepth 1 -name '*.app' -print -quit)
  /usr/libexec/PlistBuddy -c 'Print CFBundleShortVersionString' "$APP/Info.plist" | tee "$OUTPUT/ios-$VERSION-native-version.txt"
  /usr/libexec/PlistBuddy -c 'Print EXUpdatesRuntimeVersion' "$APP/Expo.plist" | tee "$OUTPUT/ios-$VERSION-native-runtime.txt"
  test "$(cat "$OUTPUT/ios-$VERSION-native-runtime.txt")" = "$VERSION"
  while IFS=$'\t' read -r PROFILE DEVICE NAME; do
    xcrun simctl boot "$DEVICE" 2>/dev/null || true
    xcrun simctl bootstatus "$DEVICE" -b
    open -a Simulator --args -CurrentDeviceUDID "$DEVICE"
    xcrun simctl install "$DEVICE" "$APP"
    bash scripts/native-store-update-matrix.sh ios "$DEVICE" "$PROFILE" "$VERSION"
    xcrun simctl shutdown "$DEVICE"
  done < "$OUTPUT/ios-selected.tsv"
done
printf 'PASS: iOS %s/%s native runtime fixtures, persisted cooldown, daily slot, language/size batch and browser/store handoff.\n' "$NATIVE_IOS_PROFILE" "$NATIVE_SYSTEM_SIZE" > "$OUTPUT/ios-result.txt"
