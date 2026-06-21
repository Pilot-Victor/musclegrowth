import { useState, useEffect } from "react";
import { Top, TextField, FixedBottomCTA, useToast } from "@toss/tds-mobile";
import { getSettings, saveSettings, getFavorites, saveFavorites } from "../storage";
import { GOAL_TYPES, PRESET_FOODS } from "../data/foods";
import FoodIcon from "../components/FoodIcon";
import type { Settings } from "../types";

const MAX_FAV = 5;

interface Props {
  /** 저장/뒤로가기 시 메인(홈) 화면으로 돌아가요. */
  onDone: () => void;
}

export default function SettingsScreen({ onDone }: Props) {
  const [weightInput, setWeightInput] = useState("");
  const [goalType, setGoalType] = useState<Settings["goalType"]>("maintain");
  const [favs, setFavs] = useState<string[]>([]);
  const toast = useToast();

  useEffect(() => {
    getSettings().then((s) => {
      setWeightInput(String(s.weight));
      setGoalType(s.goalType);
    });
    getFavorites().then(setFavs);
  }, []);

  const toggleFav = (id: string) =>
    setFavs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= MAX_FAV ? prev : [...prev, id],
    );

  const selectedGoal = GOAL_TYPES.find((g) => g.id === goalType)!;
  const weight = parseFloat(weightInput);
  const calculatedGoal = isNaN(weight) || weight <= 0 ? null : Math.round(weight * selectedGoal.multiplier);

  const handleSave = async () => {
    if (!weightInput.trim()) {
      toast.openToast("몸무게를 입력해 주세요");
      return;
    }
    if (isNaN(weight) || weight <= 0 || weight > 300) {
      toast.openToast("올바른 몸무게를 입력해 주세요 (1~300kg)");
      return;
    }
    await saveSettings({ weight, goalType });
    await saveFavorites(favs);
    toast.openToast("저장했어요 ✓");
    onDone();
  };

  return (
    <div style={{ paddingBottom: "calc(100px + env(safe-area-inset-bottom))" }}>
      <Top
        title={<Top.TitleParagraph size={22}>설정</Top.TitleParagraph>}
      />

      <div style={{ padding: "0 20px 24px" }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#191F28", marginBottom: 12 }}>
          내 정보
        </div>
        <TextField
          variant="box"
          label="몸무게 (kg)"
          placeholder="예: 70"
          value={weightInput}
          onChange={(e) => setWeightInput(e.target.value)}
        />
      </div>

      <div style={{ padding: "0 20px 24px" }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#191F28", marginBottom: 4 }}>
          목표 설정
        </div>
        <div style={{ fontSize: 13, color: "#8B95A1", marginBottom: 16 }}>
          목적에 맞는 단백질 목표를 선택해 주세요
        </div>

        {GOAL_TYPES.map((g) => {
          const isSelected = goalType === g.id;
          const calcGoal = isNaN(weight) || weight <= 0 ? null : Math.round(weight * g.multiplier);
          return (
            <div
              key={g.id}
              onClick={() => setGoalType(g.id)}
              style={{
                padding: "16px",
                borderRadius: 12,
                border: `2px solid ${isSelected ? g.color : "#F2F4F6"}`,
                background: isSelected ? g.bgColor : "#FAFAFA",
                marginBottom: 10,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: isSelected ? g.color : "#191F28" }}>
                    {g.label}
                  </div>
                  <div style={{ fontSize: 13, color: "#8B95A1", marginTop: 2 }}>
                    {g.description}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  {calcGoal != null && (
                    <div style={{ fontSize: 16, fontWeight: 700, color: g.color }}>
                      {calcGoal}g
                    </div>
                  )}
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: `2px solid ${isSelected ? g.color : "#D1D6DB"}`,
                      background: isSelected ? g.color : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginLeft: "auto",
                      marginTop: calcGoal != null ? 4 : 0,
                    }}
                  >
                    {isSelected && (
                      <div
                        style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {calculatedGoal != null && (
        <div
          style={{
            margin: "0 20px 24px",
            padding: "16px",
            background: "#FFF3EE",
            borderRadius: 12,
            border: "1px solid #FFD5C3",
          }}
        >
          <div style={{ fontSize: 14, color: "#FF6B35", fontWeight: 600 }}>
            하루 권장 단백질 목표
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#FF6B35", marginTop: 4 }}>
            {calculatedGoal}g
          </div>
          <div style={{ fontSize: 13, color: "#8B95A1", marginTop: 4 }}>
            {weightInput}kg × {selectedGoal.multiplier}
          </div>
        </div>
      )}

      <div style={{ padding: "0 20px 24px" }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#191F28", marginBottom: 4 }}>즐겨 먹는 음식</div>
        <div style={{ fontSize: 13, color: "#8B95A1", marginBottom: 14 }}>
          최대 {MAX_FAV}개를 고르면 음식 추가 화면 맨 위에 보여드려요. ({favs.length}/{MAX_FAV})
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {PRESET_FOODS.map((food) => {
            const sel = favs.includes(food.id);
            return (
              <div
                key={food.id}
                onClick={() => toggleFav(food.id)}
                style={{
                  position: "relative",
                  background: sel ? food.bgColor : "#FAFAFB",
                  border: `2px solid ${sel ? food.color : "#F2F4F6"}`,
                  borderRadius: 12,
                  padding: "14px 6px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 5,
                  userSelect: "none",
                }}
              >
                {sel && (
                  <div
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: food.color,
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ✓
                  </div>
                )}
                <FoodIcon emoji={food.emoji} image={food.image} size={26} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#191F28" }}>{food.name}</span>
                <span style={{ fontSize: 11, color: "#8B95A1" }}>{food.protein}g</span>
              </div>
            );
          })}
        </div>
      </div>

      <FixedBottomCTA onClick={handleSave}>저장하기</FixedBottomCTA>
    </div>
  );
}
