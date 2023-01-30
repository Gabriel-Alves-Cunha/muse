import { stringifyJson } from "./utils";

type ErrorWithMessage = { message: string };

const isErrorWithMessage = (error: unknown): error is ErrorWithMessage =>
	error !== null && typeof error === "object" && "message" in error;

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
	if (isErrorWithMessage(maybeError)) return maybeError;

	try {
		// @ts-ignore => If maybeError is not of type Json, it will fail:
		return new Error(stringifyJson(maybeError));
	} catch (error) {
		// Fallback in case there's an error stringifying
		return new Error(String(maybeError));
	}
}

export const getErrorMessage = (error: unknown): string =>
	toErrorWithMessage(error).message;
