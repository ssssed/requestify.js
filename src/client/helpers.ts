import { IResponse, RequestInitial, Cache, SaveCache } from "./types";

export const defaultBeforeInterceptor = (request: Request) => request;
export const defaultAfterInterceptor = async <T>(response: Response): Promise<IResponse<T>> => ({
    status: response.status,
    headers: response.headers,
    data: await response.json()
});

export const DEFAULT_CONFIG: RequestInitial<undefined> = {
    beforeInterceptor: defaultBeforeInterceptor,
    afterInterceptor: defaultAfterInterceptor,
    body: undefined,
    headers: {},
    cache: "no-cache"
}

export const cache = <T, R>(cacheKey: string, configs: RequestInitial<T>, cached: Map<string, any>): Cache<R> => {
    const isCache = configs.cache === "default" || configs.cache === "force-cache";
    const hasCache = cached.has(cacheKey);

    if (isCache && hasCache) {
        // Если есть в кеше, то возвращаем из кеша
        return { data: cached.get(cacheKey) as R, isCache, hasCache };
    }

    return { isCache, hasCache, data: null };
}

export const saveToCache = <T>({ isCache, hasCache, cached, cacheKey, data }: SaveCache<T>) => {
    if (isCache && !hasCache) {
        // если режим кеширования включен, но у нас нет в кеше, то сохраняем его в кеш
        cached.set(cacheKey, data)
        console.log(cacheKey, cached);
    }
}