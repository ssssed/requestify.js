# Метод `removeMiddleware`

Метод `removeMiddleware` позволяет удалить зарегистрированное middleware по имени или удалить все middleware, если имя не указано.

```ts
removeMiddleware(name?: string): HttpClient<T>
```

## Параметры

- **name** (строка, необязательно) — имя middleware, которое нужно удалить.
  - Если не указано, будут удалены **все middleware**.

## Возвращаемое значение

Текущий экземпляр `HttpClient` без указанного middleware или без всех middleware.

## Особенности

- В режиме разработки (если `NODE_ENV !== 'production'`) метод выбрасывает ошибку, если указанное middleware не найдено.
- Метод **мутирует текущий экземпляр**. Если необходимо сохранить оригинал, воспользуйтесь методом [`copy()`](./copy.md).

## Пример: удаление одного middleware

```ts
client.removeMiddleware("auth");
```

## Пример: удаление всех middleware

```ts
client.removeMiddleware();
```

## Обработка ошибок

В режиме разработки будет выброшена ошибка, если вы попытаетесь удалить middleware, которого не существует:

```ts
client.removeMiddleware("not-exist");
// ❌ Ошибка: Middleware not-exist is not registered in your http client instance
```

## Рекомендации

- Перед удалением middleware полезно проверять его наличие через `client.middlewares`.
- Используйте уникальные имена для всех middleware, чтобы избежать путаницы.
