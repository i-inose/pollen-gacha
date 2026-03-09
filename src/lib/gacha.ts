import { Character, PollenLevel, Rarity } from "@/types";
import { characters, getCharactersByRarity } from "@/data/characters";
import { rarityRatesByPollenLevel } from "@/data/pollen";

export function drawGacha(pollenLevel: PollenLevel): Character {
  const rates = rarityRatesByPollenLevel[pollenLevel];

  // レアリティ抽選
  const roll = Math.random() * 100;
  let rarity: Rarity;

  if (roll < rates.SSR) {
    rarity = "SSR";
  } else if (roll < rates.SSR + rates.SR) {
    rarity = "SR";
  } else if (roll < rates.SSR + rates.SR + rates.R) {
    rarity = "R";
  } else {
    rarity = "N";
  }

  // 該当レアリティからランダムにキャラ選出
  const pool = getCharactersByRarity(rarity);
  const character = pool[Math.floor(Math.random() * pool.length)];

  return character;
}

export const rarityOrder: Record<Rarity, number> = {
  N: 0,
  R: 1,
  SR: 2,
  SSR: 3,
};

export const rarityColors: Record<Rarity, string> = {
  N: "#9E9E9E",
  R: "#2196F3",
  SR: "#FF9800",
  SSR: "#FFD700",
};

export const rarityGradients: Record<Rarity, string> = {
  N: "from-gray-500 to-gray-700",
  R: "from-blue-500 via-blue-400 to-cyan-500",
  SR: "from-orange-500 via-red-400 to-pink-500",
  SSR: "from-yellow-300 via-amber-400 to-orange-500",
};
