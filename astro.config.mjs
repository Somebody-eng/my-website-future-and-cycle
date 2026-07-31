import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

const site = process.env.PUBLIC_SITE_URL || "https://future-cycle.pages.dev";

export default defineConfig({
  site,
  output: "static",
  integrations: [sitemap({ filter: (page) => !page.endsWith("/comments-admin/") })],
  markdown: {
    shikiConfig: {
      theme: "github-light"
    }
  }
});
