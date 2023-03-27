/**
 * This is basically a copy of [node-sanitize-filename](https://github.com/parshap/node-sanitize-filename)
 *
 * Replaces characters in strings that are illegal/unsafe for filenames.
 * Unsafe characters are either removed or replaced by a substitute set
 * in the optional `options` object.
 *
 * Illegal Characters on Various Operating Systems
 * / ? < > \ : * | "
 * https://kb.acronis.com/content/39790
 *
 * Unicode Control codes
 * C0 0x00-0x1f & C1 (0x80-0x9f)
 * http://en.wikipedia.org/wiki/C0_and_C1_control_codes
 *
 * Reserved filenames on Unix-based systems (".", "..")
 * Reserved filenames in Windows ("CON", "PRN", "AUX", "NUL", "COM1",
 * "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
 * "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", and
 * "LPT9") case-insesitively and with or without filename extensions.
 *
 * Capped at 255 characters in length.
 * http://unix.stackexchange.com/questions/32795/what-is-the-maximum-allowed-filename-and-folder-size-with-ecryptfs
 */

import { truncate } from "./truncate";

const windowsReservedRegex = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
const controlRegex = /[\x00-\x1f\x80-\x9f]/g;
const illegalRegex = /[\/\?<>\\:\*\|"]/g;
const windowsTrailingRegex = /[\. ]+$/;
const reservedRegex = /^\.+$/;

function replaceWithSanitized(
	originalString: string,
	replacement: string,
): string {
	return originalString
		.replace(illegalRegex, replacement)
		.replace(controlRegex, replacement)
		.replace(reservedRegex, replacement)
		.replace(windowsReservedRegex, replacement)
		.replace(windowsTrailingRegex, replacement);
}

export function sanitize(originalFilename: string, replacement = ""): string {
	if (typeof originalFilename !== "string")
		throw new Error(
			`Input must be a string to be sanitized. 'originalFilename' = \`${originalFilename}: ${typeof originalFilename}\` | 'replacement' = \`${replacement}: ${typeof replacement}\`.`,
		);

	const sanitizedReplacement = replaceWithSanitized(replacement, "");

	const sanitizedFilename = replaceWithSanitized(
		originalFilename,
		sanitizedReplacement,
	);

	return truncate(sanitizedFilename, 255);
}
