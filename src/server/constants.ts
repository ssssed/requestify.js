import type { RequestifyMethods, RequestifyTypes } from './types';

export module ErrorMessage {
	export const IMPLEMENT = 'Method not implemented.';
	export const REQUIRED = 'Missing required params.';
	export const CONTENT_TYPE_VALIDATION_ERROR =
		'Validate Error: Content-Type is not valid.';
}

export module Constants {
	export const CONTENT_TYPE = 'Content-Type';

	export module Data {
		export const BLOB = 'blob';
		export const JSON = 'json';
		export const TEXT = 'text';
	}

	export module Methods {
		export const GET = 'GET' as const;
		export const POST = 'POST' as const;
		export const PUT = 'PUT' as const;
		export const PATCH = 'PATCH' as const;
		export const DELETE = 'DELETE' as const;
		export const ALL_METHODS = [GET, POST, PUT, PATCH, DELETE];
	}

	export module Configs {
		export const DEFAULT_CONFIG: RequestifyMethods.Config = {
			baseUrl: '',
			headers: {
				'Content-Type': 'application/json',
			},
		};
		export const DEFAULT_CACHE_LIFETIME = 300_000; // 5 min
		export const DEFAULT_CACHE_CONFIG: RequestifyTypes.Cache = {
			enabled: false,
			lifetime: DEFAULT_CACHE_LIFETIME,
			methods: Methods.ALL_METHODS,
		};
	}
}
