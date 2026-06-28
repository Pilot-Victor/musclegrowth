import { useState, useEffect } from "react";
import { Tab, TextField, BottomSheet, useToast } from "@toss/tds-mobile";
import { fetchAlbumItems } from "@apps-in-toss/web-framework";
import {
  addFoodEntry,
  getFavorites,
  getCustomFoods,
  addCustomFood,
  updateCustomFood,
  removeCustomFood,
  MAX_CUSTOM_FOODS,
} from "../storage";
import { useBackHandler } from "../hooks/useBackHandler";
import { PRESET_FOODS } from "../data/foods";
import FoodIcon from "../components/FoodIcon";
import type { PresetFood } from "../data/foods";
import type { FoodEntry, CustomFood } from "../types";

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

// 즐겨먹는 음식 아이콘 선택용 이모지 목록
const FOOD_EMOJIS = [
  "🍗", "🥩", "🍖", "🍤", "🐟", "🦐",
  "🥚", "🥛", "🧀", "🍚", "🍞", "🥜",
  "🫘", "🥦", "🍌", "🥗", "🍣", "🍱",
  "🥪", "🌭", "🍫", "💪", "🥤", "🍳",
];

export default function AddFoodScreen({ onClose, onAdded, date, dateLabel }: Props) {
  const [tabIndex, setTabIndex] = useState(0);

  // 단위 기반 음식: 카드별 수량 (기본 1)
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const getQty = (id: string) => qtys[id] ?? 1;
  const incQty = (id: string) => setQtys((p) => ({ ...p, [id]: getQty(id) + 1 }));
  const decQty = (id: string) => setQtys((p) => ({ ...p, [id]: Math.max(1, getQty(id) - 1) }));

  // 용량 기반 음식: BottomSheet
  const [gramFood, setGramFood] = useState<PresetFood | null>(null);
  const [gramAmount, setGramAmount] = useState("");

  // 직접 입력
  const [customName, setCustomName] = useState("");
  const [customProtein, setCustomProtein] = useState("");
  const [customImageUri, setCustomImageUri] = useState<string | undefined>();

  // 즐겨찾기(온보딩에서 고른 음식)를 프리셋 상단에 배치
  const [favorites, setFavorites] = useState<string[]>([]);
  useEffect(() => {
    getFavorites().then(setFavorites);
  }, []);

  // 내 음식(사용자 등록) — 프리셋 맨 앞에 단위(개) 음식으로 노출
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([]);
  const loadCustomFoods = () => getCustomFoods().then(setCustomFoods);
  useEffect(() => {
    loadCustomFoods();
  }, []);

  // 즐겨먹는 음식: 추가/편집 시트 하나로 처리 · 20개 제한
  // (중간 메뉴/중첩 시트를 없애 단순화 — 카드의 ✏️로 편집 시트를 바로 열고,
  //  삭제는 그 시트 안에서 2번 탭으로 확인해요.)
  const [foodSheetOpen, setFoodSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEmoji, setNewEmoji] = useState("");
  const [newName, setNewName] = useState("");
  const [newProtein, setNewProtein] = useState("");
  const [deleteArmed, setDeleteArmed] = useState(false); // 편집 시트 내 삭제 2번탭 확인
  const [limitOpen, setLimitOpen] = useState(false); // 20개 초과 시 삭제 유도

  const customPresets: PresetFood[] = customFoods.map((cf) => ({
    id: cf.id,
    name: cf.name,
    serving: "1개",
    protein: cf.protein,
    emoji: cf.emoji,
    color: "#FF6B35",
    bgColor: "#FFF1EA",
  }));
  const orderedFoods = [
    ...customPresets,
    ...favorites
      .map((id) => PRESET_FOODS.find((f) => f.id === id))
      .filter((f): f is PresetFood => Boolean(f)),
    ...PRESET_FOODS.filter((f) => !favorites.includes(f.id)),
  ];

  const toast = useToast();

  // 뒤로가기: 용량 시트가 열려 있으면 TDS BottomSheet가 처리하고,
  // 그 외에는 음식 추가 화면 자체를 닫아요(앱이 종료되지 않도록).
  useBackHandler(gramFood === null, onClose);

  const previewProtein = gramFood ? calcProtein(gramFood, gramAmount) : 0;

  // 단위 기반 음식: 카드에서 수량을 정해 '추가'
  const addUnit = async (food: PresetFood) => {
    const qty = getQty(food.id);
    const entry: FoodEntry = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name: qty > 1 ? `${food.name} ×${qty}` : food.name,
      protein: food.protein * qty,
      emoji: food.emoji,
      imageUri: food.image,
      baseName: food.name,
      amount: qty,
      unit: "개",
      proteinPerUnit: food.protein,
    };
    await addFoodEntry(entry, date);
    toast.openToast(`${food.emoji} ${entry.name} 추가했어요`);
    onAdded();
    // 화면 유지, 해당 음식 수량만 1로 초기화
    setQtys((p) => ({ ...p, [food.id]: 1 }));
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
      baseName: gramFood.name,
      amount,
      unit: gramFood.unit ?? "g",
      proteinPerUnit: gramFood.protein / (gramFood.servingGrams ?? 100),
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

  // 추가 시트 열기 (20개 초과면 삭제 유도 팝업으로)
  const openAddSheet = () => {
    if (customFoods.length >= MAX_CUSTOM_FOODS) {
      setLimitOpen(true);
      return;
    }
    setEditingId(null);
    setNewEmoji("");
    setNewName("");
    setNewProtein("");
    setDeleteArmed(false);
    setFoodSheetOpen(true);
  };

  // 편집 시트 열기 (기존 값 채움) — 카드 ✏️에서 바로 호출해요.
  const openEditSheet = (cf: CustomFood) => {
    setEditingId(cf.id);
    setNewEmoji(cf.emoji);
    setNewName(cf.name);
    setNewProtein(String(cf.protein));
    setDeleteArmed(false);
    setFoodSheetOpen(true);
  };

  // 추가/편집 저장
  const handleSaveFood = async () => {
    const name = newName.trim();
    const protein = parseFloat(newProtein);
    if (!name) {
      toast.openToast("음식 이름을 입력해 주세요");
      return;
    }
    if (isNaN(protein) || protein <= 0) {
      toast.openToast("올바른 단백질(g)을 입력해 주세요");
      return;
    }
    const emoji = newEmoji.trim() || "🍽️";
    if (editingId) {
      await updateCustomFood({ id: editingId, name, protein, emoji });
      toast.openToast("수정했어요 ✓");
    } else {
      await addCustomFood({
        id: `cf_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name,
        protein,
        emoji,
      });
      toast.openToast(`${emoji} ${name} 추가했어요`);
    }
    setFoodSheetOpen(false);
    loadCustomFoods();
  };

  // 편집 시트 안에서 삭제 (실수 방지 위해 2번 탭 확인)
  const handleDeleteFood = async () => {
    if (!editingId) return;
    if (!deleteArmed) {
      setDeleteArmed(true);
      return;
    }
    await removeCustomFood(editingId);
    toast.openToast("삭제했어요");
    setFoodSheetOpen(false);
    setDeleteArmed(false);
    loadCustomFoods();
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
          <Tab onChange={(index) => setTabIndex(index)}>
            <Tab.Item selected={tabIndex === 0}>프리셋 음식</Tab.Item>
            <Tab.Item selected={tabIndex === 1}>직접 입력</Tab.Item>
          </Tab>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            paddingBottom: tabIndex === 1 ? 80 : 16,
          }}
        >
          {tabIndex === 0 ? (
            <>
              <button
                onClick={openAddSheet}
                style={{
                  width: "100%",
                  padding: "12px",
                  marginBottom: 12,
                  borderRadius: 8,
                  border: "1px dashed #FFB07A",
                  background: "#FFF1EA",
                  color: "#FF6B35",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ➕ 즐겨먹는 음식 추가
              </button>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
              {orderedFoods.map((food) => {
                const isCustom = food.id.startsWith("cf_");
                const stepBtnStyle = {
                  width: 26,
                  height: 26,
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
                  padding: 0,
                } as const;
                const addBtnStyle = {
                  marginTop: 4,
                  width: "100%",
                  padding: "8px 0",
                  borderRadius: 8,
                  border: "none",
                  background: food.color,
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                } as const;
                return (
                  <div
                    key={food.id}
                    style={{
                      position: "relative",
                      background: food.bgColor,
                      borderRadius: 8,
                      padding: "14px 8px 12px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    {isCustom && (
                      <button
                        onClick={() => {
                          const cf = customFoods.find((c) => c.id === food.id);
                          if (cf) openEditSheet(cf);
                        }}
                        aria-label="수정 / 삭제"
                        style={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          border: "none",
                          background: "rgba(255,255,255,0.85)",
                          fontSize: 13,
                          cursor: "pointer",
                          padding: 0,
                          lineHeight: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        ✏️
                      </button>
                    )}
                    <FoodIcon emoji={food.emoji} image={food.image} size={28} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#191F28" }}>{food.name}</span>
                    <span style={{ fontSize: 11, color: "#8B95A1" }}>
                      {food.serving}당 {food.protein}g
                    </span>
                    {food.isGramBased ? (
                      <button onClick={() => openGramSheet(food)} style={addBtnStyle}>
                        용량 추가
                      </button>
                    ) : (
                      <>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                          <button onClick={() => decQty(food.id)} style={stepBtnStyle} aria-label="수량 줄이기">
                            −
                          </button>
                          <span style={{ fontSize: 15, fontWeight: 700, color: "#191F28", minWidth: 16, textAlign: "center" }}>
                            {getQty(food.id)}
                          </span>
                          <button onClick={() => incQty(food.id)} style={stepBtnStyle} aria-label="수량 늘리기">
                            +
                          </button>
                        </div>
                        <button onClick={() => addUnit(food)} style={addBtnStyle}>
                          추가
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
              </div>
            </>
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

        {tabIndex === 1 && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              padding: "16px 16px calc(16px + env(safe-area-inset-bottom))",
              background: "#fff",
              borderTop: "1px solid #F2F4F6",
            }}
          >
            <button
              onClick={handleCustomAdd}
              style={{
                width: "100%",
                padding: 16,
                borderRadius: 8,
                border: "none",
                background: "#FF6B35",
                color: "#fff",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              추가하기
            </button>
          </div>
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
                background: "#FFF1EA",
                borderRadius: 8,
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

      {/* 즐겨먹는 음식 추가 / 편집 BottomSheet (수정·삭제를 여기 하나로 처리) */}
      <BottomSheet
        open={foodSheetOpen}
        onClose={() => {
          setFoodSheetOpen(false);
          setDeleteArmed(false);
        }}
        header={
          <BottomSheet.Header>{editingId ? "즐겨먹는 음식 수정" : "즐겨먹는 음식 추가"}</BottomSheet.Header>
        }
        cta={<BottomSheet.CTA onClick={handleSaveFood}>{editingId ? "수정하기" : "추가하기"}</BottomSheet.CTA>}
        hasTextField
      >
        <div style={{ padding: "0 24px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
          <TextField
            variant="box"
            label="음식 이름"
            placeholder="예: 닭가슴살 소시지"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <TextField
            variant="box"
            label="1개당 단백질 (g)"
            placeholder="예: 12"
            value={newProtein}
            onChange={(e) => setNewProtein(e.target.value)}
          />
          <div>
            <div style={{ fontSize: 13, color: "#6B7684", marginBottom: 8 }}>아이콘 선택</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
              {FOOD_EMOJIS.map((em) => (
                <button
                  key={em}
                  onClick={() => setNewEmoji(em)}
                  style={{
                    height: 42,
                    fontSize: 22,
                    borderRadius: 8,
                    cursor: "pointer",
                    border: newEmoji === em ? "2px solid #FF6B35" : "1px solid #E5E8EB",
                    background: newEmoji === em ? "#FFF1EA" : "#fff",
                  }}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* 편집 중일 때만 — 같은 시트 안에서 삭제 (2번 탭 확인) */}
          {editingId && (
            <button
              onClick={handleDeleteFood}
              style={{
                width: "100%",
                padding: 14,
                borderRadius: 8,
                border: deleteArmed ? "none" : "1px solid #FFD6D6",
                background: deleteArmed ? "#FF4D4F" : "#FFF5F5",
                color: deleteArmed ? "#fff" : "#FF4D4F",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {deleteArmed ? "한 번 더 누르면 삭제돼요" : "🗑️ 이 음식 삭제"}
            </button>
          )}
        </div>
      </BottomSheet>

      {/* 20개 초과 — 삭제 유도 */}
      <BottomSheet
        open={limitOpen}
        onClose={() => setLimitOpen(false)}
        header={<BottomSheet.Header>즐겨먹는 음식이 가득 찼어요</BottomSheet.Header>}
      >
        <div style={{ padding: "0 20px 24px" }}>
          <div style={{ fontSize: 14, color: "#8B95A1", marginBottom: 12 }}>
            최대 {MAX_CUSTOM_FOODS}개까지 등록할 수 있어요. 새로 추가하려면 기존 음식을 삭제해 주세요.
          </div>
          {customFoods.map((cf) => (
            <div
              key={cf.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 0",
                borderBottom: "1px solid #F2F4F6",
              }}
            >
              <span style={{ fontSize: 24 }}>{cf.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#191F28" }}>{cf.name}</div>
                <div style={{ fontSize: 12, color: "#8B95A1" }}>1개당 {cf.protein}g</div>
              </div>
              <button
                onClick={async () => {
                  await removeCustomFood(cf.id);
                  toast.openToast("삭제했어요");
                  loadCustomFoods();
                }}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "1px solid #FFD5C3",
                  background: "#FFF1EA",
                  color: "#FF6B35",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      </BottomSheet>
    </>
  );
}
