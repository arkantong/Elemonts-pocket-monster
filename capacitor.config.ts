import type { CapacitorConfig } from "@capacitor/cli";
const config: CapacitorConfig = {
  appId: "com.elemonts.game",
  appName: "Elemonts",
  webDir: "dist",
  android: { backgroundColor: "#f3f5ee" },
  plugins: { SystemBars: { insetsHandling: "css", initialViewportFitValueHint: "cover" } },
  server: { androidScheme: "http", cleartext: true },
};
export default config;
