import { defineMiddleware } from './utility';

export const jsonMiddleware = defineMiddleware<Response>({
	name: 'json',
	after(response) {
		return response.json();
	}
});

export type RequestifyResponse<T = unknown> = {
	data: T;
	status: number;
	headers: { [key: string]: string };
};

export const jsonFormatMiddleware = defineMiddleware<Response, RequestifyResponse>({
	name: 'jsonFormatMiddleware',
	async after(response) {
		return {
			data: await response.json(),
			status: response.status,
			headers: Object.fromEntries(response.headers.entries())
		} satisfies RequestifyResponse;
	}
});

export const retryMiddleware = (retry: number) => {
	return defineMiddleware<Response>({
		name: 'retryMiddleware',
		async after(response, context) {
			if (response.ok) return response;

			let lastResponse: Response = response;
			for (let attempt = 0; attempt < retry; attempt++) {
				if (!context?.refetch) break;
				lastResponse = await context.refetch();
				if (lastResponse.ok) return lastResponse;
			}

			// Возвращаем последний response вместо выброса ошибки
			// Это соответствует принципам fetch API и позволяет пользователю
			// самому решать, как обрабатывать HTTP статусы
			return lastResponse;
		}
	});
};
