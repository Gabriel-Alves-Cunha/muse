import { Window } from "happy-dom";
import { vi } from "vitest";

(function mockElectronPlusNodeGlobalsBeforeTests() {
	// Mocking window
	vi.stubGlobal("electronApi", {
		notificationApi: { sendNotificationToElectronIpcMainProcess: vi.fn() },
		fs: {
			getFullPathOfFilesForFilesInThisDirectory: vi.fn(),
			deleteFile: vi.fn(),
			readDir: vi.fn(),
		},
		os: {
			dirs: {
				documents: "test/documents",
				downloads: "test/downloads",
				music: "test/music",
			},
		},
		media: { transformPathsToMedias: vi.fn(), getBasicInfo: vi.fn() },
	});

	vi.stubGlobal("window", { ...new Window(), postMessage: vi.fn() });
})();
