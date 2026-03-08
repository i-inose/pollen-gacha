export type Rarity = "N" | "R" | "SR" | "SSR";

export interface Character {
  id: string;
  name: string;
  rarity: Rarity;
  motif: string;
  description: string;
  quote: string;
  imageUrl: string;
}

export type PollenLevel = 1 | 2 | 3 | 4 | 5;

export interface PollenData {
  region: string;
  regionName: string;
  level: PollenLevel;
  levelLabel: string;
  date: string;
}

export interface GachaResult {
  character: Character;
  pollenLevel: PollenLevel;
  timestamp: string;
  nickname: string;
  region: string;
}

export interface RankingEntry {
  nickname: string;
  characterName: string;
  rarity: Rarity;
  timestamp: string;
}

export interface RarityRates {
  N: number;
  R: number;
  SR: number;
  SSR: number;
}
