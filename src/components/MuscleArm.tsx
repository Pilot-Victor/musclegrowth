// ---------------------------------------------------------------------------
// MuscleArm — 진척도(pct: 0~1)에 따라 이두근이 성장하는 그래픽이에요.
//
// 이 그래픽을 본인이 만든 이미지로 바꾸고 싶다면:
//   1) 아래 USE_CUSTOM_IMAGES 를 true 로 바꿔요.
//   2) 단계별 이미지 4장을 `public/muscle/` 폴더에 넣어요.
//        public/muscle/stage1.png  (0~40%)
//        public/muscle/stage2.png  (40~70%)
//        public/muscle/stage3.png  (70~100%)
//        public/muscle/stage4.png  (100% 달성)
//   파일명/단계 수는 STAGE_IMAGES 배열에서 자유롭게 바꿀 수 있어요.
//
// 기본값(false)이면 아래 SVG 가 그대로 그려져요. SVG 의 좌표·색상을 직접
// 고쳐서 모양을 바꿀 수도 있어요.
// ---------------------------------------------------------------------------

const USE_CUSTOM_IMAGES = true;

// 진척도 경계값(threshold)과 이미지 경로. 낮은 단계부터 차례대로 적어요.
const STAGE_IMAGES: { upTo: number; src: string }[] = [
  { upTo: 0.4, src: "/muscle/stage1.png" },
  { upTo: 0.7, src: "/muscle/stage2.png" },
  { upTo: 1, src: "/muscle/stage3.png" },
  { upTo: Infinity, src: "/muscle/stage4.png" },
];

export default function MuscleArm({ pct }: { pct: number }) {
  const c = Math.min(Math.max(pct, 0), 1);

  // ── 이미지 모드 ──
  if (USE_CUSTOM_IMAGES) {
    const stage = STAGE_IMAGES.find((s) => c < s.upTo) ?? STAGE_IMAGES[STAGE_IMAGES.length - 1];
    return <img src={stage.src} alt="" width={100} height={148} style={{ objectFit: "contain" }} />;
  }

  // ── SVG 모드(기본) ──
  // 이두근 크기: 0% = 거의 평평, 100% = 최대 불룩
  const bicepCX = 48 - c * 20; // 48 → 28  (왼쪽으로 뻗어나감)
  const bicepRX = 8 + c * 16; //  8 → 24
  const bicepRY = 4 + c * 26; //  4 → 30
  const bicepCY = 105;

  // 단계별 피부색 (점점 더 진해짐)
  const armFill =
    c < 0.4 ? "#FFDDB3" : c < 0.7 ? "#FFCC99" : c < 1 ? "#FFB87A" : "#FF8C42";
  const bicepFill =
    c < 0.4 ? "#EEB882" : c < 0.7 ? "#E8A870" : c < 1 ? "#DE9358" : "#E06822";
  const outline = "#B87840";
  const isComplete = c >= 1;

  return (
    <svg viewBox="0 0 105 155" width="100" height="148">
      {/* 100% 달성 글로우 */}
      {isComplete && <ellipse cx="55" cy="80" rx="50" ry="68" fill="rgba(255,107,53,0.14)" />}

      {/* ── 어깨 (하단) ── */}
      <ellipse cx="65" cy="142" rx="22" ry="12" fill={armFill} stroke={outline} strokeWidth="2" />

      {/* ── 상완 몸통 ── */}
      <path
        d="M 48 78 Q 46 108 48 138 L 82 138 Q 80 108 78 78 Z"
        fill={armFill}
        stroke={outline}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* ── 이두근 (핵심 애니메이션 요소) ── */}
      <ellipse cx={bicepCX} cy={bicepCY} rx={bicepRX} ry={bicepRY} fill={bicepFill} stroke={outline} strokeWidth="1.5" />

      {/* 근육 라인 (60% 이상일 때 점진적으로 표시) */}
      {c > 0.6 && (
        <path
          d={`M ${bicepCX - 3} ${bicepCY + 9}
              Q ${bicepCX - 9} ${bicepCY}
                ${bicepCX - 3} ${bicepCY - 9}`}
          fill="none"
          stroke={outline}
          strokeWidth="1.5"
          opacity={Math.min((c - 0.6) * 2.5, 0.65)}
          strokeLinecap="round"
        />
      )}

      {/* ── 팔꿈치 관절 ── */}
      <ellipse cx="63" cy="78" rx="20" ry="12" fill={armFill} stroke={outline} strokeWidth="2" />

      {/* ── 전완 ── */}
      <path
        d="M 44 70 Q 48 45 64 18 L 82 23 Q 80 48 82 70 Z"
        fill={armFill}
        stroke={outline}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* ── 주먹 ── */}
      <ellipse cx="73" cy="18" rx="19" ry="13" fill={armFill} stroke={outline} strokeWidth="2" />

      {/* 너클 라인 */}
      <line x1="61" y1="11" x2="59" y2="19" stroke={outline} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="70" y1="8" x2="69" y2="17" stroke={outline} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="79" y1="9" x2="79" y2="17" stroke={outline} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="87" y1="12" x2="88" y2="18" stroke={outline} strokeWidth="1.5" strokeLinecap="round" />

      {/* 100% 달성 이펙트 */}
      {isComplete && (
        <>
          <text x="5" y="32" fontSize="18">✨</text>
          <text x="88" y="68" fontSize="14">⚡</text>
          <text x="3" y="85" fontSize="12">💥</text>
        </>
      )}
    </svg>
  );
}
