/* eslint-disable no-undef */
module.exports = {
	packagerConfig: {
		ignore: [
			// ignore everything but "app/", "LICENSE" and "package.json":
			"^(/src$)",
			"^(/images$)",
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
					`Completed packaging for ${options.platform}-${options.arch} at ${options.outputPaths}`,
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
			// The Zip target builds basic .zip files containing your packaged application.
			// There are no platform specific dependencies for using this maker and it will run on any platform.
			name: "@electron-forge/maker-zip",
			platform: ["linux"],
		},
		// {
		// Squirrel.Windows is a no-prompt, no-hassle, no-admin method of installing
		// Windows applications and is therefore the most user friendly you can get.
		// 	name: "@electron-forge/maker-squirrel",
		// },
	],
};
