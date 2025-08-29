# 🚀 Requestify.js

[![npm version](https://badge.fury.io/js/requestify.js.svg)](https://badge.fury.io/js/requestify.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

Лёгкий и расширяемый HTTP-клиент с поддержкой middleware для JavaScript и TypeScript проектов.

## ✨ Особенности

- 🔧 **Гибкая система middleware** - перехватывайте и модифицируйте запросы и ответы
- 🛡️ **Полная типизация TypeScript** - автодополнение и проверка типов
- 🚀 **Современный API** - основан на Fetch API
- 📦 **Минимальный размер** - без лишних зависимостей
- 🎯 **Простота использования** - интуитивный API

## 📦 Установка

```bash
npm install requestify.js
```

## 🚀 Быстрый старт

### Базовое использование

```ts
import { HttpClient } from 'requestify.js';

const api = new HttpClient({
	baseUrl: 'https://api.example.com'
});

// GET запрос
const data = await api.get('/users');

// POST запрос
const newUser = await api.post('/users', {
	name: 'John',
	email: 'john@example.com'
});
```

### С кастомным fetch для тестирования

```ts
import { HttpClient } from 'requestify.js';

// Мок для тестирования
const mockFetch = jest.fn(async () => new Response('{"data": "test"}'));

const api = new HttpClient({
	baseUrl: 'https://api.example.com',
	fetch: mockFetch
});

const data = await api.get('/users');
expect(mockFetch).toHaveBeenCalled();
```

### С middleware

```ts
import { HttpClient } from 'requestify.js';
import { jsonMiddleware, retryMiddleware } from 'requestify.js';

const api = new HttpClient({
	baseUrl: 'https://api.example.com'
})
	.registerMiddleware(jsonMiddleware)
	.registerMiddleware(retryMiddleware(3));

// Автоматически парсит JSON и повторяет неудачные запросы
const users = await api.get('/users');
```

## 🔧 Middleware

### Стандартные middleware

```ts
import { jsonMiddleware, jsonFormatMiddleware, retryMiddleware } from 'requestify.js';

// Автоматическое преобразование в JSON
const api1 = new HttpClient().registerMiddleware(jsonMiddleware);

// Форматированный ответ с метаданными
const api2 = new HttpClient().registerMiddleware(jsonFormatMiddleware);

// Повторение неудачных запросов
const api3 = new HttpClient().registerMiddleware(retryMiddleware(3));
```

### Создание собственного middleware

```ts
import { defineMiddleware } from 'requestify.js';

const authMiddleware = defineMiddleware({
	name: 'auth',
	before: async config => {
		config.headers = {
			...config.headers,
			Authorization: 'Bearer your-token'
		};
		return config;
	}
});

const api = new HttpClient().registerMiddleware(authMiddleware);
```

## 📚 Документация

Полная документация доступна на [GitHub Pages](https://ssssed.github.io/requestify.js/installation.html).

- [Установка и настройка](https://ssssed.github.io/requestify.js/installation.html)
- [API Reference](https://ssssed.github.io/requestify.js/methoods/base-config.html)
- [Middleware система](https://ssssed.github.io/requestify.js/methoods/middleware.html)
- [Стандартные middleware](https://ssssed.github.io/requestify.js/helpers/default-middlewares.html)

## 🤝 Поддержка

- 📖 [Документация](https://ssssed.github.io/requestify.js/installation.html)
- 🐛 [Issues](https://github.com/ssssed/requestify.js/issues)
- 💬 [Discussions](https://github.com/ssssed/requestify.js/discussions)

## 📄 Лицензия

MIT License - см. [LICENSE](LICENSE) файл для деталей.

## 👨‍💻 Автор

**Igor Koneshov**

- GitHub: [@ssssed](https://github.com/ssssed)
- Email: igorkoneshov@mail.ru

---

⭐ Если проект вам понравился, поставьте звезду на GitHub!
