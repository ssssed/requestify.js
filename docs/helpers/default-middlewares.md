# Стандартные middleware (default middlewares)

В библиотеке доступны готовые middleware для типовых сценариев обработки HTTP-ответов. Они позволяют быстро подключить автоматическое преобразование ответа в нужный формат и упростить работу с данными.

## jsonMiddleware

```ts
export const jsonMiddleware = defineMiddleware<Response>({
	name: 'json',
	after(response) {
		return response.json();
	}
});
```

**Назначение:**

- Автоматически преобразует объект Response в JSON.
- Удобно использовать, если вы хотите сразу получать данные, а не работать с raw Response.

**Пример использования:**

```ts
const client = new HttpClient().registerMiddleware(jsonMiddleware);
const data = await client.get<MyType>('/api/data'); // data уже распарсенный объект
```

---

## jsonFormatMiddleware

```ts
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
```

**Назначение:**

- Преобразует ответ в объект с полями:
  - `data` — распарсенные данные
  - `status` — HTTP-статус ответа
  - `headers` — заголовки ответа в виде объекта ключ-значение
- Удобно для унификации структуры ответа (например, если вы привыкли к формату axios или хотите всегда получать статус и заголовки вместе с данными).

**Пример использования:**

```ts
const client = new HttpClient().registerMiddleware(jsonFormatMiddleware);
const response = await client.get<RequestifyResponse<MyType>>('/api/data');
console.log(response.data, response.status, response.headers);
```

---

## retryMiddleware

```ts
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
			return lastResponse;
		}
	});
};
```

**Назначение:**

- Автоматически повторяет неудачные запросы указанное количество раз
- Возвращает первый успешный ответ
- При исчерпании попыток возвращает последний полученный response (не выбрасывает ошибку)

**Пример использования:**

```ts
const client = new HttpClient().registerMiddleware(retryMiddleware(3));

// Повторит запрос до 3 раз при неудаче
const response = await client.get('/api/unstable-endpoint');

// Проверяем статус самостоятельно
if (!response.ok) {
	console.log(`Request failed with status: ${response.status}`);
}
```

**Почему не выбрасывается ошибка?**

- Соответствует принципам fetch API: HTTP статусы - это не ошибки
- Позволяет пользователю самому решать, как обрабатывать разные статусы
- Более предсказуемое поведение и проще в использовании

---

## Рекомендации

- Используйте `jsonMiddleware`, если вам нужны только данные из ответа (типичный REST API).
- Используйте `jsonFormatMiddleware`, если важно получать не только данные, но и статус/заголовки (например, для обработки ошибок, пагинации, кастомных заголовков).
- Используйте `retryMiddleware` для нестабильных эндпоинтов или сетевых соединений.
- Не подключайте оба middleware одновременно — используйте только один из них для обработки JSON-ответа.
- Для других форматов (текст, blob и т.д.) реализуйте свои middleware по аналогии.

> Все предоставленные middleware нужны чтобы съэкономить время для разработчиков и не являются строгими для использования. Этот список будет расширяться со временем
