# Метод `registerMiddleware`

Метод `registerMiddleware` используется для добавления нового middleware в экземпляр `HttpClient`. Метод мутирует текущий экземпляр и позволяет расширить тип возвращаемого значения клиента.

```ts
registerMiddleware<Next>(middleware: Middleware<T, Next>): HttpClient<Next>
```

## Параметры

- **middleware** — объект middleware, реализующий интерфейс `Middleware`, содержащий:
  - `name`: уникальное имя middleware
  - `before?`: функция, вызываемая перед отправкой запроса
  - `after?`: функция, вызываемая после получения ответа

## Возвращаемое значение

Текущий экземпляр `HttpClient`, типизированный результатом, возвращаемым из middleware `after`.

## Особенности

- Метод **не создает новый экземпляр клиента**, а изменяет текущий.
- Если необходимо сохранить неизменный оригинал, рекомендуется использовать метод [`copy()`](./copy.md), а затем применять `registerMiddleware` к копии.
- Позволяет накапливать цепочку обработки ответов с помощью `.registerMiddleware().registerMiddleware()`.

## Пример

```ts
const client = new HttpClient<Response>();

const jsonMiddleware = {
  name: "json",
  after: async (response: Response) => {
    if (!response.ok) throw new Error("Ошибка запроса");
    return response.json();
  },
};

const jsonClient = client.registerMiddleware(jsonMiddleware);

const data = await jsonClient.get<{ userId: string }>("/user");
```

## Рекомендации

- Обязательно используйте уникальные имена middleware.
- При необходимости изменить возвращаемый тип используйте дженерик:
  ```ts
  const client = new HttpClient().registerMiddleware<AuthResponse>(
    authMiddleware
  );
  ```
