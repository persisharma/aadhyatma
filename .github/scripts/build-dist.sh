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
  --exclude cloudflare --exclude wrangler.toml --exclude .netlify --exclude /app
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
# /mandir/ (the temple-walk site) is a graph of modules that import each other, so under the same 4-hour cache
# one stale file could mix two versions in a browser. Move its files under a content hash; the page itself is
# the only unhashed file, and it names the hash.
mh=$(cd dist/mandir && find v4 shared -type f -print0 | sort -z | xargs -0 shasum -a 256 | shasum -a 256 | cut -c1-10)
mkdir "dist/mandir/$mh" && mv dist/mandir/v4 dist/mandir/shared "dist/mandir/$mh/"
# Every file of the source must arrive (an unanchored rsync exclude once dropped mandir/shared/img/app).
[ "$(find "dist/mandir/$mh" -type f | wc -l)" -eq "$(find mandir/v4 mandir/shared -type f | wc -l)" ] \
  || { echo "mandir: files missing from the build" >&2; exit 1; }
sed -i.bak -E "s#(src|href|data-src)=\"(v4|shared)/#\1=\"$mh/\2/#g" dist/mandir/index.html && rm dist/mandir/index.html.bak
grep -q "src=\"$mh/v4/v4.js\"" dist/mandir/index.html || { echo "mandir fingerprinting did not apply" >&2; exit 1; }
if grep -E -q '(src|href|data-src)="(v4|shared)/' dist/mandir/index.html; then echo "mandir: unrewritten path" >&2; exit 1; fi
echo "mandir fingerprint: $mh"
# Fingerprint script.js so it can be cached for a year: a change to the file
# changes the URL every page asks for.
v=$(shasum -a 256 dist/script.js | cut -c1-10)
find dist -name '*.html' -exec sed -i.bak -E "s#(src=\"(\.\./)*)script\.js\"#\1script.js?v=$v\"#g" {} + && find dist -name '*.bak' -delete
echo "script.js fingerprint: $v"
echo "dist: $(find dist -type f | wc -l | tr -d ' ') files"
