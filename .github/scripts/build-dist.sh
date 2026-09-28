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
  --exclude cloudflare --exclude wrangler.toml --exclude .netlify
( cd dist && python3 ../../.github/scripts/inline-css.py )
# Fingerprint script.js so it can be cached for a year: a change to the file
# changes the URL every page asks for.
v=$(shasum -a 256 dist/script.js | cut -c1-10)
find dist -name '*.html' -exec sed -i.bak -E "s#(src=\"(\.\./)*)script\.js\"#\1script.js?v=$v\"#g" {} + && find dist -name '*.bak' -delete
echo "script.js fingerprint: $v"
echo "dist: $(find dist -type f | wc -l | tr -d ' ') files"
