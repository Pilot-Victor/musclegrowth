import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages 웹 미리보기는 https://<user>.github.io/musclegrowth/ 하위 경로로
// 서빙되므로 base 를 맞춰줘요. 앱인토스(ait) 빌드에는 영향이 없도록
// GH_PAGES 환경변수가 있을 때만 적용해요.
export default defineConfig({
  base: process.env.GH_PAGES ? "/musclegrowth/" : "/",
  plugins: [react()],
  // cloudflared 등 터널을 통한 외부 호스트 접근 허용 (dev 미리보기용)
  server: {
    allowedHosts: true,
  },
});
