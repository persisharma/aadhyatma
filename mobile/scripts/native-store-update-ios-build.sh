#!/usr/bin/env bash
set -Eeuo pipefail
OUTPUT="$GITHUB_WORKSPACE/native-update-output"
FIXTURES="$OUTPUT/fixtures"
mkdir -p "$FIXTURES"
git rev-parse HEAD > "$FIXTURES/tested-head.txt"
xcodebuild -version > "$FIXTURES/toolchain.txt"
uname -m > "$FIXTURES/architecture.txt"
for VERSION in 1.5.3 1.5.4; do
  node scripts/native-store-update-config.cjs "$VERSION" | tee "$FIXTURES/ios-$VERSION-config.json"
  npx expo prebuild --platform ios --no-install
  if [[ "$VERSION" == 1.5.3 ]]; then pod install --project-directory=ios; fi
  WORKSPACE=$(find ios -maxdepth 1 -name '*.xcworkspace' -print -quit)
  xcodebuild -workspace "$WORKSPACE" -scheme Vedansh -configuration Release -sdk iphonesimulator \
    -destination 'generic/platform=iOS Simulator' -derivedDataPath "$OUTPUT/ios-derived" \
    ARCHS="$(uname -m)" ONLY_ACTIVE_ARCH=YES CODE_SIGNING_ALLOWED=NO build \
    2>&1 | tee "$OUTPUT/ios-$VERSION-build.log"
  APP=$(find "$OUTPUT/ios-derived/Build/Products/Release-iphonesimulator" -maxdepth 1 -name '*.app' -print -quit)
  /usr/libexec/PlistBuddy -c 'Print CFBundleShortVersionString' "$APP/Info.plist" | tee "$FIXTURES/ios-$VERSION-native-version.txt"
  /usr/libexec/PlistBuddy -c 'Print EXUpdatesRuntimeVersion' "$APP/Expo.plist" | tee "$FIXTURES/ios-$VERSION-native-runtime.txt"
  test "$(cat "$FIXTURES/ios-$VERSION-native-version.txt")" = "$VERSION"
  test "$(cat "$FIXTURES/ios-$VERSION-native-runtime.txt")" = "$VERSION"
  ditto -c -k --keepParent "$APP" "$FIXTURES/Vedansh-$VERSION.zip"
done
(cd "$FIXTURES"; shasum -a 256 Vedansh-*.zip > SHA256SUMS)
