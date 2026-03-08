import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const POLLEN_DATA_TABLE = process.env.POLLEN_DATA_TABLE;

// 地域リスト（必要に応じて拡張）
const regions = [
  "tokyo",
  "osaka",
  "nagoya",
  "fukuoka",
  "sapporo",
  "sendai",
  "hiroshima",
  "yokohama",
];

// 月別の花粉レベルベースデータ
const monthlyBase = {
  1: 1,
  2: 2,
  3: 5,
  4: 4,
  5: 3,
  6: 2,
  7: 1,
  8: 1,
  9: 2,
  10: 2,
  11: 1,
  12: 1,
};

export const handler = async () => {
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const month = now.getMonth() + 1;
  const base = monthlyBase[month] || 1;

  console.log(`Updating pollen data for ${date}, base level: ${base}`);

  const promises = regions.map(async (region) => {
    // 地域ごとにランダム変動（±1）を加える
    const variation = Math.floor(Math.random() * 3) - 1;
    const level = Math.max(1, Math.min(5, base + variation));

    await docClient.send(
      new PutCommand({
        TableName: POLLEN_DATA_TABLE,
        Item: {
          region,
          date,
          level,
          updatedAt: now.toISOString(),
        },
      })
    );

    console.log(`Updated ${region}: level ${level}`);
    return { region, level };
  });

  const results = await Promise.all(promises);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Pollen data updated",
      date,
      results,
    }),
  };
};
