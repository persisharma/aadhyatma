#!/usr/bin/env bash
# Assemble a host-neutral build of the site in website/dist: pages, images and
# text files only — no function source, package manifests or host configs —
# then inline the stylesheet. Hosts add their own config on top.
set -euo pipefail
cd "$(dirname "$0")/../../website"
rm -rf dist && mkdir dist
rsync -a ./ dist/ \
  --exclude dist --exclude node_modules --exclude 'package*.json' \
  --exclude netlify.toml --exclude netlify-functions --exclude functions \
  --exclude cloudflare --exclude wrangler.toml --exclude .netlify --exclude app
( cd dist && python3 ../../.github/scripts/inline-css.py )
# The home pages (/ and /hi/) and /stats/ are the React app in app/, pre-rendered
# for search engines. Everything else — /get/, privacy, terms, support, 404,
# robots.txt, sitemap.xml, llms*.txt, icons — stays the static site above.
( cd app && npm ci --no-audit --no-fund && VEDANSH_PUBLIC_LAUNCH=true npm run build )
cp app/dist/client/index.html dist/index.html
mkdir -p dist/hi && cp app/dist/client/hi/index.html dist/hi/index.html
rm -rf dist/stats && cp -R app/dist/client/stats dist/stats
cp -R app/dist/client/assets dist/assets
# /stats/ scripts and styles get the zone's 4-hour browser cache, so after a
# deploy the new page could run the old chart code. Fingerprint them too:
# daily.js first (app.js imports it), then app.js and style.css (the page loads them).
fp() { shasum -a 256 "$1" | cut -c1-10; }
sed -i.bak "s#'/stats/daily.js'#'/stats/daily.js?v=$(fp dist/stats/daily.js)'#" dist/stats/app.js
sed -i.bak -e "s#\"/stats/app.js\"#\"/stats/app.js?v=$(fp dist/stats/app.js)\"#" \
  -e "s#\"/stats/style.css\"#\"/stats/style.css?v=$(fp dist/stats/style.css)\"#" dist/stats/index.html
rm -f dist/stats/*.bak
grep -q "daily.js?v=" dist/stats/app.js && grep -q "app.js?v=" dist/stats/index.html && grep -q "style.css?v=" dist/stats/index.html \
  || { echo "stats fingerprinting did not apply" >&2; exit 1; }
# Fingerprint script.js so it can be cached for a year: a change to the file
# changes the URL every page asks for.
v=$(shasum -a 256 dist/script.js | cut -c1-10)
find dist -name '*.html' -exec sed -i.bak -E "s#(src=\"(\.\./)*)script\.js\"#\1script.js?v=$v\"#g" {} + && find dist -name '*.bak' -delete
echo "script.js fingerprint: $v"
echo "dist: $(find dist -type f | wc -l | tr -d ' ') files"
