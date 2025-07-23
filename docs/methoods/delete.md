# Метод `delete`

Метод `delete()` класса `HttpClient` используется для выполнения HTTP DELETE-запросов с поддержкой middleware, типизации результата и гибкой сериализации тела запроса.

## Для чего нужен

- Удаление сущностей на сервере (например, пользователя, записи, файла и др.).
- Используется для удаления профилей, постов, заказов и других объектов.
- Поддержка middleware для автоматической обработки ответа (например, преобразование в JSON, логирование).
- Гибкая сериализация тела запроса через параметр `serializeBodyData`.

## Пример использования

```ts
const client = new HttpClient({ baseUrl: "https://api.example.com" });

// DELETE-запрос (результат — объект Response)
const response = await client.delete("/users/1");
if (response.ok) {
  console.log("Пользователь удалён");
}

// DELETE-запрос с передачей тела запроса (например, для batch-удаления)
const response2 = await client.delete("/users", { ids: [1, 2, 3] });
const result2 = await response2.json();

// DELETE-запрос с middleware для автоматической обработки ответа
const clientWithJson = client.copy().registerMiddleware(
  defineMiddleware<Response, unknown>({
    name: "json",
    after: async (res) => res.json(),
  })
);
const result = await clientWithJson.delete<DeleteBody, { success: boolean }>(
  "/users/1"
);
if (result.success) {
  console.log("Пользователь удалён");
}

// Переопределение сериализации только для этого запроса
const formData = new FormData();
formData.append("id", "1");
const response3 = await client.delete("/users", formData, {
  serializeBodyData: (data) => data, // не сериализуем, отправляем как есть
});
```

> **Примечание:** Не нужно вручную сериализовать body — это делает HttpClient автоматически (или через ваш serializeBodyData, см. [подробнее](/methoods/serialize-body-data)).

## Рекомендации

- Первый дженерик (`<Body, Resp>`) — это тип передаваемых данных (body), второй — тип результата (ответа).
- Для передачи данных используйте обычные объекты (или FormData, если требуется).
- Для автоматической обработки ответа используйте middleware.
- Явно указывайте оба типа (`delete<Body, Resp>(...)`) для строгой типизации.
- Для повторяющихся настроек используйте копии клиента через метод `copy()`.
- Для особых случаев сериализации используйте параметр `serializeBodyData` в конфиге метода или глобально при создании клиента.

### О параметре `serializeBodyData`

- По умолчанию сериализует объекты в JSON, FormData/Blob/ArrayBuffer/строку — отправляет как есть.
- Можно переопределить глобально (через конструктор) или для конкретного запроса (через config.serializeBodyData).
