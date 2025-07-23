# 📚 API

## HttpClient

```ts
new HttpClient(config?: {
  baseUrl?: string;
  headers?: Record<string, string>;
  middlewares?: Middleware[];
});
```

### Методы

- `get(url, config?)` — GET-запрос
- `registerMiddleware(middleware)` — добавляет middleware
- `removeMiddleware(name?)` — удаляет middleware (по имени или все)
- `middlewares` — геттер списка middleware
- `copy()` — создаёт копию клиента с теми же настройками

---

## Типизированные middleware

Для удобства и повышения безопасности типов вы можете создавать middleware с явной типизацией с помощью вспомогательной функции `defineMiddleware`:

```ts
import { defineMiddleware } from "../src/utility";

const myTypedMiddleware = defineMiddleware<{ foo: string }, { bar: number }>({
  name: "typed",
  before: async (config) => {
    // config: Config
    return config;
  },
  after: async (response) => {
    // response: { foo: string }
    return { bar: Number(response.foo) };
  },
});
```

Такой подход позволяет IDE и TypeScript точно подсказывать типы входных и выходных данных middleware.

---
