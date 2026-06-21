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

// ---------------------------------------------------------------------------
// 추천 — 단백질 함량이 높은 음식 TOP 10
// proteinPer100g: 100g당 단백질(g). serving: 권장 섭취량. tip: 권장 섭취 방법.
// ---------------------------------------------------------------------------
export interface RecommendedFood {
  rank: number;
  name: string;
  emoji: string;
  proteinPer100g: number;
  serving: string;
  tip: string;
  logLabel: string; // '오늘 기록에 추가' 시 기록할 1회 분량 표기
  logProtein: number; // 그 분량의 단백질(g)
}

export const RECOMMENDED_FOODS: RecommendedFood[] = [
  { rank: 1, name: "단백질 보충제(웨이)", emoji: "💪", proteinPer100g: 80, serving: "1스쿱(약 30g)", tip: "운동 직후 30분 이내에 물이나 우유에 타서 빠르게 흡수시켜요.", logLabel: "1스쿱", logProtein: 24 },
  { rank: 2, name: "닭가슴살", emoji: "🍗", proteinPer100g: 31, serving: "끼니당 100~150g", tip: "기름 없이 삶거나 구워서 드세요. 퍽퍽하면 요거트 소스와 함께.", logLabel: "120g", logProtein: 37 },
  { rank: 3, name: "참치(캔)", emoji: "🐟", proteinPer100g: 29, serving: "1캔(약 100g)", tip: "기름 대신 물에 담긴 제품을 골라 기름기를 빼고 드세요.", logLabel: "1캔", logProtein: 29 },
  { rank: 4, name: "소고기 살코기", emoji: "🥩", proteinPer100g: 26, serving: "끼니당 100~150g", tip: "안심·우둔처럼 기름이 적은 부위를 굽거나 삶아서 드세요.", logLabel: "120g", logProtein: 31 },
  { rank: 5, name: "새우", emoji: "🦐", proteinPer100g: 24, serving: "100g(약 8~10마리)", tip: "지방이 적어 다이어트에 좋아요. 데치거나 구워서 드세요.", logLabel: "100g", logProtein: 24 },
  { rank: 6, name: "돼지고기 안심", emoji: "🥓", proteinPer100g: 22, serving: "끼니당 100g", tip: "삼겹살보다 안심·등심이 단백질 대비 지방이 적어요.", logLabel: "100g", logProtein: 22 },
  { rank: 7, name: "연어", emoji: "🐠", proteinPer100g: 22, serving: "100~150g, 주 2회", tip: "오메가-3가 풍부해요. 구이나 스테이크로 주 2회 정도.", logLabel: "120g", logProtein: 26 },
  { rank: 8, name: "달걀", emoji: "🥚", proteinPer100g: 13, serving: "하루 2~3개", tip: "삶은 달걀이 간편하고 흡수도 좋아요. 흰자는 더 많이 먹어도 OK.", logLabel: "2개", logProtein: 12 },
  { rank: 9, name: "그릭요거트", emoji: "🥛", proteinPer100g: 10, serving: "1컵(약 170g)", tip: "아침·간식으로. 무가당 제품에 견과류를 곁들이면 좋아요.", logLabel: "1컵", logProtein: 17 },
  { rank: 10, name: "두부", emoji: "🫙", proteinPer100g: 9, serving: "반 모(약 150g)", tip: "대표 식물성 단백질. 데치거나 구워서 양념 곁들여 드세요.", logLabel: "반 모", logProtein: 14 },
];
