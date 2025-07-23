import { defaultSerializeBodyData, type SerializeBodyDataFunction } from "./utility";

/**
 * Middleware интерфейс для обработки запроса и ответа.
 * @template Name - имя middleware
 * @template Input - тип входных данных
 * @template Output - тип выходных данных
 */
export type Middleware<Input = unknown, Output = unknown> = {
  /** Уникальное имя middleware */
  name: string;
  /**
   * Функция, выполняющаяся до отправки запроса.
   * @param config - конфигурация запроса
   * @returns модифицированная конфигурация запроса
   */
  before?: (config: Config) => Promise<Config>;
  /**
   * Функция, выполняющаяся после получения ответа.
   * @param response - ответ от fetch или другого middleware
   * @returns модифицированный или исходный ответ
   */
  after?: (response: Input) => Promise<Output> | Output;
};

/**
 * Конфигурация запроса.
 */
type Config = Simplify<Omit<RequestInit, "body" | "method" | "headers">> & {
  /** Список middleware, которые нужно исключить */
  excludeMiddleware?: string[];
  /** HTTP заголовки */
  headers?: Headers;
  serializeBodyData?: SerializeBodyDataFunction
};

/** Тип для HTTP заголовков */
type Headers = {
  [key: string]: string;
};

/** Тип URL для запроса */
type Url = RequestInfo | URL;

/**
 * Конфигурация инициализации HttpClient.
 * @template T - тип возвращаемого значения (по умолчанию Response)
 */
type InitConfig<T = Response> = {
  /** Базовый URL для всех запросов */
  baseUrl?: string;
  /** Заголовки по умолчанию */
  headers?: Headers;
  /** Список middleware */
  middlewares?: Middleware<any, T>[];
  serializeBodyData?: SerializeBodyDataFunction
};

/**
 * HTTP клиент с поддержкой middleware.
 * @template T - тип данных, которые возвращает клиент (по умолчанию Response)
 */
export class HttpClient<T = Response> {
  private _middlewares: Middleware<any, any>[] = [];
  private headers: Headers = {};
  private baseUrl?: string;
  private serializeBodyData: SerializeBodyDataFunction = defaultSerializeBodyData;

  /**
   * Конструктор HTTP клиента.
   * @param config - конфигурация клиента
   */
  constructor(config?: InitConfig<T>) {
    this.baseUrl = config?.baseUrl || "";
    this._middlewares = config?.middlewares || [];
    this.serializeBodyData = config?.serializeBodyData || defaultSerializeBodyData;
  }

  /**
   * Регистрирует middleware и мутирует текущий инстанс, расширяя тип `T`.
   * Используйте ассерты при необходимости обновить тип вручную.
   */
  registerMiddleware<Next>(middleware: Middleware<T, Next>): HttpClient<Next> {
    this._middlewares.push(middleware);
    return this as unknown as HttpClient<Next>;
  }

  /**
   * Удаление middleware по имени.
   * @param name - имя middleware для удаления
   * @returns текущий экземпляр HttpClient без указанного middleware
   */
  removeMiddleware(name?: string): HttpClient<T> {
    if (!name) {
      this._middlewares = [];
    } else {
      const isDev = process.env.NODE_ENV !== "production";
      if (isDev) {
        const middleware = this._middlewares.find((m) => m.name === name);
        if (!middleware) {
          throw new Error(
            `Middleware ${name} is not registered in your http client instance`
          );
        }
      }

      this._middlewares = this._middlewares.filter(
        (middleware) => middleware.name !== name
      );
    }
    return this;
  }

  /**
   * Список зарегистрированных middleware.
   */
  get middlewares(): { name: string }[] {
    return this._middlewares.map((m) => ({ name: m.name }));
  }

  /**
   * Создаёт копию текущего клиента HTTP с теми же настройками.
   * @returns {HttpClient<T>} Новый экземпляр HttpClient с идентичными параметрами.
   */
  copy(): HttpClient<T> {
    return new HttpClient<T>({
      baseUrl: this.baseUrl,
      middlewares: this._middlewares.map((middleware) => ({ ...middleware })),
      headers: this.headers,
    });
  }

  /**
   * Выполнение GET-запроса с применением middleware.
   * @template Resp - ожидаемый тип ответа
   * @param url - URL запроса
   * @param config - дополнительные настройки запроса
   * @returns данные ответа
   */
  async get<Resp = T>(url: Url, config?: Config): Promise<Resp> {
    let copyConfig = structuredClone(config);
    copyConfig = await this._executeBeforeMiddlewares(copyConfig);

    let response: unknown = await fetch(this._getUrl(url), {
      headers: this.headers,
      ...copyConfig,
    });

    response = await this._executeAfterMiddlewares(response, copyConfig);

    return response as Resp;
  }

