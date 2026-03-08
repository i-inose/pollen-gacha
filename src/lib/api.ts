import { Character, GachaResult, PollenData, PollenLevel, RankingEntry } from "@/types";
import { pollenLevelLabels } from "@/data/pollen";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

// API未設定時はローカルモードで動作
const isLocalMode = !API_URL;

// ============ 花粉データ取得 ============
export async function fetchPollenData(region: string): Promise<PollenData> {
  if (isLocalMode) {
    const { calculatePollenLevel } = await import("@/data/pollen");
    const month = new Date().getMonth() + 1;
    const level = calculatePollenLevel(month);
    return {
      region,
      regionName: "東京都（ローカル）",
      level,
      levelLabel: pollenLevelLabels[level],
      date: new Date().toISOString().split("T")[0],
    };
  }

  const res = await fetch(`${API_URL}/pollen?region=${encodeURIComponent(region)}`);
  const data = await res.json();
  return {
    region: data.region,
    regionName: region,
    level: data.level as PollenLevel,
    levelLabel: data.levelLabel,
    date: data.date,
  };
}

// ============ ガチャ実行 ============
export async function executeGacha(
  nickname: string,
  region: string
): Promise<{ character: Character; pollenLevel: PollenLevel }> {
  if (isLocalMode) {
    const { drawGacha } = await import("@/lib/gacha");
    const { calculatePollenLevel } = await import("@/data/pollen");
    const month = new Date().getMonth() + 1;
    const pollenLevel = calculatePollenLevel(month);
    const character = drawGacha(pollenLevel);
    return { character, pollenLevel };
  }

  const res = await fetch(`${API_URL}/gacha`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nickname, region }),
  });
  const data = await res.json();
  return {
    character: data.character,
    pollenLevel: data.pollenLevel as PollenLevel,
  };
}

// ============ ランキング取得 ============
export async function fetchRanking(
  region: string,
  date?: string
): Promise<RankingEntry[]> {
  if (isLocalMode) {
    const { getLocalRanking } = await import("@/lib/storage");
    return getLocalRanking();
  }

  const dateParam = date || new Date().toISOString().split("T")[0];
  const res = await fetch(
    `${API_URL}/ranking?region=${encodeURIComponent(region)}&date=${dateParam}`
  );
  const data = await res.json();
  return data.ranking;
}

// ============ ユーザー登録 ============
export async function registerUser(nickname: string): Promise<void> {
  if (isLocalMode) return;

  await fetch(`${API_URL}/user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nickname }),
  });
}

// ============ 利用者数取得 ============
export async function fetchUserCount(): Promise<number> {
  if (isLocalMode) {
    const { getUserCount } = await import("@/lib/storage");
    return getUserCount();
  }

  const res = await fetch(`${API_URL}/user`);
  const data = await res.json();
  return data.totalUsers;
}
