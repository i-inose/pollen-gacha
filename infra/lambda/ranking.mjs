import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const GACHA_RESULTS_TABLE = process.env.GACHA_RESULTS_TABLE;

const rarityOrder = { SSR: 4, SR: 3, R: 2, N: 1 };

export const handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const date =
      event.queryStringParameters?.date ||
      new Date().toISOString().split("T")[0];
    const region = event.queryStringParameters?.region || "tokyo";

    const result = await docClient.send(
      new QueryCommand({
        TableName: GACHA_RESULTS_TABLE,
        KeyConditionExpression: "dateRegion = :dr",
        ExpressionAttributeValues: {
          ":dr": `${date}#${region}`,
        },
      })
    );

    const items = result.Items || [];

    // レアリティ順にソートしてTOP10を返す
    const ranking = items
      .sort((a, b) => (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0))
      .slice(0, 10)
      .map((item) => ({
        nickname: item.nickname,
        characterName: item.characterName,
        rarity: item.rarity,
        timestamp: item.createdAt,
      }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ranking, date, region }),
    };
  } catch (error) {
    console.error("Ranking error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
