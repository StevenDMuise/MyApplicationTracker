import { APIGatewayProxyHandler } from 'aws-lambda';
import * as bcrypt from 'bcryptjs';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const USERS_TABLE = process.env.DYNAMODB_TABLE || '';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { username, password } = JSON.parse(event.body || '{}');
    if (!username || !password) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
    }

  // Instantiate DynamoDB v3 client inside the handler for testability
  const client = new DynamoDBClient({});
  const dynamoDb = DynamoDBDocumentClient.from(client);

    // Fetch user by username
    const result = await dynamoDb.send(new QueryCommand({
      TableName: USERS_TABLE,
      KeyConditionExpression: 'PK = :pk and SK = :sk',
      ExpressionAttributeValues: {
        ':pk': `USER#${username}`,
        ':sk': 'PROFILE',
      },
    }));
    const user = result.Items && result.Items[0];
    if (!user) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid username or password' }) };
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid username or password' }) };
    }

    // Return user profile information (excluding sensitive data)
    const userProfile = {
      id: user.userId,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    return { 
      statusCode: 200, 
      body: JSON.stringify({ 
        message: 'Login successful', 
        user: userProfile 
      }) 
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error', details: err instanceof Error ? err.message : String(err) }) };
  }
};
