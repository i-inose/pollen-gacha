import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const USERS_TABLE = process.env.USERS_TABLE;

export const handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const method = event.httpMethod;

    if (method === "POST") {
      // ユーザー登録
      const body = JSON.parse(event.body || "{}");
      const { nickname } = body;

      if (!nickname || nickname.trim().length === 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "nickname is required" }),
        };
      }

      const now = new Date().toISOString();

      await docClient.send(
        new PutCommand({
          TableName: USERS_TABLE,
          Item: {
            nickname: nickname.trim(),
            firstVisitDate: now,
            totalGachaCount: 0,
            createdAt: now,
          },
          ConditionExpression: "attribute_not_exists(nickname)",
        })
      );

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ message: "User registered", nickname }),
      };
    }

    if (method === "GET") {
      // 総利用者数取得
      const result = await docClient.send(
        new ScanCommand({
          TableName: USERS_TABLE,
          Select: "COUNT",
        })
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ totalUsers: result.Count || 0 }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  } catch (error) {
    // ConditionalCheckFailedExceptionはユーザー重複（正常ケース）
    if (error.name === "ConditionalCheckFailedException") {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "User already exists" }),
      };
    }

    console.error("User error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
