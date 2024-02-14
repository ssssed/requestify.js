import type { Response as FetchResponse } from 'node-fetch';
import fetch from 'node-fetch';
import { Constants } from './constants';
import { Cache } from './decorators/cache';
import { TimeLogger } from './decorators/logger';
import { ContentTypeValidateError, RequiredError } from './errors';
import { QueryString } from './helpers/query-string';
import type { RequestifyMethods, RequestifyTypes } from './types';
import { AbstractRequestify } from './types';

class Requestify extends AbstractRequestify {
	private __cache__ = new Map<string, unknown>();
	private _cacheConfig: RequestifyTypes.Cache =
		Constants.Configs.DEFAULT_CACHE_CONFIG;
	private _headers: RequestifyTypes.Headers | null = null;
	private _baseUrl: string;

	constructor(
		config: RequestifyMethods.Config = Constants.Configs.DEFAULT_CONFIG
	) {
		super();
		this._baseUrl = config.baseUrl ?? '';
		this._headers = config.headers ?? null;
		this._cacheConfig = {
			...Constants.Configs.DEFAULT_CACHE_CONFIG,
			...config.cache,
		};
	}

	private get requestHeaders() {
		return this._headers ?? {};
	}

	private async _serialize<T>(
		contentType: string | null,
		response: Pick<Response, 'blob' | 'json' | 'text'>
	): Promise<T> {
		if (!contentType) {
			Promise.reject(new RequiredError());
		}

		let data: Blob | unknown | string;

		if (contentType!.includes(Constants.Data.BLOB)) {
			data = await response.blob();
		} else if (contentType!.includes(Constants.Data.JSON)) {
			data = await response.json();
		} else if (contentType!.includes(Constants.Data.TEXT)) {
			data = await response.text();
		} else {
			Promise.reject(new ContentTypeValidateError());
		}
		return data as T;
	}

	private async _handleResponse<R>(
		response: FetchResponse
	): Promise<RequestifyTypes.Response<R>> {
		let data: R;
		try {
			data = await this._serialize<R>(
				response.headers.get(Constants.CONTENT_TYPE)!,
				response
			);

			return {
				data: data!,
				headers: response.headers as unknown as RequestifyTypes.Headers,
				ok: response.ok,
				status: response.status,
			};
		} catch (err: unknown) {
			if (err instanceof ContentTypeValidateError) {
				throw new ContentTypeValidateError();
			}
			if (err instanceof RequiredError) {
				throw new RequiredError();
			}
			throw new Error('Unexpected error.');
		}
	}

	@TimeLogger()
	@Cache()
	async get<
		Response = unknown,
		Params extends RequestifyTypes.Params = RequestifyTypes.Params
	>(url: string, params?: Params): Promise<RequestifyTypes.Response<Response>> {
		const endpoint = `${this._baseUrl}${url}${
			params ? QueryString.stringify(params) : ''
		}`;
		const startTime = new Date();
		console.log(`Starting request at ${startTime}`);
		const response = await fetch(endpoint, {
			method: Constants.Methods.GET,
			headers: this.requestHeaders,
		});

		const endTime = new Date();
		console.log(
			`Finished request at ${endTime}. Total time: ${
				endTime.getTime() - startTime.getTime()
			} seconds.`
		);
		return this._handleResponse<Response>(response);
	}

	async post<
		Response = unknown,
		Body extends Record<string, unknown> = Record<string, unknown>
	>(
		url: string,
		data: RequestifyTypes.RequestBody<Body>
	): Promise<RequestifyTypes.Response<Response>> {
		const { headers, params, ...body } = data;

		const endpoint = `${this._baseUrl}${url}${
			params ? QueryString.stringify(params) : ''
		}`;
		const response = await fetch(endpoint, {
			method: Constants.Methods.POST,
			headers: { ...this.requestHeaders, ...headers },
			body: JSON.stringify(body),
		});

		return this._handleResponse<Response>(response);
	}

	async put<
		Response = unknown,
		Body extends Record<string, unknown> = Record<string, unknown>
	>(
		url: string,
		data: RequestifyTypes.RequestBody<Body>
	): Promise<RequestifyTypes.Response<Response>> {
		const { headers, params, ...body } = data;

		const endpoint = `${this._baseUrl}${url}${
			params ? QueryString.stringify(params) : ''
		}`;
		const response = await fetch(endpoint, {
			method: Constants.Methods.PUT,
			headers: { ...this.requestHeaders, ...headers },
			body: JSON.stringify(body),
		});

		return this._handleResponse<Response>(response);
	}

	async patch<
		Response = unknown,
		Body extends Record<string, unknown> = Record<string, unknown>
	>(
		url: string,
		data: RequestifyTypes.RequestBody<Body>
	): Promise<RequestifyTypes.Response<Response>> {
		const { headers, params, ...body } = data;

		const endpoint = `${this._baseUrl}${url}${
			params ? QueryString.stringify(params) : ''
		}`;
		const response = await fetch(endpoint, {
			method: Constants.Methods.PATCH,
			headers: { ...this.requestHeaders, ...headers },
			body: JSON.stringify(body),
		});

		return this._handleResponse<Response>(response);
	}

	async delete<Response = unknown, Params = unknown>(
		url: string,
		params?: Params | undefined
	): Promise<RequestifyTypes.Response<Response>> {
		const endpoint = `${this._baseUrl}${url}${
			params ? QueryString.stringify(params) : ''
		}`;
		const response = await fetch(endpoint, {
			method: Constants.Methods.DELETE,
			headers: this.requestHeaders,
		});

		return this._handleResponse<Response>(response);
	}

	create(config: RequestifyMethods.Config): Requestify {
		return new Requestify(config);
	}

	cleanCache(): void {
		this.__cache__.clear();
	}

	interceptors = {
		request: {
			use: (config: Request) => {
				return config;
			},
		},
		response: {
			use: async <ResponseType = unknown>(
				response: Response
			): Promise<RequestifyTypes.Response<ResponseType>> => {
				if (!response.headers.has(Constants.CONTENT_TYPE)) {
					Promise.reject(new RequiredError());
				}

				let data: Blob | unknown | string;
				if (response.headers.has(Constants.CONTENT_TYPE)) {
					const contentType = response.headers.get(Constants.CONTENT_TYPE)!;

					if (contentType.includes(Constants.Data.BLOB)) {
						data = await response.blob();
					}

					if (contentType.includes(Constants.Data.JSON)) {
						data = await response.json();
					}

					if (contentType.includes(Constants.Data.TEXT)) {
						data = await response.text();
					}
				}

				return {
					data: data as ResponseType,
					headers: response.headers as unknown as RequestifyTypes.Headers,
					status: response.status,
					ok: response.ok,
				};
			},
		},
	};
}

export const request = new Requestify();
