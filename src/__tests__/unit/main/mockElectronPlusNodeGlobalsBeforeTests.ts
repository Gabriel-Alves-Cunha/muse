import { vi } from "vitest";

export const mockElectronPlusNodeGlobalsBeforeTests = () => {
	// Mocking window
	vi.stubGlobal("window", {
		postMessage: vi
			.fn()
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			.mockImplementation((...args: any[]) => console.log({ args })),
	});
};
