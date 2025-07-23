import { HttpClient } from "./main";

type UserSnake = {
  id: number;
  name: number;
}

type SnakeToCamelCase<S extends string> = Simplify<
	S extends `${infer Head}_${infer Tail}` ? `${Head}${Capitalize<SnakeToCamelCase<Tail>>}` : S
>;

type IsPlainObject<T> = T extends any[] ? false : T extends object ? true : false;

type KeysToCamelCase<T> = Simplify<{
	[K in keyof T as SnakeToCamelCase<Extract<K, string>>]: T[K] extends Array<infer U>
		? Array<IsPlainObject<U> extends true ? KeysToCamelCase<U> : U>
		: IsPlainObject<T[K]> extends true
		? KeysToCamelCase<T[K]>
		: T[K];
}>;

const camelToSnakeKey = (key: string): string => key.replace(/([A-Z])/g, '_$1').toLowerCase();

export function camelToSnake<T extends Record<string, any>>(obj: T): Record<string, any> {
	const result: Record<string, any> = {};

	for (const [key, value] of Object.entries(obj)) {
		const snakeKey = camelToSnakeKey(key);

		result[snakeKey] = value && typeof value === 'object' && !Array.isArray(value) ? camelToSnake(value) : value;
	}

	return result;
}

const snakeToCamelKey = (key: string): string => key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

export function snakeToCamelCase<T>(obj: T): T extends Array<infer U> ? Array<any> : Record<string, any> {
	if (Array.isArray(obj)) {
		return obj.map(item =>
			item && typeof item === 'object' && !Array.isArray(item) ? snakeToCamelCase(item) : item
		) as any;
	}

	const result: Record<string, any> = {};

	for (const [key, value] of Object.entries(obj as Record<string, any>)) {
		const camelKey = snakeToCamelKey(key);

		if (Array.isArray(value)) {
			result[camelKey] = value.map(item =>
				item && typeof item === 'object' && !Array.isArray(item) ? snakeToCamelCase(item) : item
			);
		} else if (value && typeof value === 'object') {
			result[camelKey] = snakeToCamelCase(value);
		} else {
			result[camelKey] = value;
		}
	}

	return result as any;
}

type UserCamel = KeysToCamelCase<UserSnake>;

const $api = new HttpClient({
	baseUrl: 'https://jsonplaceholder.typicode.com'
})
  .registerMiddleware({
    name: 'json',
    after: async (res: Response) => {
      return res.json() as Promise<unknown>;
    },
  })
  .registerMiddleware({
    name: 'camelCase',
    after: (data: unknown) => snakeToCamelCase(data as Record<string, any>) as unknown,
  }).registerMiddleware({
		name: 'axios data structured',
		after: (data) => {
			return { data, ok: true };
		}
	})

const response = await $api.get<{ data: UserCamel[], ok: boolean }>('/users');

$api.removeMiddleware('axios data structured')
console.log(response);
