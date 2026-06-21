import { Storage } from "@apps-in-toss/web-framework";
import type { FoodEntry, Settings, DayHistory } from "./types";

const KEY_SETTINGS = "protein_settings";
const keyForDate = (date: string) => `protein_entries_${date}`;

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function getSettings(): Promise<Settings> {
  const raw = await Storage.getItem(KEY_SETTINGS);
  if (!raw) return { weight: 70, goalType: "maintain" };
  try {
    return JSON.parse(raw) as Settings;
  } catch {
    return { weight: 70, goalType: "maintain" };
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await Storage.setItem(KEY_SETTINGS, JSON.stringify(settings));
}

export async function getEntriesForDate(date: string): Promise<FoodEntry[]> {
  const raw = await Storage.getItem(keyForDate(date));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as FoodEntry[];
  } catch {
    return [];
  }
}

export async function getTodayEntries(): Promise<FoodEntry[]> {
  return getEntriesForDate(todayString());
}

export async function addFoodEntry(entry: FoodEntry): Promise<void> {
  const today = todayString();
  const entries = await getEntriesForDate(today);
  entries.push(entry);
  await Storage.setItem(keyForDate(today), JSON.stringify(entries));
}

export async function deleteFoodEntry(id: string): Promise<void> {
  const today = todayString();
  const entries = await getEntriesForDate(today);
  const updated = entries.filter((e) => e.id !== id);
  await Storage.setItem(keyForDate(today), JSON.stringify(updated));
}

export async function getHistory(days: number): Promise<DayHistory[]> {
  const result: DayHistory[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = dateString(d);
    const entries = await getEntriesForDate(date);
    const totalProtein = entries.reduce((sum, e) => sum + e.protein, 0);
    result.push({ date, entries, totalProtein });
  }
  return result;
}
