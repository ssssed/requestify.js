import { defineMiddleware } from "./utility";

export const jsonMiddleware = defineMiddleware<Response>({
	name: 'json',
	after(response) {
			return response.json();
	},
})

export type RequestifyResponse<T = unknown> = {
	data: T;
	status: number;
	headers: { [key: string]: string };
}

export const jsonFormatMiddleware = defineMiddleware<Response, RequestifyResponse>({
	name: 'jsonFormatMiddleware',
	async after(response) {
			return { 
				data: await response.json(),
				status: response.status,
				headers: Object.fromEntries(response.headers.entries()),
			} satisfies RequestifyResponse;
	},
})