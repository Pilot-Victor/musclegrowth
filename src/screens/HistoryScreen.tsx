import { useState, useEffect } from "react";
import { BarChart, useBottomSheet, Top } from "@toss/tds-mobile";
import { getHistory, getSettings } from "../storage";
import { GOAL_TYPES } from "../data/foods";
import type { DayHistory, Settings } from "../types";

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
const MONTH_LABELS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
const WEEK_LABELS = ["D-6", "D-5", "D-4", "D-3", "D-2", "D-1", "오늘"];

export default function HistoryScreen() {
  const [history, setHistory] = useState<DayHistory[]>([]);
  const [settings, setSettings] = useState<Settings>({ weight: 70, goalType: "maintain" });
  const [viewDate, setViewDate] = useState(new Date());
  const { open, close } = useBottomSheet();

  useEffect(() => {
    Promise.all([getHistory(60), getSettings()]).then(([h, s]) => {
      setHistory(h);
      setSettings(s);
    });
  }, []);

  const goalType = GOAL_TYPES.find((g) => g.id === settings.goalType) ?? GOAL_TYPES[1];
  const goal = Math.round(settings.weight * goalType.multiplier);

  const historyMap = new Map(history.map((h) => [h.date, h]));

  const weekData = history.slice(0, 7).reverse();
  const barMax = Math.max(goal, ...weekData.map((d) => d.totalProtein));

  const calYear = viewDate.getFullYear();
  const calMonth = viewDate.getMonth();
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  function cellDate(day: number): string {
    return `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function getCellEmoji(day: number): string | null {
    const dateStr = cellDate(day);
    const entry = historyMap.get(dateStr);
    if (!entry || entry.totalProtein === 0) return null;
    return entry.totalProtein >= goal ? "💪" : "🦴";
  }

  function handleCellPress(day: number) {
    const dateStr = cellDate(day);
    const entry = historyMap.get(dateStr);
    const totalProtein = entry?.totalProtein ?? 0;
    const foods = entry?.entries ?? [];

    const d = new Date(dateStr);
    const title = `${d.getMonth() + 1}월 ${d.getDate()}일 (${DAY_LABELS[d.getDay()]})`;

    open({
      header: title,
      children: (
        <div style={{ padding: "0 24px 24px" }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#191F28",
              marginBottom: 12,
            }}
          >
            총 단백질: {totalProtein}g / {goal}g
          </div>
          {foods.length === 0 ? (
            <div style={{ color: "#8B95A1", fontSize: 14 }}>기록된 음식이 없어요</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {foods.map((f) => (
                <div
                  key={f.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 12px",
                    background: "#F9FAFB",
                    borderRadius: 8,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{f.emoji ?? "🍽️"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#191F28" }}>{f.name}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#FF6B35" }}>{f.protein}g</div>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={close}
            style={{
              marginTop: 16,
              width: "100%",
              padding: "12px",
              background: "#F2F4F6",
              border: "none",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              color: "#191F28",
            }}
          >
            닫기
          </button>
        </div>
      ),
      onClose: close,
    });
  }

  const prevMonth = () => {
    setViewDate(new Date(calYear, calMonth - 1, 1));
  };
  const nextMonth = () => {
    const now = new Date();
    if (calYear < now.getFullYear() || calMonth < now.getMonth()) {
      setViewDate(new Date(calYear, calMonth + 1, 1));
    }
  };

  return (
    <div style={{ paddingBottom: 80 }}>
      <Top
        title={<Top.TitleParagraph size={22}>기록</Top.TitleParagraph>}
      />

      <div style={{ padding: "0 20px 24px" }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#191F28", marginBottom: 12 }}>
          최근 7일
        </div>
        {weekData.length > 0 ? (
          <BarChart
            data={weekData.map((d, i) => ({
              maxValue: barMax,
              value: d.totalProtein,
              label: WEEK_LABELS[i],
              barAnnotation: d.totalProtein > 0 ? d.totalProtein : undefined,
            }))}
            fill={{ type: "auto", count: 1 }}
            height={160}
          />
        ) : (
          <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: "#8B95A1", fontSize: 14 }}>
            데이터가 없어요
          </div>
        )}
        {goal > 0 && (
          <div style={{ fontSize: 12, color: "#8B95A1", marginTop: 8 }}>
            일일 목표: {goal}g
          </div>
        )}
      </div>

      <div style={{ padding: "0 20px 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <button
            onClick={prevMonth}
            style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", padding: 4 }}
          >
            ‹
          </button>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#191F28" }}>
            {calYear}년 {MONTH_LABELS[calMonth]}
          </span>
          <button
            onClick={nextMonth}
            style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", padding: 4 }}
          >
            ›
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 2,
            marginBottom: 4,
          }}
        >
          {DAY_LABELS.map((d) => (
            <div
              key={d}
              style={{ textAlign: "center", fontSize: 11, color: "#8B95A1", padding: "4px 0" }}
            >
              {d}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 2,
          }}
        >
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const emoji = getCellEmoji(day);
            const isToday =
              new Date().getFullYear() === calYear &&
              new Date().getMonth() === calMonth &&
              new Date().getDate() === day;
            return (
              <button
                key={day}
                onClick={() => handleCellPress(day)}
                style={{
                  aspectRatio: "1",
                  borderRadius: 8,
                  border: isToday ? "2px solid #FF6B35" : "none",
                  background: isToday ? "#FFF3EE" : "#F9FAFB",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 2,
                  gap: 1,
                }}
              >
                <span style={{ fontSize: 11, color: isToday ? "#FF6B35" : "#6B7684", fontWeight: isToday ? 700 : 400 }}>
                  {day}
                </span>
                {emoji && <span style={{ fontSize: 12 }}>{emoji}</span>}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
          <div style={{ fontSize: 12, color: "#6B7684" }}>💪 목표 달성</div>
          <div style={{ fontSize: 12, color: "#6B7684" }}>🦴 미달성</div>
        </div>
      </div>
    </div>
  );
}
