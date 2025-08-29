# Базовая конфигурация HttpClient

Конструктор `HttpClient` принимает объект конфигурации, который позволяет гибко настроить поведение клиента.

```ts
new HttpClient({
  baseUrl?: string;
  headers?: Record<string, string>;
  middlewares?: Middleware[];
  serializeBodyData?: (body: unknown) => BodyInit | null | undefined;
  fetch?: (input: string | URL | globalThis.Request, init?: RequestInit) => Promise<Response>;
});
```

## Параметры конструктора

- **baseUrl** (строка, необязательно)

  - Базовый URL, который будет автоматически подставляться ко всем относительным путям в запросах.
  - Позволяет не дублировать домен/префикс в каждом запросе.
  - Пример: `baseUrl: 'https://api.example.com'`

- **headers** (объект, необязательно)

  - Заголовки по умолчанию, которые будут добавляться ко всем запросам.
  - Удобно для передачи токенов авторизации, Content-Type и других общих заголовков.
  - Пример: `{ 'Authorization': 'Bearer ...', 'Content-Type': 'application/json' }`

- **middlewares** (массив Middleware, необязательно)

  - Список middleware, которые будут применяться к каждому запросу и/или ответу.
  - Middleware позволяют реализовать кросс-срезные задачи: логирование, обработку ошибок, преобразование данных, автоматическую авторизацию и др.
  - Пример:
    ```ts
    [
      { name: 'json', after: res => res.json() },
      { name: 'auth', before: config => { ... } }
    ]
    ```

- **serializeBodyData** (функция, необязательно)

  - Функция для сериализации тела запроса (body) по умолчанию для всех методов (`post`, `put`, `patch`, `delete`).
  - По умолчанию сериализует объекты в JSON, а FormData/Blob/ArrayBuffer/строку — отправляет как есть.
  - Можно переопределить для каждого запроса через config.serializeBodyData.
  - Пример глобального переопределения (только для примера — базовая логика сериализации уже реализована под капотом, подробнее см. [документацию по сериализации](/methoods/serialize-body-data.md)):
    ```ts
    new HttpClient({
    	serializeBodyData: body => {
    		if (body instanceof FormData) return body;
    		return JSON.stringify(body);
    	}
    });
    ```
  - Пример локального переопределения для одного запроса:
    ```ts
    const client = new HttpClient();
    const formData = new FormData();
    formData.append('file', file);
    await client.post('/upload', formData, {
    	serializeBodyData: data => data // отправляем FormData как есть только для этого запроса
    });
    ```

- **fetch** (функция, необязательно)
  - Кастомная функция для выполнения HTTP-запросов.
  - По умолчанию используется глобальная функция `fetch` из браузера или Node.js.
  - Полезно для тестирования, моков или интеграции с другими HTTP-клиентами.
  - Пример для тестирования:

    ```ts
    const mockFetch = jest.fn(async () => new Response('{"data": "test"}'));

    const client = new HttpClient({
    	fetch: mockFetch
    });

    await client.get('/test');
    expect(mockFetch).toHaveBeenCalled();
    ```

  - Пример для Node.js с node-fetch:

    ```ts
    import fetch from 'node-fetch';

    const client = new HttpClient({
    	fetch: fetch
    });
    ```

## Функционал базовой конфигурации

- Позволяет централизованно управлять базовым адресом API.
- Упрощает добавление общих заголовков для всех запросов.
- Даёт возможность гибко расширять и изменять поведение клиента через middleware.
- Позволяет гибко управлять сериализацией тела запроса для разных форматов данных.
- Обеспечивает возможность использования кастомных HTTP-клиентов для тестирования и интеграции.

**Рекомендуется**:

- Использовать `baseUrl` для всех запросов к одному API.
- Передавать необходимые заголовки через `headers`, чтобы не дублировать их в каждом запросе.
- Реализовывать повторно используемую логику через middleware и подключать их через параметр `middlewares`.
- Для особых случаев сериализации использовать параметр `serializeBodyData` глобально или для конкретного запроса.
- Использовать параметр `fetch` для тестирования и интеграции с другими HTTP-клиентами.
