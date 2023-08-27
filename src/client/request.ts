import {
	DEFAULT_CONFIG,
	cache,
	defaultAfterInterceptor,
	defaultBeforeInterceptor,
	saveToCache,
} from './helpers';

import type {
	IConfig,
	IRequest,
	IResponse,
	RequestInitial,
	RequestMethod,
} from './types';

const http = async <T, R>(
	method: RequestMethod,
	url: string,
	init: RequestInitial<T>
): Promise<IResponse<R>> => {
	const {
		beforeInterceptor = defaultBeforeInterceptor,
		afterInterceptor = defaultAfterInterceptor,
		...requestInit
	} = init;
	const originalFetch = fetch.bind(window);

	const requestConfig: RequestInit = {
		...requestInit,
		method,
		body: undefined,
	};
	if (method !== 'GET' && init.body) {
		requestConfig.body = JSON.stringify(init.body);
	}
	const request = new Request(url, requestConfig);

	// Применяем перехватчик и получаем обработанный запрос
	const interceptedRequest = beforeInterceptor(request);

	const response = await originalFetch(interceptedRequest);

	return afterInterceptor<R>(response);
};

export const request: IRequest = {
	baseUrl: '',
	headers: {},
	_caches: new Map<string, any>(),
	async get<T>(url: string, configs = DEFAULT_CONFIG): Promise<IResponse<T>> {
		const cacheKey = JSON.stringify({ method: 'GET', url, data: configs });

		const {
			isCache,
			hasCache,
			data: cacheData,
		} = cache<undefined, T>(cacheKey, configs, this._caches);

		if (cacheData) {
			return {
				status: 200,
				headers: new Headers(),
				data: cacheData,
			};
		}

		const data = await http<undefined, T>('GET', `${this.baseUrl}${url}`, {
			...configs,
			headers: { ...this.headers, ...configs.headers },
		});

		saveToCache({ isCache, hasCache, cacheKey, data, cached: this._caches });
		return data;
	},
	async post<T, R>(
		url: string,
		configs: RequestInitial<T>
	): Promise<IResponse<R>> {
		const cacheKey = JSON.stringify({ method: 'POST', url, data: configs });

		const {
			isCache,
			hasCache,
			data: cacheData,
		} = cache<T, R>(cacheKey, configs, this._caches);

		if (cacheData) {
			return {
				status: 200,
				headers: new Headers(),
				data: cacheData,
			};
		}

		const data = await http<T, R>('POST', `${this.baseUrl}${url}`, {
			...configs,
			headers: { ...this.headers, ...configs.headers },
		});

		saveToCache({ isCache, hasCache, data, cacheKey, cached: this._caches });

		return data;
	},
	async patch<T, R>(
		url: string,
		configs: RequestInitial<T>
	): Promise<IResponse<R>> {
		const cacheKey = JSON.stringify({ method: 'PATCH', url, data: configs });

		const {
			isCache,
			hasCache,
			data: cacheData,
		} = cache<T, R>(cacheKey, configs, this._caches);

		if (cacheData) {
			return {
				status: 200,
				headers: new Headers(),
				data: cacheData,
			};
		}
		const data = await http<T, R>('PATCH', `${this.baseUrl}${url}`, {
			...configs,
			headers: { ...this.headers, ...configs.headers },
		});
		saveToCache({ isCache, hasCache, data, cacheKey, cached: this._caches });
		return data;
	},
	async put<T, R>(
		url: string,
		configs: RequestInitial<T>
	): Promise<IResponse<R>> {
		const cacheKey = JSON.stringify({ method: 'PUT', url, data: configs });

		const {
			isCache,
			hasCache,
			data: cacheData,
		} = cache<T, R>(cacheKey, configs, this._caches);

		if (cacheData) {
			return {
				status: 200,
				headers: new Headers(),
				data: cacheData,
			};
		}
		const data = await http<T, R>('PUT', `${this.baseUrl}${url}`, {
			...configs,
			headers: { ...this.headers, ...configs.headers },
		});
		saveToCache({ isCache, hasCache, data, cacheKey, cached: this._caches });
		return data;
	},
	async delete<T, R>(
		url: string,
		configs: RequestInitial<T>
	): Promise<IResponse<R>> {
		const cacheKey = JSON.stringify({ method: 'DELETE', url, data: configs });

		const {
			isCache,
			hasCache,
			data: cacheData,
		} = cache<T, R>(cacheKey, configs, this._caches);

		if (cacheData) {
			return {
				status: 200,
				headers: new Headers(),
				data: cacheData,
			};
		}
		const data = await http<T, R>('DELETE', `${this.baseUrl}${url}`, {
			...configs,
			headers: { ...this.headers, ...configs.headers },
		});
		saveToCache({ isCache, hasCache, data, cacheKey, cached: this._caches });
		return data;
	},
	create(config?: IConfig) {
		if (config) {
			return {
				...request,
				_caches: new Map<string, any>(),
				...config,
			};
		}
		return {
			...request,
			_caches: new Map<string, any>(),
			baseUrl: '',
			headers: {},
		};
	},
};
