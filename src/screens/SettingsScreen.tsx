import { useState, useEffect } from "react";
import { Top, TextField, FixedBottomCTA, useToast } from "@toss/tds-mobile";
import { getSettings, saveSettings } from "../storage";
import { GOAL_TYPES } from "../data/foods";
import type { Settings } from "../types";

interface Props {
  /** 저장/뒤로가기 시 메인(홈) 화면으로 돌아가요. */
  onDone: () => void;
}

export default function SettingsScreen({ onDone }: Props) {
  const [weightInput, setWeightInput] = useState("");
  const [goalType, setGoalType] = useState<Settings["goalType"]>("maintain");
  const toast = useToast();

  useEffect(() => {
    getSettings().then((s) => {
      setWeightInput(String(s.weight));
      setGoalType(s.goalType);
    });
  }, []);

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
    toast.openToast("저장했어요 ✓");
    onDone();
  };

  return (
    <div style={{ paddingBottom: 100 }}>
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

      <FixedBottomCTA onClick={handleSave}>저장하기</FixedBottomCTA>
    </div>
  );
}
