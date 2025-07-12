import { resolve } from "node:path";

import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import webfontDownload from "vite-plugin-webfont-dl";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    viteReact(),
    webfontDownload([
      "https://fonts.googleapis.com/css2?family=Leckerli+One&display=swap",
    ]),
  ],
  resolve: {
    alias: {
      "#": resolve(__dirname, "./src"),

      // https://github.com/tabler/tabler-icons/issues/1233#issuecomment-2428245119
      // /esm/icons/index.mjs exports the icons statically, so no separate chunks are created
      "@tabler/icons-react": "@tabler/icons-react/dist/esm/icons/index.mjs",
    },
  },
});
