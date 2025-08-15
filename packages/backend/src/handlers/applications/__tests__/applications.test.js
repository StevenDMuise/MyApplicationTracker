
process.env.APPLICATIONS_TABLE = 'TestTable';

const mockSend = jest.fn();
jest.mock('@aws-sdk/client-dynamodb', () => {
  return {
    DynamoDBClient: jest.fn(() => ({})),
  };
});
jest.mock('@aws-sdk/lib-dynamodb', () => {
  return {
    DynamoDBDocumentClient: { from: jest.fn(() => ({ send: mockSend })) },
    QueryCommand: jest.fn((input) => input),
    PutCommand: jest.fn((input) => input),
    UpdateCommand: jest.fn((input) => input),
    DeleteCommand: jest.fn((input) => input),
  };
});

const { handler: createHandler } = require('../create');
const { handler: listHandler } = require('../list');
const { handler: updateHandler } = require('../update');
const { handler: deleteHandler } = require('../delete');

describe('Application Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  process.env.APPLICATIONS_TABLE = 'TestTable';
  });

  it('createHandler returns 400 if required fields are missing', async () => {
    const event = { body: JSON.stringify({ company: 'TestCo' }), requestContext: { authorizer: { principalId: 'user1' } } };
    const result = await createHandler(event, {}, () => {});
    expect(result.statusCode).toBe(400);
  });

  it('createHandler returns 201 on success', async () => {
    mockSend.mockResolvedValueOnce({}); // PutCommand returns {}
    const event = {
      body: JSON.stringify({
        company: 'TestCo',
        jobDescription: 'desc',
        resumeUrl: 'url',
        coverLetterUrl: 'url',
        jobPostLink: 'link',
        dateOfApplication: '2025-08-15',
      }),
      requestContext: { authorizer: { principalId: 'user1' } },
    };
    const result = await createHandler(event, {}, () => {});
    if (result.statusCode !== 201) {
      // Print error details for debugging
      // eslint-disable-next-line no-console
      console.error('createHandler error:', result.body);
    }
    expect(result.statusCode).toBe(201);
  });

  it('listHandler returns 200 and applications', async () => {
    mockSend.mockResolvedValueOnce({ Items: [{ applicationId: 'a1' }] }); // QueryCommand returns { Items: [...] }
    const event = { requestContext: { authorizer: { principalId: 'user1' } } };
    const result = await listHandler(event, {}, () => {});
    if (result.statusCode !== 200) {
      // eslint-disable-next-line no-console
      console.error('listHandler error:', result.body);
    }
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).applications.length).toBe(1);
  });

  it('updateHandler returns 400 if no fields to update', async () => {
    const event = {
      pathParameters: { applicationId: 'a1' },
      body: JSON.stringify({}),
      requestContext: { authorizer: { principalId: 'user1' } },
    };
    const result = await updateHandler(event, {}, () => {});
    expect(result.statusCode).toBe(400);
  });

  it('updateHandler returns 200 on success', async () => {
    mockSend.mockResolvedValueOnce({}); // UpdateCommand returns {}
    const event = {
      pathParameters: { applicationId: 'a1' },
      body: JSON.stringify({ company: 'NewCo' }),
      requestContext: { authorizer: { principalId: 'user1' } },
    };
    const result = await updateHandler(event, {}, () => {});
    if (result.statusCode !== 200) {
      // eslint-disable-next-line no-console
      console.error('updateHandler error:', result.body);
    }
    expect(result.statusCode).toBe(200);
  });

  it('deleteHandler returns 200 on success', async () => {
    mockSend.mockResolvedValueOnce({}); // DeleteCommand returns {}
    const event = {
      pathParameters: { applicationId: 'a1' },
      requestContext: { authorizer: { principalId: 'user1' } },
    };
    const result = await deleteHandler(event, {}, () => {});
    if (result.statusCode !== 200) {
      // eslint-disable-next-line no-console
      console.error('deleteHandler error:', result.body);
    }
    expect(result.statusCode).toBe(200);
  });
});
