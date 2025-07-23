# Стандартные middleware (default middlewares)

В библиотеке доступны готовые middleware для типовых сценариев обработки HTTP-ответов. Они позволяют быстро подключить автоматическое преобразование ответа в нужный формат и упростить работу с данными.

## jsonMiddleware

```ts
export const jsonMiddleware = defineMiddleware<Response>({
  name: "json",
  after(response) {
    return response.json();
  },
});
```

**Назначение:**

- Автоматически преобразует объект Response в JSON.
- Удобно использовать, если вы хотите сразу получать данные, а не работать с raw Response.

**Пример использования:**

```ts
const client = new HttpClient().registerMiddleware(jsonMiddleware);
const data = await client.get<MyType>("/api/data"); // data уже распарсенный объект
```

---

## jsonFormatMiddleware

```ts
export const jsonFormatMiddleware = defineMiddleware<
  Response,
  RequestifyResponse
>({
  name: "jsonFormatMiddleware",
  async after(response) {
    return {
      data: await response.json(),
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
    } satisfies RequestifyResponse;
  },
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
const response = await client.get<RequestifyResponse<MyType>>("/api/data");
console.log(response.data, response.status, response.headers);
```

---

## Рекомендации

- Используйте `jsonMiddleware`, если вам нужны только данные из ответа (типичный REST API).
- Используйте `jsonFormatMiddleware`, если важно получать не только данные, но и статус/заголовки (например, для обработки ошибок, пагинации, кастомных заголовков).
- Не подключайте оба middleware одновременно — используйте только один из них для обработки JSON-ответа.
- Для других форматов (текст, blob и т.д.) реализуйте свои middleware по аналогии.

> Все предоставленные middleware нужны чтобы съэкономить время для разработчиков и не являются строгими для использования. Этот список будет расширяться со временем
