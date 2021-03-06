import { stringifyJson } from "@common/utils";

type ErrorWithMessage = { message: string; };

const isErrorWithMessage = (error: unknown): error is ErrorWithMessage =>
	typeof error === "object" && error !== null && "message" in error;

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
	if (isErrorWithMessage(maybeError)) return maybeError;

	try {
		return new Error(stringifyJson(maybeError));
	} catch (error) {
		// Fallback in case there's an error stringifying
		return new Error(String(maybeError));
	}
}

export const getErrorMessage = (error: unknown) =>
	toErrorWithMessage(error).message;
