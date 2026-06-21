import { useState } from "react";
import { Tab, TextField, FixedBottomCTA, BottomSheet, useToast } from "@toss/tds-mobile";
import { fetchAlbumItems } from "@apps-in-toss/web-framework";
import { addFoodEntry } from "../storage";
import { PRESET_FOODS } from "../data/foods";
import FoodIcon from "../components/FoodIcon";
import type { PresetFood } from "../data/foods";
import type { FoodEntry } from "../types";

interface Props {
  onClose: () => void;
  onAdded: () => void;
  /** 추가할 날짜(YYYY-MM-DD). 생략하면 오늘에 추가해요. */
  date?: string;
  /** 헤더에 표시할 날짜 라벨(예: "6월 18일"). 과거 기록 추가 시 사용해요. */
  dateLabel?: string;
}

function calcProtein(food: PresetFood, amountStr: string): number {
  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0 || !food.servingGrams) return 0;
  return Math.round((food.protein / food.servingGrams) * amount * 10) / 10;
}

export default function AddFoodScreen({ onClose, onAdded, date, dateLabel }: Props) {
  const [tabIndex, setTabIndex] = useState(0);

  // 단위 기반 음식: 카운터
  const [selections, setSelections] = useState<Record<string, number>>({});

  // 용량 기반 음식: BottomSheet
  const [gramFood, setGramFood] = useState<PresetFood | null>(null);
  const [gramAmount, setGramAmount] = useState("");

  // 직접 입력
  const [customName, setCustomName] = useState("");
  const [customProtein, setCustomProtein] = useState("");
  const [customImageUri, setCustomImageUri] = useState<string | undefined>();

  const toast = useToast();

  const totalSelected = Object.values(selections).reduce((s, n) => s + n, 0);
  const previewProtein = gramFood ? calcProtein(gramFood, gramAmount) : 0;

  // 단위 기반 카운터
  const increment = (foodId: string) => {
    setSelections((prev) => ({ ...prev, [foodId]: (prev[foodId] ?? 0) + 1 }));
  };
  const decrement = (foodId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelections((prev) => {
      const next = (prev[foodId] ?? 0) - 1;
      if (next <= 0) {
        const rest = { ...prev };
        delete rest[foodId];
        return rest;
      }
      return { ...prev, [foodId]: next };
    });
  };

  // 단위 기반 일괄 추가
  const handleUnitConfirm = async () => {
    for (const [foodId, qty] of Object.entries(selections)) {
      const food = PRESET_FOODS.find((f) => f.id === foodId)!;
      const entry: FoodEntry = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name: qty > 1 ? `${food.name} ×${qty}` : food.name,
        protein: food.protein * qty,
        emoji: food.emoji,
        imageUri: food.image,
      };
      await addFoodEntry(entry, date);
    }
    const names = Object.entries(selections)
      .map(([id, qty]) => {
        const food = PRESET_FOODS.find((f) => f.id === id)!;
        return qty > 1 ? `${food.emoji} ${food.name} ×${qty}` : `${food.emoji} ${food.name}`;
      })
      .join(", ");
    toast.openToast(`${names} 추가했어요`);
    onAdded();
    // 화면을 닫지 않고 선택만 초기화해서 이어서 다른 음식을 추가할 수 있어요.
    setSelections({});
  };

  // 용량 기반 BottomSheet 열기
  const openGramSheet = (food: PresetFood) => {
    setGramFood(food);
    setGramAmount(String(food.servingGrams ?? 100));
  };

  // 용량 기반 추가
  const handleGramAdd = async () => {
    if (!gramFood) return;
    const amount = parseFloat(gramAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.openToast("올바른 용량을 입력해 주세요");
      return;
    }
    const protein = calcProtein(gramFood, gramAmount);
    const entry: FoodEntry = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name: `${gramFood.name} (${amount}${gramFood.unit ?? "g"})`,
      protein,
      emoji: gramFood.emoji,
      imageUri: gramFood.image,
    };
    await addFoodEntry(entry, date);
    toast.openToast(`${gramFood.emoji} ${gramFood.name} ${protein}g 추가했어요`);
    setGramFood(null);
    setGramAmount("");
    onAdded();
  };

  // 직접 입력
  const handleImagePick = async () => {
    try {
      const items = await fetchAlbumItems({ types: ["PHOTO"], maxCount: 1 });
      if (items && items.length > 0) {
        setCustomImageUri(items[0].dataUri);
      }
    } catch {
      toast.openToast("사진을 불러올 수 없어요");
    }
  };

  const handleCustomAdd = async () => {
    const name = customName.trim();
    const protein = parseFloat(customProtein);
    if (!name) {
      toast.openToast("음식 이름을 입력해 주세요");
      return;
    }
    if (isNaN(protein) || protein <= 0) {
      toast.openToast("올바른 단백질 함량을 입력해 주세요");
      return;
    }
    const entry: FoodEntry = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name,
      protein,
      imageUri: customImageUri,
      isCustom: true,
    };
    await addFoodEntry(entry, date);
    toast.openToast(`${name} ${protein}g 추가했어요`);
    onAdded();
    // 화면을 닫지 않고 입력만 초기화해서 이어서 다른 음식을 추가할 수 있어요.
    setCustomName("");
    setCustomProtein("");
    setCustomImageUri(undefined);
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#fff",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: "1px solid #F2F4F6",
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
              padding: 0,
              marginRight: 12,
              color: "#191F28",
            }}
          >
            ←
          </button>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#191F28" }}>
            음식 추가{dateLabel ? ` · ${dateLabel}` : ""}
          </span>
        </div>

        <div style={{ borderBottom: "1px solid #F2F4F6" }}>
          <Tab onChange={(index) => { setTabIndex(index); setSelections({}); }}>
            <Tab.Item selected={tabIndex === 0}>프리셋 음식</Tab.Item>
            <Tab.Item selected={tabIndex === 1}>직접 입력</Tab.Item>
          </Tab>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            paddingBottom: totalSelected > 0 ? 80 : 16,
          }}
        >
          {tabIndex === 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
              {PRESET_FOODS.map((food) => {
                const qty = selections[food.id] ?? 0;
                const selected = qty > 0;

                if (food.isGramBased) {
                  return (
                    <div
                      key={food.id}
                      onClick={() => openGramSheet(food)}
                      style={{
                        position: "relative",
                        background: food.bgColor,
                        border: "2px solid transparent",
                        borderRadius: 12,
                        padding: "16px 8px",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        userSelect: "none",
                      }}
                    >
                      <FoodIcon emoji={food.emoji} image={food.image} size={28} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#191F28" }}>{food.name}</span>
                      <span
                        style={{
                          fontSize: 11,
                          color: "#fff",
                          background: food.color,
                          borderRadius: 6,
                          padding: "1px 6px",
                          fontWeight: 600,
                        }}
                      >
                        {food.serving}당 {food.protein}g
                      </span>
                      <span style={{ fontSize: 11, color: "#8B95A1" }}>탭하여 용량 입력</span>
                    </div>
                  );
                }

                // 단위 기반
                return (
                  <div
                    key={food.id}
                    onClick={() => increment(food.id)}
                    style={{
                      position: "relative",
                      background: food.bgColor,
                      border: `2px solid ${selected ? food.color : "transparent"}`,
                      borderRadius: 12,
                      padding: "16px 8px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      userSelect: "none",
                    }}
                  >
                    {selected && (
                      <div
                        style={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          minWidth: 20,
                          height: 20,
                          borderRadius: 10,
                          background: food.color,
                          color: "#fff",
                          fontSize: 11,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "0 5px",
                        }}
                      >
                        {qty}
                      </div>
                    )}
                    <FoodIcon emoji={food.emoji} image={food.image} size={28} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#191F28" }}>{food.name}</span>
                    <span style={{ fontSize: 12, color: "#8B95A1" }}>{food.serving}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: food.color }}>
                      단백질 {food.protein}g
                    </span>
                    {selected && (
                      <button
                        onClick={(e) => decrement(food.id, e)}
                        style={{
                          marginTop: 2,
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: "#fff",
                          border: `1.5px solid ${food.color}`,
                          color: food.color,
                          fontSize: 16,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          lineHeight: 1,
                        }}
                      >
                        −
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <TextField
                variant="box"
                label="음식 이름"
                placeholder="예: 닭가슴살 샐러드"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
              <TextField
                variant="box"
                label="단백질 함량 (g)"
                placeholder="예: 30"
                value={customProtein}
                onChange={(e) => setCustomProtein(e.target.value)}
              />
              <div>
                <div style={{ fontSize: 13, color: "#6B7684", marginBottom: 8 }}>음식 사진 (선택)</div>
                {customImageUri ? (
                  <div style={{ position: "relative", display: "inline-block" }}>
                    <img
                      src={customImageUri}
                      alt="선택된 이미지"
                      style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }}
                    />
                    <button
                      onClick={() => setCustomImageUri(undefined)}
                      style={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: "#6B7684",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleImagePick}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 8,
                      border: "2px dashed #D1D6DB",
                      background: "#F9FAFB",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                      color: "#8B95A1",
                      fontSize: 12,
                    }}
                  >
                    <span style={{ fontSize: 24 }}>📷</span>
                    <span>사진 추가</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {tabIndex === 0 && totalSelected > 0 && (
          <FixedBottomCTA onClick={handleUnitConfirm}>{totalSelected}개 추가하기</FixedBottomCTA>
        )}
        {tabIndex === 1 && (
          <FixedBottomCTA onClick={handleCustomAdd}>추가하기</FixedBottomCTA>
        )}
      </div>

      {/* 용량 입력 BottomSheet */}
      <BottomSheet
        open={gramFood !== null}
        onClose={() => setGramFood(null)}
        header={
          gramFood ? (
            <BottomSheet.Header>
              {gramFood.emoji} {gramFood.name}
            </BottomSheet.Header>
          ) : undefined
        }
        headerDescription={
          gramFood ? (
            <BottomSheet.HeaderDescription>
              {gramFood.serving}당 단백질 {gramFood.protein}g
            </BottomSheet.HeaderDescription>
          ) : undefined
        }
        cta={
          <BottomSheet.CTA onClick={handleGramAdd}>추가하기</BottomSheet.CTA>
        }
        hasTextField
      >
        <div style={{ padding: "0 24px 16px" }}>
          <TextField
            variant="box"
            label={`용량 (${gramFood?.unit ?? "g"})`}
            placeholder={String(gramFood?.servingGrams ?? 100)}
            value={gramAmount}
            onChange={(e) => setGramAmount(e.target.value)}
          />
          {previewProtein > 0 && (
            <div
              style={{
                marginTop: 16,
                padding: "14px 16px",
                background: "#FFF3EE",
                borderRadius: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 14, color: "#8B95A1" }}>예상 단백질</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: "#FF6B35" }}>
                {previewProtein}g
              </span>
            </div>
          )}
        </div>
      </BottomSheet>
    </>
  );
}
