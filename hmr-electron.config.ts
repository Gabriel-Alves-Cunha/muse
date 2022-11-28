import type { UserProvidedConfigProps } from "hmr-electron";

const isDevelopment = process.env.NODE_ENV === "development";

const config: UserProvidedConfigProps = {
	electronEsbuildExternalPackages: [
		"electron-devtools-installer",
		"./lib-cov/fluent-ffmpeg",
		// "fluent-ffmpeg",
	],
	electronEntryFilePath: "src/main/index.ts",
	preloadFilePath: "src/main/preload.ts",
	esbuildConfig: {
		define: { isDev: String(isDevelopment) },
	},
};

export default config;
