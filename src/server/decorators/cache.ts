import type { RequestifyTypes } from '../types';

export function Cache() {
	return function CacheDecorator<T extends (...args: any[]) => any>(
		target: Object,
		propertyKey: string | symbol,
		descriptor: TypedPropertyDescriptor<T>
	): TypedPropertyDescriptor<T> | void {
		const originalMethod = descriptor.value;

		if (typeof originalMethod === 'function') {
			descriptor.value = function (
				this: ThisParameterType<T>,
				...args: Parameters<T>
			) {
				const instance = this as any;
				const cacheKey = JSON.stringify(args);

				// Используем замыкание для хранения кэша в экземпляре класса
				if (!instance.__cache__) {
					instance.__cache__ = new Map<string, unknown>();
				}

				const cache = instance.__cache__ as Map<string, unknown>;
				const config = instance._cacheConfig as RequestifyTypes.Cache; // Доступ к конфигурации кэширования через экземпляр класса

				if (config.enabled && cache.has(cacheKey)) {
					return cache.get(cacheKey) as ReturnType<T>;
				} else {
					const result = originalMethod.apply(this, args);
					if (config.enabled) {
						cache.set(cacheKey, result);
						setTimeout(() => {
							cache.delete(cacheKey);
						}, config.lifetime);
					}
					return result;
				}
			} as T;
		}

		return descriptor;
	};
}
