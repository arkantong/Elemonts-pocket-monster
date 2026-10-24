import type { CapacitorConfig } from "@capacitor/cli";
const config: CapacitorConfig = {
  appId: "com.elemonts.game",
  appName: "Elemonts",
  webDir: "dist",
  android: { backgroundColor: "#f3f5ee" },
  server: { androidScheme: "http", cleartext: true },
};
export default config;
