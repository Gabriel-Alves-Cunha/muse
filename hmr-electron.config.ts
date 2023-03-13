import type { UserProvidedConfigProps } from "hmr-electron";

const isDev = String(process.env.NODE_ENV === "development");

const config: UserProvidedConfigProps = {
	electronEsbuildExternalPackages: [
		"electron-devtools-installer",
		"./lib-cov/fluent-ffmpeg",
	],
	electronEntryFilePath: "src/main/index.ts",
	preloadFilePath: "src/main/preload.ts",
	esbuildConfig: {
		define: { isDev },
	},
};

export default config;
