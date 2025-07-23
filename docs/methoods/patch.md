# Метод `patch`

Метод `patch()` класса `HttpClient` используется для выполнения HTTP PATCH-запросов с поддержкой middleware, типизации результата и гибкой сериализации тела запроса.

## Для чего нужен

- Частичное обновление данных на сервере (например, изменение одного или нескольких полей сущности).
- Используется для обновления профиля пользователя, статусов, отдельных параметров и др.
- Поддержка middleware для автоматической обработки запроса и ответа.
- Гибкая сериализация тела запроса через параметр `serializeBodyData`.

## Пример использования

```ts
const client = new HttpClient({ baseUrl: "https://api.example.com" });

// PATCH-запрос (результат — объект Response)
const response = await client.patch("/users/1", { name: "Jane" });
const updatedUser = await response.json();

// PATCH-запрос с middleware для автоматического преобразования ответа в JSON
const clientWithJson = client.copy().registerMiddleware(
  defineMiddleware<Response, unknown>({
    name: "json",
    after: async (res) => res.json(),
  })
);
const user = await clientWithJson.patch<UserBody, User>("/users/1", {
  name: "Jane",
});

// Переопределение сериализации только для этого запроса
const formData = new FormData();
formData.append("name", "Jane");
const response2 = await client.patch("/users/1", formData, {
  serializeBodyData: (data) => data, // не сериализуем, отправляем как есть
});
```

> **Примечание:** Не нужно вручную сериализовать body — это делает HttpClient автоматически (или через ваш serializeBodyData, см. [подробнее](/methoods/serialize-body-data)).

## Рекомендации

- Первый дженерик (`<Body, Resp>`) — это тип передаваемых данных (body), второй — тип результата (ответа).
- Для передачи данных используйте обычные объекты (или FormData, если требуется).
- Для автоматической обработки ответа используйте middleware.
- Явно указывайте оба типа (`patch<Body, Resp>(...)`) для строгой типизации.
- Для повторяющихся настроек используйте копии клиента через метод `copy()`.
- Для особых случаев сериализации используйте параметр `serializeBodyData` в конфиге метода или глобально при создании клиента.

### О параметре `serializeBodyData`

- По умолчанию сериализует объекты в JSON, FormData/Blob/ArrayBuffer/строку — отправляет как есть.
- Можно переопределить глобально (через конструктор) или для конкретного запроса (через config.serializeBodyData).
