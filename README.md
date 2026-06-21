# 단백질 트래커 (musclegrowth)

하루 단백질 섭취량을 기록하고, **진척도에 따라 자라는 근육 이미지**로 동기를 부여하는 앱인토스(Apps in Toss) 미니앱이에요.

## 주요 기능

- **홈** — 오늘 섭취한 단백질과 목표 대비 진척도(링 + 4단계 근육 이미지), 최근 7일 목표 달성 트렌드 문구
- **음식 추가** — 프리셋 15종(단위/용량 기반) + 직접 입력(사진 첨부 가능)
- **기록** — 최근 7일 막대그래프 + 월 달력. 달력에서 **과거 날짜를 탭해 기록을 추가/삭제**할 수 있어요
- **설정** — 체중·목표(벌크업/유지/다이어트)로 일일 단백질 목표 자동 계산

## 기술 스택

- React 18 + TypeScript, Vite
- 앱인토스 `@apps-in-toss/web-framework` (Granite), `@toss/tds-mobile` (TDS)
- 저장: 앱인토스 `Storage` (브라우저에서는 `localStorage`로 자동 폴백 → 로컬 점검 가능)

## 개발

```bash
npm install
npm run dev      # granite dev → http://localhost:5173
npm run lint
```

> 참고: `@toss/tds-mobile`은 앱인토스(localhost 포함) 환경에서만 동작해요.
> 일반 웹 호스팅(예: GitHub Pages)에 정적 배포하면 실행이 차단되니, 점검은 `granite dev` 또는 앱인토스 샌드박스로 하세요.

## 빌드 & 배포 (앱인토스)

```bash
npm run build                          # ait build → musclegrowth.ait 생성
npm run deploy -- --api-key <콘솔키>    # 또는 --profile <이름>
```

- 배포 API 키는 [앱인토스 콘솔](https://apps-in-toss.toss.im/) > 워크스페이스 > API 키 > 콘솔 API 키 에서 발급해요.
- 배포 후 [샌드박스 앱](https://developers-apps-in-toss.toss.im/development/test/sandbox.md)/QR로 실제 토스앱에서 점검 → 콘솔에서 검토 요청 → 출시.

## 프로젝트 구조

```
src/
  App.tsx                 # 하단 탭 네비게이션
  screens/                # 홈 / 음식추가 / 기록 / 설정
  components/             # MuscleArm(진척도 근육 이미지), FoodIcon
  data/foods.ts           # 프리셋 음식 · 목표 유형
  storage.ts              # 저장소(네이티브 Storage + localStorage 폴백)
public/muscle/            # 근육 4단계 이미지(stage1~4)
IMAGES.md                 # 이미지 교체 가이드
```

## 유용한 링크

- [앱인토스 콘솔](https://apps-in-toss.toss.im/)
- [앱인토스 개발자센터](https://developers-apps-in-toss.toss.im/)
- [앱인토스 개발자 커뮤니티](https://techchat-apps-in-toss.toss.im/)
