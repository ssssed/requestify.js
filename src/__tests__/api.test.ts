import { describe, it, expect } from "@jest/globals";
import { HttpClient } from "../main";

type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

describe("api methoods", () => {
  it("метод get возвращает корректные данные с jsonplaceholder", async () => {
    const $api = new HttpClient();
    const response = await $api.get(
      "https://jsonplaceholder.typicode.com/todos/1"
    );
		expect(response.status).toBe(200);
  });

  it("метод post создает пост на jsonplaceholder", async () => {
    const input = {
      userId: 1,
      id: 1,
      title:
        "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
      body: "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto",
    };

    const $api = new HttpClient();
    const response = await $api.post<Post>(
      "https://jsonplaceholder.typicode.com/posts",
      input
    );
		expect(response.status).toBe(201);
  });

  it("метод put обновляет пост целиком на jsonplaceholder", async () => {
    const input = {
      userId: 1,
      id: 1,
      title: "test title",
      body: "test body",
    };

    const $api = new HttpClient();
    const response = await $api.put<Post>(
      "https://jsonplaceholder.typicode.com/posts/1",
      input
    );
		expect(response.status).toBe(200);
  });

  it("метод patch обновляет пост частично на jsonplaceholder", async () => {
    const input = {
      title: "test title",
      body: "test body",
    };

    const $api = new HttpClient();
    const response = await $api.patch<Partial<Post>>(
      "https://jsonplaceholder.typicode.com/posts/1",
      input
    );
		expect(response.status).toBe(200);
  });

  it("метод delete удаляет пост на jsonplaceholder", async () => {
    const $api = new HttpClient();
    const response = await $api.delete<Partial<Post>>(
      "https://jsonplaceholder.typicode.com/posts/1"
    );

    expect(response.status).toBe(200);
  });
});
