# Sundarkand

App-ready Markdown edition for the Sundarkand module.

Structure:
- `sundarkand.md` contains the full 121-reading Shri Ramcharitmanas Sundarkand edition.
- Each reading includes original Awadhi/Devanagari text, transliteration, Hindi meaning, and English meaning.
- `scripts/parse-sundarkand.mjs` generates the mobile JSON mirror at `mobile/src/data/sundarkand/sundarkand.hi-en.json`.

Run from the repo root:

```bash
node scripts/parse-sundarkand.mjs
```