  /**
   * Выполнение Post-запроса с применением middleware.
   * @template Body - ожидаемый тип передаваемых параметров
   * @template Resp - ожидаемый тип ответа
   * @param url - URL запроса
   * @param body - Body запроса
   * @param config - дополнительные настройки запроса
   * @returns данные ответа
   */
  async post<Body, Resp = T>(
    url: Url,
    body: Body,
    config?: Config
  ): Promise<Resp> {
    let copyConfig = structuredClone(config);
    copyConfig = await this._executeBeforeMiddlewares(copyConfig);

    let response: unknown = await fetch(this._getUrl(url), {
      method: "POST",
      headers: this.headers,
      body: config?.serializeBodyData ? config.serializeBodyData(body) : this.serializeBodyData(body),
      ...copyConfig,
    });

    response = await this._executeAfterMiddlewares(response, copyConfig);

    return response as Resp;
  }

  /**
   * Выполнение Patch-запроса с применением middleware.
   * @template Body - ожидаемый тип передаваемых параметров
   * @template Resp - ожидаемый тип ответа
   * @param url - URL запроса
   * @param body - Body запроса
   * @param config - дополнительные настройки запроса
   * @returns данные ответа
   */
  async patch<Body, Resp = T>(
    url: Url,
    body: Body,
    config?: Config
  ): Promise<Resp> {
    let copyConfig = structuredClone(config);
    copyConfig = await this._executeBeforeMiddlewares(copyConfig);

    let response: unknown = await fetch(this._getUrl(url), {
      method: "PATCH",
      headers: this.headers,
      body: config?.serializeBodyData ? config.serializeBodyData(body) : this.serializeBodyData(body),
      ...copyConfig,
    });

    response = await this._executeAfterMiddlewares(response, copyConfig);

    return response as Resp;
  }

  /**
   * Выполнение Put-запроса с применением middleware.
   * @template Body - ожидаемый тип передаваемых параметров
   * @template Resp - ожидаемый тип ответа
   * @param url - URL запроса
   * @param body - Body запроса
   * @param config - дополнительные настройки запроса
   * @returns данные ответа
   */
  async put<Body, Resp = T>(
    url: Url,
    body: Body,
    config?: Config
  ): Promise<Resp> {
    let copyConfig = structuredClone(config);
    copyConfig = await this._executeBeforeMiddlewares(copyConfig);

    let response: unknown = await fetch(this._getUrl(url), {
      method: "PUT",
      headers: this.headers,
      body: config?.serializeBodyData ? config.serializeBodyData(body) : this.serializeBodyData(body),
      ...copyConfig,
    });

    response = await this._executeAfterMiddlewares(response, copyConfig);

    return response as Resp;
  }

  /**
   * Выполнение Delete-запроса с применением middleware.
   * @template Body - ожидаемый тип передаваемых параметров
   * @template Resp - ожидаемый тип ответа
   * @param url - URL запроса
   * @param body - Body запроса
   * @param config - дополнительные настройки запроса
   * @returns данные ответа
   */
  async delete<Body, Resp = T>(
    url: Url,
    body: Body,
    config?: Config
  ): Promise<Resp> {
    let copyConfig = structuredClone(config);
    copyConfig = await this._executeBeforeMiddlewares(copyConfig);

    let response: unknown = await fetch(this._getUrl(url), {
      method: "DELETE",
      headers: this.headers,
      body: config?.serializeBodyData ? config.serializeBodyData(body) : this.serializeBodyData(body),
      ...copyConfig,
    });

    response = await this._executeAfterMiddlewares(response, copyConfig);

    return response as Resp;
  }

  private async _executeBeforeMiddlewares(
    config?: Config
  ): Promise<Config | undefined> {
    if (!config) return config;
    for (const middleware of this._middlewares) {
      if (config?.excludeMiddleware?.includes(middleware.name)) continue;
      if (middleware.before && config) config = await middleware.before(config);
    }
    return config;
  }

  private async _executeAfterMiddlewares(
    response: unknown,
    config?: Config
  ): Promise<unknown> {
    for (const middleware of this._middlewares) {
      if (config?.excludeMiddleware?.includes(middleware.name)) continue;
      if (middleware.after) {
        response = await middleware.after(response);
      }
    }
    return response;
  }

  private _getUrl(url: Url): Url {
    if (this.baseUrl && typeof url === "string" && !url.startsWith("http")) {
      return this.baseUrl.replace(/\/$/, "") + "/" + url.replace(/^\//, "");
    }
    return url;
  }
}
