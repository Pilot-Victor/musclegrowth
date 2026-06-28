import { useState, useEffect } from "react";
import { BottomSheet, TextField, useToast } from "@toss/tds-mobile";
import {
  getCustomFoods,
  addCustomFood,
  updateCustomFood,
  removeCustomFood,
  MAX_CUSTOM_FOODS,
} from "../storage";
import { useBackHandler } from "../hooks/useBackHandler";
import type { CustomFood } from "../types";

// 아이콘 선택용 이모지 목록
const FOOD_EMOJIS = [
  "🍗", "🥩", "🍖", "🍤", "🐟", "🦐",
  "🥚", "🥛", "🧀", "🍚", "🍞", "🥜",
  "🫘", "🥦", "🍌", "🥗", "🍣", "🍱",
  "🥪", "🌭", "🍫", "💪", "🥤", "🍳",
];

interface Props {
  onClose: () => void;
}

/**
 * 설정 → '즐겨 먹는 음식' 관리 화면.
 * 내가 자주 먹는 음식(내 음식)을 등록·수정·삭제해요.
 * 등록한 음식은 음식 추가 화면 맨 앞에 단위(개)로 노출돼 바로 기록할 수 있어요.
 */
export default function CustomFoodsScreen({ onClose }: Props) {
  const [foods, setFoods] = useState<CustomFood[]>([]);
  const load = () => getCustomFoods().then(setFoods);
  useEffect(() => {
    load();
  }, []);

  // 추가/편집은 시트로, 삭제는 행의 '삭제' 버튼 2번 탭으로 처리해요.
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [protein, setProtein] = useState("");
  const [emoji, setEmoji] = useState("");
  const [deleteArmedId, setDeleteArmedId] = useState<string | null>(null); // 삭제 2번탭 대상 행
  const toast = useToast();

  // 뒤로가기: 시트가 열려 있으면 TDS가 처리, 아니면 화면을 닫아요.
  useBackHandler(!sheetOpen, onClose);

  const openAdd = () => {
    if (foods.length >= MAX_CUSTOM_FOODS) {
      toast.openToast(`최대 ${MAX_CUSTOM_FOODS}개까지 등록할 수 있어요`);
      return;
    }
    setEditingId(null);
    setName("");
    setProtein("");
    setEmoji("");
    setDeleteArmedId(null);
    setSheetOpen(true);
  };

  const openEdit = (cf: CustomFood) => {
    setEditingId(cf.id);
    setName(cf.name);
    setProtein(String(cf.protein));
    setEmoji(cf.emoji);
    setDeleteArmedId(null);
    setSheetOpen(true);
  };

  const handleSave = async () => {
    const nm = name.trim();
    const pr = parseFloat(protein);
    if (!nm) {
      toast.openToast("음식 이름을 입력해 주세요");
      return;
    }
    if (isNaN(pr) || pr <= 0) {
      toast.openToast("올바른 단백질(g)을 입력해 주세요");
      return;
    }
    const em = emoji.trim() || "🍽️";
    if (editingId) {
      await updateCustomFood({ id: editingId, name: nm, protein: pr, emoji: em });
      toast.openToast("수정했어요 ✓");
    } else {
      await addCustomFood({
        id: `cf_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name: nm,
        protein: pr,
        emoji: em,
      });
      toast.openToast(`${em} ${nm} 등록했어요`);
    }
    setSheetOpen(false);
    load();
  };

  // 행의 '삭제' 버튼: 첫 탭은 확인 대기, 같은 행을 한 번 더 탭하면 삭제.
  const handleDeleteRow = async (id: string) => {
    if (deleteArmedId !== id) {
      setDeleteArmedId(id);
      return;
    }
    await removeCustomFood(id);
    toast.openToast("삭제했어요");
    setDeleteArmedId(null);
    load();
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
        {/* 헤더 */}
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
            aria-label="뒤로"
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
          <span style={{ fontSize: 18, fontWeight: 700, color: "#191F28" }}>즐겨 먹는 음식</span>
        </div>

        {/* 본문 */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 24px" }}>
          <div style={{ fontSize: 13, color: "#8B95A1", marginBottom: 16, lineHeight: 1.5 }}>
            자주 먹는 음식을 등록하면 음식 추가 화면에서 바로 기록할 수 있어요.
            <br />
            등록 {foods.length} / {MAX_CUSTOM_FOODS}개
          </div>

          {foods.length === 0 ? (
            <div
              style={{
                padding: "40px 0",
                textAlign: "center",
                color: "#B0B8C1",
                fontSize: 14,
              }}
            >
              아직 등록한 음식이 없어요.
              <br />
              아래 버튼으로 추가해 보세요.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {foods.map((cf) => {
                const armed = deleteArmedId === cf.id;
                return (
                  <div
                    key={cf.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: "#FAFAFB",
                      border: "1px solid #F2F4F6",
                    }}
                  >
                    <span style={{ fontSize: 26 }}>{cf.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "#191F28" }}>{cf.name}</div>
                      <div style={{ fontSize: 12, color: "#8B95A1", marginTop: 2 }}>1개당 {cf.protein}g</div>
                    </div>
                    <button
                      onClick={() => openEdit(cf)}
                      style={{
                        flexShrink: 0,
                        padding: "8px 14px",
                        borderRadius: 8,
                        border: "1px solid #FFD5C3",
                        background: "#fff",
                        color: "#FF6B35",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteRow(cf.id)}
                      style={{
                        flexShrink: 0,
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: armed ? "none" : "1px solid #FFD6D6",
                        background: armed ? "#FF4D4F" : "#fff",
                        color: armed ? "#fff" : "#FF4D4F",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {armed ? "한번 더" : "삭제"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* 추가 버튼 */}
          <button
            onClick={openAdd}
            style={{
              marginTop: 16,
              width: "100%",
              padding: "14px",
              borderRadius: 12,
              border: "1px dashed #FFB07A",
              background: "#FFF1EA",
              color: "#FF6B35",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            ＋ 즐겨 먹는 음식 추가
          </button>
        </div>
      </div>

      {/* 추가 / 편집 시트 (삭제는 목록의 '삭제' 버튼에서) */}
      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        header={<BottomSheet.Header>{editingId ? "음식 수정" : "음식 추가"}</BottomSheet.Header>}
        cta={<BottomSheet.CTA onClick={handleSave}>{editingId ? "수정하기" : "추가하기"}</BottomSheet.CTA>}
        hasTextField
      >
        <div style={{ padding: "0 24px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
          <TextField
            variant="box"
            label="음식 이름"
            placeholder="예: 닭가슴살 소시지"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            variant="box"
            label="1개당 단백질 (g)"
            placeholder="예: 12"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
          />
          <div>
            <div style={{ fontSize: 13, color: "#6B7684", marginBottom: 8 }}>아이콘 선택</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
              {FOOD_EMOJIS.map((em) => (
                <button
                  key={em}
                  onClick={() => setEmoji(em)}
                  style={{
                    height: 42,
                    fontSize: 22,
                    borderRadius: 8,
                    cursor: "pointer",
                    border: emoji === em ? "2px solid #FF6B35" : "1px solid #E5E8EB",
                    background: emoji === em ? "#FFF1EA" : "#fff",
                  }}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
