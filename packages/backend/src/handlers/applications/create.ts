import { APIGatewayProxyHandler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);
const APPLICATIONS_TABLE = process.env.APPLICATIONS_TABLE || process.env.DYNAMODB_TABLE || '';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.principalId;
    if (!userId) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    }
    const body = JSON.parse(event.body || '{}');
    const {
      company,
      jobDescription,
      resumeUrl,
      coverLetterUrl,
      jobPostLink,
      dateOfApplication,
      status = 'active',
    } = body;
    if (!company || !jobDescription || !jobPostLink || !dateOfApplication) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
    }
    const applicationId = uuidv4();
    const now = new Date().toISOString();
    const item = {
      PK: `USER#${userId}`,
      SK: `APP#${applicationId}`,
      applicationId,
      company,
      jobDescription,
      resumeUrl,
      coverLetterUrl,
      jobPostLink,
      dateOfApplication,
      status,
      createdAt: now,
      updatedAt: now,
    };
    await dynamoDb.send(new PutCommand({ TableName: APPLICATIONS_TABLE, Item: item }));
    return { statusCode: 201, body: JSON.stringify({ message: 'Application created', applicationId }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error', details: err instanceof Error ? err.message : String(err) }) };
  }
};
