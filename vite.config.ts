import type { UserConfig as VitestUserConfig } from "vitest/config";
import type { UserConfig as ViteUserConfig } from "vite";

import { configDefaults } from "vitest/config";
import { defineConfig } from "vite";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
	const isTest = mode === "test";

	const config: ViteUserConfig & VitestUserConfig = {
		test: {
			includeSource: ["src/**/*.{js,ts}"],
			environment: "happy-dom",
			logHeapUsage: true,
			dir: "./tests",
			// coverage: {
			// 	// reporter: ["html", "text"],
			// 	reporter: ["text"],
			// 	// all: true,
			// },
			exclude: [
				...configDefaults.exclude,
				"**/seeLeakedVariables.ts",
				"**/.eslintrc.{js,cjs}",
				"**/styles.ts",
				"**/global.ts",
				"coverage/**",
				"**/*.d.ts",
			],
		},

		define: isTest ?
			{} :
			{ "process.env": process.env ?? "", "import.meta.vitest": "undefined" },
		server: { port: 3_000 },
		root: "./src/renderer",
		// @ts-ignore => This gives an error cause of VitestUserConfig type, but it works.
		plugins: [react()],
		envDir: "./",
		base: "./",

		resolve: {
			alias: [
				{
					find: "@components",
					replacement: resolve("src/renderer/components"),
				},
				{ find: "@contexts", replacement: resolve("src/renderer/contexts") },
				{ find: "@modules", replacement: resolve("src/renderer/modules") },
				{ find: "@styles", replacement: resolve("src/renderer/styles") },
				{ find: "@routes", replacement: resolve("src/renderer/routes") },
				{ find: "@utils", replacement: resolve("src/renderer/utils") },
				{ find: "@hooks", replacement: resolve("src/renderer/hooks") },
				{ find: "@renderer", replacement: resolve("src/renderer") },
				{ find: "@common", replacement: resolve("src/common") },
				{ find: "@main", replacement: resolve("src/main") },
				{ find: "@tests", replacement: resolve("tests") },
			],
		},
	};

	// console.dir(
	// 	{ isTest, isDev, config },
	// 	{
	// 		maxStringLength: 1_000,
	// 		maxArrayLength: 40,
	// 		compact: false,
	// 		sorted: false,
	// 		colors: true,
	// 		depth: 10,
	// 	}
	// );

	return config;
});
