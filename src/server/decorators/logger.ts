export function TimeLogger() {
	return function LoggerDecorator<T extends (...args: any[]) => any>(
		target: Object,
		propertyKey: string | symbol,
		descriptor: TypedPropertyDescriptor<T>
	): TypedPropertyDescriptor<T> | void {
		const originalMethod = descriptor.value;

		if (typeof originalMethod === 'function') {
			descriptor.value = async function (
				this: ThisParameterType<T>,
				...args: Parameters<T>
			) {
				const startTime = new Date();
				console.log(`Starting request at ${startTime}`);

				try {
					const result = await originalMethod.apply(this, args);
					const endTime = new Date();
					console.log(
						`Finished request at ${endTime}. Total time: ${
							endTime.getTime() - startTime.getTime()
						} seconds.`
					);
					return result;
				} catch (error) {
					console.error(`An error occurred during the request: ${error}`);
					throw error;
				}
			} as T;
		}

		return descriptor;
	};
}
