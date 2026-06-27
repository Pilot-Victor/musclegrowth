import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "musclegrowth",
  brand: {
    displayName: "단백질 트래커",
    primaryColor: "#FF6B35",
    icon: "/icon.png",
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
