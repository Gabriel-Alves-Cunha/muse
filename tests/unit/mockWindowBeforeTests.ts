import { Window } from "happy-dom";
import { vi } from "vitest";

export function mockWindowBeforeTests() {
	const window = new Window();

	// Mocking window
	vi.stubGlobal("window", { window });
}
