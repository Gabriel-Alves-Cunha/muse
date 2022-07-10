import { ValidationError } from "fastest-validator";

export function checkOrThrow(
	result: true | ValidationError[] | Promise<true | ValidationError[]>,
): void {
	if (result === true) return;

	throw new Error(JSON.stringify(result, null, 2));
}
