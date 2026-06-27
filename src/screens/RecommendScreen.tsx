import { Top, useToast } from "@toss/tds-mobile";
import { RECOMMENDED_FOODS } from "../data/foods";
import type { RecommendedFood } from "../data/foods";
import { addFoodEntry } from "../storage";

const rankColor = (rank: number) =>
  rank === 1 ? "#FF6B35" : rank === 2 ? "#FF8C42" : rank === 3 ? "#FFB07A" : "#8B95A1";

// 로컬 기준 "오늘"이 며칠째인지(epoch day) → 매일 추천이 1칸씩 바뀌어요.
function todayPickIndex(len: number): number {
  const now = new Date();
  const epochDay = Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / 86400000);
  return ((epochDay % len) + len) % len;
}

export default function RecommendScreen() {
  const today = RECOMMENDED_FOODS[todayPickIndex(RECOMMENDED_FOODS.length)];
  const toast = useToast();

  const logToday = async (food: RecommendedFood) => {
    await addFoodEntry({
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name: `${food.name} (${food.logLabel})`,
      protein: food.logProtein,
      emoji: food.emoji,
    });
    toast.openToast(`${food.emoji} ${food.name} ${food.logProtein}g 오늘 기록에 추가했어요`);
  };

  return (
    <div style={{ paddingBottom: "calc(80px + env(safe-area-inset-bottom))" }}>
      <Top
        title={<Top.TitleParagraph size={22}>단백질 추천</Top.TitleParagraph>}
        subtitleBottom={
          <Top.SubtitleParagraph size={15}>단백질 가득한 음식과 권장 섭취 방법이에요</Top.SubtitleParagraph>
        }
      />

      {/* 오늘의 추천 (매일 바뀜) */}
      <div style={{ padding: "4px 16px 8px" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #FF8C42 0%, #FF6B35 100%)",
            borderRadius: 10,
            padding: "18px 20px",
            color: "#fff",
            boxShadow: "0 6px 18px rgba(255,107,53,0.28)",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.95 }}>🔥 오늘의 추천</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
            <span style={{ fontSize: 44, lineHeight: 1 }}>{today.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{today.name}</div>
              <div style={{ fontSize: 13, marginTop: 2, opacity: 0.95 }}>
                100g당 단백질 <b style={{ fontSize: 15 }}>{today.proteinPer100g}g</b>
              </div>
            </div>
          </div>
          <div
            style={{
              marginTop: 14,
              background: "rgba(255,255,255,0.18)",
              borderRadius: 8,
              padding: "12px 14px",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700 }}>권장량 · {today.serving}</div>
            <div style={{ fontSize: 13, marginTop: 4, lineHeight: 1.5, opacity: 0.97 }}>{today.tip}</div>
          </div>
          <button
            onClick={() => logToday(today)}
            style={{
              marginTop: 12,
              width: "100%",
              padding: "13px",
              borderRadius: 8,
              border: "none",
              background: "#fff",
              color: "#FF6B35",
              fontSize: 15,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            오늘 기록에 추가 · {today.logLabel} {today.logProtein}g
          </button>
        </div>
      </div>

      {/* 이런건 어때요? — TOP 10 */}
      <div style={{ padding: "12px 16px 4px" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#191F28" }}>이런건 어때요?</div>
        <div style={{ fontSize: 13, color: "#8B95A1", marginTop: 2 }}>단백질 함량이 높은 음식 TOP 10</div>
      </div>

      <div style={{ padding: "8px 16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {RECOMMENDED_FOODS.map((food) => (
          <div
            key={food.rank}
            style={{
              display: "flex",
              gap: 12,
              padding: "14px",
              background: "#FAFAFB",
              borderRadius: 8,
              border: "1px solid #F2F4F6",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                flexShrink: 0,
                borderRadius: "50%",
                background: rankColor(food.rank),
                color: "#fff",
                fontSize: 14,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {food.rank}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#191F28" }}>
                  {food.emoji} {food.name}
                </span>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#FF6B35", whiteSpace: "nowrap" }}>
                  {food.proteinPer100g}g
                  <span style={{ fontSize: 11, color: "#8B95A1", fontWeight: 600 }}> /100g</span>
                </span>
              </div>
              <div style={{ fontSize: 12, color: "#4E5968", marginTop: 4 }}>
                <span style={{ fontWeight: 600, color: "#191F28" }}>권장량</span> {food.serving}
              </div>
              <div style={{ fontSize: 12, color: "#6B7684", marginTop: 4, lineHeight: 1.45 }}>{food.tip}</div>
              <button
                onClick={() => logToday(food)}
                style={{
                  marginTop: 8,
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "1px solid #FFD5C3",
                  background: "#FFF1EA",
                  color: "#FF6B35",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                + 오늘 기록에 추가 ({food.logLabel} {food.logProtein}g)
              </button>
            </div>
          </div>
        ))}

        <div style={{ fontSize: 11, color: "#B0B8C1", textAlign: "center", marginTop: 6, lineHeight: 1.5 }}>
          단백질 함량은 일반적인 100g 기준 근사값이에요.
          <br />
          하루 권장 단백질은 체중·운동량에 따라 달라요(설정에서 목표 확인).
        </div>
      </div>
    </div>
  );
}
