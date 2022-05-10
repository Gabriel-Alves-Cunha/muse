import { vi } from "vitest";

export const mockElectronPlusNodeGlobalsBeforeTests = () => {
	// Mocking window
	vi.stubGlobal("window", {
		postMessage: vi
			.fn()
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			.mockImplementation(function () {
				console.log(
					"%cwindow.postMessage arguments =",
					"color:blue",
					// eslint-disable-next-line prefer-rest-params
					JSON.stringify(arguments, null, 2)
				);
			}),
	});
};
