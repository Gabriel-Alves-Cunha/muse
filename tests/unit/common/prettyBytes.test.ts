// @vitest-environment node

import { expect, it } from "vitest";

import { prettyBytes } from "@common/prettyBytes";

it("should return prettyfied bytes", () => {
	const bytes_1 = [0, 1, 435, 246545, 24564567473];

	const prettyfiedBytes_1 = bytes_1.map(byte => prettyBytes(byte));

	expect(prettyfiedBytes_1).toStrictEqual([
		"0 B",
		"1 B",
		"435 B",
		"247 KB",
		"24.6 GB",
	]);
});
