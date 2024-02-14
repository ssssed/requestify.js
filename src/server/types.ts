import { Constants } from './constants';
import { ImplementsError, RequiredError } from './errors';

export module RequestMethods {
	export type RequestMethod = (typeof Constants.Methods.ALL_METHODS)[number];
	export interface Get {
		get<
			Response = unknown,
			Params extends RequestifyTypes.Params = RequestifyTypes.Params
		>(
			url: string,
			params?: Params
		): Promise<RequestifyTypes.Response<Response>>;
	}

	export interface Post {
		post<
			Response = unknown,
			Body extends Record<string, unknown> = Record<string, unknown>
		>(
			url: string,
			data: RequestifyTypes.RequestBody<Body>
		): Promise<RequestifyTypes.Response<Response>>;
	}

	export interface Put {
		put<
			Response = unknown,
			Body extends Record<string, unknown> = Record<string, unknown>
		>(
			url: string,
			data: RequestifyTypes.RequestBody<Body>
		): Promise<RequestifyTypes.Response<Response>>;
	}

	export interface Patch {
		patch<
			Response = unknown,
			Body extends Record<string, unknown> = Record<string, unknown>
		>(
			url: string,
			data: RequestifyTypes.RequestBody<Body>
		): Promise<RequestifyTypes.Response<Response>>;
	}

	export interface Delete {
		delete<
			Response = unknown,
			Params extends RequestifyTypes.Params = RequestifyTypes.Params
		>(
			url: string,
			params?: Params
		): Promise<RequestifyTypes.Response<Response>>;
	}
}

export module RequestifyMethods {
	export type Config = {
		baseUrl?: string;
		headers?: RequestifyTypes.Headers;
		cache?: RequestifyTypes.Cache;
	};

	export interface Create {
		create(config: Config): AbstractRequestify;
	}

	export interface CleanCache {
		cleanCache(): void;
	}
}

export module Interceptors {
	export type RequestHandler = (config: Request) => Request;
	export type ResponseHandler = <ResponseType = unknown>(
		response: Response
	) => Promise<RequestifyTypes.Response<ResponseType>>;

	export interface Usable<Handler = RequestHandler> {
		use: Handler;
	}

	export type RequestType = Usable<RequestHandler>;
	export type ResponseType = Usable<ResponseHandler>;

	export interface InterceptorSettings {
		interceptors: {
			request: RequestType;
			response: ResponseType;
		};
	}
}

export module RequestifyTypes {
	export type Headers = Record<string & Required<'Content-Type'>, string>;
	export type Cache = {
		enabled: boolean;
		lifetime?: number; // in millisecond
		methods?: RequestMethods.RequestMethod[]; // enable method caching
	};
	export type Params = Record<string, string | number>;
	export type RequestBody<
		T extends Record<string, unknown> = Record<string, unknown>
	> = T & {
		headers?: Headers;
		params?: Params;
	};
	export type Response<ResponseType = unknown> = {
		status: number;
		data: ResponseType;
		headers: Headers;
		ok: boolean;
	};
}

export abstract class AbstractRequestify
	implements
		RequestMethods.Get,
		RequestMethods.Post,
		RequestMethods.Put,
		RequestMethods.Patch,
		RequestMethods.Delete,
		RequestifyMethods.Create,
		RequestifyMethods.CleanCache,
		Interceptors.InterceptorSettings
{
	get<
		Response = unknown,
		Params extends RequestifyTypes.Params = RequestifyTypes.Params
	>(url: string, params?: Params): Promise<RequestifyTypes.Response<Response>> {
		throw new ImplementsError();
	}
	post<
		Response = unknown,
		Body extends Record<string, unknown> = Record<string, unknown>
	>(
		url: string,
		data: RequestifyTypes.RequestBody<Body>
	): Promise<RequestifyTypes.Response<Response>> {
		throw new ImplementsError();
	}
	put<
		Response = unknown,
		Body extends Record<string, unknown> = Record<string, unknown>
	>(
		url: string,
		data: RequestifyTypes.RequestBody<Body>
	): Promise<RequestifyTypes.Response<Response>> {
		throw new ImplementsError();
	}
	patch<
		Response = unknown,
		Body extends Record<string, unknown> = Record<string, unknown>
	>(
		url: string,
		data: RequestifyTypes.RequestBody<Body>
	): Promise<RequestifyTypes.Response<Response>> {
		throw new ImplementsError();
	}
	delete<
		Response = unknown,
		Params extends RequestifyTypes.Params = RequestifyTypes.Params
	>(url: string, params?: Params): Promise<RequestifyTypes.Response<Response>> {
		throw new ImplementsError();
	}
	create(config: RequestifyMethods.Config): AbstractRequestify {
		throw new ImplementsError();
	}
	cleanCache(): void {
		throw new ImplementsError();
	}

	interceptors: {
		request: Interceptors.RequestType;
		response: Interceptors.ResponseType;
	};

	constructor() {
		this.interceptors = {
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
}
