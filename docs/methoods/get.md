# Метод `get`

Метод `get()` класса `HttpClient` используется для выполнения HTTP GET-запросов с поддержкой middleware и типизации результата.

## Для чего нужен

- Получение данных с сервера по указанному URL.
- Автоматическая обработка ответа через цепочку middleware (например, преобразование в JSON, обработка ошибок, авторизация и др.).
- Гибкая типизация результата: можно явно указать ожидаемый тип данных (при наличии соответствующего middleware).

## Пример использования

```ts
const client = new HttpClient({ baseUrl: "https://api.example.com" });

// Простой GET-запрос (результат — объект Response, как в fetch)
const response = await client.get("/users");
const users = await response.json(); // вручную преобразуем в данные

// GET-запрос с дополнительной конфигурацией
const response2 = await client.get("/users/1", {
  headers: { "X-Request-ID": "123" },
});
const user = await response2.json();

// GET-запрос с middleware для автоматического преобразования ответа в JSON
const clientWithJson = client.copy().registerMiddleware(
  defineMiddleware<Response, unknown>({
    name: "json",
    after: async (res) => res.json(),
  })
);
const usersData = await clientWithJson.get<User[]>("/users"); // usersData уже массив пользователей
```

## Рекомендации

- Если не используете middleware для преобразования ответа, работайте с объектом Response как в fetch.
- Для автоматического получения данных используйте middleware (например, для преобразования в JSON).
- Явно указывайте тип результата (`get<Type>(...)`) только если цепочка middleware гарантирует нужный тип.
- Для повторяющихся настроек (заголовки, middleware) используйте копии клиента через метод `copy()`.

**Метод `get()` — основной способ получать данные с сервера, совмещая лаконичность, гибкость и безопасность типов.**
