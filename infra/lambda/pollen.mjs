import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const POLLEN_DATA_TABLE = process.env.POLLEN_DATA_TABLE;

const pollenLevelLabels = {
  1: "少ない",
  2: "やや多い",
  3: "多い",
  4: "非常に多い",
  5: "極めて多い",
};

export const handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const region = event.queryStringParameters?.region || "tokyo";
    const date = new Date().toISOString().split("T")[0];

    const result = await docClient.send(
      new GetCommand({
        TableName: POLLEN_DATA_TABLE,
        Key: { region, date },
      })
    );

    if (result.Item) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          region: result.Item.region,
          level: result.Item.level,
          levelLabel: pollenLevelLabels[result.Item.level] || "不明",
          date: result.Item.date,
        }),
      };
    }

    // データがない場合: 月ベースのフォールバック
    const month = new Date().getMonth() + 1;
    const monthlyBase = { 1: 1, 2: 2, 3: 5, 4: 4, 5: 3, 6: 2, 7: 1, 8: 1, 9: 2, 10: 2, 11: 1, 12: 1 };
    const base = monthlyBase[month] || 1;
    const variation = Math.floor(Math.random() * 3) - 1;
    const level = Math.max(1, Math.min(5, base + variation));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        region,
        level,
        levelLabel: pollenLevelLabels[level],
        date,
        source: "fallback",
      }),
    };
  } catch (error) {
    console.error("Pollen error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
