# A6 Kubera Chalisa: research checkpoint

## Delivery status

This is a research checkpoint, not the A6 app implementation. It reconstructs the findings recorded in the A6 session; the earlier local source-review.md could not be reread because the execution workspace was unavailable when this checkpoint was published. Preserve that local report if the workspace becomes available and reconcile it with this file.

A5 PR #699 is merged. This checkpoint branches from current main. No prayer JSON, meanings, pronunciation, registry changes, tests or built visual are included. Keep the PR draft.

## Composition and editorial findings

The intended composition begins “जैसे अटल हिमालय, और जैसे अडिग सुमेर”.
The prior collation recorded 2 opening dohas, 44 body couplets and 2 closing dohas: 48 reading units. Reverify that segmentation against complete sources before implementation; do not trim it to 40 because of the title.

Candidate sources checked in the prior research:
- [Drik Panchang](https://www.drikpanchang.com/lyrics/chalisa/lord-kubera/shri-kubera-chalisa.html?lang=hi): complete edition read; preferred textual comparison base pending provenance resolution.
- [Voidcan](https://www.voidcan.org/kuber-chalisa/): complete Devanagari and romanization read. Variants and romanization errors were recorded; do not copy its pronunciation unchecked.
- [Pavitra Granth](https://pavitragranth.com/chalisa/shree-kuber-chalisa): direct access returned 403, so it was not verified as a complete edition.
- [VedikMarg](https://vedikmarg.in/bhakti/chalisa/kuber-chalisa): discusses unknown authorship; the possible Manas Parivar signature was not established as authorship.

Recorded variants include opening जै / जय and body सहस्त्र / सहस्र and भोद / भोग. Some editions append unrelated Shiva Chalisa closing material; exclude those additions after source verification. No full prayer or third-party meanings are reproduced here.

## Provenance investigation and limits

- Official T-Series [Tejaswinee Ingale recording](https://www.youtube.com/watch?v=R8BFyFMe4vE) and Wings Music / Bhajan India [Ritesh Mishra recording](https://www.youtube.com/watch?v=7g9Qr2zinYk) had indexed credits naming the lyrics Traditional. Direct access was limited. This supports traditional attribution, but alone does not establish the date or reuse status of this exact edition. Recording rights are separate.
- An Internet Archive exact-title metadata query returned zero records. A broader query found a 2016 discourse, not an established complete edition of this prayer. Its CC BY-NC-ND licence does not establish a reusable commercial adaptation source.
- Internet Archive [Kuber, 1940](https://archive.org/details/in.ernet.dli.2015.348511) was a novel, confirmed by its OCR preface, and was excluded as a title false positive.
- Google Books indexed results for a 1971 Amar Chitra Katha comic and a 2013 Kubera study did not establish a dated witness of this composition.
- Targeted indexed WorldCat and Hindi Wikisource searches did not find a matching historical edition. These searches were not exhaustive. OpenLibrary returned HTTP 503, which is an access failure rather than a zero-result finding.
- No applicable explicit text licence was found. Artwork licences associated with recordings cannot be treated as licences for the prayer.
- A [Prabhat Khabar page](https://www.prabhatkhabar.com/religion/aarti-chalisa/kuber-chalisa-lyrics-in-hindi) attributes lyrics to Gulshan Kumar, while [JaapDaily](https://jaapdaily.com/learn/chalisa/kuber-chalisa/) questions whether that is a recording credit and mentions another signature, Krishnadatta. Neither established literary authorship. No reliable author/death-date chain was found.

The research did not establish that this composition is protected, nor did it establish a documented public-domain or licensed edition. Absence of a search result is not evidence of absence.

Remaining source gap: a dated bibliographically supported witness of this exact composition with sufficient author/date evidence, an applicable licence/permission, or a complete user-provided source suitable for transformation. No one has been contacted.

## Implementation handover

Once the source question is resolved:
1. Reverify the complete edition, stanza order and documented variants.
2. Write original Hindi and English meanings and independently check pronunciation.
3. Integrate with the existing Kubera deity, artwork and Chalisa reader. Include catalog, registries, search, discovery, routes and generated counts. No new audio or artwork.
4. Preserve stable IDs and existing A5 work. Inspect current main and overlapping content PRs before editing shared files.
5. Run repository-required tests and affected journeys. Capture the actual built UI across required languages and sizes; record native testing limits honestly.
6. Reconcile the original local research report when accessible. No local worktree cleanup is authorized by this checkpoint.

B1 is Satyanarayan Aarti, id satyanarayan-aarti, deity vishnu, using the existing AartiReaderScreen. It has no functional dependency on A6, but shares catalog/discovery/count integration files. Implement it in a separate session and serialize overlapping edits. This PR does not implement B1.

## Acceptance evidence

- PASS: current remote AGENTS.md and shared build checklist read; open Kubera PR search returned no existing result before creation.
- PENDING: provenance resolution, complete-text editorial review, original meanings/pronunciation and all A6 app integration.
- PENDING: app unit/integration/route tests, CI, built visuals and native journeys. No test pass is claimed.
- N/A for this documentation-only diff: runtime/ANR profiling, artwork publication and changed UI verification. Those remain required as applicable for eventual implementation.
- Language/size/platform coverage: none executed for A6.
- This checkpoint adds documentation only and does not make A6 reachable in the app.
