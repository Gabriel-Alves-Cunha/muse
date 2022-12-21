export const { log, error, assert, groupEnd, groupCollapsed, warn, info } =
	console;

export function throwErr(
	message?: string | undefined,
	options?: ErrorOptions | undefined,
): never {
	throw new Error(message, options);
}
