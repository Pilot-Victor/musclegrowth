import { Storage } from "@apps-in-toss/web-framework";
import type { FoodEntry, Settings, DayHistory } from "./types";

const KEY_SETTINGS = "protein_settings";
const keyForDate = (date: string) => `protein_entries_${date}`;

// ---------------------------------------------------------------------------
// 저장소 백엔드
// 토스앱(앱인토스) 환경에서는 네이티브 Storage를 쓰고,
// 일반 브라우저(로컬 테스트)에서는 네이티브 브릿지가 없어 throw 되므로
// localStorage로 자동 폴백해요. 한 번 판별한 뒤 캐시해서 읽기/쓰기를 일관되게 유지해요.
// ---------------------------------------------------------------------------
let useLocal: boolean | null = null;

async function ensureBackend(): Promise<void> {
  if (useLocal !== null) return;
  try {
    await Storage.getItem("__ait_probe__");
    useLocal = false;
  } catch {
    useLocal = true;
  }
}

async function getItem(key: string): Promise<string | null> {
  await ensureBackend();
  if (useLocal) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  try {
    return await Storage.getItem(key);
  } catch {
    useLocal = true;
    return getItem(key);
  }
}

async function setItem(key: string, value: string): Promise<void> {
  await ensureBackend();
  if (useLocal) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* 무시 */
    }
    return;
  }
  try {
    await Storage.setItem(key, value);
  } catch {
    useLocal = true;
    await setItem(key, value);
  }
}

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function getSettings(): Promise<Settings> {
  const raw = await getItem(KEY_SETTINGS);
  if (!raw) return { weight: 70, goalType: "maintain" };
  try {
    return JSON.parse(raw) as Settings;
  } catch {
    return { weight: 70, goalType: "maintain" };
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await setItem(KEY_SETTINGS, JSON.stringify(settings));
}

export async function getEntriesForDate(date: string): Promise<FoodEntry[]> {
  const raw = await getItem(keyForDate(date));
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
  await setItem(keyForDate(today), JSON.stringify(entries));
}

export async function deleteFoodEntry(id: string): Promise<void> {
  const today = todayString();
  const entries = await getEntriesForDate(today);
  const updated = entries.filter((e) => e.id !== id);
  await setItem(keyForDate(today), JSON.stringify(updated));
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
