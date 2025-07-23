import type { Middleware } from "./main";

export function defineMiddleware<Input = unknown, Output = unknown>(middleware: Middleware<Input, Output>): Middleware<Input, Output> {
	return middleware;
}

export type SerializeBodyDataFunction<Input = unknown> = (data: Input) => BodyInit | null | undefined;

export function defaultSerializeBodyData<Input = unknown>(data: Input): BodyInit | null | undefined {
	if(data === undefined) return;
  if (data == null) return null;

  // Если это FormData, Blob, ArrayBuffer, URLSearchParams — возвращаем как есть
  if (
    typeof FormData !== 'undefined' && data instanceof FormData ||
    typeof Blob !== 'undefined' && data instanceof Blob ||
    typeof ArrayBuffer !== 'undefined' && data instanceof ArrayBuffer ||
    typeof URLSearchParams !== 'undefined' && data instanceof URLSearchParams
  ) {
    return data as BodyInit;
  }

  // Если это строка — возвращаем как есть
  if (typeof data === 'string') return data;

  // Если это объект или массив — сериализуем в JSON
  if (typeof data === 'object' || Array.isArray(data)) {
    return JSON.stringify(data);
  }

  // Для других типов (например, число, boolean) — преобразуем в строку
  return String(data);
}