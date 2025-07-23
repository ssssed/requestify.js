import { describe, it, expect } from "@jest/globals";
import { HttpClient } from "../main";
import { defineMiddleware } from "../utility";

type JsonResponseFormat<T = unknown> = {
  data: T;
  status: number;
  headers: { [key: string]: string };
}

type Post = {
  userId: number; id: number; title: string; body: string
}

const jsonFormat = defineMiddleware<Response>({
  name: "jsonFormat",
  async after(response) {
      return {
        data: await response.json(),
        status: response.status,
        headers: response.headers,
      }
  },
})

const json = defineMiddleware<Response>({
  name: "json",
  async after(response) {
    return await response.json();
  },
});

describe("configuration", () => {
  it("инициализация baseUrl", async () => {
    const $api = new HttpClient({
      baseUrl: "https://jsonplaceholder.typicode.com",
    });
    const response = await $api.get("/todos/1");
    const data = await response.json();
    expect(data).toHaveProperty("id", 1);
    expect(data).toHaveProperty("userId");
    expect(data).toHaveProperty("title");
    expect(data).toHaveProperty("completed");
  });

  it("custom headers", async () => {
    const $api = new HttpClient({
      baseUrl: "https://jsonplaceholder.typicode.com",
      headers: {
        "X-Test-Id": "test-id",
      },
      middlewares: [
        {
          name: "header-logs",
          async before(config) {
            if (config.headers) {
              expect(config.headers?.["X-Test-Id"]).toBe("test-id");
            }
            return config;
          },
        },
      ],
    });
    await $api.get("/todos/1");
  });

  it("before middleware", async () => {
    const $api = new HttpClient({
      baseUrl: "https://jsonplaceholder.typicode.com",
      headers: {
        "X-Test-Id": "test-id",
      },
      middlewares: [
        {
          name: "header-logs",
          async before(config) {
            if (config.headers) {
              expect(config.headers?.["X-Test-Id"]).toBe("test-id");
            }
            return config;
          },
        },
      ],
    });
    await $api.get("/todos/1");
  });

  it("register middleware", async () => {
    const $api = new HttpClient({
      baseUrl: "https://jsonplaceholder.typicode.com",
    }).registerMiddleware(json);

    expect($api.middlewares.length === 1).toBe(true);
  });

  it("register middleware вне создания instance", async () => {
    let $api = new HttpClient({
      baseUrl: "https://jsonplaceholder.typicode.com",
    });

    $api.registerMiddleware(json);

    expect($api.middlewares.length === 1).toBe(true);
  });

  it("json format middleware", async () => {
    const $api = new HttpClient({
      baseUrl: "https://jsonplaceholder.typicode.com",
    }).registerMiddleware(json);

    const response = await $api.get("/todos");

    expect(Array.isArray(response)).toBe(true);
  });

  it("удаление middleware", async () => {
    const $api = new HttpClient({
      baseUrl: "https://jsonplaceholder.typicode.com",
      middlewares: [json],
    });

    await $api.get("/todos");

    $api.removeMiddleware("json");

    expect($api.middlewares.length === 0).toBe(true);
  });

  it("кастомная серилизация", async () => {
    const $api = new HttpClient({
      baseUrl: "https://jsonplaceholder.typicode.com",
      middlewares: [jsonFormat],
      serializeBodyData: (data) => JSON.stringify(data),
    });

    const data = {
      userId: 1,
      id: 1,
      title:
        "tttt",
      body: "test",
    }

    const response = await $api.post<Post, JsonResponseFormat<Post>>("/posts", data);

    expect(response.status).toBe(201);
    expect(response.data.id).toBe(101);
  });
});
