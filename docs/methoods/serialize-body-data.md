# serializeBodyData

`serializeBodyData` — это функция, отвечающая за преобразование (сериализацию) данных, которые передаются в тело запроса (`body`) методов `post`, `put`, `patch`, `delete` класса `HttpClient`.

## Для чего нужна

- Позволяет автоматически преобразовывать любые данные (объекты, строки, FormData и др.) в формат, который корректно воспринимается fetch в поле `body`.
- Обеспечивает универсальность и удобство работы с разными типами данных без необходимости вручную сериализовать их в каждом запросе.
- Даёт возможность гибко переопределять логику сериализации для специфических кейсов (например, отправка файлов, нестандартные форматы, интеграция с legacy API).

## Реализация по умолчанию

В библиотеке реализована функция `defaultSerializeBodyData`, которая используется по умолчанию:

```ts
export function defaultSerializeBodyData<Input = unknown>(
  data: Input
): BodyInit | null | undefined {
  if (data === undefined) return;
  if (data == null) return null;

  // Если это FormData, Blob, ArrayBuffer, URLSearchParams — возвращаем как есть
  if (
    (typeof FormData !== "undefined" && data instanceof FormData) ||
    (typeof Blob !== "undefined" && data instanceof Blob) ||
    (typeof ArrayBuffer !== "undefined" && data instanceof ArrayBuffer) ||
    (typeof URLSearchParams !== "undefined" && data instanceof URLSearchParams)
  ) {
    return data as BodyInit;
  }

  // Если это строка — возвращаем как есть
  if (typeof data === "string") return data;

  // Если это объект или массив — сериализуем в JSON
  if (typeof data === "object" || Array.isArray(data)) {
    return JSON.stringify(data);
  }

  // Для других типов (например, число, boolean) — преобразуем в строку
  return String(data);
}
```

## Как работает в HttpClient

- По умолчанию используется глобально для всех методов, если не указано иное.
- Можно переопределить глобально при создании клиента:
  ```ts
  const client = new HttpClient({
    serializeBodyData: (body) => {
      if (body instanceof FormData) return body;
      return JSON.stringify(body);
    },
  });
  ```
- Можно переопределить для конкретного запроса через config:
  ```ts
  await client.post("/upload", formData, {
    serializeBodyData: (data) => data, // отправляем FormData как есть только для этого запроса
  });
  ```

## Рекомендации

- В большинстве случаев достаточно стандартной реализации — она покрывает все типовые сценарии (JSON, FormData, файлы, строки).
- Переопределяйте `serializeBodyData`, если:
  - Требуется особый формат сериализации (например, XML, Protobuf, кастомные бинарные данные).
  - Необходимо реализовать специфическую логику для интеграции с нестандартными API.
- Для единичных случаев используйте локальное переопределение через config, для глобальных — через конструктор клиента.

---

**Подробнее о настройке и примерах использования см. разделы:**

- [Базовая конфигурация](./base-config.md)
- [Методы post, put, patch, delete](./post.md)
