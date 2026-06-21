export interface PresetFood {
  id: string;
  name: string;
  serving: string;
  protein: number;
  emoji: string;
  color: string;
  bgColor: string;
  isGramBased?: boolean;
  servingGrams?: number;
  unit?: "g" | "ml";
  /**
   * (선택) 이모지 대신 보여줄 내 이미지 경로예요.
   * 이미지를 public/foods/ 에 넣고 "/foods/파일명.png" 형식으로 적어요.
   * 예) image: "/foods/chicken.png"
   */
  image?: string;
}

export interface GoalType {
  id: "bulk" | "maintain" | "cut";
  label: string;
  sublabel: string;
  multiplier: number;
  color: string;
  bgColor: string;
  description: string;
}

export const PRESET_FOODS: PresetFood[] = [
  { id: "f1", name: "닭가슴살", serving: "100g", protein: 23, emoji: "🍗", color: "#FFE0B2", bgColor: "#FFF3E0", isGramBased: true, servingGrams: 100, unit: "g" },
  { id: "f2", name: "달걀", serving: "1개", protein: 6, emoji: "🥚", color: "#FFF9C4", bgColor: "#FFFDE7" },
  { id: "f3", name: "두부", serving: "100g", protein: 8, emoji: "🫙", color: "#DCEDC8", bgColor: "#F1F8E9", isGramBased: true, servingGrams: 100, unit: "g" },
  { id: "f4", name: "그릭요거트", serving: "170g", protein: 17, emoji: "🥛", color: "#E3F2FD", bgColor: "#E3F2FD", isGramBased: true, servingGrams: 170, unit: "g" },
  { id: "f5", name: "참치캔", serving: "1캔", protein: 20, emoji: "🐟", color: "#B3E5FC", bgColor: "#E1F5FE" },
  { id: "f6", name: "소고기", serving: "100g", protein: 26, emoji: "🥩", color: "#FFCCBC", bgColor: "#FBE9E7", isGramBased: true, servingGrams: 100, unit: "g" },
  { id: "f7", name: "연어", serving: "100g", protein: 20, emoji: "🐠", color: "#FFAB91", bgColor: "#FBE9E7", isGramBased: true, servingGrams: 100, unit: "g" },
  { id: "f8", name: "우유", serving: "200ml", protein: 8, emoji: "🍼", color: "#E8EAF6", bgColor: "#EDE7F6", isGramBased: true, servingGrams: 200, unit: "ml" },
  { id: "f9", name: "단백질쉐이크", serving: "1스쿱", protein: 25, emoji: "💪", color: "#CE93D8", bgColor: "#F3E5F5" },
  { id: "f10", name: "아몬드", serving: "30g", protein: 6, emoji: "🌰", color: "#D7CCC8", bgColor: "#EFEBE9", isGramBased: true, servingGrams: 30, unit: "g" },
  { id: "f11", name: "돼지고기", serving: "100g", protein: 20, emoji: "🥓", color: "#FFCDD2", bgColor: "#FFEBEE", isGramBased: true, servingGrams: 100, unit: "g" },
  { id: "f12", name: "콩", serving: "100g", protein: 9, emoji: "🫘", color: "#C8E6C9", bgColor: "#E8F5E9", isGramBased: true, servingGrams: 100, unit: "g" },
  { id: "f13", name: "새우", serving: "100g", protein: 18, emoji: "🦐", color: "#FFCCBC", bgColor: "#FBE9E7", isGramBased: true, servingGrams: 100, unit: "g" },
  { id: "f14", name: "치즈", serving: "1장", protein: 7, emoji: "🧀", color: "#FFF9C4", bgColor: "#FFFDE7" },
  { id: "f15", name: "프로틴바", serving: "1개", protein: 20, emoji: "🍫", color: "#D7CCC8", bgColor: "#EFEBE9" },
];

export const GOAL_TYPES: GoalType[] = [
  { id: "bulk", label: "근육 증가", sublabel: "벌크업", multiplier: 2.2, color: "#FF6B35", bgColor: "#FFF3EE", description: "체중 × 2.2g" },
  { id: "maintain", label: "체형 유지", sublabel: "유지", multiplier: 1.6, color: "#4CAF50", bgColor: "#F1F8F1", description: "체중 × 1.6g" },
  { id: "cut", label: "체지방 감소", sublabel: "다이어트", multiplier: 1.2, color: "#2196F3", bgColor: "#E8F4FD", description: "체중 × 1.2g" },
];
