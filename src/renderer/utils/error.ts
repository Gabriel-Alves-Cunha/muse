type ErrorWithMessage = { message: string };

const isErrorWithMessage = (error: unknown): error is ErrorWithMessage =>
	typeof error === "object" && error !== null && "message" in error;

const toErrorWithMessage = (maybeError: unknown): ErrorWithMessage => {
	if (isErrorWithMessage(maybeError)) return maybeError;

	try {
		return new Error(JSON.stringify(maybeError));
	} catch (error) {
		// Fallback in case there's an error stringifying
		return new Error(String(maybeError));
	}
};

export const getErrorMessage = (error: unknown) =>
	toErrorWithMessage(error).message;
