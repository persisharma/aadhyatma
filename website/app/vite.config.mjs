import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { analyticsPlugin } from "./analytics/local.mjs";
import { seo } from "./src/seo.js";

export default defineConfig({
  build: {
    outDir: "dist/client",
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [
    react(),
    analyticsPlugin(),
    {
      name: "vedansh-readable-html",
      async transformIndexHtml(html, ctx) {
        const lang = ctx.originalUrl?.startsWith("/hi") ? "hi" : "en";
        let result = html
          .replace("<!--seo-->", seo(lang, false))
          .replace('<html lang="en">', `<html lang="${lang}">`);
        if (ctx.server) {
          const { render } = await ctx.server.ssrLoadModule(
            "/src/entry-server.jsx",
          );
          result = result.replace(
            '<div id="root"></div>',
            `<div id="root">${render(lang)}</div>`,
          );
        }
        return result;
      },
    },
  ],
});
