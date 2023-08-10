type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestHeaders = {
    [key: string]: string;
};

type RequestInitial<T> = {
    headers?: RequestHeaders;
    body?: T;
    cache?: RequestCache;
    credentials?: RequestCredentials;
    integrity?: string;
    keepalive?: boolean;
    method?: string;
    mode?: RequestMode;
    redirect?: RequestRedirect;
    referrer?: string;
    referrerPolicy?: ReferrerPolicy;
    signal?: AbortSignal | null;
    window?: null;
    beforeInterceptor?: (request: Request) => Request;
    afterInterceptor?: <T>(response: Response) => Promise<IResponse<T>>;
}

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

interface IResponse<T> {
    status: number;
    headers: Headers,
    data: T
}

const defaultBeforeInterceptor = (request: Request) => request;
const defaultAfterInterceptor = async <T>(response: Response): Promise<IResponse<T>> => ({
    status: response.status,
    headers: response.headers,
    data: await response.json()
});

const http = async <T, R>(method: RequestMethod, url: string, init: RequestInitial<T>): Promise<IResponse<R>> => {
    const { beforeInterceptor = defaultBeforeInterceptor, afterInterceptor = defaultAfterInterceptor, ...requestInit } = init;
    const originalFetch = fetch.bind(window);

    const requestConfig: RequestInit = { ...requestInit, method, body: undefined }
    if (method !== "GET" && init.body) {
        requestConfig.body = JSON.stringify(init.body);
    }
    const request = new Request(url, requestConfig);

    // Применяем перехватчик и получаем обработанный запрос
    const interceptedRequest = beforeInterceptor(request);

    const response = await originalFetch(interceptedRequest);

    return afterInterceptor<R>(response);
}

const DEFAULT_CONFIG: RequestInitial<undefined> = {
    beforeInterceptor: defaultBeforeInterceptor,
    afterInterceptor: defaultAfterInterceptor,
    body: undefined,
    headers: {},
    cache: "no-cache"
}

export const request: IRequest = {
    _caches: new Map<string, any>(),
    set baseUrl(url: string) {
        this.baseUrl = url;
    },
    set headers(headers: RequestHeaders) {
        this.headers = headers;
    },
    async get<T>(url: string, configs = DEFAULT_CONFIG): Promise<IResponse<T>> {
        const cacheKey = JSON.stringify({ method: "GET", url, data: configs.body });

        const isCache = configs.cache === "default" || configs.cache === "force-cache";
        const hasCache = this._caches.has(cacheKey);

        if (isCache && hasCache) {
            // Если есть в кеше, то возвращаем из кеша
            return this._caches.get(cacheKey);
        }

        const data = await http<undefined, T>("GET", url, configs);

        if (isCache && !hasCache) {
            // если режим кеширования включен, но у нас нет в кеше, то сохраняем его в кеш
            this._caches.set(cacheKey, data)
            console.log(cacheKey, this._caches);
        }
        return data;
    },
    async post<T, R>(url: string, configs: RequestInitial<T>): Promise<IResponse<R>> {
        return await http<T, R>("POST", url, configs);
    },
    async patch<T, R>(url: string, configs: RequestInitial<T>): Promise<IResponse<R>> {
        return await http<T, R>("PATCH", url, configs);
    },
    async put<T, R>(url: string, configs: RequestInitial<T>): Promise<IResponse<R>> {
        return await http<T, R>("PUT", url, configs);
    },
    async delete<T, R>(url: string, configs: RequestInitial<T>): Promise<IResponse<R>> {
        return await http<T, R>("DELETE", url, configs);
    },
    create() {
        return { ...request, _caches: new Map<string, any>() };
    },
}
