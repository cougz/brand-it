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
  environments: {
    // "ssr" is TanStack Start's server environment name (START_ENVIRONMENT_NAMES.server).
    // noExternal: true ensures every npm dependency is bundled into server.js —
    // Cloudflare Workers has no node_modules at runtime.
    ssr: {
      resolve: {
        noExternal: true,
      },
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
