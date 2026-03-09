import { GachaResult, RankingEntry } from "@/types";
import { rarityOrder } from "@/lib/gacha";

// v2: リセット（都道府県対応・天気API連携）
const NICKNAME_KEY = "pollen-gacha-v2-nickname";
const RESULTS_KEY = "pollen-gacha-v2-results";
const REGION_KEY = "pollen-gacha-v2-region";

export function getNickname(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(NICKNAME_KEY);
}

export function setNickname(nickname: string): void {
  localStorage.setItem(NICKNAME_KEY, nickname);
}

export function getRegion(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REGION_KEY);
}

export function setRegion(region: string): void {
  localStorage.setItem(REGION_KEY, region);
}

export function getGachaHistory(): GachaResult[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(RESULTS_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function addGachaResult(result: GachaResult): void {
  const history = getGachaHistory();
  history.unshift(result);
  // 最大100件保持
  if (history.length > 100) {
    history.pop();
  }
  localStorage.setItem(RESULTS_KEY, JSON.stringify(history));
}

// ローカルのガチャ結果からランキングを生成（AWS連携前の仮実装）
export function getLocalRanking(): RankingEntry[] {
  const history = getGachaHistory();
  const today = new Date().toISOString().split("T")[0];

  return history
    .filter((r) => r.timestamp.startsWith(today))
    .sort(
      (a, b) =>
        rarityOrder[b.character.rarity] - rarityOrder[a.character.rarity]
    )
    .slice(0, 10)
    .map((r) => ({
      nickname: r.nickname,
      characterName: r.character.name,
      rarity: r.character.rarity,
      timestamp: r.timestamp,
    }));
}

// 今日すでにガチャを引いたか判定
const LAST_GACHA_KEY = "pollen-gacha-v2-last-date";

export function hasPlayedToday(): boolean {
  if (typeof window === "undefined") return false;
  const last = localStorage.getItem(LAST_GACHA_KEY);
  if (!last) return false;
  const today = new Date().toISOString().split("T")[0];
  return last === today;
}

export function markPlayedToday(): void {
  const today = new Date().toISOString().split("T")[0];
  localStorage.setItem(LAST_GACHA_KEY, today);
}

// ユーザー数カウント（ローカル仮実装）
export function getUserCount(): number {
  if (typeof window === "undefined") return 0;
  const count = localStorage.getItem("pollen-gacha-v2-user-count");
  return count ? parseInt(count, 10) : 0;
}

export function incrementUserCount(): number {
  const current = getUserCount();
  const next = current + 1;
  localStorage.setItem("pollen-gacha-v2-user-count", String(next));
  return next;
}
