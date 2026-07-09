import { useState, useEffect } from "react";
import { TextField, useToast } from "@toss/tds-mobile";
import {
  getCustomFoods,
  addCustomFood,
  updateCustomFood,
  removeCustomFood,
  MAX_CUSTOM_FOODS,
  getEffectivePresets,
  setPresetOverride,
  hidePreset,
  restorePresets,
  hasPresetEdits,
} from "../storage";
import { useBackHandler } from "../hooks/useBackHandler";
import type { CustomFood } from "../types";
import type { PresetFood } from "../data/foods";

// 빠른 선택용 이모지 (원하는 이모지가 없으면 아래 '직접 입력'으로 아무 이모지나 사용 가능)
const FOOD_EMOJIS = [
  "🍗", "🍖", "🥩", "🥓", "🍤", "🦐",
  "🦑", "🦀", "🐟", "🐠", "🍣", "🍱",
  "🍙", "🍚", "🍜", "🍲", "🥘", "🍝",
  "🌮", "🌯", "🥙", "🧆", "🥪", "🍔",
  "🍕", "🌭", "🥨", "🥐", "🍞", "🥖",
  "🧇", "🥞", "🧈", "🥚", "🍳", "🧀",
  "🥛", "🥜", "🌰", "🫘", "🥦", "🥬",
  "🥕", "🌽", "🍅", "🥑", "🍠", "🥔",
  "🍌", "🍎", "🍊", "🍇", "🍓", "🫐",
  "🍑", "🥝", "🍍", "🥭", "🍉", "🥥",
  "🍫", "🍩", "🍪", "🎂", "🧁", "🍦",
  "🍯", "☕", "🍵", "🧃", "🥤", "🧋",
  "🍺", "💪", "🔥", "⭐", "🍽️", "🥗",
];

// 프리셋과 내 음식을 한 목록에서 관리하기 위한 통합 항목
interface Item {
  key: string;
  kind: "custom" | "preset";
  id: string;
  name: string;
  protein: number;
  emoji: string;
  serving: string; // "1개" | "100g" 등
}

interface Props {
  onClose: () => void;
}

/**
 * 설정 → '즐겨 먹는 음식' 관리 화면.
 * 프리셋(기본 제공)과 내 음식(직접 등록)을 한 화면에서 모두 수정/삭제해요.
 * - 프리셋 수정 = 오버라이드 저장, 삭제 = 숨김 (기본값 복원 가능)
 * - 내 음식 = 추가/수정/삭제
 */
