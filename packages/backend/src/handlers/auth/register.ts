import { APIGatewayProxyHandler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);
const USERS_TABLE = process.env.DYNAMODB_TABLE || '';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { username, password, email } = JSON.parse(event.body || '{}');
    if (!username || !password || !email) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
    }

    // Check if user already exists
    const existing = await dynamoDb.send(new QueryCommand({
      TableName: USERS_TABLE,
      KeyConditionExpression: 'PK = :pk and SK = :sk',
      ExpressionAttributeValues: {
        ':pk': `USER#${username}`,
        ':sk': 'PROFILE',
      },
    }));
    if (existing.Items && existing.Items.length > 0) {
      return { statusCode: 409, body: JSON.stringify({ error: 'Username already exists' }) };
    }

    const userId = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    const userItem = {
      PK: `USER#${username}`,
      SK: 'PROFILE',
      userId,
      username,
      passwordHash,
      email,
      role: 'trial',
      createdAt: now,
      trialEndsAt: null,
    };

  await dynamoDb.send(new PutCommand({ TableName: USERS_TABLE, Item: userItem }));
    return { statusCode: 201, body: JSON.stringify({ message: 'User registered successfully' }) };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error', details: message }) };
  }
};
