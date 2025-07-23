import { describe, it, expect } from '@jest/globals';
import { HttpClient } from '../main';

describe('HttpClient', () => {
  it('метод get возвращает корректные данные с jsonplaceholder', async () => {
    const $api = new HttpClient();
    const response = await $api.get('https://jsonplaceholder.typicode.com/todos/1');
    const data = await response.json();
    expect(data).toHaveProperty('id', 1);
    expect(data).toHaveProperty('userId');
    expect(data).toHaveProperty('title');
    expect(data).toHaveProperty('completed');
  });
  
  it('инициализация baseUrl', async () => {
    const $api = new HttpClient({
      baseUrl: 'https://jsonplaceholder.typicode.com'
    });
    const response = await $api.get('/todos/1');
    const data = await response.json();
    expect(data).toHaveProperty('id', 1);
    expect(data).toHaveProperty('userId');
    expect(data).toHaveProperty('title');
    expect(data).toHaveProperty('completed');
  });

  it('custom headers', async () => {
    const $api = new HttpClient({
      baseUrl: 'https://jsonplaceholder.typicode.com',
      headers: {
        'X-Test-Id': "test-id"
      },
      middlewares: [
        {name: 'header-logs',
          async before(config) {
            if(config.headers) {
              expect(config.headers?.['X-Test-Id']).toBe('test-id')
            }
              return config;
          },
        }
      ]
    });
    await $api.get('/todos/1');
  });

  it('before middleware', async () => {
    const $api = new HttpClient({
      baseUrl: 'https://jsonplaceholder.typicode.com',
      headers: {
        'X-Test-Id': "test-id"
      },
      middlewares: [
        {name: 'header-logs',
          async before(config) {
            if(config.headers) {
              expect(config.headers?.['X-Test-Id']).toBe('test-id')
            }
              return config;
          },
        }
      ]
    });
    await $api.get('/todos/1');
  });

  it('register middleware', async () => {
    const $api = new HttpClient({
      baseUrl: 'https://jsonplaceholder.typicode.com',
    }).registerMiddleware({
      name: 'wrapper response',
      async after(response) {
          return await response.json();
      },
    })
    
    expect($api.middlewares.length === 1).toBe(true);
  });

  it('register middleware вне создания instance', async () => {
    let $api = new HttpClient({
      baseUrl: 'https://jsonplaceholder.typicode.com',
    })
    
    $api.registerMiddleware({
      name: 'wrapper response',
      async after(response) {
          return await response.json();
      },
    })
  

    expect($api.middlewares.length === 1).toBe(true);
  });

  it('json format middleware', async () => {
    const $api = new HttpClient({
      baseUrl: 'https://jsonplaceholder.typicode.com',
    }).registerMiddleware({
      name: 'wrapper response',
      after(response) {
          return response.json();
      },
    })

    const response = await $api.get('/todos');
    
   expect(Array.isArray(response)).toBe(true);
  });

  it('удаление middleware', async () => {
    const $api = new HttpClient({
      baseUrl: 'https://jsonplaceholder.typicode.com',
      middlewares: [
        {
          name: 'wrapper response',
          async after(response) {
              return await response.json();
          },
        }
      ]
    })

    await $api.get('/todos');
    
    $api.removeMiddleware('wrapper response')

    expect($api.middlewares.length === 0).toBe(true);
  });
});
