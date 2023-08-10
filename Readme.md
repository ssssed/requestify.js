# requestify.js

The requestify.js library is an add-on to fetch, and extends its capabilities by providing a convenient api, and the goal of requestify.js is to replace heavyweight request libraries.

## Installing
---

##### Package manager
Using npm:
```npm install requestify.js```
Using yarn:
```yarn add requestify.js```

Once the package is installed, you can import the library using import approach:
```js
import { request } from "requestify.js";
```

## Example
---

```js
import { request } from "requestify.js";

request.get('https://api.example.com/users')
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });

const requestData = {
  body: {
    name: 'John Doe',
    email: 'john@example.com',
  }
};

request.post('https://api.example.com/users', requestData)
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });

// Want to use async/await? Add the `async` keyword to your function/method.
async function getUsers() {
  try {
    const response = await axios.get('https://api.example.com/users');
    console.log(response);
  } catch (error) {
    console.error(error);
  }
}
```

### Requestify.js support typescript
```typescript
import { request } from "requestify.js";

interface IUsers {
    userId: number;
    name: string;
    age: number;
}

request.get<IUsers[]>('https://api.example.com/users')
  .then(response => {
    console.log(response.data); // response.data - IUsers[]
  })
  .catch(error => {
    console.error(error);
  });

const requestData = {
  body: {
    name: 'John Doe',
    email: 'john@example.com',
  }
};

interface IRegisterData {
    name: string;
    email: string;
}

interface IRegisterResponse {
    id: number;
    email: string;
    name: string;
    age: number;
}

request.post<IRegisterData, IRegisterResponse>('https://api.example.com/users', requestData)
  .then(response => {
    console.log(response.data); // response.data - IRegisterResponse
  })
  .catch(error => {
    console.error(error);
  });

// Want to use async/await? Add the `async` keyword to your function/method.
async function getUsers() {
  try {
    const response = await axios.get<IUser[]>('https://api.example.com/users');
    console.log(response.data); // response.data - IUser[]
  } catch (error) {
    console.error(error);
  }
}
```

### Configuration
---
```request``` has its own configuration, such as:

* baseUrl - string
* headers - [key: string]: string

You can set the behavior of interceptors in each request in the configuration, and you can choose whether to cache requests or not. For example:

```js
import { request } from "requestify.js";

request.post('https://api.example.com/users', {
    body: {
        name: "test",
        email: "test@test.com"
    },
    async beforeInterceptor(request) {
        /* In this interceptor we intercept the request and perform some logic before
        sending it, we can add authorization keys to the headers and so on.
        IMPORTANT beforeInterceptor must necessarily return a request
        */
        console.log(request)
        return request;
    },
    async afterInterceptor(response) {
        // your logic

        /*
        in this interceptor we intercept the request and execute some logic before
        processing it. IMPORTANT the afterInterceptor must return some kind of response,
        how to process the data is up to you, whether it is text or blob file or json.
        */

        // default
       return {
            status: response.status,
            headers: response.headers,
            data: await response.json()
        }
    }
})
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });
```

### Instance
---
###### For convenience and mashability, you can create separate request instances that are independent of each other ######

#
```js
import { request } from "requestify.js";

const myInstance = request.create();
```

### Cache management
---

In order to cache requests and not to send them repeatedly, you need to pass the value "default" or "force-cache" to the cache field in the parameters to the request

The link on which the request was made and the parameters that were passed along with it are cached, if all of the above coincides, then at the value of the cache field "default" or "force-cache", the request will not be sent again

```js
import { request } from "requestify.js";

request.get('https://api.example.com/users', {
    cache: "default"
})
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });
```

### All options requested
---

```typescript
interface IRequest {
    baseUrl?: string;
    headers?: RequestHeaders;
    get: <T>(url: string, configs?: RequestInitial<undefined>) => Promise<IResponse<T>>;
    post: <T, R>(url: string, configs: RequestInitial<T>) => Promise<IResponse<R>>;
    put: <T, R>(url: string, configs: RequestInitial<T>) => Promise<IResponse<R>>;
    patch: <T, R>(url: string, configs: RequestInitial<T>) => Promise<IResponse<R>>;
    delete: <T, R>(url: string, configs: RequestInitial<T>) => Promise<IResponse<R>>;
    create: () => IRequest;
    _caches: Map<string, any>
}
```