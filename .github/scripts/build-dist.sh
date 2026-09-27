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
echo "dist: $(find dist -type f | wc -l | tr -d ' ') files"
