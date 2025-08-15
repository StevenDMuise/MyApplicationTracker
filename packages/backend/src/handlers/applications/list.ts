import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);
const APPLICATIONS_TABLE = process.env.APPLICATIONS_TABLE || process.env.DYNAMODB_TABLE || '';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.principalId;
    if (!userId) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    }
    const result = await dynamoDb.send(new QueryCommand({
      TableName: APPLICATIONS_TABLE,
      KeyConditionExpression: 'PK = :pk and begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'APP#',
      },
    }));
    return { statusCode: 200, body: JSON.stringify({ applications: result.Items || [] }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error', details: err instanceof Error ? err.message : String(err) }) };
  }
};
