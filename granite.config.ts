import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "musclegrowth",
  brand: {
    displayName: "근성장",
    primaryColor: "#FF6B35",
    icon: "https://static.toss.im/appsintoss/44827/16c7d6b9-5853-4bf9-b829-b9035867752b.png",
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite dev",
      build: "vite build",
    },
  },
  permissions: [
    // 직접 입력 음식의 사진 첨부(fetchAlbumItems)에 필요해요.
    { name: "photos", access: "read" },
  ],
  outdir: "dist",
});
