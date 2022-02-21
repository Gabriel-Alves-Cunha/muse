/* eslint-disable no-undef */
module.exports = {
	packagerConfig: {
		ignore: [
			// ignore everything but "app/", "LICENSE" and "package.json":
			"^(/src$)",
			"^(/images$)",
			".editorconfig",
			".gitignore",
			"package-lock.json",
			"^(/README.md$)",
			"Stork.SPA.njsproj",
			"Stork.SPA.njsproj.user",
			"vite.config.json",
			"tsconfig.json",
			"tslint.json",
			"jest.config.js",
			"forge.config.js",
			"vite.config.ts",
			"TODO.txt",
			/^\/?(?:\w+\/)*(\.\w+)/gm, // dot files
		],
		icon: "assets/logo.png",
		packageManager: "yarn",
		replace: true,
		prune: true,
		asar: false,
		junk: true,
	},
	hooks: {
		postPackage: async (forgeConfig, options) => {
			if (options.spinner) {
				console.log({ forgeConfig, options });
				options.spinner.info(
					`Completed packaging for ${options.platform}-${options.arch} at ${options.outputPaths[0]}`,
				);
			}
		},
	},
	publishers: [
		{
			name: "@electron-forge/publisher-github",
			config: {
				repository: {
					owner: "Gabriel-Alves-Cunha",
					name: "muse",
				},
				prerelease: true,
			},
		},
	],
	plugins: [["@electron-forge/plugin-electronegativity"]],
	makers: [
		{
			name: "@electron-forge/maker-zip",
		},
		// {
		// 	name: "@electron-forge/maker-squirrel",
		// },
	],
};
