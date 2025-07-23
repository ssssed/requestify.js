# Функция `defineMiddleware`

`defineMiddleware()` — вспомогательная функция для создания типизированных middleware с поддержкой автодополнения и строгой типизации в TypeScript.

## Для чего нужна

- **Явная типизация:** Позволяет явно указать типы входных и выходных данных middleware, что делает цепочку обработки данных предсказуемой и безопасной.
- **Улучшение автодополнения:** IDE подсказывает корректные типы на каждом этапе обработки.
- **Снижение количества ошибок:** Ошибки типов выявляются на этапе компиляции, а не во время выполнения.

## Пример использования

```ts
import { defineMiddleware } from "../src/utility";

// Пример: middleware, который преобразует Response в JSON
const autoJson = defineMiddleware<Response, unknown>({
  name: "autoJson",
  after: async (res) => res.json(),
});

// Пример: middleware, который преобразует строку в число
const stringToNumber = defineMiddleware<string, number>({
  name: "stringToNumber",
  after: (value) => Number(value),
});

// Использование с HttpClient
const client = new HttpClient()
  .registerMiddleware(autoJson)
  .registerMiddleware(stringToNumber);

const result = await client.get<number>("https://example.com/value");
// result будет типа number
```

## Рекомендации

- Всегда используйте `defineMiddleware` для создания собственных middleware — это повысит читаемость и надёжность кода.
- Явно указывайте типы Input и Output для сложных преобразований.
- Сохраняйте имя middleware (`name`) в отдельную константу для удобства удаления и переиспользования.

**Пример с константой:**

```ts
const AUTO_JSON = "autoJson";
const autoJson = defineMiddleware<Response, unknown>({
  name: AUTO_JSON,
  after: async (res) => res.json(),
});
client.removeMiddleware(AUTO_JSON);
```
