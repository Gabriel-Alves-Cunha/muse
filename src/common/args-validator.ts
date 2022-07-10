import Validator, { type ValidationError } from "fastest-validator";

export const validator = new Validator();

export function checkOrThrow(
	result: true | ValidationError[] | Promise<true | ValidationError[]>,
): void {
	if (result === true) return;

	throw new Error(JSON.stringify(result, null, 2));
}
