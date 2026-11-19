# Sanatan native follow-up — 6 November 2026

PR #624 remains draft. Native acceptance is not yet established.

## Executed evidence

- Source a469ea3696f29baf588b3783fee83c9c1e000202: iOS Release app and widget extension compiled successfully, installed and launched on iPhone SE (3rd generation), iOS 18.5, Xcode 16.4. Native job 127731173081 stopped at the OS Open confirmation for an unrelated widget URL, before Sanatan.
- Preserved simulator app archive SHA-256: 3c74f9dd7f1a830ba092ae94b3e82772040d18ef9f22580eadb84b5be56bf419, run 42168692889 artifact 13481645746. Unsigned simulator executable includes arm64 and x86_64.
- Run 42172775469: actual native Home → Sanatan → English → search reached; Maestro hideKeyboard could not dismiss iOS keyboard. Captured native search screen is evidence of that state only.
- Run 42174842139: XCTest driver passed; Home scroll failed because the default center gesture stayed inside a nested carousel. Screenshot shows Home remained at the top. New bounded outer-margin swipe helper still asserts the real Home entry before continuing.
- Android job 127731173275 exhausted JVM Metaspace at approximately eight minutes and then hung until the 75-minute timeout. No APK or Android screen acceptance resulted.

## Corrections in this checkpoint

- Search now indexes the same Gujarati/Kannada labels rendered by the existing transliteration helpers. Fixed queries: સ્વસ્તિક and ಸ್ವಸ್ತಿಕ; Hindi/English aliases remain supported. Focused data/screen suites: 13 tests passed; TypeScript passed.
- Native search disables autocorrection and capitalization, labels the return key Search and explicitly dismisses the keyboard on submit.
- Sanatan flows use Return instead of the unreliable iOS hideKeyboard swipe and capture Home/hub before search.
- Android retains release lint, raises the Metaspace limit to 2 GiB, limits workers, compiles Kotlin in process, exits on OOM and limits compilation to 30 minutes. APK/source/hash are preserved before UI execution.
- iOS can embed current production JS/assets into the checksum-verified preserved native SDK when a conservative source-compatibility gate passes. Native executable, Info.plist, frameworks and extensions are hashed before/after and must remain unchanged. Receipt records both native baseline and current JavaScript HEAD plus bundle/manifest hashes. Native dependency/config/asset changes require a fresh build. This is local simulator installation, not OTA or release.
- Full native matrix still includes saved/cold resume, all 13 artwork contexts, four reading scripts × Standard/Large × default/enlarged system text. Automation screenshots require visual inspection; successful parsing is not native acceptance.

## Pending

Execute corrected native jobs and inspect native Home, hub, collection, reader and diagrams. Record actual per-platform/script/size results and fix real failures. Required pending native and independent editorial checks keep the PR draft. No merge or release has been performed.
