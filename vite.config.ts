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
  build: {
    // 큰 벤더 라이브러리를 별도 청크로 분리해서 초기 로딩/캐싱을 개선해요.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("/@toss/")) return "tds";
          if (id.includes("/@apps-in-toss/")) return "ait";
          // emotion 은 react 와 상호 의존이라 같은 청크로 묶어 순환 청크를 방지해요.
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/scheduler/") ||
            id.includes("/@emotion/")
          ) {
            return "react";
          }
          return "vendor";
        },
      },
    },
    // TDS는 라이브러리 특성상 단일 청크가 커요(약 950KB). 경고 기준을 현실에 맞게 조정해요.
    chunkSizeWarningLimit: 1000,
  },
});
