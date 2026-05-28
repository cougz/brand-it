import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "~": resolve(import.meta.dirname, "app"),
    },
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      target: "cloudflare-workers",
      srcDirectory: "app",
      router: {
        routesDirectory: "routes",
        generatedRouteTree: "routeTree.gen.ts",
      },
    }),
    cloudflare(),
  ],
});
