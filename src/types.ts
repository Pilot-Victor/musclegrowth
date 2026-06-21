export interface FoodEntry {
  id: string;
  name: string;
  protein: number;
  emoji?: string;
  imageUri?: string;
  isCustom?: boolean;
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
