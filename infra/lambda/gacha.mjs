import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const GACHA_RESULTS_TABLE = process.env.GACHA_RESULTS_TABLE;
const USERS_TABLE = process.env.USERS_TABLE;
const POLLEN_DATA_TABLE = process.env.POLLEN_DATA_TABLE;

// キャラクターデータ
const characters = [
  { id: "sugicchi", name: "スギっち", rarity: "N", motif: "スギ花粉", quote: "春の定番、スギだよ〜" },
  { id: "hinokking", name: "ヒノキング", rarity: "N", motif: "ヒノキ花粉", quote: "スギの後にやってくるぜ" },
  { id: "butakusan", name: "ブタクサン", rarity: "N", motif: "ブタクサ花粉", quote: "秋も油断するなよ〜" },
  { id: "kamogayar", name: "カモガヤー", rarity: "N", motif: "カモガヤ花粉", quote: "イネ科代表、参上！" },
  { id: "inetchi", name: "イネッチ", rarity: "R", motif: "イネ花粉", quote: "田んぼからこんにちは" },
  { id: "yomogirasu", name: "ヨモギラス", rarity: "R", motif: "ヨモギ花粉", quote: "秋の伏兵、ヨモギだ！" },
  { id: "shirakabaron", name: "シラカバロン", rarity: "R", motif: "シラカバ花粉", quote: "北海道の貴公子" },
  { id: "hanamizuking", name: "ハナミズキング", rarity: "SR", motif: "ハナミズキ花粉", quote: "花粉界の隠れボス" },
  { id: "matsudaioh", name: "マツダイオー", rarity: "SR", motif: "マツ花粉", quote: "巨大花粉の帝王" },
  { id: "kafun-daimaoh", name: "花粉大魔王", rarity: "SSR", motif: "全花粉の融合体", quote: "すべての花粉を統べる者…" },
];

// 花粉レベルごとの排出率
const rarityRates = {
  1: { N: 60, R: 30, SR: 9, SSR: 1 },
  2: { N: 52, R: 32, SR: 13, SSR: 3 },
  3: { N: 44, R: 34, SR: 17, SSR: 5 },
  4: { N: 36, R: 35, SR: 22, SSR: 7 },
  5: { N: 30, R: 35, SR: 25, SSR: 10 },
};

function drawGacha(pollenLevel) {
  const rates = rarityRates[pollenLevel] || rarityRates[1];
  const roll = Math.random() * 100;

  let rarity;
  if (roll < rates.SSR) rarity = "SSR";
  else if (roll < rates.SSR + rates.SR) rarity = "SR";
  else if (roll < rates.SSR + rates.SR + rates.R) rarity = "R";
  else rarity = "N";

  const pool = characters.filter((c) => c.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}

async function getPollenLevel(region, date) {
  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: POLLEN_DATA_TABLE,
        Key: { region, date },
      })
    );
    return result.Item?.level || 1;
  } catch {
    // フォールバック: 月ベースの簡易計算
    const month = new Date().getMonth() + 1;
    const monthlyBase = { 1: 1, 2: 2, 3: 5, 4: 4, 5: 3, 6: 2, 7: 1, 8: 1, 9: 2, 10: 2, 11: 1, 12: 1 };
    const base = monthlyBase[month] || 1;
    const variation = Math.floor(Math.random() * 3) - 1;
    return Math.max(1, Math.min(5, base + variation));
  }
}

export const handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const body = JSON.parse(event.body || "{}");
    const { nickname, region = "tokyo" } = body;

    if (!nickname || nickname.trim().length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "nickname is required" }) };
    }

    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const timestamp = now.toISOString();

    // 花粉レベル取得
    const pollenLevel = await getPollenLevel(region, date);

    // ガチャ実行
    const character = drawGacha(pollenLevel);

    // 結果をDynamoDBに保存
    await docClient.send(
      new PutCommand({
        TableName: GACHA_RESULTS_TABLE,
        Item: {
          dateRegion: `${date}#${region}`,
          timestampNickname: `${timestamp}#${nickname}`,
          characterId: character.id,
          characterName: character.name,
          rarity: character.rarity,
          nickname,
          pollenLevel,
          createdAt: timestamp,
        },
      })
    );

    // ユーザーのガチャ回数を更新
    await docClient.send(
      new UpdateCommand({
        TableName: USERS_TABLE,
        Key: { nickname },
        UpdateExpression: "SET totalGachaCount = if_not_exists(totalGachaCount, :zero) + :one, lastGachaAt = :now",
        ExpressionAttributeValues: {
          ":zero": 0,
          ":one": 1,
          ":now": timestamp,
        },
      })
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        character,
        pollenLevel,
        timestamp,
      }),
    };
  } catch (error) {
    console.error("Gacha error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
