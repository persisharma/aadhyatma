# R2 loading and simulator verification — 11 October 2026

The user selected **simulator** verification after the paired iPhone was unavailable.
R2 loading now works in a clean iPhone 17 Pro / iOS 26.5 QA simulator. The cause was the
simulator missing the corporate HTTPS inspection CA already trusted by this Mac.
No production app code, TLS policy, CDN configuration, artwork or manifest changed in
this follow-up. The approved reader integration remains active.

## Environment repair

Both normal-validation URLSession probes receive:
`cdn.vedansh.app → ca.gokwik.goskope.com → *.fra2.goskope.com`.
Before provisioning, iOS rejects the root (-67843) and transport fails -1200/-9802.
The default foreground session also reproduces the failure outside Expo/cache logic.

Created isolated simulator `Vedansh-R2-Native-QA`, UDID
`5AD7B853-9A21-4247-98C6-47BAE046E16E`. Exported the existing Mac System-keychain CA,
compared its full SHA-256 with both native certificate chains, and imported that exact root
only into this QA simulator. CA constraints, validity and self-signature verification pass.
The root fingerprint is
`5dee1b47c5dd97886586e1cb1669a6c5df31393323109b7eae020c0d0fcd6234`.
Normal native trust now succeeds, returning HTTP 200 and the final Hanuman sea image's exact
62,452 bytes and approved full SHA-256. No trust callback accepts an invalid chain; all
probes retain `performDefaultHandling`. No global Mac network/trust settings changed.

Evidence: `host-fingerprints.json`, `simulator-before-ca.json`, `simulator-after-ca.json`,
`qa-certificate-validation.txt`. A QA keychain reset did not remove the trust-store CA;
`simulator-keychain-reset-still-trusted.json` records that failed outage technique. It is
not offline evidence. The working QA simulator retains the CA.

## Native app proof

The initial Release app was installed with an absent `Documents/reading-backgrounds/`
directory. Its original production JavaScript downloaded the Rama–Hanuman illustration and
existing Chalisa background through native Expo FileSystem. Both complete files match
approved full source hashes/bytes and the banner decodes with its complete 2:1 canvas.
They remain unchanged after process restart. No files were seeded into this fresh simulator.
See `native-cold-files.json`, `native-pre-restart-files.json`, `native-warm-restart-files.json`.

For exact request counts, an isolated QA preload wraps the existing native FileSystem
boundary while loading the unchanged production index, cache and screens. The preload logs
native starts/results and can route only cache misses to unavailable HTTPS loopback port 9.
It preserves the production content hashes and URL resolution used by the cache. Production
assets/configuration remain untouched. `qa-native-preload.js` is the reproducible observer;
`capture-native-phase.py` snapshots its events and persistent file identities.

| Native check | Download calls | Result |
| --- | --- | --- |
| Fresh Durga illustration cache | 1 | HTTP 200; exact source bytes/hash; displayed |
| Revisit same reader | 0 additional | Same hash/size/mtime/inode |
| Restart, reopen reader | 0 | Same file displayed |
| Open Katha using the same Durga art | 0 for that art | Complete banner displayed above prose |
| Restart with asset origin unavailable | 0 for cached art | Cached Durga displayed |
| Uncached Hanuman during outage | Failed/cancelled attempts only | Bundled manuscript/paper; text and paging usable |
| Restore R2 and revisit uncached content | 1 successful transfer per missing hash | Banner/background downloaded and displayed |
| Restart with outage after all four downloads | 0 | All four files unchanged; cached Hanuman displayed |
| Restore original Release bundle | 0 file replacements | All four files retain full hash/bytes/mtime/inode |

The outage is **native transport fault injection in the simulator**, not physical airplane
mode. Misses use the real native downloader against an unreachable endpoint, time out at
approximately eight seconds, and leave no partial or falsely completed cache files. A
page change remained usable while a request was pending and cancelled it after roughly
2.76 seconds. Saved snapshots show pages 1 → 2 → 1 and unchanged verse/meaning availability.
Failed/interrupted attempts may retry; the download-once contract applies after successful
completion. See `native-outage-ui.json` and `native-unavailable-*.json`.

`native-verification-summary.json` asserts all four native-downloaded files against the
88-row approved source/upload index and checks zero calls on persisted reuse. Evidence for
recovery and final restart is `native-online-recovered.json` and
`native-final-offline-restart.json`. This establishes the shared cache path on scoped native
readers, not a fresh full walkthrough of all 32 screen mappings or all languages.

## Responsiveness and verification limits

Four real native R2 transfers took **260, 271, 312 and 330 ms** in this run. A QA-only 50 ms
JavaScript heartbeat recorded no timer lateness above 50 ms during those transfer windows.
Text, paging and navigation remain usable through the eight-second outage wait. Separate
startup/navigation timer stalls of about 54–127 ms were recorded before the transfers; this
run does not attribute those stalls to artwork or establish a before/after startup baseline.
The observer itself adds asynchronous diagnostic writes and is excluded from production.

Instruments PID attachment failed; subsequent simulator recordings did not finalize usable
traces and were stopped. No CPU, iOS main-thread, frame-time, energy or memory benchmark is
claimed. Simulator responsiveness does not certify physical-device performance. The user
replaced physical testing with simulator testing; no phone install/test occurred.

Fresh focused verification: **3 suites / 35 tests pass**, including long-lived persistent
reuse, restart, changed hashes/hosts, concurrent deduplication, cancellation, transport/disk
failure, fallback, deferred loading, geometry and decode recovery. Both preparation verifiers
pass for **43 banners and 45 backgrounds**. The prior full integration audit and production
bundle checks are in `../style3-full-set/integration-audit.md`.

Completed valid artwork has no TTL, HEAD/revalidation request or automatic eviction. Files
live in Documents, not the purgeable OS cache directory. New content hashes, deleted app
storage or uninstall permit a new fetch; interrupted/decode-damaged files recover by retry.
The shared queue allows at most two misses, defers work until interactions finish, cancels
unneeded work and lets persisted hits bypass slow downloads.

## Final state and screenshots

Removed the outage flag and ignored QA entry, then restored the exact original Release
JavaScript bundle (full byte equality verified). OTA is disabled only in the isolated QA app
copy to keep this checkout under test. Source/native production configuration is unchanged.
Reinstall preserved all four files including modification times and inodes. The simulator is
left running this normal QA build. See `qa-restoration.json` and
`native-restored-release-files.json`. No OTA/store release or public configuration change.

- [Native R2 Rama–Hanuman banner](native-r2-rama.jpg)
- [Native Durga banner](native-r2-durga.jpg)
- [Katha reusing the cached banner](native-katha-r2.jpg)
- [Cached Durga during outage](native-cached-durga-outage.jpg)
- [Uncached offline fallback](native-uncached-fallback.jpg)
- [Cached Hanuman after restart during outage](native-cached-hanuman-outage.jpg)
