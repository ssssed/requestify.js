export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type RequestHeaders = {
	[key: string]: string;
};

export type IConfig = {
	baseUrl?: string;
	headers?: RequestHeaders;
};

export type RequestInitial<T> = {
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
};

export interface IRequest {
	baseUrl?: string;
	headers?: RequestHeaders;
	get: <T>(
		url: string,
		configs?: RequestInitial<undefined>
	) => Promise<IResponse<T>>;
	post: <T, R>(
		url: string,
		configs: RequestInitial<T>
	) => Promise<IResponse<R>>;
	put: <T, R>(url: string, configs: RequestInitial<T>) => Promise<IResponse<R>>;
	patch: <T, R>(
		url: string,
		configs: RequestInitial<T>
	) => Promise<IResponse<R>>;
	delete: <T, R>(
		url: string,
		configs: RequestInitial<T>
	) => Promise<IResponse<R>>;
	create: (config?: IConfig) => IRequest;
	_caches: Map<string, any>;
}

export interface IResponse<T> {
	status: number;
	headers: Headers;
	data: T;
}

export interface Cache<T = null> {
	data: T | null;
	isCache: boolean;
	hasCache: boolean;
}

export interface SaveCache<T = any> {
	isCache: boolean;
	hasCache: boolean;
	cacheKey: string;
	cached: Map<string, any>;
	data: T;
}
