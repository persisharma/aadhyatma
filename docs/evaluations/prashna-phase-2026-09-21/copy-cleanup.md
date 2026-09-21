# Customer-copy cleanup — 21 September 2026

Removed from the current working tree. Matching Hindi strings were removed too; the Daan register subtitle also had explicit Gujarati and Kannada versions, which were removed. This inventory records the English wording for review.

| Surface | Removed wording |
| --- | --- |
| Prashna phase basis | “This is the first interpretation model; rule-source review is incomplete. Navamsha, Dashamsha and Shadbala are not included in this assessment.” |
| Other Prashna purposes, expanded basis | “Source review of the rules is pending. Practical steps are separate editorial suggestions.” |
| Ask, expanded working | `prashna-phase-v1 … source review pending` and `buildPrashnaAnswer(…)` age/scoring traces. Actual basis chains remain and follow the selected Hindi/English language. |
| Ghar Vastu assessment | “This map lives only on this phone — it is sent nowhere.” |
| Ghar Vastu roster and comparison | “These maps live only on this phone — they are sent nowhere.” |
| Pitru Smaran list | “This list lives only on this phone — solved on-device by the same engine as the festivals” |
| Pitru Paksha learning | “The traditional notes for the remaining tithis follow their source review.” (added on main; removed during PR reconciliation) |
| Pitru Paksha overview | “Matched on-device by the panchang engine — sunrise-tithi convention” |
| Janma Tithi list | “One tithi engine, both directions — this list lives only on this phone” |
| Kul Parampara record | “This record lives on this device. It is sent nowhere and joins no list.” |
| Kul Parampara export intro | “A record that cannot leave the device fails at the one job it has.” |
| Kul Parampara export footer | “The file goes through the OS share sheet — no cloud, no server. Sharing is your decision, never the app’s.” |
| Daan ledger | “A remembrance, never a score — private, on this device only” |
| Daan register door | “Private — on this device only” |
| Vastu text handoff | “This map lives only on that phone; this text left it only because the user shared it.” |

Two replacements:

- Navagraha practice: “An existing traditional practice in your library” / “ऐप में पहले से उपलब्ध पारम्परिक पाठ” → **“A prayer to the nine grahas” / “नवग्रहों की स्तुति का पाठ”**.
- Delete-home confirmation: “This record lives only on this phone — deleting it cannot be undone.” → **“Deleting this record cannot be undone.” / “हटाने के बाद यह रिकॉर्ड वापस नहीं आएगा।”**

## Retained

Graha/dasha/gochar explanations, calculation dates and reference frames, evidence chains, meaningful uncertainty about the reading, exact share-content notices and deletion consequences. Internal source-review flags and structured export provenance remain accurate; removing a development-status paragraph does not make the interpretation verified or release-ready.

## Verification for this cleanup

- TypeScript: pass.
- Existing customer-copy guard: pass, with legacy privacy-footer exceptions removed. The exact unavailable-compass message is permitted because it explains how to continue.
- Existing screen/handoff suites: 8 suites, 78 tests passed.
- Ask: 47 tests passed, including all 223 positive corpus examples.
- Diff whitespace check: pass.
- No fresh simulator screenshots for this copy-only pass. Earlier phase screenshots in this directory precede these removals.
