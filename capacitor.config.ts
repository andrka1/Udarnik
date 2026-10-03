import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.udarnik.app",
  appName: "Ударник",
  webDir: "dist",
  backgroundColor: "#0b1220",
  android: {
    allowMixedContent: false,
  },
};

export default config;
