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
  1: "Lv.1",
  2: "Lv.2",
  3: "Lv.3",
  4: "Lv.4",
  5: "Lv.5",
};

// 花粉レベルに応じた排出率テーブル
export const rarityRatesByPollenLevel: Record<PollenLevel, RarityRates> = {
  1: { N: 40, R: 35, SR: 18, SSR: 7 },
  2: { N: 32, R: 35, SR: 22, SSR: 11 },
  3: { N: 25, R: 33, SR: 27, SSR: 15 },
  4: { N: 18, R: 30, SR: 32, SSR: 20 },
  5: { N: 12, R: 28, SR: 35, SSR: 25 },
};

// 関東（デフォルト）の月別花粉レベル
export const monthlyPollenBase: Record<number, PollenLevel> = {
  1: 1, 2: 2, 3: 5, 4: 4, 5: 3, 6: 2,
  7: 1, 8: 1, 9: 2, 10: 2, 11: 1, 12: 1,
};

// 地域グループごとの花粉レベル補正（関東基準との差分）
// 正: 花粉が多い方向 / 負: 少ない方向
type RegionGroup = "hokkaido" | "tohoku" | "kanto" | "chubu" | "kinki" | "chugoku" | "shikoku" | "kyushu" | "okinawa";

const regionOffsets: Record<RegionGroup, Record<number, number>> = {
  hokkaido:  { 1: 0, 2: -1, 3: -2, 4: -1, 5: 1, 6: 1, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 },
  tohoku:    { 1: 0, 2: -1, 3: -1, 4: 0, 5: 1, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 },
  kanto:     { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 },
  chubu:     { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 },
  kinki:     { 1: 0, 2: 0, 3: 0, 4: 1, 5: 0, 6: 0, 7: 0, 8: 0, 9: 1, 10: 0, 11: 0, 12: 0 },
  chugoku:   { 1: 0, 2: 1, 3: 0, 4: 0, 5: -1, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 },
  shikoku:   { 1: 0, 2: 1, 3: 0, 4: 0, 5: -1, 6: 0, 7: 0, 8: 0, 9: 1, 10: 0, 11: 0, 12: 0 },
  kyushu:    { 1: 0, 2: 1, 3: 1, 4: 0, 5: -1, 6: 0, 7: 0, 8: 0, 9: 1, 10: 0, 11: 0, 12: 0 },
  okinawa:   { 1: 0, 2: -1, 3: -2, 4: -2, 5: -2, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 },
};

const prefectureToGroup: Record<string, RegionGroup> = {
  hokkaido: "hokkaido",
  aomori: "tohoku", iwate: "tohoku", miyagi: "tohoku", akita: "tohoku", yamagata: "tohoku", fukushima: "tohoku",
  ibaraki: "kanto", tochigi: "kanto", gunma: "kanto", saitama: "kanto", chiba: "kanto", tokyo: "kanto", kanagawa: "kanto",
  niigata: "chubu", toyama: "chubu", ishikawa: "chubu", fukui: "chubu", yamanashi: "chubu", nagano: "chubu", gifu: "chubu", shizuoka: "chubu", aichi: "chubu", mie: "chubu",
  shiga: "kinki", kyoto: "kinki", osaka: "kinki", hyogo: "kinki", nara: "kinki", wakayama: "kinki",
  tottori: "chugoku", shimane: "chugoku", okayama: "chugoku", hiroshima: "chugoku", yamaguchi: "chugoku",
  tokushima: "shikoku", kagawa: "shikoku", ehime: "shikoku", kochi: "shikoku",
  fukuoka: "kyushu", saga: "kyushu", nagasaki: "kyushu", kumamoto: "kyushu", oita: "kyushu", miyazaki: "kyushu", kagoshima: "kyushu",
  okinawa: "okinawa",
};

// 簡易的な花粉レベル計算（マスターデータ + ランダム変動）
export function calculatePollenLevel(month: number): PollenLevel {
  const base = monthlyPollenBase[month] || 1;
  const variation = Math.floor(Math.random() * 3) - 1;
  const level = Math.max(1, Math.min(5, base + variation));
  return level as PollenLevel;
}

// 地域別の花粉レベル計算
export function calculatePollenLevelByRegion(month: number, region: string): PollenLevel {
  const base = monthlyPollenBase[month] || 1;
  const group = prefectureToGroup[region] || "kanto";
  const offset = regionOffsets[group]?.[month] || 0;
  const variation = Math.floor(Math.random() * 3) - 1;
  const level = Math.max(1, Math.min(5, base + offset + variation));
  return level as PollenLevel;
}