export default function CustomFoodsScreen({ onClose }: Props) {
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([]);
  const [presets, setPresets] = useState<PresetFood[]>([]);
  const [edited, setEdited] = useState(false);

  const load = async () => {
    const [cf, pf, ed] = await Promise.all([
      getCustomFoods(),
      getEffectivePresets(),
      hasPresetEdits(),
    ]);
    setCustomFoods(cf);
    setPresets(pf);
    setEdited(ed);
  };
  useEffect(() => {
    load();
  }, []);

  const [adding, setAdding] = useState(false);
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editKind, setEditKind] = useState<"custom" | "preset">("custom");
  const [editId, setEditId] = useState<string>("");
  const [editServing, setEditServing] = useState("1개");
  const [name, setName] = useState("");
  const [protein, setProtein] = useState("");
  const [emoji, setEmoji] = useState("");
  const [deleteArmedKey, setDeleteArmedKey] = useState<string | null>(null);
  const [restoreArmed, setRestoreArmed] = useState(false);
  const toast = useToast();

  const formOpen = adding || editKey !== null;

  useBackHandler(true, () => (formOpen ? closeForm() : onClose()));

  const items: Item[] = [
    ...customFoods.map((cf) => ({
      key: `c_${cf.id}`,
      kind: "custom" as const,
      id: cf.id,
      name: cf.name,
      protein: cf.protein,
      emoji: cf.emoji,
      serving: "1개",
    })),
    ...presets.map((p) => ({
      key: `p_${p.id}`,
      kind: "preset" as const,
      id: p.id,
      name: p.name,
      protein: p.protein,
      emoji: p.emoji,
      serving: p.serving,
    })),
  ];

  const closeForm = () => {
    setAdding(false);
    setEditKey(null);
    setName("");
    setProtein("");
    setEmoji("");
  };

  const openAdd = () => {
    if (customFoods.length >= MAX_CUSTOM_FOODS) {
      toast.openToast(`내 음식은 최대 ${MAX_CUSTOM_FOODS}개까지 등록할 수 있어요`);
      return;
    }
    setDeleteArmedKey(null);
    setRestoreArmed(false);
    setEditKey(null);
    setEditKind("custom");
    setEditServing("1개");
    setName("");
    setProtein("");
    setEmoji("");
    setAdding(true);
  };

  const openEdit = (item: Item) => {
    setDeleteArmedKey(null);
    setRestoreArmed(false);
    setAdding(false);
    setEditKey(item.key);
    setEditKind(item.kind);
    setEditId(item.id);
    setEditServing(item.serving);
    setName(item.name);
    setProtein(String(item.protein));
    setEmoji(item.emoji);
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
    if (adding) {
      await addCustomFood({
        id: `cf_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name: nm,
        protein: pr,
        emoji: em,
      });
      toast.openToast(`${em} ${nm} 등록했어요`);
    } else if (editKind === "custom") {
      await updateCustomFood({ id: editId, name: nm, protein: pr, emoji: em });
      toast.openToast("수정했어요 ✓");
    } else {
      await setPresetOverride(editId, { name: nm, protein: pr, emoji: em });
      toast.openToast("수정했어요 ✓");
    }
    closeForm();
    await load();
  };

  const handleDelete = async (item: Item) => {
    if (deleteArmedKey !== item.key) {
      setDeleteArmedKey(item.key);
      return;
    }
    if (item.kind === "custom") {
      await removeCustomFood(item.id);
    } else {
      await hidePreset(item.id);
    }
    toast.openToast("삭제했어요");
    setDeleteArmedKey(null);
    await load();
  };

  const handleRestore = async () => {
    if (!restoreArmed) {
      setRestoreArmed(true);
      return;
    }
    await restorePresets();
    toast.openToast("기본 음식을 되돌렸어요");
    setRestoreArmed(false);
    await load();
  };

  return (
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

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 40px" }}>
        <div style={{ fontSize: 13, color: "#8B95A1", marginBottom: 16, lineHeight: 1.5 }}>
          음식 추가 화면에 나오는 음식이에요. 기본 음식도 값을 바꾸거나 삭제할 수 있어요.
        </div>

        {/* 인라인 추가/편집 폼 */}
        {formOpen && (
          <div
            style={{
              padding: "16px",
              borderRadius: 12,
              background: "#FFF7F3",
              border: "1px solid #FFD5C3",
              marginBottom: 16,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, color: "#191F28" }}>
              {adding ? "새 음식 추가" : "음식 수정"}
            </div>
            <TextField
              variant="box"
              label="음식 이름"
              placeholder="예: 닭가슴살 소시지"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              variant="box"
              label={`${editServing}당 단백질 (g)`}
              placeholder="예: 12"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
            />
            <div>
              <div
                style={{
                  fontSize: 13,
                  color: "#6B7684",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                아이콘 선택
                <span style={{ fontSize: 20 }}>{emoji || "🍽️"}</span>
                <span style={{ color: "#B0B8C1" }}>현재 아이콘</span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(6, 1fr)",
                  gap: 8,
                  maxHeight: 210,
                  overflowY: "auto",
                }}
              >
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
              <div style={{ marginTop: 10 }}>
                <TextField
                  variant="box"
                  label="직접 입력 (아무 이모지나)"
                  placeholder="예: 🍗 (이모지 키보드로 입력)"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={closeForm}
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 8,
                  border: "1px solid #E5E8EB",
                  background: "#fff",
                  color: "#4E5968",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                취소
              </button>
              <button
                onClick={handleSave}
                style={{
                  flex: 2,
                  padding: 14,
                  borderRadius: 8,
                  border: "none",
                  background: "#FF6B35",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {adding ? "추가하기" : "수정 저장"}
              </button>
            </div>
          </div>
        )}

        {/* 통합 목록 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((item) => {
            const armed = deleteArmedKey === item.key;
            const isEditing = editKey === item.key;
            return (
              <div
                key={item.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: isEditing ? "#FFF1EA" : "#FAFAFB",
                  border: `1px solid ${isEditing ? "#FFD5C3" : "#F2F4F6"}`,
                }}
              >
                <span style={{ fontSize: 26 }}>{item.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#191F28" }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: "#8B95A1", marginTop: 2 }}>
                    {item.serving}당 {item.protein}g
                  </div>
                </div>
                <button
                  onClick={() => openEdit(item)}
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
                  onClick={() => handleDelete(item)}
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

        {/* 내 음식 추가 */}
        {!formOpen && (
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
            ＋ 내 음식 추가
          </button>
        )}

        {/* 기본값 복원 (프리셋을 수정/삭제한 적이 있을 때만) */}
        {!formOpen && edited && (
          <button
            onClick={handleRestore}
            style={{
              marginTop: 10,
              width: "100%",
              padding: "12px",
              borderRadius: 12,
              border: "none",
              background: restoreArmed ? "#4E5968" : "#F2F4F6",
              color: restoreArmed ? "#fff" : "#6B7684",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {restoreArmed ? "한 번 더 누르면 기본 음식으로 되돌려요" : "기본 음식 되돌리기 (수정/삭제 초기화)"}
          </button>
        )}
      </div>
    </div>
  );
}
