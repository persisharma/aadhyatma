import { createServer } from "vite";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { seo } from "../src/seo.js";
import { offerings } from "../src/catalog.js";
const launch = process.env.VEDANSH_PUBLIC_LAUNCH === "true";
const server = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
  // SSR-only use: skip the dev dependency optimizer, whose run is cancelled
  // (and throws) when the server closes straight after rendering.
  optimizeDeps: { noDiscovery: true, include: [] },
});
try {
  const { render } = await server.ssrLoadModule("/src/entry-server.jsx");
  const template = await readFile("dist/client/index.html", "utf8");
  for (const lang of ["en", "hi"]) {
    const head = seo(lang, launch);
    const html = template
      .replace(/<html lang="en">/, `<html lang="${lang}">`)
      .replace(/<title>[\s\S]*?<\/script>/, head)
      .replace('<div id="root"></div>', `<div id="root">${render(lang)}</div>`);
    const folder = lang === "en" ? "dist/client" : "dist/client/hi";
    await mkdir(folder, { recursive: true });
    await writeFile(folder + "/index.html", html);
  }
  const sitemap =
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' +
    ["https://vedansh.app/", "https://vedansh.app/hi/"]
      .map(
        (url) =>
          `<url><loc>${url}</loc><xhtml:link rel="alternate" hreflang="en-IN" href="https://vedansh.app/"/><xhtml:link rel="alternate" hreflang="hi-IN" href="https://vedansh.app/hi/"/></url>`,
      )
      .join("") +
    "</urlset>";
  await writeFile(
    "dist/client/robots.txt",
    launch
      ? "User-agent: *\nAllow: /\nDisallow: /stats/\nDisallow: /api/\nSitemap: https://vedansh.app/sitemap.xml\n"
      : "User-agent: *\nDisallow: /\n",
  );
  await writeFile("dist/client/sitemap.xml", sitemap);
  await writeFile(
    "dist/client/llms.txt",
    "# Vedansh\n\nVedansh is a free Hindu devotion app for iOS and Android. This website offers limited previews; complete tools and texts are in the app.\n\n## Official pages\n- [English](https://vedansh.app/)\n- [Hindi](https://vedansh.app/hi/)\n- [Download](https://vedansh.app/get/)\n- [Privacy](https://vedansh.app/privacy/)\n- [Support](https://vedansh.app/support/)\n\n## Offerings\n" +
      offerings
        .map(
          (f) => `- [${f.en}](https://vedansh.app/#${f.id}): ${f.description}`,
        )
        .join("\n") +
      "\n\n## Website preview boundaries\nThree Gita verses (2.47, 2.48, 2.50), one opening Hanuman Chalisa doha, and 11-count japa. An approximate sunrise, sunset, day choghadiya and Rahu Kaal for a chosen Indian city (IST); no tithi, nakshatra or full Panchang, birth chart calculation, or payment on the website.\n",
  );
  console.log(
    `Pre-rendered English and Hindi. Search indexing: ${launch ? "enabled for public launch" : "disabled for prototype"}.`,
  );
} finally {
  await server.close();
}
