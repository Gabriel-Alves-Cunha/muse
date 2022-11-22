import type { UserProvidedConfigProps } from "hmr-electron";

// import packageJSON from "/home/gabriel/Documents/VSCode/my_projects/muse/package.json" assert {
// 	type: "json",
// };
//
// const { dependencies, devDependencies } = packageJSON;
//
// function findExternals(): string[] {
// 	const externals: Set<string> = new Set();
//
// 	for (const pkg of Object.keys(devDependencies)) externals.add(pkg);
// 	for (const pkg of Object.keys(dependencies)) externals.add(pkg);
//
// 	return [...externals];
// }

const isDevelopment = process.env.NODE_ENV === "development";

const config: UserProvidedConfigProps = {
	electronEsbuildExternalPackages: // findExternals(),
		[
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
