const { log10, floor, abs, min } = Math;

const UNITS = Object.freeze([
	"B",
	"KB",
	"MB",
	"GB",
	"TB",
	"PB",
	"EB",
	"ZB",
	"YB",
]);

export const prettyBytes = (num: number, precision = 3, addSpace = true) => {
	if (abs(num) < 1) return num + (addSpace ? " " : "") + "B";

	const exponent = min(
		floor(log10(num < 0 ? -num : num) / 3),
		UNITS.length - 1
	);

	const n = Number(
		((num < 0 ? -num : num) / 1_000 ** exponent).toPrecision(precision)
	);

	return (num < 0 ? "-" : "") + n + (addSpace ? " " : "") + UNITS[exponent];
};
