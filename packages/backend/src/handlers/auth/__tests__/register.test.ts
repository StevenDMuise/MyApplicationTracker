// @ts-ignore
import { handler as registerHandler } from '../register';

describe('registerHandler', () => {
	it('returns 400 if required fields are missing', async () => {
		const event = { body: JSON.stringify({ username: 'user' }) } as any;
		const context = {} as any;
		const callback = () => {};
		const result = await registerHandler(event, context, callback);
		expect(result && result.statusCode).toBe(400);
		expect(result && JSON.parse(result.body).error).toBe('Missing required fields');
	});
});
describe('registerHandler', () => {
	it('returns 400 if required fields are missing', async () => {
		const event = { body: JSON.stringify({ username: 'user' }) } as any;
		const context = {} as any;
		const callback = () => {};
		const result = await registerHandler(event, context, callback);
		expect(result && result.statusCode).toBe(400);
		expect(result && JSON.parse(result.body).error).toBe('Missing required fields');
	});
}); 
