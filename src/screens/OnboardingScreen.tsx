import { useState } from "react";
import { TextField, useToast } from "@toss/tds-mobile";
import { PRESET_FOODS, GOAL_TYPES } from "../data/foods";
import { saveSettings, saveFavorites, setOnboarded } from "../storage";
import { useBackHandler } from "../hooks/useBackHandler";
import FoodIcon from "../components/FoodIcon";
import type { Settings } from "../types";

interface Props {
  onDone: () => void;
}

const MAX_FAV = 5;

export default function OnboardingScreen({ onDone }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [weightInput, setWeightInput] = useState("");
  const [goalType, setGoalType] = useState<Settings["goalType"]>("maintain");
  const [favs, setFavs] = useState<string[]>([]);
  const toast = useToast();

  // 뒤로가기: 2단계에서는 1단계로 돌아가요(앱이 종료되지 않도록).
  useBackHandler(step === 2, () => setStep(1));

  const weight = parseFloat(weightInput);
  const selectedGoal = GOAL_TYPES.find((g) => g.id === goalType)!;
  const calcGoal = isNaN(weight) || weight <= 0 ? null : Math.round(weight * selectedGoal.multiplier);

  const goNext = () => {
    if (!weightInput.trim() || isNaN(weight) || weight <= 0 || weight > 300) {
      toast.openToast("올바른 몸무게를 입력해 주세요 (1~300kg)");
      return;
    }
    setStep(2);
  };

  const toggleFav = (id: string) => {
    setFavs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= MAX_FAV ? prev : [...prev, id],
    );
  };

  const finish = async () => {
    await saveSettings({ weight, goalType });
    await saveFavorites(favs);
    await setOnboarded();
    onDone();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#fff",
        zIndex: 200,
        maxWidth: 430,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 진행 표시 */}
      <div style={{ display: "flex", gap: 6, padding: "20px 24px 8px" }}>
        {[1, 2].map((s) => (
          <div
            key={s}
            style={{ flex: 1, height: 4, borderRadius: 2, background: s <= step ? "#FF6B35" : "#F2F4F6" }}
          />
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 24px 24px" }}>
        {step === 1 ? (
          <>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#191F28", marginTop: 8 }}>
              먼저 목표를 정해볼까요? 💪
            </div>
            <div style={{ fontSize: 14, color: "#8B95A1", marginTop: 8, marginBottom: 28 }}>
              몸무게와 목표에 맞춰 하루 단백질 목표를 계산해 드려요.
            </div>

            <TextField
              variant="box"
              label="몸무게 (kg)"
              placeholder="예: 70"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
            />

            <div style={{ fontSize: 15, fontWeight: 700, color: "#191F28", margin: "28px 0 4px" }}>목표</div>
            <div style={{ fontSize: 13, color: "#8B95A1", marginBottom: 14 }}>목적에 맞는 단백질 목표를 골라요</div>
            {GOAL_TYPES.map((g) => {
              const isSel = goalType === g.id;
              const gGoal = isNaN(weight) || weight <= 0 ? null : Math.round(weight * g.multiplier);
              return (
                <div
                  key={g.id}
                  onClick={() => setGoalType(g.id)}
                  style={{
                    padding: "16px",
                    borderRadius: 8,
                    border: `2px solid ${isSel ? g.color : "#F2F4F6"}`,
                    background: isSel ? g.bgColor : "#FAFAFA",
                    marginBottom: 10,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: isSel ? g.color : "#191F28" }}>{g.label}</div>
                    <div style={{ fontSize: 13, color: "#8B95A1", marginTop: 2 }}>{g.description}</div>
                  </div>
                  {gGoal != null && <div style={{ fontSize: 16, fontWeight: 700, color: g.color }}>{gGoal}g</div>}
                </div>
              );
            })}

            {calcGoal != null && (
              <div
                style={{
                  marginTop: 14,
                  padding: "16px",
                  background: "#FFF1EA",
                  borderRadius: 8,
                  border: "1px solid #FFD5C3",
                }}
              >
                <div style={{ fontSize: 14, color: "#FF6B35", fontWeight: 600 }}>하루 권장 단백질 목표</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#FF6B35", marginTop: 4 }}>{calcGoal}g</div>
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#191F28", marginTop: 8 }}>
              즐겨 먹는 음식을 골라요 🍽️
            </div>
            <div style={{ fontSize: 14, color: "#8B95A1", marginTop: 8, marginBottom: 8 }}>
              자주 먹는 단백질 음식을 최대 {MAX_FAV}개 고르면, 음식 추가 화면 맨 위에 보여드려요.
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#FF6B35", marginBottom: 14 }}>
              {favs.length} / {MAX_FAV} 선택
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
                      borderRadius: 8,
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
          </>
        )}
      </div>

      {/* 하단 버튼 */}
      <div
        style={{
          padding: "12px 24px calc(24px + env(safe-area-inset-bottom))",
          borderTop: "1px solid #F2F4F6",
          display: "flex",
          gap: 10,
        }}
      >
        {step === 2 && (
          <button
            onClick={() => setStep(1)}
            style={{
              padding: "16px 20px",
              borderRadius: 8,
              border: "none",
              background: "#F2F4F6",
              color: "#191F28",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            이전
          </button>
        )}
        <button
          onClick={step === 1 ? goNext : finish}
          style={{
            flex: 1,
            padding: "16px",
            borderRadius: 8,
            border: "none",
            background: "#FF6B35",
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {step === 1 ? "다음" : "시작하기"}
        </button>
      </div>
    </div>
  );
}
