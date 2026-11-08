# Sanatan Parichay — visual learning revision

Base: `62d9b6d725e58b93c42cdb239468a647c155af1c` (8 November 2026).
Approved direction: the section audit and the user's request for visual teaching,
including a spatial ten-direction view and before/after review.
Audit: https://chatgpt.com/space/page_b101f16c5ff8819185e7fdd6942c9ac1

## Implemented scope

All 13 existing lessons retain their IDs, three authored pages, saved state and
source qualifications. This revision improves those lessons; it does not publish
PR #605's 201 research seeds or claim to complete the future catalogue expansion.
Hindi/English definitions and explanations use the existing Gujarati/Kannada
re-scripting policy. Full native Gujarati/Kannada translations remain a separate
editorial task, not a completed translation claim.

- Each lesson has a short answer, defined terms, formatted prose, a takeaway and
  real in-app onward actions. The collection list names the actual lesson before
  its broader collection label. Search indexes taught terms and page headings.
- Ten directions: an eight-point tilted plane plus a separate vertical axis;
  all ten direction/guardian buttons remain readable native text. Above/Below
  details keep the selected Kamika list distinct from the Ananta alternative.
  The plane is a static teaching schematic, not a compass or a GPU 3D scene.
- Thirty-three deities: five selectable groups with contextual descriptions.
  Dashavatara shows all ten names in each separately selectable roster.
  Navagraha opens the selected stotra verse or corresponding Jyotish reference.
- Ganesha: actual attributes of a newly prepared four-arm illustration; no false
  labels placed on the existing collection painting. Tulasi: distinct plant,
  leaves, japa beads and neck beads. Both paintings await the user's R2 upload.
- Elements: one lamp analogy with five selectable terms. Time: a Sun/Moon angular
  schematic and an explicitly illustrative, undated “until 14:15” row. Temple:
  exterior-to-sanctum structure and gateway/sanctum-tower distinction. Texts:
  four literary forms. Gargi: sequential dialogue explicitly marked a retelling,
  kept separate from Maitreyi. Swastika retains complete meaning/drawing stages.
- Narration/prose shares preserve original paragraphs and add the glossary,
  takeaway and full visual rosters. Related reading pushes on the Home stack;
  Back returns to the mounted lesson/page. Existing saves/progress are unchanged.

## Asset preparation and publication

`artwork.json` records SHA-256, export size, dimensions and generated-master hashes.
Two original text-free paintings were generated specifically for this teaching
revision. Ganesha was reviewed for four arms, goad/noose/broken tusk/varada and
mouse; Tulasi for separate objects and undistorted strands. This is an author's
visual review, not independent religious/editorial sign-off or device rendering.
Detailed generation prompts remain outside GitHub under the existing policy.
Masters were generated in the conversation; reproducible optimized exports are
tracked in `mobile/assets/sanatan-learning/`.

Run `node scripts/prepare-sanatan-learning.mjs`. It stages hashed object names,
`manifest.json` and `upload-files.json` in `scripts/.cache/sanatan-learning/`.
Upload the two WebPs to the exact keys in that list. Set the public CDN origin in
`EXPO_PUBLIC_ASSET_BASE_URL` when it differs from the app default. Only after public
objects are reachable, run:

```
node scripts/prepare-sanatan-learning.mjs --cdn --activate
```

The command verifies **both complete byte hashes before writing** the runtime
manifest. Commit the activated manifest separately after upload. No upload or
activation happens automatically. The current empty manifest causes no network
request and reserves no empty image frame. Published images use the shared cache
and an explicit native aspect-ratio frame. Offline falls back to neutral paper.
Prepared artwork may be shown in review with a preview-only manifest; this does
not represent publication in the app.

## Performance and acceptance

No animation loop, WebGL, timers, layout polling, new storage or startup imports
are added. Numeric SVG marks avoid script-font issues; equivalent names are
scalable native controls. The bounded concept index covers 13 lessons and 39
pages. Narration preparation is memoized per stable lesson ID. Both optional
WebPs together are 431,444 bytes; each is below 250 KB and no larger than 1200 px.
They have no static bundle import. Related destinations are resolved on action.

Automated checks are recorded in `verification.md`. Native flows are authored in
`.maestro/sanatan-visual-learning.yaml` and included in the native search matrix.
Parsing, SSR/component previews, unit tests and absence of reported crashes do
not prove native fidelity or freedom from ANRs.

Before readiness, inspect actual iOS/Android four-script × Standard/Large screens,
compact/system text, navigation Back/resume, offline/cache failure, playback and
real share exports. On a representative lower-configuration Android release build,
compare cold entry, repeated selections, scrolling and Back/reopen with baseline;
record frame time, memory, responsiveness and logcat/ANR traces. Also check iOS
hangs. This environment has no native device/SDK, so those checks stay PENDING.
No EAS build, version bump, release, merge or OTA is part of this revision.
