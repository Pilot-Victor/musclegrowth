# 이두근 단계 이미지

홈 화면의 "자라나는 이두근" 그래픽을 내 이미지로 바꿀 때 쓰는 폴더예요.

## 사용법
1. 단계별 이미지를 이 폴더에 넣어요:
   - `stage1.png` — 0~40%
   - `stage2.png` — 40~70%
   - `stage3.png` — 70~100%
   - `stage4.png` — 100% 달성
2. `src/components/MuscleArm.tsx` 맨 위의 `USE_CUSTOM_IMAGES` 를 `true` 로 바꿔요.

단계 수나 파일명은 `MuscleArm.tsx` 의 `STAGE_IMAGES` 배열에서 바꿀 수 있어요.

- 권장 크기: 세로로 긴 형태 (예: 200×296), 배경 투명 png
