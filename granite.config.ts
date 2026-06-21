import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "musclegrowth",
  brand: {
    displayName: "단백질 트래커",
    primaryColor: "#FF6B35",
    icon: "",
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite dev",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
});
