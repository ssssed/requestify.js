# 📦 Установка

```bash
npm install requestify.js
```

Или через `yarn`:

```bash
yarn add requestify.js
```

# 🚨 Быстрое начало

```ts
import { HttpClient } from "requestify.js";

const api = new HttpClient({ baseUrl: "https://api.example.com" });

api.get("/users").then(console.log);
```
