export interface FoodEntry {
  id: string;
  name: string;
  protein: number;
  emoji?: string;
  imageUri?: string;
  isCustom?: boolean;
  // 용량/수량 수정용 (있을 때만). 수정 시 protein = proteinPerUnit × amount 로 재계산해요.
  baseName?: string; // 단위 표기를 뺀 이름 (예: "연어")
  amount?: number; // 용량/수량 (예: 120)
  unit?: string; // "g" | "ml" | "개"
  proteinPerUnit?: number; // 1 단위당 단백질(g)
}

export interface Settings {
  weight: number;
  goalType: "bulk" | "maintain" | "cut";
}

export interface DayHistory {
  date: string;
  entries: FoodEntry[];
  totalProtein: number;
}
