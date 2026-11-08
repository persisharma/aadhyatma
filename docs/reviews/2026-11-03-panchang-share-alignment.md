# Panchang export chrome alignment — 3 November 2026

Base: `f7b3a5abcdea703cc1965a66b552174a3f5235e3` (main, including merged #608).

## Cause and implementation

The first fix bounded the bitmap but exposed two remaining typography problems.
The subtitle used `withMarkHeadroom` on a 12/14 outer Text with an 11.5dp
nested Indic run and no gap after the wordmark. Its negative margin pulled
the label into the artwork. The location's 13/17 line and the Download pill's
12/15 line used the same upward compensation inside vertically centered rows.
The mixed Indic/Inter CTA also forced both fonts onto one baseline.

PanchangShareCard now gives its brand copy a 3dp gap, renders the subtitle as
one script-aware Text with full 18/19dp leading, and keeps negative reader
headroom out of these chrome labels. The location retains its one-line
auto-fit policy without a fixed lineHeight. Download label and URL have their
own natural line boxes in a centered row, with a 6dp gap.

Natural line boxes are not optical ink bounds: the shipped Noto faces reserve
deep descender space. Local, em-based optical offsets center the visible
letters, calibrated from the actual bundled faces using Canvas TextMetrics.
These do not change shared reader headroom, interactive scaling or app typography.

| Script/face | Location offset (em) | Download offset (em) |
| --- | ---: | ---: |
| Hindi Noto Serif Devanagari | 0.295 | 0.285 |
| Gujarati Noto Serif Gujarati | 0.170 | 0.175 |
| Kannada Noto Serif Kannada | 0.260 | 0.275 |
| English Cormorant / Inter | 0.040 | -0.010 |

The fixed Inter URL has -0.090em correction for its ascenders/descenders.
Reference strings are Didwana in each script and the localized download label.
A correction is relative to each face's own line-box center, not a change to
the font baseline or the source artwork.

## Evidence

- Four new component cases fail against the old subtitle structure/leading;
  all four pass after the fix. Together with WordmarkCapture, **12/12 pass**
  in the focused real React Native 0.81.5 / React 19.1 / Jest 29 harness.
  Expo gradient/SVG are renderer mocks and the theme supplies static colors.
- The actual component was rendered via React Native Web with loaded shipped
  fonts, the screenshot's day data, Didwana, SVG/gradient adapters and 2× capture.
  Hindi, English, Gujarati and Kannada changed header/footer crops were reviewed.
  Each has a >=3dp subtitle gap and all changed labels stay within the card.
  The English preview localizes the changed header; unchanged sample body values
  are not a verified English calendar-data fixture.
- Hindi 1080×1350 output pixel bounds: place ink center 58.0px versus chip
  center 58.53px; Download label 1300px versus pill center 1300px;
  URL 1301px versus pill center 1300px. Complete matras remain visible.
- Existing Panchang Maestro smoke retains English/Hindi preview/cancel coverage
  and adds an alignment capture checkpoint. YAML parses (2 documents).
- Preview: [corrected Hindi card](https://chatgpt.com/library?file_id=libfile_5627be5104088191a43aa01c20f61af8&account_id=ef1b37df-162b-473f-a1be-d4cacda8dcce).

## Acceptance / handover

| Checks | Status |
| --- | --- |
| U1/U2 | PASS: current main and merged #608 inspected; scope is the three reported labels. |
| U3/U4 | PASS browser crops in hi/en/gu/kn and fixed-image dimensions; PENDING native Standard/Large, compact and enlarged-system-text matrix. |
| U5/U6 | PENDING native picker/cancel/platform handoff; no state, navigation, persistence or lifecycle logic changed. |
| U7/U8 | PASS source/art integration: existing approved assets/manifest/paint barrier retained; checked shared reader helper and isolated correction to Panchang export chrome. |
| U9 | PASS focused regressions/YAML; PENDING full mobile suite and executed Maestro/native visual/export checks. |
| U10 | PASS source review: no new runtime dependency, artwork bytes, engine solve, startup work or saved-ID change. |
| U11 | PASS scope based on main after #608; design/wiki/smoke updated. Final CI remains pending. |
| U12 | Implementation/tests/docs preserved on `codex/fix-panchang-share-label-alignment`; verify remote head before cleanup. |
| C3/C4/C9 | PASS browser/type/layout checks; PENDING actual iOS/Android exports, long-location and sharing-route native matrix. |
| C5 | N/A calculations: no Panchang model, engine, location, date or timezone changes. |
| C1/C2/C6/C7/C8/C10 | N/A: no content/story, reminder, navigation/persistence, media or release changes. |

Browser captures do not establish native verification. No native toolchain is
available here. Keep the follow-up draft until required native/full-suite checks
pass. No merge, build, release or OTA was performed.
