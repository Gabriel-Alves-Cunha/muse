import type { UserProvidedConfigProps } from "hmr-electron";

import packageJSON from "/home/gabriel/Documents/VSCode/my_projects/muse/package.json" assert {
	type: "json",
};

const { dependencies, devDependencies } = packageJSON;

function findExternals(): string[] {
	const externals: Set<string> = new Set();

	Object.keys(devDependencies).forEach(pkg => externals.add(pkg));
	Object.keys(dependencies).forEach(pkg => externals.add(pkg));

	return [...externals];
}

const config: UserProvidedConfigProps = {
	electronEsbuildExternalPackages: // findExternals(),
		[
			"electron-devtools-installer",
			"./lib-cov/fluent-ffmpeg",
			"fluent-ffmpeg",
		], // findExternals(),
	electronEntryFilePath: "src/main/index.cts",
	preloadFilePath: "src/main/preload.cts",
};

export default config;
