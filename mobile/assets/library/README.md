# Generated scripture database

Run `npm run build:library` from `mobile/` with Node >=22.13 before a native build.
`npm start`, `npm run ios`, `npm run android`, `npm test`, and EAS builds do this automatically.
The generated `library.db` is intentionally gitignored; JSON/Markdown remain the reviewed
content sources. `npm run verify:library` checks deterministic regeneration.

Do not edit or acquire content directly into this database. The compiler retains every
source field and stable verse position. The database also contains a derived search index.
