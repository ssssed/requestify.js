import type { Middleware } from "./main";

export function defineMiddleware<Input = unknown, Output = unknown>(middleware: Middleware<Input, Output>): Middleware<Input, Output> {
	return middleware;
}