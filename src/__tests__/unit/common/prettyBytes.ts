/* eslint-disable */

import { prettyBytes } from "../../../common/prettyBytes";

it("should return prettyfied bytes", () => {
	const bytes_1 = [0, 1, 435, 246545, 24564567473];
	const bytes_2 = [0.13, 132, 546787654, 2345, 567473];

	const prettyfiedBytes_1 = bytes_1.map(byte => prettyBytes(byte));
	const prettyfiedBytes_2 = bytes_2.map(byte => prettyBytes(byte, 10, false));

	expect(prettyfiedBytes_1).toStrictEqual([
		"0 B",
		"1 B",
		"435 B",
		"247 KB",
		"24.6 GB",
	]);
	expect(prettyfiedBytes_2).toStrictEqual([
		"0.13B",
		"132B",
		"546.787654MB",
		"2.345KB",
		"567.473KB",
	]);
});
