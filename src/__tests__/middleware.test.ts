import { describe, it, expect } from '@jest/globals';
import { HttpClient } from '../main';
import { jsonMiddleware, jsonFormatMiddleware, retryMiddleware, type RequestifyResponse } from '../middlewares';

function createResponse(body: any, init: { status?: number; headers?: Record<string, string> } = {}) {
	const jsonBody = JSON.stringify(body);
	const headers = new global.Headers(init.headers ?? { 'content-type': 'application/json' });
	return new global.Response(jsonBody, { status: init.status ?? 200, headers });
}

describe('middlewares', () => {
	it('json middleware converts Response to parsed JSON', async () => {
		const mockFetch = jest.fn(async () => createResponse({ ok: true, value: 42 }));

		const api = new HttpClient({ fetch: mockFetch }).registerMiddleware(jsonMiddleware);

		const data = await api.get<{ ok: boolean; value: number }>('/any');

		expect(mockFetch).toHaveBeenCalledTimes(1);
		expect(data).toEqual({ ok: true, value: 42 });
	});

	it('jsonFormatMiddleware returns RequestifyResponse with data, status, headers', async () => {
		const mockFetch = jest.fn(async () =>
			createResponse(
				{ items: [1, 2, 3] },
				{ status: 201, headers: { 'x-test': 'yes', 'content-type': 'application/json' } }
			)
		);

		const api = new HttpClient({ fetch: mockFetch }).registerMiddleware(jsonFormatMiddleware);

		const response = await api.get<RequestifyResponse<{ items: number[] }>>('/list');

		expect(mockFetch).toHaveBeenCalledTimes(1);
		expect(response.status).toBe(201);
		expect(response.data).toEqual({ items: [1, 2, 3] });
		expect(response.headers['x-test']).toBe('yes');
	});

	it('retryMiddleware refetches on failure and returns last response', async () => {
		const sequence: Response[] = [
			createResponse({ error: 'fail-1' }, { status: 500 }),
			createResponse({ error: 'fail-2' }, { status: 500 }),
			createResponse({ ok: true }, { status: 200 })
		];
		const mockFetch = jest.fn(async () => sequence.shift() as Response);

		const api = new HttpClient({ fetch: mockFetch }).registerMiddleware(retryMiddleware(2));

		const ok = await api.get<Response>('/retry');
		expect(mockFetch).toHaveBeenCalledTimes(3);
		expect(ok.ok).toBe(true);

		// Тест: возвращает последний response при исчерпании попыток
		const failSeq: Response[] = [
			createResponse({ error: 'fail-a' }, { status: 500 }),
			createResponse({ error: 'fail-b' }, { status: 500 }),
			createResponse({ error: 'fail-c' }, { status: 500 })
		];
		const mockFetchFail = jest.fn(async () => failSeq.shift() as Response);
		const apiFail = new HttpClient({ fetch: mockFetchFail }).registerMiddleware(retryMiddleware(2));

		const lastResponse = await apiFail.get<Response>('/retry-fail');
		expect(mockFetchFail).toHaveBeenCalledTimes(3);
		expect(lastResponse.status).toBe(500);
		expect(lastResponse.ok).toBe(false);
	});
});
