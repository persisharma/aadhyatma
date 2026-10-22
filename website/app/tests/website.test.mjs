import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { offerings, groups, faqs, storeLinks } from "../src/catalog.js";
import { seo } from "../src/seo.js";

for (const lang of ["en", "hi"]) {
  test(`${lang}: production output is readable without JavaScript and agrees with its structured data`, async () => {
    const html = await readFile(
      new URL(
        `../dist/client/${lang === "hi" ? "hi/" : ""}index.html`,
        import.meta.url,
      ),
      "utf8",
    );
    assert.match(html, new RegExp(`<html lang="${lang}">`));
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.equal(
      (html.match(/class="offering"/g) || []).length,
      offerings.length,
    );
    assert.equal(
      (html.match(/type="module"/g) || []).length,
      1,
      "The application remains hydrated, not a static screenshot",
    );
    assert.equal((html.match(/application\/ld\+json/g) || []).length, 1);
    // Either build mode is valid output; the public-launch switch itself is tested below.
    assert.match(html, /name="robots" content="(noindex,follow|index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1)"/);
    const graph = JSON.parse(
      html.match(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
      )[1],
    )["@graph"];
    const list = graph.find((x) => x["@type"] === "ItemList");
    assert.equal(list.numberOfItems, offerings.length);
    for (const f of offerings) {
      assert.ok(
        html.includes(`id="${f.id}"`),
        f.id + " has a readable destination",
      );
      const item = list.itemListElement.find((x) =>
        x.item.url.endsWith("#" + f.id),
      );
      assert.equal(item.item.name, lang === "hi" ? f.hi : f.en);
      assert.ok(html.includes(lang === "hi" ? f.hi : f.en));
    }
    assert.equal(
      graph.find((x) => x["@type"] === "FAQPage").mainEntity.length,
      faqs.length,
    );
    assert.ok(html.includes(storeLinks.ios));
    assert.ok(html.includes(storeLinks.android));
    assert.ok(
      !html.includes("localhost"),
      "No local development URLs in production content",
    );
  });
}
test("web samples stay deliberately limited; the full library is not bundled", async () => {
  const d = JSON.parse(
    await readFile(
      new URL("../src/preview-content.json", import.meta.url),
      "utf8",
    ),
  );
  assert.deepEqual(
    d.gita.map((v) => v.number),
    [47, 48, 50],
  );
  assert.ok(
    d.gita.every((v) => !("commentaryHi" in v) && !("commentaryEn" in v)),
  );
  assert.equal(d.chalisa.lines.length, 2, "Only the opening doha is present");
  assert.equal(d.mantras.length, 3);
  assert.equal(offerings.filter((x) => x.preview).length, 3);
  assert.equal(new Set(offerings.map((f) => f.id)).size, offerings.length);
  assert.ok(offerings.every((f) => groups.some((g) => g[0] === f.group)));
});
test("prototype indexing is disabled, with an explicit public-launch switch", async () => {
  const robots = await readFile(
    new URL("../dist/client/robots.txt", import.meta.url),
    "utf8",
  );
  assert.match(robots, /Disallow: \//);
  for (const lang of ["en", "hi"]) {
    assert.match(
      seo(lang, true),
      /content="index,follow,max-image-preview:large/,
    );
    assert.match(seo(lang, false), /content="noindex,follow"/);
  }
});

test('mala coordinates have stable precision for server/browser hydration', async () => {
  const html = await readFile(new URL('../dist/client/index.html', import.meta.url), 'utf8');
  const ring = html.match(/<svg[^>]*class="mala-ring"[\s\S]*?<\/svg>/)[0];
  assert.equal((ring.match(/<circle/g) || []).length, 109);
  for (const coordinate of ring.matchAll(/c[xy]="([^"]+)"/g)) {
    assert.match(coordinate[1], /^\d+(\.\d{1,3})?$/);
  }
});
