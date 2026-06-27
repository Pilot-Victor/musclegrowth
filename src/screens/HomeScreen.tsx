import { useState, useEffect, useCallback } from "react";
import { Top, ListRow, Button, BottomSheet, TextField, useToast } from "@toss/tds-mobile";
import { getTodayEntries, deleteFoodEntry, updateFoodEntry, getSettings, getHistory } from "../storage";
import { GOAL_TYPES, PRESET_FOODS } from "../data/foods";
import MuscleArm from "../components/MuscleArm";
import type { FoodEntry, Settings } from "../types";

// 수정한 용량/수량으로 이름·단백질을 다시 만들어요.
function buildName(baseName: string, amount: number, unit: string): string {
  if (unit === "개") return amount > 1 ? `${baseName} ×${amount}` : baseName;
  return `${baseName} (${amount}${unit})`;
}
function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// 용량/수량 수정이 가능한(구조 정보가 다 있는) 음식인지 판단해요.
function isStructuredEntry(e: FoodEntry): boolean {
  return e.proteinPerUnit != null && e.amount != null && e.baseName != null && e.unit != null;
}

// 이전 버전으로 추가해 구조 정보가 없는 프리셋 음식을 이름으로 매칭해
// amount/unit/proteinPerUnit/baseName 을 복원해요. (소고기 → 용량, 달걀 → 수량)
// 직접입력(isCustom) 음식은 단위 개념이 없어 그대로 둬요.
function hydrateEntry(entry: FoodEntry): FoodEntry {
  if (isStructuredEntry(entry) || entry.isCustom) return entry;
  const preset = PRESET_FOODS.find(
    (f) => entry.baseName === f.name || entry.name === f.name || entry.name.startsWith(f.name + " "),
  );
  if (!preset) return entry;
  if (preset.isGramBased) {
    const proteinPerUnit = preset.protein / (preset.servingGrams ?? 100);
    return {
      ...entry,
      baseName: preset.name,
      unit: preset.unit ?? "g",
      proteinPerUnit,
      amount: round1(entry.protein / proteinPerUnit),
    };
  }
  return {
    ...entry,
    baseName: preset.name,
    unit: "개",
    proteinPerUnit: preset.protein,
    amount: Math.max(1, Math.round(entry.protein / preset.protein)),
  };
}

interface Props {
  onAddFood: () => void;
  refreshKey: number;
}

// ---------------------------------------------------------------------------
// ProgressDisplay — 링 + 팔 + 수치
// ---------------------------------------------------------------------------
function ProgressDisplay({ current, goal }: { current: number; goal: number }) {
  const size = 240;
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(current / Math.max(goal, 1), 1);
  const offset = circumference * (1 - pct);
  const remaining = Math.max(goal - current, 0);

  // 링 색상: 달성 여부에 따라 변경
  const ringColor = pct >= 1 ? "#F59E0B" : "#FF6B35";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0 4px" }}>
      {/* 링 + 팔 컨테이너 */}
      <div style={{ position: "relative", width: size, height: size }}>
        {/* 진행도 링 (가장 뒤) */}
        <svg
          width={size} height={size}
          style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}
        >
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="#F0F0F0" strokeWidth={stroke}
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.3s ease" }}
          />
        </svg>

        {/* 근육 팔 SVG (링 중앙에 배치) */}
        <div
          style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <MuscleArm pct={pct} />
        </div>

        {/* 진행률 텍스트 (링 우측 하단) */}
        <div
          style={{
            position: "absolute",
            bottom: 18,
            right: 18,
            background: pct >= 1 ? "#F59E0B" : "#FF6B35",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            borderRadius: 8,
            padding: "2px 8px",
          }}
        >
          {Math.round(pct * 100)}%
        </div>
      </div>

      {/* 수치 */}
      <div style={{ textAlign: "center", marginTop: 6 }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: "#191F28", lineHeight: 1.1 }}>
          {current}g
        </div>
        <div style={{ fontSize: 13, color: "#8B95A1", marginTop: 3 }}>목표 {goal}g</div>
        <div
          style={{
            fontSize: 13,
            color: pct >= 1 ? "#F59E0B" : "#FF6B35",
            marginTop: 5,
            fontWeight: 600,
          }}
        >
          {pct >= 1 ? "목표 달성! 근육 완성 💪" : `${remaining}g 더 먹으면 근육이 완성돼요`}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HomeScreen
