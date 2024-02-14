import type { RequestifyTypes } from '../types';

export class QueryString {
	static stringify(data?: RequestifyTypes.Params) {
		if (!data) return '';

		let query: string = Object.entries(data)
			.map(([key, value]) => {
				// Преобразуем значения в строки, если они не являются строками
				let stringValue = typeof value === 'string' ? value : String(value);
				// URL-кодирование ключей и значений
				key = encodeURIComponent(key);
				stringValue = encodeURIComponent(stringValue);
				// Формирование пары ключ-значение
				return `${key}=${stringValue}`;
			})
			.join('&');
		return query.length ? '?' + query : '';
	}
}
