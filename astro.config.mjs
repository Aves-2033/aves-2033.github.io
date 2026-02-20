import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://ketrent.ru",
  output: "static",
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/admin"),
    }),
  ],
  vite: {
    css: {
      devSourcemap: true,
    },
  },
});