// ---------------------------------------------------------------------------
export default function HomeScreen({ onAddFood, refreshKey }: Props) {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [settings, setSettings] = useState<Settings>({ weight: 70, goalType: "maintain" });
  // 최근 7일 중 목표를 달성한 날 수
  const [weekAchieved, setWeekAchieved] = useState(0);
  // 최근 7일에 기록이 하나라도 있는지 (없으면 트렌드 문구 숨김)
  const [hasWeekData, setHasWeekData] = useState(false);
  // 연속으로 목표를 달성한 날 수
  const [streak, setStreak] = useState(0);

  const load = useCallback(async () => {
    const [e, s, history] = await Promise.all([getTodayEntries(), getSettings(), getHistory(7)]);
    setEntries(e);
    setSettings(s);
    const dailyGoal = Math.round(
      s.weight * (GOAL_TYPES.find((g) => g.id === s.goalType) ?? GOAL_TYPES[1]).multiplier,
    );
    setWeekAchieved(history.filter((d) => dailyGoal > 0 && d.totalProtein >= dailyGoal).length);
    setHasWeekData(history.some((d) => d.entries.length > 0));
    // 연속 달성일 (history[0] = 오늘). 오늘이 아직 미달이면 끊지 않고 어제부터 카운트.
    let s2 = 0;
    for (let i = 0; i < history.length; i++) {
      if (dailyGoal > 0 && history[i].totalProtein >= dailyGoal) s2++;
      else if (i === 0) continue;
      else break;
    }
    setStreak(s2);
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const handleDelete = async (id: string) => {
    await deleteFoodEntry(id);
    load();
  };

  // 음식 수정
  const toast = useToast();
  const [editing, setEditing] = useState<FoodEntry | null>(null);
  const [editValue, setEditValue] = useState(""); // 용량(구조화 엔트리) 또는 단백질(그 외)
  const isStructured = editing != null && isStructuredEntry(editing);

  const openEdit = (entry: FoodEntry) => {
    const hydrated = hydrateEntry(entry); // 옛 프리셋 음식이면 용량/수량 정보 복원
    setEditing(hydrated);
    setEditValue(String(isStructuredEntry(hydrated) ? hydrated.amount : hydrated.protein));
  };

  const editPreviewProtein =
    editing && isStructured
      ? round1((editing.proteinPerUnit ?? 0) * (parseFloat(editValue) || 0))
      : parseFloat(editValue) || 0;

  const handleEditSave = async () => {
    if (!editing) return;
    const v = parseFloat(editValue);
    if (isNaN(v) || v <= 0) {
      toast.openToast("올바른 값을 입력해 주세요");
      return;
    }
    let updated: FoodEntry;
    if (isStructured) {
      const protein = round1((editing.proteinPerUnit ?? 0) * v);
      updated = {
        ...editing,
        amount: v,
        protein,
        name: buildName(editing.baseName!, v, editing.unit!),
      };
    } else {
      updated = { ...editing, protein: round1(v) };
    }
    await updateFoodEntry(updated);
    setEditing(null);
    load();
    toast.openToast("수정했어요 ✓");
  };

  const goalType = GOAL_TYPES.find((g) => g.id === settings.goalType) ?? GOAL_TYPES[1];
  const goal = Math.round(settings.weight * goalType.multiplier);
  const total = entries.reduce((sum, e) => sum + e.protein, 0);

  const today = new Date();
  const dateLabel = `${today.getMonth() + 1}월 ${today.getDate()}일`;

  // 최근 7일 트렌드 문구 (달성 횟수에 따라 응원 메시지 변경)
  const trendSuffix =
    weekAchieved >= 5 ? "잘하구 있어요" : weekAchieved <= 2 ? "요즘 바쁘신가요?" : "좀 더 분발해야해요";
  const trendColor =
    weekAchieved >= 5 ? "#F59E0B" : weekAchieved <= 2 ? "#8B95A1" : "#FF6B35";

  return (
    <div style={{ paddingBottom: "calc(80px + env(safe-area-inset-bottom))" }}>
      <Top
        title={<Top.TitleParagraph size={22}>단백질 트래커</Top.TitleParagraph>}
        subtitleBottom={
          <div>
            <Top.SubtitleParagraph size={15}>{dateLabel}</Top.SubtitleParagraph>
            {hasWeekData && (
              <div style={{ fontSize: 13, color: trendColor, fontWeight: 600, marginTop: 4 }}>
                최근 일주일 중 {weekAchieved}회 목표를 달성했어요, {trendSuffix}
              </div>
            )}
            {streak >= 2 && (
              <div style={{ fontSize: 13, color: "#FF6B35", fontWeight: 700, marginTop: 4 }}>
                🔥 {streak}일 연속 목표 달성 중!
              </div>
            )}
          </div>
        }
      />

      <ProgressDisplay current={total} goal={goal} />

      <div style={{ padding: "0 16px 16px" }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#191F28", marginBottom: 8 }}>
          오늘 먹은 음식 {entries.length > 0 ? `(${entries.length})` : ""}
        </div>
        {entries.length === 0 ? (
          <div style={{ textAlign: "center", color: "#8B95A1", fontSize: 14, padding: "32px 0" }}>
            아직 기록된 음식이 없어요
          </div>
        ) : (
          entries.map((entry) => (
            <ListRow
              key={entry.id}
              left={
                entry.imageUri ? (
                  <ListRow.AssetImage src={entry.imageUri} shape="squircle" size="medium" />
                ) : (
                  <ListRow.AssetText shape="squircle" size="medium">
                    {entry.emoji ?? "🍽️"}
                  </ListRow.AssetText>
                )
              }
              contents={
                <ListRow.Texts
                  type="2RowTypeA"
                  top={entry.name}
                  bottom={`단백질 ${entry.protein}g`}
                />
              }
              right={
                <div style={{ display: "flex", gap: 6 }}>
                  <Button size="small" color="primary" variant="weak" onClick={() => openEdit(entry)}>
                    수정
                  </Button>
                  <Button size="small" color="dark" variant="weak" onClick={() => handleDelete(entry.id)}>
                    삭제
                  </Button>
                </div>
              }
            />
          ))
        )}
      </div>

      <div style={{ position: "fixed", bottom: "calc(80px + env(safe-area-inset-bottom))", right: 24 }}>
        <button
          onClick={onAddFood}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#FF6B35",
            color: "#fff",
            fontSize: 28,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(255,107,53,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          +
        </button>
      </div>

      {/* 음식 수정 (용량/수량 또는 단백질) */}
      <BottomSheet
        open={editing !== null}
        onClose={() => setEditing(null)}
        header={<BottomSheet.Header>{(editing?.baseName ?? editing?.name ?? "") + " 수정"}</BottomSheet.Header>}
        cta={<BottomSheet.CTA onClick={handleEditSave}>저장</BottomSheet.CTA>}
        hasTextField
      >
        <div style={{ padding: "0 24px 16px" }}>
          <TextField
            variant="box"
            label={isStructured ? (editing?.unit === "개" ? "수량 (개)" : `용량 (${editing?.unit})`) : "단백질 (g)"}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
          />
          {isStructured && (parseFloat(editValue) || 0) > 0 && (
            <div
              style={{
                marginTop: 16,
                padding: "14px 16px",
                background: "#FFF1EA",
                borderRadius: 8,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 14, color: "#8B95A1" }}>단백질</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: "#FF6B35" }}>{editPreviewProtein}g</span>
            </div>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}
