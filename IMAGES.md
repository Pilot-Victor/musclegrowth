# 이미지 직접 바꾸기 가이드

이 앱에서 이미지를 내가 직접 바꿀 수 있는 곳은 3가지예요.
코드를 깊이 몰라도, 아래 순서만 따라 하면 돼요.

---

## ① 음식 아이콘 (이모지 → 내 이미지)

현재 음식 아이콘은 이모지(🍗, 🥚 …)예요. 내 이미지로 바꾸려면:

1. 이미지 파일을 `public/foods/` 에 넣어요. 예) `public/foods/chicken.png`
2. `src/data/foods.ts` 에서 바꾸고 싶은 음식에 `image` 를 추가해요:

   ```ts
   { id: "f1", name: "닭가슴살", serving: "100g", protein: 23, emoji: "🍗",
     color: "#FFE0B2", bgColor: "#FFF3E0", isGramBased: true, servingGrams: 100, unit: "g",
     image: "/foods/chicken.png" },   // ← 이 줄만 추가
   ```

`image` 가 있으면 이미지를, 없으면 기존 이모지를 보여줘요. 일부 음식만 바꿔도 돼요.

---

## ② 홈 화면의 "자라나는 이두근" 그래픽

진척도에 따라 커지는 팔 그림이에요. 지금은 코드로 그린 SVG 예요.

**내 이미지(단계별 4장)로 바꾸기**
1. `public/muscle/` 에 단계별 이미지를 넣어요:
   - `stage1.png` (0~40%) / `stage2.png` (40~70%) / `stage3.png` (70~100%) / `stage4.png` (100%)
2. `src/components/MuscleArm.tsx` 맨 위 `USE_CUSTOM_IMAGES = false` 를 `true` 로 바꿔요.

**SVG 모양을 직접 손보기**
`src/components/MuscleArm.tsx` 안의 좌표/색상 값을 고치면 돼요. (이미지 없이도 가능)

---

## ③ 그 밖의 정적 이미지 (로고 등)

1. 이미지를 `public/images/` 에 넣어요. 예) `public/images/logo.png`
2. 코드에서 `/images/logo.png` 경로로 부르면 돼요:

   ```tsx
   <img src="/images/logo.png" alt="로고" width={120} />
   ```

> `public/` 안에 둔 파일은 항상 맨 앞 `/` 로 시작하는 경로로 불러요. (`public/` 글자는 빼요.)

---

## 미리보기 / 확인하는 법

```bash
npm run dev
```
→ 브라우저에서 `http://localhost:5173` 접속. 파일을 고치면 화면이 자동으로 새로고침돼요.
모바일 화면처럼 보려면 브라우저 개발자도구에서 폭을 430px 정도로 맞추세요.
