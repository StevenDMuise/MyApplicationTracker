

const bcrypt = require('bcryptjs');

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
  };
});

const { handler: loginHandler } = require('../login');

describe('loginHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 if required fields are missing', async () => {
    const event = { body: JSON.stringify({ username: 'user' }) };
    const context = {};
    const callback = () => {};
    const result = await loginHandler(event, context, callback);
    expect(result && result.statusCode).toBe(400);
  });

  it('returns 401 for invalid credentials', async () => {
    const event = { body: JSON.stringify({ username: 'notarealuser', password: 'badpass' }) };
    const context = {};
    const callback = () => {};
    mockSend.mockResolvedValueOnce({ Items: [] });
    const result = await loginHandler(event, context, callback);
    expect(result && result.statusCode).toBe(401);
  });

  it('returns 200 for valid credentials', async () => {
    const username = 'validuser';
    const password = 'validpass';
    const passwordHash = await bcrypt.hash(password, 10);
    const event = { body: JSON.stringify({ username, password }) };
    const context = {};
    const callback = () => {};
    mockSend.mockResolvedValueOnce({ Items: [{ passwordHash, userId: '123' }] });
    const result = await loginHandler(event, context, callback);
    expect(result && result.statusCode).toBe(200);
    expect(result && JSON.parse(result.body).message).toBe('Login successful');
  });
});
