import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

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
    const body = JSON.parse(event.body || '{}');
    const updateFields = Object.keys(body)
      .filter((k) => [
        'company',
        'jobDescription',
        'resumeUrl',
        'coverLetterUrl',
        'jobPostLink',
        'dateOfApplication',
        'status',
      ].includes(k));
    if (updateFields.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No valid fields to update' }) };
    }
    const updateExpr = 'set ' + updateFields.map((k, i) => `#${k} = :${k}`).join(', ') + ', updatedAt = :updatedAt';
    const exprAttrNames = Object.fromEntries(updateFields.map((k) => [`#${k}`, k]));
    const exprAttrValues = Object.fromEntries(updateFields.map((k) => [`:${k}`, body[k]]));
    exprAttrValues[':updatedAt'] = new Date().toISOString();
    await dynamoDb.send(new UpdateCommand({
      TableName: APPLICATIONS_TABLE,
      Key: { PK: `USER#${userId}`, SK: `APP#${applicationId}` },
      UpdateExpression: updateExpr,
      ExpressionAttributeNames: exprAttrNames,
      ExpressionAttributeValues: exprAttrValues,
    }));
    return { statusCode: 200, body: JSON.stringify({ message: 'Application updated' }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error', details: err instanceof Error ? err.message : String(err) }) };
  }
};
