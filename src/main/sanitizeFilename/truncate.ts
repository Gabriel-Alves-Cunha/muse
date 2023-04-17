export function isHighSurrogate(codePoint: number): boolean {
	return codePoint >= 0xd800 && codePoint <= 0xdbff;
}

function isLowSurrogate(codePoint: number): boolean {
	return codePoint >= 0xdc00 && codePoint <= 0xdfff;
}

function getLength(str: string): number {
	return Buffer.byteLength(str);
}

/** Truncate string by size in bytes. */
export function truncate(string: string, byteLength: number): string {
	if (typeof string !== "string") throw new Error("Input must be string.");

	const stringLength = string.length;
	let byteLengthSoFar = 0;
	let codePoint: number;
	let segment: string;

	for (let index = 0; index < stringLength; ++index) {
		codePoint = string.charCodeAt(index);
		segment = string[index] as string;

		if (
			isHighSurrogate(codePoint) &&
			isLowSurrogate(string.charCodeAt(index + 1))
		) {
			++index;
			segment += string[index];
		}

		byteLengthSoFar += getLength(segment);

		if (byteLengthSoFar === byteLength) return string.slice(0, index + 1);
		else if (byteLengthSoFar > byteLength)
			return string.slice(0, index - segment.length + 1);
	}

	return string;
}
