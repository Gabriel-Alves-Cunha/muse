import { vi } from "vitest";

export const mockElectronPlusNodeGlobalsBeforeTests = () => {
	// Mocking window
	vi.stubGlobal("electron", {
		notificationApi: { sendNotificationToElectronIpcMainProcess: vi.fn() },
		fs: {
			getFullPathOfFilesForFilesInThisDirectory: vi.fn(),
			deleteFile: vi.fn(),
			readFile: vi.fn(),
			readdir: vi.fn(),
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

	vi.stubGlobal("window", {
		postMessage: vi.fn() // eslint-disable-next-line @typescript-eslint/no-explicit-any
			.mockImplementation(function() {
				console.log(
					"%cwindow.postMessage arguments =",
					"color:blue",
					// eslint-disable-next-line prefer-rest-params
					JSON.stringify(arguments, null, 2),
				);
			}),
	});
};
