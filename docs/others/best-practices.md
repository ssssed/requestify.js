# 🏆 Best Practices

## Пример: Использование middleware для преобразования данных

```ts
import { HttpClient } from "requestify.js";

// Создаём экземпляр клиента с базовым URL
const $api = new HttpClient({
  baseUrl: "https://jsonplaceholder.typicode.com",
})
  // Middleware для автоматического преобразования ответа в JSON
  .registerMiddleware({
    name: "json",
    after: async (res: Response) => {
      return res.json() as Promise<unknown>;
    },
  })
  // Middleware для преобразования ключей из snake_case в camelCase
  .registerMiddleware({
    name: "camelCase",
    after: (data: unknown) =>
      snakeToCamelCase(data as Record<string, any>) as unknown,
  })
  // Middleware для структурирования ответа как у axios
  .registerMiddleware({
    name: "axios data structured",
    after: (data) => {
      return { data, ok: true };
    },
  });

// Получение пользователей с автоматическим преобразованием структуры данных
const response = await $api.get<{ data: UserCamel[]; ok: boolean }>("/users");

// Удаление middleware по имени
$api.removeMiddleware("axios data structured");
```

**Рекомендации:**

- Используйте цепочку registerMiddleware для поэтапной обработки данных.
- Для повторного использования конфигурации клиента используйте метод `copy()`.
- Удаляйте ненужные middleware с помощью `removeMiddleware`.
- Преобразуйте данные в удобный для вас формат прямо на уровне middleware.

## Типизированные middleware

Для повышения безопасности типов и удобства автодополнения используйте функцию `defineMiddleware`:

```ts
import { defineMiddleware } from "../src/utility";

// Рекомендуется сохранять имя middleware в отдельную константу
const AUTO_JSON_MIDDLEWARE = "autoJson";

// Пример: middleware, который автоматически преобразует ответ в JSON
const autoJson = defineMiddleware<Response, unknown>({
  name: AUTO_JSON_MIDDLEWARE,
  after: async (res) => res.json(),
});

// Использование с HttpClient
const client = new HttpClient().registerMiddleware(autoJson);

const result = await client.get<unknown>("https://example.com/data");
// result будет содержать распарсенные JSON-данные

// Удаление middleware по имени
client.removeMiddleware(AUTO_JSON_MIDDLEWARE);
```

**Преимущества:**

- Явная типизация входа и выхода middleware
- IDE подсказывает типы на каждом этапе цепочки
- Меньше ошибок при обработке данных
- Удобно и безопасно управлять middleware по имени, избегая опечаток
