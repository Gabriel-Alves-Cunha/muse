const { log10, floor, abs, min } = Math;

const UNITS = Object.freeze(
	["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"] as const,
);

export type PrettyBytes = Readonly<
	`${"" | "-"}${number} ${typeof UNITS[number]}`
>;

export function prettyBytes(num: Readonly<number>, precision = 3): PrettyBytes {
	if (abs(num) < 1) return `${num} B`;

	const exponent = min(
		floor(log10(num < 0 ? -num : num) / 3),
		UNITS.length - 1,
	);

	const n = Number(
		((num < 0 ? -num : num) / 1_000 ** exponent).toPrecision(precision),
	);

	// @ts-ignore => I'm almost sure exponent is a number < UNITS.length >= 0
	return `${num < 0 ? "-" : ""}${n} ${UNITS[exponent]}`;
}
