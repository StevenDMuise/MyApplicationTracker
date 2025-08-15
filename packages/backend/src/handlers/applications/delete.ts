import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);
const APPLICATIONS_TABLE = process.env.APPLICATIONS_TABLE || process.env.DYNAMODB_TABLE || '';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.principalId;
    if (!userId) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    }
    const applicationId = event.pathParameters?.applicationId;
    if (!applicationId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing applicationId' }) };
    }
    await dynamoDb.send(new DeleteCommand({
      TableName: APPLICATIONS_TABLE,
      Key: { PK: `USER#${userId}`, SK: `APP#${applicationId}` },
    }));
    return { statusCode: 200, body: JSON.stringify({ message: 'Application deleted' }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error', details: err instanceof Error ? err.message : String(err) }) };
  }
};
