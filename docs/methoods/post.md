# Метод `post`

Метод `post()` класса `HttpClient` используется для выполнения HTTP POST-запросов с поддержкой middleware, типизации результата и гибкой сериализации тела запроса.

## Для чего нужен

- Отправка новых данных на сервер (создание сущностей).
- Используется для регистрации, авторизации, создания заказов, публикации сообщений и других операций, где требуется передать данные на сервер.
- Поддержка middleware для автоматической обработки запроса и ответа (например, сериализация body, обработка ошибок, преобразование ответа в JSON).
- Гибкая сериализация тела запроса через параметр `serializeBodyData`.

## Пример использования

```ts
const client = new HttpClient({ baseUrl: "https://api.example.com" });

// Простой POST-запрос (результат — объект Response)
const response = await client.post("/users", { name: "John" });
const user = await response.json();

// POST-запрос с middleware для автоматического преобразования ответа в JSON
const clientWithJson = client.copy().registerMiddleware(
  defineMiddleware<Response, unknown>({
    name: "json",
    after: async (res) => res.json(),
  })
);
const createdUser = await clientWithJson.post<UserBody, User>("/users", {
  name: "John",
});

// Переопределение сериализации только для этого запроса
const formData = new FormData();
formData.append("name", "John");
const response2 = await client.post("/users", formData, {
  serializeBodyData: (data) => data, // не сериализуем, отправляем как есть
});
```

> **Примечание:** Не нужно вручную сериализовать body — это делает HttpClient автоматически (или через ваш serializeBodyData, см. [подробнее](/methoods/serialize-body-data)).

## Рекомендации

- Первый дженерик (`<Body, Resp>`) — это тип передаваемых данных (body), второй — тип результата (ответа).
- Для передачи данных используйте обычные объекты (или FormData, если требуется).
- Для автоматической обработки ответа используйте middleware (например, для преобразования в JSON).
- Явно указывайте оба типа (`post<Body, Resp>(...)`), если хотите строгую типизацию и автодополнение для body и результата.
- Для повторяющихся настроек используйте копии клиента через метод `copy()`.
- Для особых случаев сериализации используйте параметр `serializeBodyData` в конфиге метода или глобально при создании клиента.

### О параметре `serializeBodyData`

- По умолчанию сериализует объекты в JSON, FormData/Blob/ArrayBuffer/строку — отправляет как есть.
- Можно переопределить глобально (через конструктор) или для конкретного запроса (через config.serializeBodyData).
