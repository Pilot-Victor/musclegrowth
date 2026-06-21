import { Top } from "@toss/tds-mobile";
import { RECOMMENDED_FOODS } from "../data/foods";

const rankColor = (rank: number) =>
  rank === 1 ? "#FF6B35" : rank === 2 ? "#FF8B5E" : rank === 3 ? "#FFB088" : "#8B95A1";

export default function RecommendScreen() {
  return (
    <div style={{ paddingBottom: 80 }}>
      <Top
        title={<Top.TitleParagraph size={22}>단백질 추천 TOP 10</Top.TitleParagraph>}
        subtitleBottom={
          <Top.SubtitleParagraph size={15}>단백질 함량이 높은 음식과 권장 섭취 방법이에요</Top.SubtitleParagraph>
        }
      />

      <div style={{ padding: "4px 16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {RECOMMENDED_FOODS.map((food) => (
          <div
            key={food.rank}
            style={{
              display: "flex",
              gap: 12,
              padding: "14px",
              background: "#FAFAFB",
              borderRadius: 14,
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
