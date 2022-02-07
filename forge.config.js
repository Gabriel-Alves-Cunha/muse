/* eslint-disable no-undef */
module.exports = {
	packagerConfig: {},
	makers: [
		{
			name: "@electron-forge/maker-zip",
			platforms: ["linux"],
		},
		// {
		// 	name: "@electron-forge/maker-squirrel",
		// 	config: {
		// 		name: "muse",
		// 	},
		// },
		// {
		// 	name: "@electron-forge/maker-deb",
		// 	config: {},
		// },
		// {
		// 	name: "@electron-forge/maker-rpm",
		// 	config: {},
		// },
	],
};
