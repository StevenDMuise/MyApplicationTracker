const { handler: registerHandler } = require('../register');

describe('registerHandler', () => {
  it('returns 400 if required fields are missing', async () => {
    const event = { body: JSON.stringify({ username: 'user' }) };
    const context = {};
    const callback = () => {};
    const result = await registerHandler(event, context, callback);
    expect(result && result.statusCode).toBe(400);
    expect(result && JSON.parse(result.body).error).toBe('Missing required fields');
  });
});
