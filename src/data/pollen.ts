import { PollenLevel, RarityRates } from "@/types";

export const pollenLevelLabels: Record<PollenLevel, string> = {
  1: "少ない",
  2: "やや多い",
  3: "多い",
  4: "非常に多い",
  5: "極めて多い",
};

export const pollenLevelColors: Record<PollenLevel, string> = {
  1: "#4CAF50",
  2: "#FFC107",
  3: "#FF9800",
  4: "#F44336",
  5: "#9C27B0",
};

export const pollenLevelEmojis: Record<PollenLevel, string> = {
  1: "🟢",
  2: "🟡",
  3: "🟠",
  4: "🔴",
  5: "🟣",
};

// 花粉レベルに応じた排出率テーブル
export const rarityRatesByPollenLevel: Record<PollenLevel, RarityRates> = {
  1: { N: 60, R: 30, SR: 9, SSR: 1 },
  2: { N: 52, R: 32, SR: 13, SSR: 3 },
  3: { N: 44, R: 34, SR: 17, SSR: 5 },
  4: { N: 36, R: 35, SR: 22, SSR: 7 },
  5: { N: 30, R: 35, SR: 25, SSR: 10 },
};

// 月別の花粉レベルベースデータ（地域に関わらず使うシンプルな設定）
// 実際のAPIに差し替え可能
export const monthlyPollenBase: Record<number, PollenLevel> = {
  1: 1,  // 1月: 少ない
  2: 2,  // 2月: やや多い
  3: 5,  // 3月: 極めて多い
  4: 4,  // 4月: 非常に多い
  5: 3,  // 5月: 多い
  6: 2,  // 6月: やや多い
  7: 1,  // 7月: 少ない
  8: 1,  // 8月: 少ない
  9: 2,  // 9月: やや多い（ブタクサ）
  10: 2, // 10月: やや多い
  11: 1, // 11月: 少ない
  12: 1, // 12月: 少ない
};

// 簡易的な花粉レベル計算（マスターデータ + ランダム変動）
export function calculatePollenLevel(month: number): PollenLevel {
  const base = monthlyPollenBase[month] || 1;
  // ±1のランダム変動
  const variation = Math.floor(Math.random() * 3) - 1;
  const level = Math.max(1, Math.min(5, base + variation));
  return level as PollenLevel;
}
