#!/usr/bin/env bash
set -Eeuo pipefail
OUTPUT="$GITHUB_WORKSPACE/native-update-output"
mkdir -p "$OUTPUT" e2e-shots
trap 'rc=$?; if [[ -n "${DEVICE:-}" ]]; then xcrun simctl io "$DEVICE" screenshot "$OUTPUT/ios-final.png" || true; xcrun simctl spawn "$DEVICE" log show --last 3m --style compact --predicate '\''process == "Vedansh"'\'' > "$OUTPUT/ios-device.log" 2>&1 || true; fi; cp e2e-shots/update-*.png "$OUTPUT/" 2>/dev/null || true; exit "$rc"' EXIT
git rev-parse HEAD > "$OUTPUT/tested-head.txt"
xcodebuild -version > "$OUTPUT/ios-toolchain.txt"
xcrun simctl list devices available --json > "$OUTPUT/ios-devices.json"
python3 - "$OUTPUT" <<'PY'
import json,pathlib,sys
out=pathlib.Path(sys.argv[1]); devices=json.loads((out/'ios-devices.json').read_text())['devices']
phones=[d for runtime,ds in devices.items() if '.iOS-' in runtime for d in ds if d.get('isAvailable') and d['name'].startswith('iPhone')]
if not phones:raise SystemExit('No available iOS simulator')
compact=['iPhone SE (3rd generation)','iPhone 16e','iPhone 17e','iPhone 16','iPhone 17']
wide=['iPhone 17 Pro Max','iPhone 16 Pro Max','iPhone 16 Plus','iPhone 17 Pro','iPhone 16 Pro']
small=min(phones,key=lambda d:compact.index(d['name']) if d['name'] in compact else 99)
large=min([d for d in phones if d['udid']!=small['udid']],key=lambda d:wide.index(d['name']) if d['name'] in wide else 99)
(out/'ios-selected.tsv').write_text(''.join(f"{profile}\t{d['udid']}\t{d['name']}\n" for profile,d in [('compact',small),('wide',large)]))
PY
# Establish XCTest readiness before paying for a native compilation.
while IFS=$'\t' read -r PROFILE DEVICE NAME; do
  xcrun simctl boot "$DEVICE" 2>/dev/null || true
  xcrun simctl bootstatus "$DEVICE" -b
  open -a Simulator --args -CurrentDeviceUDID "$DEVICE"
  maestro --device "$DEVICE" test --config .maestro/config.yaml .maestro/brand-driver-check.yaml \
    2>&1 | tee "$OUTPUT/ios-$PROFILE-driver.log"
  xcrun simctl shutdown "$DEVICE"
done < "$OUTPUT/ios-selected.tsv"
for VERSION in 1.5.3 1.5.4; do
  node scripts/native-store-update-config.cjs "$VERSION" | tee "$OUTPUT/ios-$VERSION-config.json"
  npx expo prebuild --platform ios --no-install
  if [[ "$VERSION" == 1.5.3 ]]; then pod install --project-directory=ios; fi
  WORKSPACE=$(find ios -maxdepth 1 -name '*.xcworkspace' -print -quit)
  xcodebuild -workspace "$WORKSPACE" -scheme Vedansh -configuration Release -sdk iphonesimulator \
    -destination 'generic/platform=iOS Simulator' -derivedDataPath "$OUTPUT/ios-derived" \
    ARCHS="$(uname -m)" ONLY_ACTIVE_ARCH=YES CODE_SIGNING_ALLOWED=NO build \
    2>&1 | tee "$OUTPUT/ios-$VERSION-build.log"
  APP=$(find "$OUTPUT/ios-derived/Build/Products/Release-iphonesimulator" -maxdepth 1 -name '*.app' -print -quit)
  /usr/libexec/PlistBuddy -c 'Print CFBundleShortVersionString' "$APP/Info.plist" | tee "$OUTPUT/ios-$VERSION-native-version.txt"
  /usr/libexec/PlistBuddy -c 'Print EXUpdatesRuntimeVersion' "$APP/Expo.plist" | tee "$OUTPUT/ios-$VERSION-native-runtime.txt"
  test "$(cat "$OUTPUT/ios-$VERSION-native-runtime.txt")" = "$VERSION"
  if [[ "$VERSION" == 1.5.3 ]]; then ditto -c -k --keepParent "$APP" "$OUTPUT/Vedansh-update-fixture-ios.zip"; fi
  while IFS=$'\t' read -r PROFILE DEVICE NAME; do
    xcrun simctl boot "$DEVICE" 2>/dev/null || true
    xcrun simctl bootstatus "$DEVICE" -b
    open -a Simulator --args -CurrentDeviceUDID "$DEVICE"
    xcrun simctl install "$DEVICE" "$APP"
    bash scripts/native-store-update-matrix.sh ios "$DEVICE" "$PROFILE" "$VERSION"
    xcrun simctl shutdown "$DEVICE"
  done < "$OUTPUT/ios-selected.tsv"
done
printf '%s\n' 'PASS: iOS native runtime fixtures, persisted cooldown, daily slot, language/size matrix and browser/store handoff.' > "$OUTPUT/ios-result.txt"
