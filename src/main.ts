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
type Config = Simplify<Omit<RequestInit, 'body' | 'method' | 'headers'>> & {
  /** Список middleware, которые нужно исключить */
  excludeMiddleware?: string[];
  /** HTTP заголовки */
  headers?: Headers;
}

/** Тип для HTTP заголовков */
type Headers = {
  [key: string]: string;
}

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
};

/**
 * HTTP клиент с поддержкой middleware.
 * @template T - тип данных, которые возвращает клиент (по умолчанию Response)
 */
export class HttpClient<T = Response> {
  private _middlewares: Middleware<any, any>[] = [];
  private headers: Headers = {};
  private baseUrl?: string;

  /**
   * Конструктор HTTP клиента.
   * @param config - конфигурация клиента
   */
  constructor(config?: InitConfig<T>) {
    this.baseUrl = config?.baseUrl || "";
    this._middlewares = config?.middlewares || [];
  }

  /**
   * Регистрирует новый middleware и возвращает новый инстанс HttpClient
   * с обновленной типизацией, учитывающей добавленный middleware.
   *
   * Важно: если вы вызываете этот метод в формате
   * ```ts
   * $api.registerMiddleware({...})
   * ```
   * то типизация у исходного инстанса `$api` **не изменится**.
   * Для корректного использования нового типа необходимо
   * присвоить результат вызова в переменную:
   * ```ts
   * $api = $api.registerMiddleware({...});
   * ```
   *
   * ВАЖНО `registerMiddleware`, вызываемый отдельно от инициализации,
   * создает **новый типизированный инстанс**, НО который **СОХРАНЯЕТ** ссылку на `middlewares` у HttpClient.
   *
   * @template Name - имя middleware
   * @template Next - тип следующего шага (результат после middleware)
   * @param {Middleware<Name, T, Next>} middleware - middleware для регистрации
   * @returns {HttpClient<Next>} новый инстанс HttpClient с обновленной типизацией
   */
  registerMiddleware<Next>(
    middleware: Middleware<T, Next>
  ): HttpClient<Next> {
    this._middlewares.push(middleware);
    return new HttpClient<Next>({
      baseUrl: this.baseUrl,
      headers: this.headers,
      middlewares: this._middlewares,
    });
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
			const isDev = process.env.NODE_ENV !== 'production';
			if (isDev) {
				const middleware = this._middlewares.find(m => m.name === name);
				if(!middleware) {
					throw new Error(`Middleware ${name} is not registered in your http client instance`)
				}
			}
			
      this._middlewares = this._middlewares.filter(middleware => middleware.name !== name);
    }
    return this;
  }

  /**
   * Список зарегистрированных middleware.
   */
  get middlewares(): { name: string }[] {
    return this._middlewares.map(m => ({ name: m.name }));
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

  private async _executeBeforeMiddlewares(config?: Config): Promise<Config | undefined> {
    if (!config) return config;
    for (const middleware of this._middlewares) {
      if (config?.excludeMiddleware?.includes(middleware.name)) continue;
      if (middleware.before && config) config = await middleware.before(config);
    }
    return config;
  }

  private async _executeAfterMiddlewares(response: unknown, config?: Config): Promise<unknown> {
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
