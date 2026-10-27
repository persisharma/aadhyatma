# Vrat illustrated card correction

The user supplied the original landing/list images and requested the established Kids Stories listing treatment. Vrat now renders `ListingCard` directly, with compact square list and landscape Upcoming variants; Today/category doors share its frame. Three event-specific paintings correct Karwa Chauth and Janmashtami imagery. Existing deity paintings, neutral fallbacks and story assets remain available.

The final design review is in [design-qa.md](design-qa.md), with full-view and focused side-by-side comparisons. Reference images are in `references/`, generated masters and exact prompts in `masters/`, and source/shipped hashes plus optimized-file sizes in `artwork-manifest.json`. The three new local WebPs total 120,082 bytes.

Final native evidence: `native-standard-landing.png`, `native-standard-upcoming.png`, `native-standard-list.png`, `native-standard-list-lower.png`, the `native-large-*` set, `native-english-*`, `native-system-xxxl-*` and `native-kids-stories-shared-card.png`. Inspect final root-level captures; iteration folders contain earlier findings/rejected loading states.

Validation: TypeScript and 3,778 tests pass on the combined tree. The final category copy/wrapping correction also passes TypeScript and 28 focused checks. iOS native save/unfollow, detail opening and Today expansion/collapse passed. Android, physical-device accessibility and an exhaustive visual catalog pass remain pending. No release, OTA, asset upload or remote merge was performed.

PR #542 was merged before this correction. The changes extend existing draft PR #550 and retain its header/search work; the final patch reuses the shared listing component instead of its earlier private artwork wrapper.
