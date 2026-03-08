import { GachaResult, RankingEntry } from "@/types";
import { rarityOrder } from "@/lib/gacha";

const NICKNAME_KEY = "pollen-gacha-nickname";
const RESULTS_KEY = "pollen-gacha-results";

export function getNickname(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(NICKNAME_KEY);
}

export function setNickname(nickname: string): void {
  localStorage.setItem(NICKNAME_KEY, nickname);
}

export function getGachaHistory(): GachaResult[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(RESULTS_KEY);
  return data ? JSON.parse(data) : [];
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

// ユーザー数カウント（ローカル仮実装）
export function getUserCount(): number {
  if (typeof window === "undefined") return 0;
  const count = localStorage.getItem("pollen-gacha-user-count");
  return count ? parseInt(count, 10) : 0;
}

export function incrementUserCount(): number {
  const current = getUserCount();
  const next = current + 1;
  localStorage.setItem("pollen-gacha-user-count", String(next));
  return next;
}
