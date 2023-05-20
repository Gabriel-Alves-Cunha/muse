const { log10, floor, abs, min } = Math;

const UNITS = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"] as const;

export function prettyBytes(num: number, precision = 3): PrettyBytes {
	if (abs(num) < 1) return `${num} B`;

	const exponent = min(
		floor(log10(num < 0 ? -num : num) / 3),
		UNITS.length - 1,
	);

	const number = Number(
		((num < 0 ? -num : num) / 1_000 ** exponent).toPrecision(precision),
	);

	const signal = num < 0 ? "-" : "";

	// @ts-ignore => I'm almost sure exponent is a number < UNITS.length >= 0
	return `${signal}${number} ${UNITS[exponent] ?? "ERROR"}`;
}

export type PrettyBytes = `${"" | "-"}${number} ${typeof UNITS[number]}`;
