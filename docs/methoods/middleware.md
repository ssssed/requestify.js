# 🧩 Использование middleware

```ts
const authMiddleware = {
  name: 'auth',
  before: async (config) => {
    config.headers = {
      ...config.headers,
      Authorization: 'Bearer your-token',
    };
    return config;
  }
};

const api = new HttpClient()
  .registerMiddleware(authMiddleware);

await api.get('/me');
```

## Удаление middleware

```ts
api.removeMiddleware('auth');
```

## Исключение middleware при запросе

```ts
await api.get('/me', {
  excludeMiddleware: ['auth'],
});
```

## Архитектура middleware

Каждый middleware может реализовать методы:

- `before(config)` — вызывается перед выполнением запроса
- `after(response)` — вызывается после получения ответа

Middleware обрабатываются в порядке регистрации.
