import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  site: "https://www.asepbagja.com",
  integrations: [mdx()],
  experimental: {
    assets: true,
  },
});
