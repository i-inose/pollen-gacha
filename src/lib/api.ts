import { Character, PollenData, PollenLevel, RankingEntry } from "@/types";
import { pollenLevelLabels } from "@/data/pollen";
import { characters as localCharacters } from "@/data/characters";
import { getPrefecture, getPrefectureName } from "@/data/prefectures";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

// API未設定時はローカルモードで動作
const isLocalMode = !API_URL;

// ============ Open-Meteo天気データから花粉レベルを推定 ============
interface OpenMeteoDaily {
  temperature_2m_max: number[];
  precipitation_sum: number[];
  wind_speed_10m_max: number[];
  relative_humidity_2m_mean: number[];
}

function estimatePollenLevel(
  weather: OpenMeteoDaily,
  month: number
): PollenLevel {
  const temp = weather.temperature_2m_max[0];
  const rain = weather.precipitation_sum[0];
  const wind = weather.wind_speed_10m_max[0];
  const humidity = weather.relative_humidity_2m_mean[0];

  // 花粉シーズン外（7-8月, 11-1月）はベース低い
  const offSeason = [7, 8, 11, 12, 1];
  const peakSeason = [3, 4]; // スギ・ヒノキピーク
  const subSeason = [2, 5, 9, 10]; // サブシーズン

  let baseScore: number;
  if (offSeason.includes(month)) {
    baseScore = 10;
  } else if (peakSeason.includes(month)) {
    baseScore = 70;
  } else if (subSeason.includes(month)) {
    baseScore = 40;
  } else {
    baseScore = 30; // 6月
  }

  // 天気条件による補正（-30 ~ +30）
  let weatherBonus = 0;

  // 気温: 15℃以上で花粉飛散が活発。20℃超でさらに+
  if (temp >= 20) weatherBonus += 15;
  else if (temp >= 15) weatherBonus += 10;
  else if (temp >= 10) weatherBonus += 5;
  else if (temp < 5) weatherBonus -= 10;

  // 降水: 雨の日は花粉が飛ばない
  if (rain >= 10) weatherBonus -= 20;
  else if (rain >= 5) weatherBonus -= 15;
  else if (rain >= 1) weatherBonus -= 10;
  else weatherBonus += 5; // 晴れ

  // 風速: 強風で花粉が舞う
  if (wind >= 20) weatherBonus += 10;
  else if (wind >= 10) weatherBonus += 5;

  // 湿度: 乾燥すると花粉が飛びやすい
  if (humidity < 40) weatherBonus += 5;
  else if (humidity > 80) weatherBonus -= 5;

  const totalScore = Math.max(0, Math.min(100, baseScore + weatherBonus));

  // スコアをPollenLevel 1-5に変換
  if (totalScore >= 80) return 5;
  if (totalScore >= 60) return 4;
  if (totalScore >= 40) return 3;
  if (totalScore >= 20) return 2;
  return 1;
}

async function fetchWeatherPollenLevel(
  region: string
): Promise<PollenLevel> {
  const pref = getPrefecture(region);
  if (!pref) {
    const { calculatePollenLevelByRegion } = await import("@/data/pollen");
    return calculatePollenLevelByRegion(new Date().getMonth() + 1, region);
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${pref.lat}&longitude=${pref.lon}&daily=temperature_2m_max,precipitation_sum,wind_speed_10m_max,relative_humidity_2m_mean&forecast_days=1&timezone=Asia%2FTokyo`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Open-Meteo API error");

  const data = await res.json();
  const month = new Date().getMonth() + 1;
  return estimatePollenLevel(data.daily, month);
}

// ============ 花粉データ取得 ============
export async function fetchPollenData(region: string): Promise<PollenData> {
  if (isLocalMode) {
    // Open-Meteo天気APIから花粉レベルを推定
    const level = await fetchWeatherPollenLevel(region);
    return {
      region,
      regionName: getPrefectureName(region),
      level,
      levelLabel: pollenLevelLabels[level],
      date: new Date().toISOString().split("T")[0],
    };
  }

  const res = await fetch(`${API_URL}/pollen?region=${encodeURIComponent(region)}`);
  if (!res.ok) throw new Error(`Pollen API error: ${res.status}`);
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
    const pollenLevel = await fetchWeatherPollenLevel(region);
    const character = drawGacha(pollenLevel);
    return { character, pollenLevel };
  }

  const res = await fetch(`${API_URL}/gacha`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nickname, region }),
  });
  if (!res.ok) throw new Error(`Gacha API error: ${res.status}`);
  const data = await res.json();
  const character: Character = {
    ...data.character,
    imageUrl: data.character.imageUrl || `/characters/${data.character.id}.png`,
    description: data.character.description || localCharacters.find(c => c.id === data.character.id)?.description || "",
  };
  return {
    character,
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
