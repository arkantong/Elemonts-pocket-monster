import { version } from "./package.json";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig(({ mode }) => ({
  define: { __APP_VERSION__: JSON.stringify(version) },
  plugins: [
    react(),
    {
      name: "elemonts-build-identity",
      transformIndexHtml: () => [{ tag: "meta", attrs: { name: "elemonts-ui-version", content: version }, injectTo: "head" }],
    },
    VitePWA({
      disable: mode === "native",
      registerType: "autoUpdate",
      manifest: {
        name: "Elemonts",
        short_name: "Elemonts",
        description: "Rumah kecil, petualangan besar.",
        theme_color: "#213f2d",
        background_color: "#f3f5ee",
        display: "standalone",
        orientation: "portrait",
        icons: [
          {
            src: "/icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,woff2,wav,m4a,glb}"],
        maximumFileSizeToCacheInBytes: 8000000,
        navigateFallbackDenylist: [/^\/api/],
      },
    }),
  ],
  server: {
    watch: { ignored: ["**/android/**", "**/test-results/**"] },
    host: "0.0.0.0",
    port: 5173,
    proxy: { "/duel": { target: "ws://127.0.0.1:3001", ws: true } },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id: string) =>
          id.includes("/three/")
            ? "three"
            : id.includes("/motion")
              ? "motion"
              : undefined,
      },
    },
  },
}));
